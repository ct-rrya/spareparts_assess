'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Monitor, X } from 'lucide-react';

// universal admin nav list
const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/customers', label: 'Customers' },
];

export function AdminShell({
  children,
  storageMode = 'local-fallback',
}: {
  children: React.ReactNode;
  storageMode?: 'supabase' | 'local-fallback';
}) {
  const pathname = usePathname();
  const [desktopWarningDismissed, setDesktopWarningDismissed] = useState(false);
  const mobileNavRef = useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateNavScroll = useCallback(() => {
    const el = mobileNavRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateNavScroll();
    window.addEventListener('resize', updateNavScroll);
    return () => window.removeEventListener('resize', updateNavScroll);
  }, [updateNavScroll, pathname]);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.assign('/admin/login');
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB] text-[#0E0B33] flex flex-col md:flex-row">
      {/* mobile topbar + horizontal tabs */}
      <header className="md:hidden sticky top-0 z-40">
        <div className="bg-[#1F06AC] text-white px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/images/favicon.svg"
              alt="SpareParts"
              className="h-6 w-6 object-contain shrink-0"
            />
            <span className="font-catchye text-xl tracking-wide">SpareParts</span>
            <span className="sp-mono bg-[#E3EF4F] text-[#1F06AC] text-[10px] font-bold px-2 py-0.5 rounded">
              ADMIN
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="sp-mono text-[11px] font-semibold tracking-wider text-white/90 hover:text-[#E3EF4F] px-2 py-1.5 cursor-pointer"
          >
            SIGN OUT
          </button>
        </div>

        <div className="relative bg-white border-b border-[#E2E4EC]">
          <nav
            ref={mobileNavRef}
            onScroll={updateNavScroll}
            aria-label="Admin navigation"
            className="px-2 flex items-center gap-1 overflow-x-auto scrollbar-none"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 px-3.5 h-11 inline-flex items-center text-[13px] whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? 'border-[#E3EF4F] text-[#1F06AC] font-semibold'
                      : 'border-transparent text-[#4A4F78] hover:text-[#0E0B33] font-medium'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {canScrollLeft && (
            <button
              type="button"
              onClick={() => mobileNavRef.current?.scrollBy({ left: -120, behavior: 'smooth' })}
              aria-label="Scroll navigation left"
              className="absolute left-0 top-0 bottom-0 pr-3 pl-1 flex items-center bg-gradient-to-r from-white via-white/95 to-transparent text-[#1F06AC] cursor-pointer"
            >
              <span className="h-6 w-6 rounded-full bg-[#F6F7FB] border border-[#D5DCF3] flex items-center justify-center">
                <ChevronLeft size={14} />
              </span>
            </button>
          )}

          {canScrollRight && (
            <button
              type="button"
              onClick={() => mobileNavRef.current?.scrollBy({ left: 120, behavior: 'smooth' })}
              aria-label="Swipe or scroll navigation right"
              className="absolute right-0 top-0 bottom-0 pl-4 pr-1 flex items-center bg-gradient-to-l from-white via-white/95 to-transparent text-[#1F06AC] cursor-pointer"
            >
              <span className="h-6 w-6 rounded-full bg-[#F6F7FB] border border-[#D5DCF3] flex items-center justify-center">
                <ChevronRight size={14} />
              </span>
            </button>
          )}
        </div>
      </header>

      {/* fixed universal sidebar (desktop) */}
      <aside className="hidden md:flex bg-[#1F06AC] text-white w-[250px] shrink-0 flex-col sticky top-0 h-screen overflow-y-auto p-5 border-r border-[#5882E8]/30 z-30">
        {/* desktop logo */}
        <div className="hidden md:flex items-center justify-between px-2 pb-6 border-b border-[#5882E8]/40 mb-3">
          <div className="flex items-center gap-2">
            <img
              src="/images/logo.svg"
              alt="SpareParts"
              className="h-7 w-7 object-contain shrink-0"
            />
            <div className="font-catchye text-2xl tracking-wide text-white">
              SpareParts
            </div>
          </div>
          <span className="sp-mono bg-[#E3EF4F] text-[#1F06AC] text-[10px] font-bold px-2 py-0.5 rounded">
            ADMIN
          </span>
        </div>

        {/* nav links */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center h-11 px-3.5 rounded-lg text-[15px] transition-colors ${
                  isActive
                    ? 'bg-[#E3EF4F] text-[#1F06AC] font-semibold'
                    : 'text-[#DDE5FB] hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* return to storefront */}
        <Link
          href="/"
          className="block px-3.5 py-2.5 text-xs font-semibold text-[#DDE5FB] hover:text-[#E3EF4F] mt-4 border-t border-[#5882E8]/40 pt-4 transition-colors"
        >
          ← View Storefront
        </Link>

        {/* bottom profile & signout */}
        <div className="mt-auto pt-6 px-1 flex flex-col gap-3 border-t border-[#5882E8]/40">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-white">Store Admin</span>
            <span className="sp-mono text-[11px] text-[#DDE5FB]">
              admin@spareparts.ph
            </span>
          </div>

          <div className="sp-mono text-[10px] text-[#DDE5FB] border border-[#5882E8]/50 rounded px-2 py-1 bg-[#170485]/40">
            {storageMode === 'supabase'
              ? 'Storage: Supabase Live'
              : 'Storage: Local Fallback'}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg bg-white/10 hover:bg-white/20 text-[#E3EF4F] hover:text-white border border-[#5882E8]/60 h-10 text-xs font-semibold sp-mono tracking-wider transition-colors cursor-pointer"
          >
            SIGN OUT
          </button>
        </div>
      </aside>

      {/* main content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full flex flex-col gap-5 sm:gap-6">
        {!desktopWarningDismissed && (
          <div
            role="status"
            className="md:hidden rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-950 flex items-center justify-between gap-2.5"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Monitor size={15} className="text-amber-700 shrink-0" />
              <span className="leading-snug">
                Admin dashboard is best experienced on desktop.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDesktopWarningDismissed(true)}
              aria-label="Dismiss desktop notice"
              className="text-amber-700 hover:text-amber-950 p-1 shrink-0 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
