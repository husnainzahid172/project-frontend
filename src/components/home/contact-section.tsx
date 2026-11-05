import { Mail, MessageCircle } from 'lucide-react';
import { SITE, whatsappLink } from '@/lib/site-config';

export function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-20 border-t border-white/10 py-20 sm:py-24">
      <div className="container-page">
        <div className="surface flex flex-col gap-10 p-8 sm:p-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-md">
            <p className="eyebrow">Contact</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-zinc-50">Talk to us</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              For order support, documentation requests or general questions, message us on WhatsApp or send an email.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:min-w-[280px]">
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-accent justify-start px-5">
              <MessageCircle className="h-4 w-4" /> WhatsApp {SITE.whatsappDisplay}
            </a>
            <a href={`mailto:${SITE.email}`} className="btn-secondary justify-start px-5">
              <Mail className="h-4 w-4" /> {SITE.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
