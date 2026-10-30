'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  asLink?: boolean;
}

export function AzLabsLogo({
  className = '',
  showTagline = false,
  size = 'md',
  asLink = true,
}: LogoProps) {
  const [imageError, setImageError] = useState(false);

  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Precision Scientific Mark */}
      <div className="relative flex items-center justify-center">
        {!imageError ? (
          <img
            src="/images/az-labs-logo.svg"
            alt="AZ Labs Logo"
            className={`${iconSizes[size]} object-contain`}
            onError={() => setImageError(true)}
          />
        ) : null}

        {/* Fallback Vector Emblem when PNG is not yet in /images */}
        {imageError && (
          <div
            className={`relative ${iconSizes[size]} rounded-lg bg-gradient-to-br from-zinc-900 via-neutral-900 to-black border border-emerald-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]`}
          >
            {/* Emerald Geometric Accents */}
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
            <svg
              className="w-full h-full p-1.5"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Precision Reticle */}
              <circle
                cx="20"
                cy="20"
                r="18"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeDasharray="2 4"
                className="text-emerald-500/40"
              />
              {/* AZ Monogram Geometry */}
              <path
                d="M12 28L18 12L24 28M14.5 23H21.5"
                stroke="#10b981"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M23 14H30L23 26H30"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 font-bold tracking-tight">
          <span className={`text-white font-mono ${titleSizes[size]}`}>AZ</span>
          <span className={`text-emerald-400 font-sans tracking-wider ${titleSizes[size]}`}>
            LABS
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] ml-0.5" />
        </div>
        {showTagline && (
          <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 -mt-0.5">
            Research. Refined.
          </span>
        )}
      </div>
    </div>
  );

  if (asLink) {
    return (
      <Link href="/" className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
