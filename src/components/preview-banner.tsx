'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store-context';

export function PreviewBanner() {
  const { preview } = useStore();
  if (!preview) return null;
  return (
    <div className="bg-amber-300 text-zinc-900">
      <div className="container-page flex flex-wrap items-center justify-between gap-2 py-2 text-xs sm:text-sm">
        <p>
          <strong>Private preview.</strong> Only you can see this. Products without a price show a test price of £10 / €12. Checkout opens a
          WhatsApp message marked TEST and saves nothing.
        </p>
        <div className="flex gap-4">
          <Link href="/" className="underline underline-offset-2">Public site</Link>
          <Link href="/admin" className="underline underline-offset-2">Admin</Link>
        </div>
      </div>
    </div>
  );
}
