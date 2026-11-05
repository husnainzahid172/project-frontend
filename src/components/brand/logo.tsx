import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  asLink?: boolean;
  size?: 'sm' | 'md';
}

export function AzLabsLogo({ className = '', asLink = true, size = 'md' }: LogoProps) {
  const h = size === 'sm' ? 22 : 26;
  const content = (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <Image src="/images/az-labs-mark.png" alt="" width={Math.round(h * 1.59)} height={h} priority />
      <span className="font-display text-[15px] tracking-[0.02em] text-zinc-50">
        <span className="font-extrabold">AZ</span>
        <span className="ml-1 font-light tracking-[0.14em]">LABS</span>
      </span>
    </span>
  );
  if (!asLink) return content;
  return (
    <Link href="/" aria-label="AZ Labs home" className="rounded-md">
      {content}
    </Link>
  );
}
