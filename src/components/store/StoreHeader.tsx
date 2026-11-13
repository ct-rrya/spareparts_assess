'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Category } from '@/types';
import { Loader2, Menu, Search, ShoppingCart, X } from 'lucide-react';

interface StoreHeaderProps {
  categories?: Category[];
}

export function StoreHeader({ categories = [] }: StoreHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
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
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-[60px] sm:h-[72px] grid grid-cols-[1fr_auto_1fr] items-center gap-2 lg:flex lg:justify-between lg:gap-8">
          {/* mobile hamburger on left */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            className="lg:hidden justify-self-start rounded-lg border border-[#C9D2F0] h-9 w-9 flex items-center justify-center text-[#0E0B33] bg-white cursor-pointer shrink-0"
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          {/* brand logo (centered on mobile, left on desktop) */}
          <Link
            href="/"
            className="justify-self-center lg:justify-self-start flex items-center gap-1.5 sm:gap-2 text-[#0E0B33] no-underline shrink-0"
          >
            <img
              src="/images/logo.svg"
              alt="SpareParts"
              className="h-5 w-5 sm:h-9 sm:w-9 object-contain shrink-0"
            />
            <span className="font-catchye text-[19px] sm:text-[28px] tracking-wide text-[#1F06AC]">
              SpareParts
            </span>
          </Link>

          {/* desktop simple navigation */}
          <nav className="hidden lg:flex items-center gap-7 text-sm sm:text-[15px] font-semibold text-[#0E0B33]">
            <Link
              href="/"
              className={`transition-colors py-2 ${
                pathname === '/'
                  ? 'text-[#0F42C0] border-b-2 border-[#0F42C0] font-bold'
                  : 'text-[#0E0B33] hover:text-[#0F42C0]'
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={`transition-colors py-2 ${
                pathname.startsWith('/products')
                  ? 'text-[#0F42C0] border-b-2 border-[#0F42C0] font-bold'
                  : 'text-[#0E0B33] hover:text-[#0F42C0]'
              }`}
            >
              Products
            </Link>
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
                placeholder="Search products..."
                aria-label="Search products"
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

          {/* cart and mobile search trigger */}
          <div className="justify-self-end flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open search"
              className="md:hidden rounded-lg border border-[#C9D2F0] h-9 w-9 flex items-center justify-center text-[#0E0B33] bg-white cursor-pointer"
            >
              <Search size={15} />
            </button>

            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-[#1F06AC] hover:bg-[#170485] text-white px-2.5 sm:px-4 h-9 sm:h-11 text-sm font-semibold transition-colors cursor-pointer"
            >
              <ShoppingCart
                size={15}
                className="sm:w-[18px] sm:h-[18px] text-[#E3EF4F]"
                aria-hidden="true"
              />
              <span className="hidden sm:inline">Cart</span>
              <span className="sp-mono bg-[#E3EF4F] text-[#1F06AC] text-[11px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full min-w-[18px] sm:min-w-[20px] text-center">
                {hydrated ? itemCount : 0}
              </span>
            </Link>
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
              placeholder="Search products..."
              className="flex-1 h-11 rounded-lg border border-[#C9D2F0] px-3.5 text-sm bg-white"
            />
            <button
              type="submit"
              className="h-11 px-4 rounded-lg bg-[#0F42C0] text-white text-sm font-semibold cursor-pointer"
            >
              Search
            </button>
          </form>

          <div className="flex flex-col gap-1 text-[15px] font-semibold pt-1">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className={`py-2.5 px-3 rounded-md transition-colors ${
                pathname === '/'
                  ? 'bg-[#EAEFFC] text-[#0F42C0] font-bold'
                  : 'text-[#0E0B33] hover:bg-[#EAEFFC]'
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={() => setMenuOpen(false)}
              className={`py-2.5 px-3 rounded-md transition-colors ${
                pathname.startsWith('/products')
                  ? 'bg-[#EAEFFC] text-[#0F42C0] font-bold'
                  : 'text-[#0E0B33] hover:bg-[#EAEFFC]'
              }`}
            >
              Products
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
