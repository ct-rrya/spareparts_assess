'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';

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
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.assign('/admin/login');
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB] text-[#0E0B33] flex flex-col md:grid md:grid-cols-[250px_1fr]">
      {/* mobile header */}
      <div className="md:hidden bg-[#1F06AC] text-white px-4 py-3.5 flex items-center justify-between border-b border-[#5882E8]/40">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">SpareParts</span>
          <span className="sp-mono bg-[#E3EF4F] text-[#1F06AC] text-[10px] font-bold px-2 py-0.5 rounded">
            ADMIN
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle admin menu"
          className="rounded-lg border border-[#5882E8] p-2 text-white"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* sidebar matching design board */}
      <aside
        className={`${
          mobileOpen ? 'flex' : 'hidden'
        } md:flex bg-[#1F06AC] text-white p-5 flex-col gap-1.5 border-b md:border-b-0 md:border-r border-[#5882E8]/30`}
      >
        <div className="hidden md:flex items-center justify-between px-2 pb-6 border-b border-[#5882E8]/40 mb-3">
          <div className="text-xl font-bold tracking-tight text-white">
            Spare<span className="text-[#E3EF4F]">Parts</span>
          </div>
          <span className="sp-mono bg-[#E3EF4F] text-[#1F06AC] text-[10px] font-bold px-2 py-0.5 rounded">
            ADMIN
          </span>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center h-11 px-3.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#E3EF4F] text-[#1F06AC]'
                    : 'text-[#DDE5FB] hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/"
          className="block px-3.5 py-2.5 text-xs font-semibold text-[#DDE5FB] hover:text-white mt-4 border-t border-[#5882E8]/40 pt-4"
        >
          ← View Storefront
        </Link>

        <div className="mt-auto pt-6 px-1 flex flex-col gap-3 border-t border-[#5882E8]/40">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-white">Store Admin</span>
            <span className="sp-mono text-[11px] text-[#DDE5FB]">
              admin@spareparts.demo
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
            className="w-full rounded-lg bg-white/10 hover:bg-white/20 text-white border border-[#5882E8]/60 h-10 text-xs font-semibold transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* main admin content */}
      <main className="p-4 sm:p-6 lg:p-8 max-w-[1240px] w-full flex flex-col gap-6">
        {children}
      </main>
    </div>
  );
}
