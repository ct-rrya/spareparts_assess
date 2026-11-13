'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
}

export function BackButton({
  fallbackHref = '/products',
  label = 'Go back',
}: BackButtonProps) {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5DCF3] bg-white hover:bg-[#EAEFFC] px-3 h-8 sp-mono text-xs font-semibold text-[#0F42C0] transition-colors cursor-pointer"
    >
      <ArrowLeft size={14} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

