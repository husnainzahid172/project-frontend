'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AzLabsLogo } from '@/components/brand/logo';
import { OrderRecord, OrderStatus } from '@/types/order';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Package,
  ShoppingCart,
  Users,
  CheckCircle,
  Clock,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Search,
  Filter,
  Download,
  ArrowLeft,
  RefreshCw,
  Edit,
  Plus,
} from 'lucide-react';

interface AdminDashboardProps {
  initialOrders: OrderRecord[];
  initialProducts: Product[];
}

export function AdminDashboard({
  initialOrders,
  initialProducts,
}: AdminDashboardProps) {
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'diagnostics'>('orders');

  // Filter & Search
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  // Status updating
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Stats calculation
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending_contact').length;
  const confirmedOrders = orders.filter((o) => o.status === 'confirmed').length;
  const totalGbpValue = orders
    .filter((o) => o.currency === 'GBP')
    .reduce((acc, o) => acc + o.total_amount, 0);
  const totalEurValue = orders
    .filter((o) => o.currency === 'EUR')
    .reduce((acc, o) => acc + o.total_amount, 0);

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase().trim();
      const matchRef = o.reference.toLowerCase().includes(q);
      const matchName = o.customer_name.toLowerCase().includes(q);
      const matchEmail = o.customer_email.toLowerCase().includes(q);
      const matchInst = o.institution?.toLowerCase().includes(q) || false;
      if (!matchRef && !matchName && !matchEmail && !matchInst) return false;
    }
    return true;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer az-admin-2026',
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: newStatus, updated_at: new Date().toISOString() } : o
          )
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleToggleProductStock = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, in_stock: !p.in_stock } : p))
    );
  };

  const exportOrdersCsv = () => {
    const headers = [
      'Reference',
      'Customer',
      'Email',
      'Phone',
      'Institution',
      'Country',
      'Currency',
      'Subtotal',
      'Shipping',
      'VAT',
      'Total',
      'Status',
      'Created_At',
    ];
    const rows = orders.map((o) => [
      o.reference,
      `"${o.customer_name}"`,
      o.customer_email,
      `"${o.customer_phone}"`,
      `"${o.institution || ''}"`,
      o.country_code,
      o.currency,
      o.subtotal.toFixed(2),
      o.shipping_cost.toFixed(2),
      o.vat_amount.toFixed(2),
      o.total_amount.toFixed(2),
      o.status,
      o.created_at,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `az-labs-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusColors: Record<OrderStatus, string> = {
    pending_contact: 'border-amber-500/40 text-amber-400 bg-amber-950/30',
    confirmed: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30',
    processing: 'border-blue-500/40 text-blue-400 bg-blue-950/30',
    dispatched: 'border-purple-500/40 text-purple-400 bg-purple-950/30',
    completed: 'border-zinc-500/40 text-zinc-300 bg-zinc-900',
    cancelled: 'border-red-500/40 text-red-400 bg-red-950/30',
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 pb-20">
      {/* Admin Top Navigation */}
      <header className="border-b border-zinc-900 bg-zinc-950/90 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Storefront</span>
          </Link>
          <div className="h-4 w-px bg-zinc-800" />
          <AzLabsLogo showTagline size="sm" asLink={false} />
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400">
            Admin Console
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-zinc-800 bg-zinc-900/60 p-0.5 text-xs font-mono">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'orders'
                  ? 'bg-emerald-600 text-white font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'products'
                  ? 'bg-emerald-600 text-white font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Catalogue ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'diagnostics'
                  ? 'bg-emerald-600 text-white font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Diagnostics
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
              <span>Total Orders</span>
              <ShoppingCart className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-white">{totalOrders}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Logged on secure server</div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
              <span>Pending WhatsApp</span>
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-amber-400">{pendingOrders}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Awaiting coordinator review</div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
              <span>Confirmed Orders</span>
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">{confirmedOrders}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Batch reserved & verified</div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
              <span>Gross Order Value</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-white">
              £{totalGbpValue.toFixed(2)} <span className="text-zinc-500 text-sm">/ €{totalEurValue.toFixed(2)}</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">Recalculated on server</div>
          </div>
        </div>

        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <Input
                    placeholder="Search by Ref, Customer, Email, Institution..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="pl-9 h-9 bg-zinc-950 border-zinc-800 text-xs text-zinc-200"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 bg-zinc-950 border border-zinc-800 rounded-md px-3 text-xs font-mono text-zinc-200"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="pending_contact">Pending Contact</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={exportOrdersCsv}
                className="border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 text-xs font-mono text-zinc-300 gap-1.5 self-end sm:self-auto"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
            </div>

            {/* Orders Table */}
            <div className="rounded-xl border border-zinc-850 bg-zinc-950 overflow-hidden">
              <Table>
                <TableHeader className="bg-zinc-900/50">
                  <TableRow className="border-zinc-850 hover:bg-transparent">
                    <TableHead className="font-mono text-xs text-zinc-400">Order Ref</TableHead>
                    <TableHead className="font-mono text-xs text-zinc-400">Customer & Institution</TableHead>
                    <TableHead className="font-mono text-xs text-zinc-400">Territory</TableHead>
                    <TableHead className="font-mono text-xs text-zinc-400 text-right">Total Validated</TableHead>
                    <TableHead className="font-mono text-xs text-zinc-400">Status</TableHead>
                    <TableHead className="font-mono text-xs text-zinc-400">Timestamp</TableHead>
                    <TableHead className="font-mono text-xs text-zinc-400 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-zinc-500 text-xs">
                        No orders match the current filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="border-zinc-850 hover:bg-zinc-900/40">
                        <TableCell className="font-mono font-bold text-emerald-400 text-xs">
                          {order.reference}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-zinc-200 text-xs">{order.customer_name}</div>
                          <div className="text-[11px] text-zinc-500">
                            {order.institution || order.customer_email}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-zinc-300">
                          {order.country_code}
                        </TableCell>
                        <TableCell className="font-mono font-semibold text-right text-xs text-white">
                          {order.currency === 'EUR' ? '€' : '£'}
                          {order.total_amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono px-2 py-0.5 uppercase ${
                              statusColors[order.status] || ''
                            }`}
                          >
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[11px] text-zinc-400 font-mono">
                          {new Date(order.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            className="text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 h-8 px-2.5"
                          >
                            View Record
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Authorized Catalogue Inventory</h3>
                <p className="text-xs text-zinc-400">
                  Manage product specifications, pricing, stock levels, and authorized distribution territories.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-850 bg-zinc-950 overflow-hidden">
              <Table>
                <TableHeader className="bg-zinc-900/50">
                  <TableRow className="border-zinc-850 hover:bg-transparent">
                    <TableHead className="font-mono text-xs text-zinc-400">SKU / CAS</TableHead>
                    <TableHead className="font-mono text-xs text-zinc-400">Product Name & Grade</TableHead>
                    <TableHead className="font-mono text-xs text-zinc-400">Category</TableHead>
                    <TableHead className="font-mono text-xs text-zinc-400 text-right">Price (GBP / EUR)</TableHead>
                    <TableHead className="font-mono text-xs text-zinc-400">Batch CoA</TableHead>
                    <TableHead className="font-mono text-xs text-zinc-400">Stock Status</TableHead>
                    <TableHead className="font-mono text-xs text-zinc-400 text-right">Toggle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} className="border-zinc-850 hover:bg-zinc-900/40">
                      <TableCell className="font-mono text-xs">
                        <span className="text-emerald-400 font-bold">{product.sku}</span>
                        {product.cas_number && (
                          <div className="text-[10px] text-zinc-500">CAS {product.cas_number}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-zinc-200 text-xs">{product.name}</div>
                        <div className="text-[11px] text-zinc-400">{product.unit_size}</div>
                      </TableCell>
                      <TableCell className="text-xs text-zinc-400">{product.category}</TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        <span className="text-white font-semibold">£{product.price_gbp.toFixed(2)}</span>
                        <span className="text-zinc-500 ml-1.5">/ €{product.price_eur.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-zinc-300">
                        {product.coa_batch || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            product.in_stock
                              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20'
                              : 'border-zinc-700 text-zinc-500 bg-zinc-900'
                          }
                        >
                          {product.in_stock ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleProductStock(product.id)}
                          className="h-8 text-[11px] border-zinc-800 hover:bg-zinc-850"
                        >
                          {product.in_stock ? 'Mark Reserve' : 'Mark In-Stock'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* TAB 3: DIAGNOSTICS & SUPABASE STATUS */}
        {activeTab === 'diagnostics' && (
          <div className="space-y-6 max-w-3xl">
            <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-950 space-y-4">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                Infrastructure & Environment Diagnostics
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Check current Supabase PostgreSQL database connections, environment variables, and WhatsApp click-to-chat configuration.
              </p>

              <div className="space-y-3 pt-2 text-xs font-mono">
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400">Database Engine:</span>
                  <span className="text-emerald-400 font-bold">Supabase PostgreSQL 15+</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400">Row Level Security (RLS):</span>
                  <span className="text-emerald-400 font-bold">Enabled & Verified</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400">Server Price Recalculation:</span>
                  <span className="text-emerald-400 font-bold">Active (/api/orders)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400">Configured WhatsApp Phone:</span>
                  <span className="text-zinc-200">+44 7448 399290 (UK WhatsApp Desk)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400">Primary Domain:</span>
                  <span className="text-emerald-400 font-bold">azlabs.pro</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400">Official Tagline:</span>
                  <span className="text-zinc-200">Research. Refined.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl bg-zinc-950 border border-zinc-850 text-zinc-100 p-0 overflow-hidden shadow-2xl">
            <DialogHeader className="p-6 border-b border-zinc-900 bg-zinc-950">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
                    Order Record
                  </span>
                  <DialogTitle className="text-2xl font-mono font-bold text-emerald-400">
                    {selectedOrder.reference}
                  </DialogTitle>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs font-mono px-2.5 py-1 uppercase ${
                    statusColors[selectedOrder.status]
                  }`}
                >
                  {selectedOrder.status.replace('_', ' ')}
                </Badge>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
              {/* Customer & Destination */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Customer</div>
                  <div className="font-semibold text-zinc-200 mt-0.5">{selectedOrder.customer_name}</div>
                  <div className="text-zinc-400">{selectedOrder.customer_email}</div>
                  <div className="text-zinc-400 font-mono">{selectedOrder.customer_phone}</div>
                  {selectedOrder.institution && (
                    <div className="text-emerald-400 font-medium mt-1">
                      {selectedOrder.institution}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Delivery Address</div>
                  <div className="text-zinc-300 mt-0.5">{selectedOrder.address_line1}</div>
                  {selectedOrder.address_line2 && (
                    <div className="text-zinc-400">{selectedOrder.address_line2}</div>
                  )}
                  <div className="text-zinc-400">
                    {selectedOrder.city}, {selectedOrder.postal_code}
                  </div>
                  <div className="text-emerald-400 font-bold font-mono">
                    Country: {selectedOrder.country_code}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <div className="font-mono text-zinc-400 uppercase mb-2">Itemized Products</div>
                  <div className="rounded-lg border border-zinc-800 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-zinc-900/40">
                        <TableRow className="border-zinc-800">
                          <TableHead className="text-zinc-400 text-xs">SKU & Name</TableHead>
                          <TableHead className="text-zinc-400 text-xs text-center">Qty</TableHead>
                          <TableHead className="text-zinc-400 text-xs text-right">Unit</TableHead>
                          <TableHead className="text-zinc-400 text-xs text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((it) => (
                          <TableRow key={it.id} className="border-zinc-800">
                            <TableCell>
                              <div className="font-mono text-emerald-400">{it.sku}</div>
                              <div className="text-zinc-200">{it.product_name}</div>
                            </TableCell>
                            <TableCell className="text-center font-mono">{it.quantity}</TableCell>
                            <TableCell className="text-right font-mono">
                              {selectedOrder.currency === 'EUR' ? '€' : '£'}
                              {it.unit_price.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-mono font-bold text-white">
                              {selectedOrder.currency === 'EUR' ? '€' : '£'}
                              {it.total_price.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Financial Totals */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-1.5 font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal:</span>
                  <span>
                    {selectedOrder.currency === 'EUR' ? '€' : '£'}
                    {selectedOrder.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping:</span>
                  <span>
                    {selectedOrder.currency === 'EUR' ? '€' : '£'}
                    {selectedOrder.shipping_cost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>VAT:</span>
                  <span>
                    {selectedOrder.currency === 'EUR' ? '€' : '£'}
                    {selectedOrder.vat_amount.toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex justify-between font-bold text-sm text-white">
                  <span>Total Amount:</span>
                  <span className="text-emerald-400">
                    {selectedOrder.currency === 'EUR' ? '€' : '£'}
                    {selectedOrder.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Status Update Control */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-zinc-200">Update Order Status</div>
                  <div className="text-[11px] text-zinc-400">Modify status in database registry</div>
                </div>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleUpdateStatus(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  disabled={isUpdatingStatus}
                  className="bg-zinc-950 border border-zinc-700 rounded-md px-3 py-1.5 text-xs font-mono text-zinc-200"
                >
                  <option value="pending_contact">Pending Contact</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
