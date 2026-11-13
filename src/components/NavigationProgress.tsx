'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navigating, setNavigating] = useState(false);

  // reset loading indicator once navigation finishes
  useEffect(() => {
    setNavigating(false);
  }, [pathname, searchParams]);

  // trigger visible loading state immediately when internal links are clicked
  useEffect(() => {
    let safetyTimer: ReturnType<typeof setTimeout> | null = null;
    let slowTimer: ReturnType<typeof setTimeout> | null = null;

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

        // notify toast if navigation takes over 2.5s (fallback for browsers without navigator.connection)
        slowTimer = setTimeout(() => {
          window.dispatchEvent(new CustomEvent('spareparts:slow-network'));
        }, 2500);
        safetyTimer = setTimeout(() => setNavigating(false), 8000);
      }
    }

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
      if (safetyTimer) clearTimeout(safetyTimer);
      if (slowTimer) clearTimeout(slowTimer);
    };
  }, [pathname, searchParams]);

  if (!navigating) return null;

  return (
    <>
      {/* top progress bar */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-50 h-1 bg-indigo-100 overflow-hidden"
      >
        <div className="h-full bg-[#1F06AC] w-2/3 animate-pulse" />
      </div>

      {/* subtle screen dim + centered loading icon */}
      <div
        aria-live="polite"
        aria-label="Loading"
        className="fixed inset-0 z-50 bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none"
      >
        <div className="bg-white border border-slate-200 shadow-lg rounded-full p-3.5 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-[#1F06AC]" />
        </div>
      </div>
    </>
  );
}
