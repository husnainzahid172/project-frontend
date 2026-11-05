'use client';

import { useEffect, useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { AzLabsLogo } from '@/components/brand/logo';
import { useCart } from '@/lib/cart-context';
import { useCurrency } from '@/lib/currency-context';
import { useStore } from '@/lib/store-context';

const LINKS = [
  { href: '/#catalogue', label: 'Catalogue' },
  { href: '/#quality', label: 'Quality' },
  { href: '/#about', label: 'About' },
  { href: '/#contact', label: 'Contact' },
];

function CurrencyToggle({ compact = false }: { compact?: boolean }) {
  const { currency, setCurrency } = useCurrency();
  return (
    <div role="group" aria-label="Currency" className="flex rounded-full border border-white/10 p-0.5">
      {(['GBP', 'EUR'] as const).map((c) => (
        <button
          key={c}
          onClick={() => setCurrency(c)}
          aria-pressed={currency === c}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${currency === c ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-zinc-50'}`}
        >
          {compact ? c : c === 'GBP' ? '£ GBP' : '€ EUR'}
        </button>
      ))}
    </div>
  );
}

export function Navbar() {
  const { itemCount, setIsCartOpen } = useCart();
  const { base } = useStore();
  const links = LINKS.map((l) => ({ ...l, href: `${base}${l.href}` }));
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 bg-background/90 backdrop-blur transition-[border-color] ${scrolled ? 'border-b border-white/10' : 'border-b border-transparent'}`}>
      <div className="container-page flex h-16 items-center justify-between">
        <AzLabsLogo />
        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-zinc-300 transition-colors hover:text-zinc-50">{l.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block"><CurrencyToggle /></div>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-200 transition-colors hover:bg-white/10"
            aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            {itemCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-semibold text-white">{itemCount}</span>
            )}
          </button>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-200 hover:bg-white/10 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div id="mobile-nav" className="border-t border-white/10 bg-card md:hidden">
          <nav aria-label="Mobile" className="container-page flex flex-col py-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-3 text-[15px] text-zinc-100">{l.label}</a>
            ))}
            <div className="mt-2 border-t border-white/10 pt-4"><CurrencyToggle compact /></div>
          </nav>
        </div>
      )}
    </header>
  );
}
