import Image from 'next/image';

/** Product photo from storage, or a neutral branded placeholder. */
export function ProductImage({
  src,
  alt,
  className = '',
  sizes = '(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw',
  priority = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative aspect-square overflow-hidden bg-[#f2f2f0] ${className}`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-contain p-4 mix-blend-multiply" />
      ) : (
        <div className="flex h-full items-center justify-center" role="img" aria-label={alt}>
          <Image src="/images/az-labs-mark-dark.png" alt="" width={96} height={60} className="opacity-10" />
        </div>
      )}
    </div>
  );
}
