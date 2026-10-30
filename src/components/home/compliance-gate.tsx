'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import { AzLabsLogo } from '@/components/brand/logo';

export function ComplianceGate() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const acknowledged = localStorage.getItem('az_labs_compliance_v1');
      if (!acknowledged) {
        setIsOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('az_labs_compliance_v1', 'acknowledged');
    } catch {
      // ignore
    }
    setIsOpen(false);
  };

  const handleExit = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md bg-zinc-950 border border-zinc-800 text-zinc-100 p-6 shadow-2xl rounded-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AzLabsLogo showTagline size="md" asLink={false} />
          </div>

          <div className="w-12 h-12 rounded-full bg-amber-950/40 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <ShieldAlert className="h-6 w-6" />
          </div>

          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white text-center font-mono">
              Age Verification & In-Vitro Research Policy
            </DialogTitle>
          </DialogHeader>

          <div className="text-xs text-zinc-300 space-y-3 text-left leading-relaxed font-sans bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
            <p>
              Welcome to <strong className="text-white">AZ Labs (azlabs.pro)</strong>. Before browsing our peptide catalogue or placing an order, please review and confirm:
            </p>
            <ul className="space-y-2 text-[11px] text-zinc-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>You are at least <strong>21 years of age</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>All chemical compounds and lyophilized peptides are ordered strictly for <strong>in-vitro laboratory research and analytical testing</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Products are <strong>NOT</strong> for human or animal consumption, medical therapy, or cosmetic use.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              onClick={handleAccept}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-5 text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              I Am 21+ & Confirm Research Use
            </Button>
            <Button
              variant="outline"
              onClick={handleExit}
              className="border-zinc-800 hover:bg-zinc-900 text-zinc-400 text-xs py-5"
            >
              Exit Site
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
