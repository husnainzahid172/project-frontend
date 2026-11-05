import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export function Hero({ orderingOpen, hasProducts }: { orderingOpen: boolean; hasProducts: boolean }) {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <Image
        src="/images/az-labs-mark.png"
        alt=""
        width={564}
        height={354}
        aria-hidden
        priority
        className="pointer-events-none absolute right-[-3%] top-1/2 hidden w-[40%] max-w-[560px] -translate-y-1/2 opacity-[0.05] lg:block"
      />
      <div className="container-page relative pb-20 pt-20 sm:pb-28 sm:pt-28">
        <p className="eyebrow">AZ Labs · Research &amp; Life Sciences</p>
        <h1 className="mt-5 max-w-3xl font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight text-zinc-50 sm:text-6xl lg:text-7xl">
          Research.
          <br />
          <span className="text-zinc-500">Refined.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg">
          A focused catalogue for the UK and EU, with clear specifications, honest documentation and a team you can
          reach directly.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href="#catalogue" className="btn-primary">
            {hasProducts ? 'View catalogue' : 'About the catalogue'} <ArrowRight className="h-4 w-4" />
          </a>
          <a href="#contact" className="btn-secondary">Contact us</a>
        </div>
        {!orderingOpen && (
          <p className="mt-12 inline-flex max-w-xl items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden />
            Online ordering is not open yet. Products appear here once their documentation has been verified.
          </p>
        )}
      </div>
    </section>
  );
}
