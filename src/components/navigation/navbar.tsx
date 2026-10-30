'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AzLabsLogo } from '@/components/brand/logo';
import { useCart } from '@/lib/cart-context';
import { useCurrency } from '@/lib/currency-context';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  Menu,
  X,
  MessageCircle,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { getWhatsAppNumber } from '@/lib/order-service';

export function Navbar() {
  const { itemCount, setIsCartOpen } = useCart();
  const { currency, setCurrency } = useCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Peptides Catalogue', href: '#catalogue' },
    { label: 'Quality & CoA', href: '#standards' },
    { label: 'About AZ Labs', href: '#about' },
    { label: 'Research Policies', href: '#regulatory' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleOpenWhatsApp = () => {
    const phone = getWhatsAppNumber();
    const msg = encodeURIComponent(
      'Hello AZ Labs (azlabs.pro), I would like to inquire about peptide stock and 10-vial kit boxes.'
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      {/* Top Banner Notice (Inspired by Vitralab Research) */}
      <div className="bg-emerald-950/60 border-b border-emerald-900/40 px-4 py-1 text-center text-[11px] font-mono text-emerald-300 flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>
          IN-VITRO LABORATORY USE ONLY • DISPATCHING TO UK & ELIGIBLE EU • WHATSAPP DESK:{' '}
          <a
            href="https://wa.me/447448399290"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white font-bold font-mono"
          >
            +44 7448 399290
          </a>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <AzLabsLogo showTagline size="md" />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-300">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-emerald-400 transition-colors py-1 relative group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-200 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Right Actions: WhatsApp, Currency, Cart, Admin */}
        <div className="flex items-center gap-2.5">
          {/* Direct WhatsApp Action in Navbar */}
          <Button
            onClick={handleOpenWhatsApp}
            variant="ghost"
            size="sm"
            className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-900/50 h-9 px-2.5 font-mono"
            title="Chat directly on WhatsApp"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>WhatsApp Desk</span>
          </Button>

          {/* Currency Toggle */}
          <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/80 p-0.5 text-xs font-mono">
            <button
              onClick={() => setCurrency('GBP')}
              className={`px-2 py-1 rounded transition-colors ${
                currency === 'GBP'
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              £ GBP
            </button>
            <button
              onClick={() => setCurrency('EUR')}
              className={`px-2 py-1 rounded transition-colors ${
                currency === 'EUR'
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              € EUR
            </button>
          </div>

          {/* Cart Trigger */}
          <Button
            onClick={() => setIsCartOpen(true)}
            variant="outline"
            size="sm"
            className="relative border-zinc-800 bg-zinc-900/80 hover:bg-zinc-850 hover:border-emerald-500/50 text-zinc-200 h-9 px-3 gap-2 text-xs"
          >
            <ShoppingCart className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline font-mono font-medium">Cart</span>
            {itemCount > 0 && (
              <span className="flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-emerald-500 text-black font-mono text-[11px] font-bold shadow-[0_0_10px_#10b981]">
                {itemCount}
              </span>
            )}
          </Button>

          {/* Admin Link */}
          <Link
            href="/admin"
            className="hidden sm:flex items-center gap-1 text-xs text-zinc-400 hover:text-emerald-400 px-2 py-1 rounded border border-zinc-800/60 bg-zinc-900/40 hover:border-emerald-500/40 transition-colors font-mono"
            title="Admin Dashboard"
          >
            <Lock className="h-3 w-3" />
            <span className="hidden md:inline">Admin</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 bg-zinc-900"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 p-4 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm text-zinc-300 font-medium">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-zinc-900 hover:text-emerald-400 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleOpenWhatsApp();
              }}
              className="px-3 py-2 rounded-lg bg-emerald-950/60 text-emerald-300 flex items-center gap-2 font-mono text-xs border border-emerald-900/60 text-left"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp Desk: +44 7448 399290</span>
            </button>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-zinc-900 text-zinc-400 flex items-center gap-2 font-mono text-xs"
            >
              <Lock className="h-3.5 w-3.5" />
              Admin Portal
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
