'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navigating, setNavigating] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  // reset loading indicator once navigation finishes
  useEffect(() => {
    setNavigating(false);
    setShowSpinner(false);
  }, [pathname, searchParams]);

  // trigger visible loading state immediately when internal links are clicked
  useEffect(() => {
    let safetyTimer: ReturnType<typeof setTimeout> | null = null;
    let slowTimer: ReturnType<typeof setTimeout> | null = null;
    let spinnerTimer: ReturnType<typeof setTimeout> | null = null;

    function handleClick(e: MouseEvent) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        anchor.target === '_blank'
      ) {
        return;
      }

      const current =
        pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      if (href !== current) {
        setNavigating(true);
        if (safetyTimer) clearTimeout(safetyTimer);
        if (slowTimer) clearTimeout(slowTimer);
        if (spinnerTimer) clearTimeout(spinnerTimer);

        // only show center spinner if route takes longer than 400ms to load
        spinnerTimer = setTimeout(() => setShowSpinner(true), 400);

        // notify toast if navigation takes over 5s
        slowTimer = setTimeout(() => {
          window.dispatchEvent(new CustomEvent('spareparts:slow-network'));
        }, 5000);
        safetyTimer = setTimeout(() => {
          setNavigating(false);
          setShowSpinner(false);
        }, 9000);
      }
    }

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
      if (safetyTimer) clearTimeout(safetyTimer);
      if (slowTimer) clearTimeout(slowTimer);
      if (spinnerTimer) clearTimeout(spinnerTimer);
    };
  }, [pathname, searchParams]);

  if (!navigating) return null;

  return (
    <>
      {/* sleek top progress bar without screen freeze */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-[#EAEFFC] overflow-hidden"
      >
        <div className="h-full bg-[#0F42C0] w-full animate-pulse transition-all duration-300" />
      </div>

      {/* centered spinner only if loading exceeds 400ms without heavy backdrop blur */}
      {showSpinner && (
        <div
          aria-live="polite"
          aria-label="Loading"
          className="fixed bottom-6 right-6 z-50 pointer-events-none"
        >
          <div className="bg-white/95 border border-[#D5DCF3] shadow-lg rounded-full p-3 flex items-center justify-center">
            <Loader2 size={22} className="animate-spin text-[#0F42C0]" />
          </div>
        </div>
      )}
    </>
  );
}
