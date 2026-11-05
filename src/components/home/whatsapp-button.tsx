import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '@/lib/site-config';

export function WhatsAppFloatingButton() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Message AZ Labs support on WhatsApp"
      className="fixed bottom-5 right-5 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-card text-emerald-400 shadow-lg shadow-black/40 transition-colors hover:border-emerald-700 hover:text-emerald-400"
    >
      <MessageCircle className="h-5 w-5" />
    </a>
  );
}
