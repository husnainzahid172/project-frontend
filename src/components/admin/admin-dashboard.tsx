'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ImagePlus, Lock, LogOut, Plus, Trash2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { AzLabsLogo } from '@/components/brand/logo';
import { ELIGIBILITY_LABEL, ELIGIBILITY_STATUSES, type EligibilityStatus, type Product } from '@/types/product';
import { ORDER_STATUSES, type AuditLogEntry, type OrderRecord, type OrderStatus } from '@/types/order';
import { PRODUCT_CATEGORIES, SHIPPING_COUNTRIES } from '@/lib/products-data';
import { formatMoney } from '@/lib/pricing';
import { checkPurchase, isPubliclyListed, validateStatusChange } from '@/lib/eligibility';

type Session = { email: string; role: 'super_admin' | 'admin' | 'auditor' };

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_contact: 'Pending contact',
  confirmed: 'Confirmed',
  processing: 'Processing',
  dispatched: 'Dispatched',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_STYLE: Record<EligibilityStatus, string> = {
  pending_review: 'bg-amber-400/10 text-amber-300 ring-amber-400/30',
  approved_marketing: 'bg-sky-400/10 text-sky-300 ring-sky-400/30',
  approved_sale: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/30',
  not_approved: 'bg-white/5 text-zinc-500 ring-white/15',
};

async function api(method: 'POST' | 'PATCH', url: string, body: unknown) {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || 'Request failed');
  return data;
}

