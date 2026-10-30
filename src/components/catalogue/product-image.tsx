'use client';

import React, { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  category: string;
  capColor?: string;
  sku?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
}

export function ProductImage({
  src,
  alt,
  category,
  capColor = '#10b981',
  sku = 'AZ-PEP',
  className = '',
  aspectRatio = 'square',
}: ProductImageProps) {
  const [error, setError] = useState(false);

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
  };

  // Ultra-realistic lyophilized peptide vial SVG renderer
  const renderPeptideVial = () => {
    const isLiquid = category === 'Laboratory Solutions';

    return (
      <svg
        className="w-3/4 h-3/4 max-w-[150px] drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
        viewBox="0 0 120 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Glass body gradient */}
          <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#27272a" stopOpacity="0.8" />
            <stop offset="25%" stopColor="#3f3f46" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#71717a" stopOpacity="0.1" />
            <stop offset="75%" stopColor="#3f3f46" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#18181b" stopOpacity="0.9" />
          </linearGradient>

          {/* Aluminum crimp collar gradient */}
          <linearGradient id="crimpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a1a1aa" />
            <stop offset="35%" stopColor="#f4f4f5" />
            <stop offset="70%" stopColor="#d4d4d8" />
            <stop offset="100%" stopColor="#71717a" />
          </linearGradient>

          {/* Flip-off plastic button gradient */}
          <linearGradient id="capGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
          </linearGradient>

          {/* Lyophilized powder cake gradient */}
          <linearGradient id="powderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f4f4f5" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#e4e4e7" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#d4d4d8" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Shadow under vial */}
        <ellipse cx="60" cy="150" rx="34" ry="6" fill="#000000" fillOpacity="0.6" filter="blur(3px)" />

        {/* 1. Glass Vial Outer Wall */}
        <rect
          x="32"
          y="38"
          width="56"
          height="106"
          rx="10"
          fill="url(#glassGrad)"
          stroke="#52525b"
          strokeWidth="1.5"
        />

        {/* 2. Lyophilized Cake / Liquid at bottom of vial */}
        {!isLiquid ? (
          <path
            d="M34 112 Q60 115 86 112 L86 136 C86 141 82 143 78 143 L42 143 C38 143 34 141 34 136 Z"
            fill="url(#powderGrad)"
          />
        ) : (
          <path
            d="M34 85 Q60 88 86 85 L86 136 C86 141 82 143 78 143 L42 143 C38 143 34 141 34 136 Z"
            fill="rgba(56, 189, 248, 0.25)"
            stroke="#38bdf8"
            strokeWidth="0.8"
          />
        )}

        {/* 3. Laboratory Label On Vial Body */}
        <rect
          x="35"
          y="56"
          width="50"
          height="52"
          rx="2"
          fill="#0c1110"
          stroke="#27272a"
          strokeWidth="1"
        />
        {/* Brand Bar */}
        <rect x="35" y="56" width="50" height="8" rx="1" fill="#18221f" />
        <text x="40" y="62" fill="#10b981" fontSize="5" fontFamily="monospace" fontWeight="bold">
          AZ LABS
        </text>
        <circle cx="78" cy="60" r="1.5" fill={capColor} />

        {/* Product SKU text on label */}
        <text x="39" y="73" fill="#ffffff" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold">
          {sku}
        </text>
        <text x="39" y="80" fill="#a1a1aa" fontSize="4.2" fontFamily="monospace">
          IN-VITRO ONLY
        </text>

        {/* Purity & Batch Badges */}
        <rect x="38" y="86" width="44" height="6" rx="1" fill="#18181b" />
        <text x="40" y="90.5" fill="#10b981" fontSize="3.8" fontFamily="monospace">
          &gt;99% HPLC PASS
        </text>
        <line x1="38" y1="96" x2="82" y2="96" stroke="#27272a" strokeWidth="0.8" />
        <text x="39" y="103" fill="#71717a" fontSize="3.5" fontFamily="monospace">
          -20°C DESICCATE
        </text>

        {/* Glass reflection highlight on label & wall */}
        <path
          d="M37 40 L44 40 L44 140 L37 140 Z"
          fill="#ffffff"
          fillOpacity="0.08"
        />

        {/* 4. Glass Neck & Lip */}
        <rect x="44" y="24" width="32" height="15" fill="url(#glassGrad)" stroke="#52525b" strokeWidth="1" />

        {/* 5. Butyl Rubber Septum Stopper (inside collar) */}
        <rect x="47" y="22" width="26" height="5" rx="1" fill="#3f3f46" />

        {/* 6. Polished Aluminum Crimp Collar */}
        <rect
          x="43"
          y="16"
          width="34"
          height="11"
          rx="2"
          fill="url(#crimpGrad)"
          stroke="#71717a"
          strokeWidth="1"
        />
        {/* Aluminum score lines */}
        <line x1="45" y1="21" x2="75" y2="21" stroke="#a1a1aa" strokeWidth="0.8" />

        {/* 7. Colored Flip-Off Plastic Top Seal */}
        <rect
          x="41"
          y="9"
          width="38"
          height="8"
          rx="3"
          fill={capColor}
          stroke="#000000"
          strokeOpacity="0.3"
          strokeWidth="1"
        />
        {/* Cap sheen & highlight */}
        <rect x="41" y="9" width="38" height="8" rx="3" fill="url(#capGrad)" />
        <ellipse cx="60" cy="11" rx="14" ry="1.5" fill="#ffffff" fillOpacity="0.3" />
      </svg>
    );
  };

  return (
    <div
      className={`relative w-full ${aspectClasses[aspectRatio]} overflow-hidden rounded-xl bg-gradient-to-b from-zinc-950 via-zinc-900/60 to-black flex items-center justify-center p-4 border border-zinc-800/80 group-hover:border-emerald-500/40 transition-all duration-300 ${className}`}
    >
      {/* Background Precision Grid Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/20 via-transparent to-transparent pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(to right, #10b981 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Render authorized photograph or scientific 3D vector vial */}
      {!error && src && src !== '#' ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
          onError={() => setError(true)}
          loading="lazy"
        />
      ) : (
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
          {renderPeptideVial()}
          <span className="mt-1 text-[9px] font-mono uppercase tracking-widest text-emerald-400/80">
            AZ LABS PRO • LYOPHILIZED SOLID
          </span>
        </div>
      )}
    </div>
  );
}
