'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppNumber } from '@/lib/order-service';

export function WhatsAppFloatingButton() {
  const handleOpen = () => {
    const phone = getWhatsAppNumber();
    const message = encodeURIComponent(
      'Hello AZ Labs (azlabs.pro), I would like to inquire regarding in-vitro research peptides, 10-vial kit boxes, and batch CoA availability.'
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-30">
      <button
        onClick={handleOpen}
        className="group relative flex items-center justify-center p-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Direct WhatsApp Order Desk"
        title="Chat with AZ Labs Peptide Technical Desk"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-black animate-ping" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-black" />
        <MessageCircle className="h-6 w-6" />

        {/* Hover label */}
        <span className="absolute right-full mr-3 whitespace-nowrap px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
          Direct WhatsApp Desk • +44 7448 399290
        </span>
      </button>
    </div>
  );
}