export function AdminDashboard({
  session,
  initialOrders,
  initialProducts,
  audit,
}: {
  session: Session;
  initialOrders: OrderRecord[];
  initialProducts: Product[];
  audit: AuditLogEntry[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<'products' | 'orders' | 'audit'>('products');
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const readOnly = session.role === 'auditor';

  const stats = useMemo(() => {
    const live = initialOrders.filter((o) => o.status !== 'cancelled');
    const sum = (c: 'GBP' | 'EUR') => live.filter((o) => o.currency === c).reduce((a, o) => a + Number(o.total_amount), 0);
    return {
      orders: initialOrders.length,
      pending: initialOrders.filter((o) => o.status === 'pending_contact').length,
      gbp: sum('GBP'),
      eur: sum('EUR'),
      listed: initialProducts.filter(isPubliclyListed).length,
      orderable: initialProducts.filter((p) => checkPurchase(p).allowed).length,
      review: initialProducts.filter((p) => p.eligibility_status === 'pending_review').length,
    };
  }, [initialOrders, initialProducts]);

  async function updateOrder(orderId: string, status: string) {
    setError(null);
    try {
      await api('PATCH', '/api/admin/orders', { orderId, status });
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/10 bg-card">
        <div className="container-page flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <AzLabsLogo size="sm" />
            <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-zinc-300">Admin</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-300">
            <a href="/preview" target="_blank" rel="noopener" className="font-medium text-emerald-400 hover:underline">Preview store</a>
            <span className="hidden sm:inline">{session.email} · {session.role}</span>
            <form action="/api/admin/logout" method="post">
              <button className="inline-flex items-center gap-1.5 hover:text-zinc-50"><LogOut className="h-4 w-4" /> Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <main className="container-page py-8">
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          {([
            ['Orders', stats.orders],
            ['Pending contact', stats.pending],
            ['Revenue GBP', formatMoney(stats.gbp, 'GBP')],
            ['Revenue EUR', formatMoney(stats.eur, 'EUR')],
            ['Publicly listed', stats.listed],
            ['Orderable', stats.orderable],
            ['Pending review', stats.review],
          ] as const).map(([k, v]) => (
            <div key={k} className="surface p-4">
              <p className="text-xs text-zinc-400">{k}</p>
              <p className="mt-1 font-display text-xl font-semibold tabular-nums text-zinc-50">{v}</p>
            </div>
          ))}
        </section>
        <p className="mt-2 text-xs text-zinc-400">Revenue excludes cancelled orders and reflects recorded order totals, not payments received.</p>

        <div className="mt-8 flex items-end justify-between border-b border-white/10">
          <div className="flex gap-1" role="tablist">
            {(['products', 'orders', 'audit'] as const).map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                className={`-mb-px border-b-2 px-4 py-2.5 text-sm capitalize ${tab === t ? 'border-white font-medium text-zinc-50' : 'border-transparent text-zinc-400 hover:text-zinc-100'}`}>
                {t === 'audit' ? 'Audit log' : t}
              </button>
            ))}
          </div>
          {tab === 'products' && !readOnly && (
            <button onClick={() => setEditing('new')} className="btn-primary mb-2 h-9 px-4"><Plus className="h-4 w-4" /> New product</button>
          )}
        </div>

        {error && <p role="alert" className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

        {tab === 'products' && (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-card">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="text-left text-xs text-zinc-400">
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Public</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Document</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {initialProducts.map((p) => (
                  <tr key={p.id} className="border-b border-white/[0.06] last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md border border-white/10 bg-[#f2f2f0]">
                          {p.image_urls?.[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image_urls[0]} alt="" className="h-full w-full object-contain" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-50">{p.name}</p>
                          <p className="font-mono text-xs text-zinc-400">{p.sku} · {p.unit_size}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ring-1 ${STATUS_STYLE[p.eligibility_status]}`}>
                        {p.is_restricted && <Lock className="h-3 w-3" />} {ELIGIBILITY_LABEL[p.eligibility_status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{checkPurchase(p).allowed ? 'Listed · orderable' : isPubliclyListed(p) ? 'Listed' : 'Hidden'}</td>
                    <td className="px-4 py-3 tabular-nums text-zinc-200">{p.price_gbp > 0 ? `${formatMoney(p.price_gbp, 'GBP')} / ${formatMoney(p.price_eur, 'EUR')}` : '—'}</td>
                    <td className="px-4 py-3 text-zinc-200">{p.in_stock ? p.stock_quantity : 'Out'}</td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-zinc-300" title={p.eligibility_doc_ref ?? ''}>{p.eligibility_doc_ref || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      {!readOnly && <button onClick={() => setEditing(p)} className="font-medium text-emerald-400 hover:underline">Edit</button>}
                    </td>
                  </tr>
                ))}
                {initialProducts.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-zinc-400">No products. Run the catalogue migration or add one.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'orders' && (
          <div className="mt-6 space-y-2">
            {initialOrders.length === 0 && <p className="py-10 text-center text-sm text-zinc-400">No orders yet.</p>}
            {initialOrders.map((o) => (
              <div key={o.id} className="surface">
                <div className="flex flex-wrap items-center gap-4 p-4">
                  <button onClick={() => setOpenOrder(openOrder === o.id ? null : o.id)} className="flex flex-1 items-center gap-3 text-left" aria-expanded={openOrder === o.id}>
                    <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${openOrder === o.id ? 'rotate-180' : ''}`} />
                    <span className="font-mono text-sm text-zinc-50">{o.reference}</span>
                    <span className="text-sm text-zinc-300">{o.customer_name}</span>
                    <span className="text-xs text-zinc-400">{new Date(o.created_at).toLocaleString('en-GB')}</span>
                  </button>
                  <span className="text-sm tabular-nums text-zinc-50">{formatMoney(Number(o.total_amount), o.currency)}</span>
                  <select aria-label={`Status for ${o.reference}`} disabled={readOnly} value={o.status} onChange={(e) => updateOrder(o.id, e.target.value)}
                    className="h-9 rounded-lg border border-white/15 bg-card px-2 text-sm text-zinc-100">
                    {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                </div>
                {openOrder === o.id && (
                  <div className="grid gap-6 border-t border-white/[0.06] p-4 text-sm md:grid-cols-2">
                    <div className="space-y-1 text-zinc-300">
                      <p className="font-medium text-zinc-50">{o.customer_name}{o.institution ? ` · ${o.institution}` : ''}</p>
                      <p>{o.customer_email} · {o.customer_phone}</p>
                      <p>{[o.address_line1, o.address_line2, o.city, o.postal_code, o.country_code].filter(Boolean).join(', ')}</p>
                      {o.notes && <p className="pt-2 text-zinc-400">Note: {o.notes}</p>}
                    </div>
                    <div>
                      {o.items?.map((i) => (
                        <div key={i.id} className="flex justify-between py-1 text-zinc-200">
                          <span>{i.product_name} <span className="text-zinc-500">({i.sku})</span> × {i.quantity}</span>
                          <span className="tabular-nums">{formatMoney(Number(i.total_price), o.currency)}</span>
                        </div>
                      ))}
                      <div className="mt-2 space-y-0.5 border-t border-white/[0.06] pt-2 text-zinc-400">
                        <div className="flex justify-between"><span>Shipping</span><span>{formatMoney(Number(o.shipping_cost), o.currency)}</span></div>
                        <div className="flex justify-between"><span>VAT</span><span>{formatMoney(Number(o.vat_amount), o.currency)}</span></div>
                        <div className="flex justify-between font-medium text-zinc-50"><span>Total</span><span>{formatMoney(Number(o.total_amount), o.currency)}</span></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'audit' && (
          <div className="mt-6 space-y-2">
            {audit.length === 0 && <p className="py-10 text-center text-sm text-zinc-400">No changes recorded yet.</p>}
            {audit.map((a) => (
              <div key={a.id} className="surface p-4 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="text-zinc-50">{a.entity} · {a.action} · <span className="font-mono text-xs text-zinc-400">{a.entity_id}</span></span>
                  <span className="text-xs text-zinc-400">{a.actor_email} · {new Date(a.created_at).toLocaleString('en-GB')}</span>
                </div>
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-xs text-zinc-400">{JSON.stringify(a.before)} → {JSON.stringify(a.after)}</pre>
              </div>
            ))}
          </div>
        )}
      </main>

      {editing && (
        <ProductEditor
          product={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); router.refresh(); }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

type Form = {
  name: string; slug: string; sku: string; category: string; unit_size: string; pack_contents: string; description: string;
  specs: [string, string][]; cas_number: string; sequence: string; molecular_formula: string; molecular_weight: string; storage_notes: string;
  price_gbp: string; price_eur: string; kit_price_gbp: string; kit_price_eur: string; in_stock: boolean; stock_quantity: string; max_per_order: string;
  eligibility_status: EligibilityStatus; eligibility_doc_ref: string; eligibility_conditions: string; lawful_destinations: string[];
  coa_batch: string; coa_date: string; coa_url: string; alt_text: string; is_featured: boolean;
};

const s = (v: string | null | undefined) => v ?? '';
const n = (v: number | null | undefined) => (v == null || v === 0 ? '' : String(v));
const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function toForm(p: Product | null): Form {
  return {
    name: s(p?.name), slug: s(p?.slug), sku: s(p?.sku), category: p?.category ?? PRODUCT_CATEGORIES[0], unit_size: s(p?.unit_size),
    pack_contents: s(p?.pack_contents), description: s(p?.description), specs: Object.entries(p?.specifications ?? {}),
    cas_number: s(p?.cas_number), sequence: s(p?.sequence), molecular_formula: s(p?.molecular_formula), molecular_weight: s(p?.molecular_weight),
    storage_notes: s(p?.storage_notes), price_gbp: n(p?.price_gbp), price_eur: n(p?.price_eur), kit_price_gbp: n(p?.kit_price_gbp),
    kit_price_eur: n(p?.kit_price_eur), in_stock: p?.in_stock ?? false, stock_quantity: String(p?.stock_quantity ?? 0),
    max_per_order: String(p?.max_per_order ?? 10), eligibility_status: p?.eligibility_status ?? 'pending_review',
    eligibility_doc_ref: s(p?.eligibility_doc_ref), eligibility_conditions: s(p?.eligibility_conditions),
    lawful_destinations: p?.lawful_destinations ?? [], coa_batch: s(p?.coa_batch), coa_date: s(p?.coa_date), coa_url: s(p?.coa_url),
    alt_text: s(p?.alt_text), is_featured: p?.is_featured ?? false,
  };
}

const num = (v: string) => (v.trim() === '' ? 0 : Number(v));
const numOrNull = (v: string) => (v.trim() === '' ? null : Number(v));

function Input({ id, label, hint, ...props }: { id: string; label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input id={id} className="field" {...props} />
      {hint && <p className="mt-1 text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}

function ProductEditor({ product, onClose, onSaved }: { product: Product | null; onClose: () => void; onSaved: () => void }) {
  const isNew = !product;
  const locked = product?.is_restricted ?? false;
  const [f, setF] = useState<Form>(() => toForm(product));
  const [images, setImages] = useState<{ path: string; url?: string }[]>(
    (product?.image_paths ?? []).map((path, i) => ({ path, url: product?.image_urls?.[i] }))
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  const statusProblem = validateStatusChange({
    eligibility_status: f.eligibility_status,
    eligibility_doc_ref: f.eligibility_doc_ref,
    lawful_destinations: f.lawful_destinations,
    in_stock: f.in_stock,
    stock_quantity: num(f.stock_quantity),
    is_restricted: locked,
    price_gbp: num(f.price_gbp),
    price_eur: num(f.price_eur),
  });

  function payload() {
    return {
      name: f.name, slug: f.slug || slugify(f.name), sku: f.sku, category: f.category, unit_size: f.unit_size,
      pack_contents: f.pack_contents, description: f.description,
      specifications: Object.fromEntries(f.specs.filter(([k, v]) => k.trim() && v.trim()).map(([k, v]) => [k.trim(), v.trim()])),
      cas_number: f.cas_number, sequence: f.sequence, molecular_formula: f.molecular_formula, molecular_weight: f.molecular_weight,
      storage_notes: f.storage_notes, price_gbp: num(f.price_gbp), price_eur: num(f.price_eur),
      kit_price_gbp: numOrNull(f.kit_price_gbp), kit_price_eur: numOrNull(f.kit_price_eur), in_stock: f.in_stock,
      stock_quantity: Math.max(0, Math.floor(num(f.stock_quantity))), max_per_order: Math.max(1, Math.floor(num(f.max_per_order) || 1)),
      eligibility_doc_ref: f.eligibility_doc_ref, eligibility_conditions: f.eligibility_conditions, lawful_destinations: f.lawful_destinations,
      coa_batch: f.coa_batch, coa_date: f.coa_date, coa_url: f.coa_url, alt_text: f.alt_text || f.name, is_featured: f.is_featured,
      image_paths: images.map((i) => i.path),
    };
  }

  async function save() {
    setErr(null);
    setSaving(true);
    try {
      if (isNew) {
        await api('POST', '/api/admin/products', payload());
      } else {
        await api('PATCH', '/api/admin/products', { productId: product!.id, patch: { ...payload(), eligibility_status: f.eligibility_status } });
      }
      onSaved();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function upload(file: File) {
    if (!product) return;
    setErr(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('productId', product.id);
      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');
      setImages((imgs) => [...imgs, { path: data.path, url: URL.createObjectURL(file) }]);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[94vh] max-w-3xl overflow-y-auto bg-card p-0 sm:rounded-2xl">
        <div className="sticky top-0 z-10 border-b border-white/10 bg-card px-6 py-4">
          <DialogTitle className="font-display text-lg font-semibold text-zinc-50">{isNew ? 'New product' : product!.name}</DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">Changes are recorded in the audit log.</DialogDescription>
        </div>

        <div className="space-y-8 px-6 py-6 text-sm">
          {locked && (
            <div className="flex gap-3 rounded-xl border border-white/15 bg-white/[0.03] p-4 text-zinc-200">
              <Lock className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium text-zinc-50">Restricted product</p>
                <p className="mt-1">{product?.restriction_reason ?? 'This product cannot be approved for marketing or sale on this site.'}</p>
              </div>
            </div>
          )}

          {/* Status */}
          <section className="space-y-4">
            <h3 className="font-display text-sm font-semibold text-zinc-50">Regulatory status</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {ELIGIBILITY_STATUSES.map((st) => {
                const disabled = isNew ? st !== 'pending_review' : locked && st !== 'pending_review' && st !== 'not_approved';
                return (
                  <label key={st} className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 ${f.eligibility_status === st ? 'border-white' : 'border-white/10'} ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}>
                    <input type="radio" name="status" className="mt-0.5 accent-emerald-500" disabled={disabled} checked={f.eligibility_status === st} onChange={() => set('eligibility_status', st)} />
                    <span>
                      <span className="font-medium text-zinc-50">{ELIGIBILITY_LABEL[st]}</span>
                      <span className="block text-xs text-zinc-400">
                        {st === 'pending_review' && 'Hidden from the public site.'}
                        {st === 'approved_marketing' && 'Listed publicly; no ordering. Needs a document reference.'}
                        {st === 'approved_sale' && 'Listed and orderable to selected destinations. Needs document, destinations and prices.'}
                        {st === 'not_approved' && 'Hidden; cannot be promoted or sold.'}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            {isNew && <p className="text-xs text-zinc-400">New products always start as Pending review.</p>}
            {!locked && (
              <>
                <Input id="pe-doc" label="Documentation reference" value={f.eligibility_doc_ref} onChange={(e) => set('eligibility_doc_ref', e.target.value)}
                  placeholder="e.g. Solicitor letter ref ABC/123, 12 Nov 2026" hint="The written advice or authorisation covering this exact product, its packaging and its claims." />
                <div>
                  <label htmlFor="pe-cond" className="label">Supply conditions (copied from the document)</label>
                  <textarea id="pe-cond" rows={2} value={f.eligibility_conditions} onChange={(e) => set('eligibility_conditions', e.target.value)} className="field h-auto py-2" />
                </div>
                <fieldset>
                  <legend className="label">Permitted destinations (only those named in the document)</legend>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {SHIPPING_COUNTRIES.map((c) => (
                      <label key={c.code} className="flex items-center gap-2 text-zinc-200">
                        <input type="checkbox" className="accent-emerald-500" checked={f.lawful_destinations.includes(c.code)}
                          onChange={(e) => set('lawful_destinations', e.target.checked ? [...f.lawful_destinations, c.code] : f.lawful_destinations.filter((x) => x !== c.code))} />
                        {c.code}
                      </label>
                    ))}
                  </div>
                </fieldset>
                {statusProblem && f.eligibility_status !== 'pending_review' && f.eligibility_status !== 'not_approved' && (
                  <p className="text-xs text-amber-300">{statusProblem}</p>
                )}
              </>
            )}
          </section>

          {/* Details */}
          <section className="space-y-4">
            <h3 className="font-display text-sm font-semibold text-zinc-50">Product details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input id="pe-name" label="Name" value={f.name} onChange={(e) => set('name', e.target.value)} />
              <Input id="pe-sku" label="SKU" value={f.sku} onChange={(e) => set('sku', e.target.value.toUpperCase())} />
              <Input id="pe-slug" label="URL slug" value={f.slug} placeholder={slugify(f.name)} onChange={(e) => set('slug', slugify(e.target.value))} />
              <div>
                <label htmlFor="pe-cat" className="label">Category</label>
                <input id="pe-cat" list="pe-cats" className="field" value={f.category} onChange={(e) => set('category', e.target.value)} />
                <datalist id="pe-cats">{PRODUCT_CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
              </div>
              <Input id="pe-unit" label="Strength / size" value={f.unit_size} onChange={(e) => set('unit_size', e.target.value)} placeholder="e.g. 10 mg · 15 mL" />
              <Input id="pe-pack" label="Pack contents" value={f.pack_contents} onChange={(e) => set('pack_contents', e.target.value)} />
            </div>
            <div>
              <label htmlFor="pe-desc" className="label">Description</label>
              <textarea id="pe-desc" rows={3} value={f.description} onChange={(e) => set('description', e.target.value)} className="field h-auto py-2" />
              <p className="mt-1 text-xs text-zinc-400">Factual only. Do not add therapeutic or medicinal claims unless the documentation authorises them.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input id="pe-cas" label="CAS number" value={f.cas_number} onChange={(e) => set('cas_number', e.target.value)} />
              <Input id="pe-mf" label="Molecular formula" value={f.molecular_formula} onChange={(e) => set('molecular_formula', e.target.value)} />
              <Input id="pe-mw" label="Molecular weight" value={f.molecular_weight} onChange={(e) => set('molecular_weight', e.target.value)} />
              <Input id="pe-seq" label="Sequence" value={f.sequence} onChange={(e) => set('sequence', e.target.value)} />
            </div>
            <div>
              <p className="label">Specifications</p>
              <div className="space-y-2">
                {f.specs.map(([k, v], i) => (
                  <div key={i} className="flex gap-2">
                    <input aria-label="Specification name" className="field" value={k} onChange={(e) => set('specs', f.specs.map((x, j) => (j === i ? ([e.target.value, x[1]] as [string, string]) : x)))} />
                    <input aria-label="Specification value" className="field" value={v} onChange={(e) => set('specs', f.specs.map((x, j) => (j === i ? ([x[0], e.target.value] as [string, string]) : x)))} />
                    <button aria-label="Remove specification" onClick={() => set('specs', f.specs.filter((_, j) => j !== i))} className="px-2 text-zinc-500 hover:text-red-300"><X className="h-4 w-4" /></button>
                  </div>
                ))}
                <button onClick={() => set('specs', [...f.specs, ['', '']])} className="text-xs font-medium text-emerald-400 hover:underline">+ Add specification</button>
              </div>
            </div>
            <Input id="pe-storage" label="Storage notes" value={f.storage_notes} onChange={(e) => set('storage_notes', e.target.value)} />
          </section>

          {/* Images */}
          <section className="space-y-3">
            <h3 className="font-display text-sm font-semibold text-zinc-50">Images</h3>
            {isNew ? (
              <p className="text-xs text-zinc-400">Save the product first, then add images.</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-3">
                  {images.map((img, i) => (
                    <div key={img.path} className="relative h-24 w-24 overflow-hidden rounded-lg border border-white/10 bg-[#f2f2f0]">
                      {img.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img.url} alt="" className="h-full w-full object-contain" />
                      )}
                      {i === 0 && <span className="absolute left-1 top-1 rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] text-white">Primary</span>}
                      <div className="absolute bottom-1 right-1 flex gap-1">
                        {i > 0 && (
                          <button onClick={() => setImages((x) => [x[i], ...x.filter((_, j) => j !== i)])} className="rounded bg-black/70 px-1.5 text-[10px] text-zinc-100 shadow">Primary</button>
                        )}
                        <button aria-label="Remove image" onClick={() => setImages((x) => x.filter((_, j) => j !== i))} className="rounded bg-black/70 p-1 text-zinc-200 shadow hover:text-red-300"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-white/15 text-xs text-zinc-400 hover:border-white/30 hover:text-zinc-100 disabled:opacity-50">
                    <ImagePlus className="h-5 w-5" /> {uploading ? 'Uploading…' : 'Add image'}
                  </button>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                </div>
                <p className="text-xs text-zinc-400">JPEG, PNG or WebP, up to 5 MB. Uploads are saved immediately; ordering and removal are saved when you press Save. Packaging text shown in images must be covered by the product&apos;s approval.</p>
                <Input id="pe-alt" label="Image alt text" value={f.alt_text} onChange={(e) => set('alt_text', e.target.value)} />
              </>
            )}
          </section>

          {/* Commercial */}
          <section className="space-y-4">
            <h3 className="font-display text-sm font-semibold text-zinc-50">Pricing &amp; inventory</h3>
            <div className="grid gap-4 sm:grid-cols-4">
              <Input id="pe-gbp" label="Price GBP" type="number" min={0} step="0.01" value={f.price_gbp} onChange={(e) => set('price_gbp', e.target.value)} />
              <Input id="pe-eur" label="Price EUR" type="number" min={0} step="0.01" value={f.price_eur} onChange={(e) => set('price_eur', e.target.value)} />
              <Input id="pe-kgbp" label="10-pack GBP" type="number" min={0} step="0.01" value={f.kit_price_gbp} onChange={(e) => set('kit_price_gbp', e.target.value)} hint="Optional" />
              <Input id="pe-keur" label="10-pack EUR" type="number" min={0} step="0.01" value={f.kit_price_eur} onChange={(e) => set('kit_price_eur', e.target.value)} hint="Optional" />
            </div>
            <div className="grid items-end gap-4 sm:grid-cols-4">
              <Input id="pe-stock" label="Stock (units)" type="number" min={0} value={f.stock_quantity} onChange={(e) => set('stock_quantity', e.target.value)} />
              <Input id="pe-max" label="Max per order" type="number" min={1} value={f.max_per_order} onChange={(e) => set('max_per_order', e.target.value)} />
              <label className="flex h-11 items-center gap-2 text-zinc-200"><input type="checkbox" className="accent-emerald-500" checked={f.in_stock} onChange={(e) => set('in_stock', e.target.checked)} /> In stock</label>
              <label className="flex h-11 items-center gap-2 text-zinc-200"><input type="checkbox" className="accent-emerald-500" checked={f.is_featured} onChange={(e) => set('is_featured', e.target.checked)} /> Featured</label>
            </div>
          </section>

          {/* CoA */}
          <section className="space-y-4">
            <h3 className="font-display text-sm font-semibold text-zinc-50">Certificate of Analysis</h3>
            <p className="-mt-2 text-xs text-zinc-400">Genuine, batch-specific documents only.</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input id="pe-batch" label="Batch number" value={f.coa_batch} onChange={(e) => set('coa_batch', e.target.value)} />
              <Input id="pe-cdate" label="Issue date" value={f.coa_date} onChange={(e) => set('coa_date', e.target.value)} />
              <Input id="pe-curl" label="Document URL" type="url" value={f.coa_url} onChange={(e) => set('coa_url', e.target.value)} placeholder="https://…" />
            </div>
          </section>

          {err && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-300">{err}</p>}
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-white/10 bg-card px-6 py-4">
          <button onClick={onClose} className="btn-secondary h-10">Cancel</button>
          <button onClick={save} disabled={saving || !f.name.trim() || !f.sku.trim() || (!isNew && !!statusProblem && f.eligibility_status !== 'pending_review' && f.eligibility_status !== 'not_approved')} className="btn-primary h-10">
            {saving ? 'Saving…' : isNew ? 'Create product' : 'Save'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
