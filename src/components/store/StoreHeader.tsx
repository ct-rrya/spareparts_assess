'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Category } from '@/types';
import { Loader2, Menu, Search, X } from 'lucide-react';

interface StoreHeaderProps {
  categories?: Category[];
}

export function StoreHeader({ categories = [] }: StoreHeaderProps) {
  const router = useRouter();
  const { itemCount, hydrated } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleHeaderSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    startTransition(() => {
      router.push(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
    });
  }

  return (
    <div className="sticky top-0 z-40 bg-white">
      <header className="border-b border-[#D5DCF3] bg-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-[60px] sm:h-[72px] flex items-center justify-between gap-4 sm:gap-8">
          {/* brand logo with flask mark */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-[#0E0B33] no-underline shrink-0"
          >
            <span className="w-7 h-7 sm:w-[30px] sm:h-[30px] rounded-lg bg-[#1F06AC] flex items-center justify-center shrink-0">
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#E3EF4F"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 3h8M9 3v6l-4.5 9A2 2 0 006.3 21h11.4a2 2 0 001.8-3L15 9V3M7.5 15h9" />
              </svg>
            </span>
            <span className="font-catchye text-2xl sm:text-[28px] tracking-wide text-[#1F06AC]">
              SpareParts
            </span>
          </Link>

          {/* desktop category navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm sm:text-[15px] font-medium text-[#0E0B33]">
            {categories.slice(0, 3).map((cat, idx) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="flex items-center gap-1.5 hover:text-[#0F42C0] transition-colors py-2 whitespace-nowrap"
              >
                <span className="sp-mono text-xs text-[#0F42C0] font-semibold">
                  {cat.code || `0${idx + 1}`}
                </span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </nav>

          <div className="flex-1 hidden md:block" />

          {/* search bar desktop */}
          <form
            onSubmit={handleHeaderSearch}
            className="hidden md:flex items-center w-[240px] lg:w-[280px]"
          >
            <div className="relative flex w-full">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog..."
                aria-label="Search catalog"
                className="w-full h-11 rounded-lg border border-[#C9D2F0] bg-white pl-9 pr-3 text-sm text-[#0E0B33] placeholder:text-[#4A4F78] focus:outline-none focus:border-[#1F06AC]"
              />
              <span className="absolute left-3 top-3 text-[#4A4F78] pointer-events-none">
                {isPending ? (
                  <Loader2 size={16} className="animate-spin text-[#1F06AC]" />
                ) : (
                  <Search size={16} />
                )}
              </span>
            </div>
          </form>

          {/* cart and mobile triggers */}
          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 rounded-lg bg-[#1F06AC] hover:bg-[#170485] text-white px-3.5 sm:px-4 h-11 text-sm font-semibold transition-colors cursor-pointer"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#E3EF4F"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 7h12l-1 12H7L6 7z" />
                <path d="M9 7a3 3 0 016 0" />
              </svg>
              <span className="hidden sm:inline">Cart</span>
              <span className="sp-mono bg-[#E3EF4F] text-[#1F06AC] text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {hydrated ? itemCount : 0}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className="lg:hidden rounded-lg border border-[#C9D2F0] h-11 w-11 flex items-center justify-center text-[#0E0B33] bg-white cursor-pointer"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* mobile slide-out drawer menu */}
      {menuOpen && (
        <div className="lg:hidden border-b border-[#D5DCF3] bg-white px-4 py-4 flex flex-col gap-3 shadow-lg">
          <form onSubmit={handleHeaderSearch} className="md:hidden flex gap-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog..."
              className="flex-1 h-11 rounded-lg border border-[#C9D2F0] px-3.5 text-sm bg-white"
            />
            <button
              type="submit"
              className="h-11 px-4 rounded-lg bg-[#0F42C0] text-white text-sm font-semibold cursor-pointer"
            >
              Search
            </button>
          </form>

          <div className="flex flex-col gap-1 text-[15px] font-medium pt-1">
            <Link
              href="/products"
              onClick={() => setMenuOpen(false)}
              className="py-2.5 px-3 rounded-md hover:bg-[#EAEFFC] text-[#0E0B33]"
            >
              All Products
            </Link>
            {categories.map((cat, idx) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                onClick={() => setMenuOpen(false)}
                className="py-2.5 px-3 rounded-md hover:bg-[#EAEFFC] text-[#0E0B33] flex items-center justify-between"
              >
                <span>{cat.name}</span>
                <span className="sp-mono text-xs text-[#0F42C0] font-semibold">
                  {cat.code || `0${idx + 1}`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
