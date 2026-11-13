'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Category, Product } from '@/types';
import { ProductCard } from './ProductCard';
import { Search } from 'lucide-react';

interface ProductListingClientProps {
  initialProducts: Product[];
  categories: Category[];
  initialCategorySlug?: string;
  initialQuery?: string;
}

export function ProductListingClient({
  initialProducts,
  categories,
  initialCategorySlug,
  initialQuery = '',
}: ProductListingClientProps) {
  const [search, setSearch] = useState(initialQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    if (!initialCategorySlug) return [];
    const found = categories.find((c) => c.slug === initialCategorySlug);
    return found ? [found.id] : [];
  });
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOrder, setSortOrder] = useState<
    'default' | 'price-asc' | 'price-desc'
  >('default');

  function toggleCategory(catId: string) {
    setSelectedCategories((prev) =>
      prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId]
    );
  }

  function clearFilters() {
    setSearch('');
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
    setSortOrder('default');
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = minPrice.trim() ? Number(minPrice) : null;
    const max = maxPrice.trim() ? Number(maxPrice) : null;

    let list = initialProducts.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.specimen_code.toLowerCase().includes(q)) {
        return false;
      }
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(p.category_id)
      ) {
        return false;
      }
      if (min !== null && Number.isFinite(min) && p.price < min) return false;
      if (max !== null && Number.isFinite(max) && p.price > max) return false;
      return true;
    });

    if (sortOrder === 'price-asc') {
      list = list.slice().sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-desc') {
      list = list.slice().sort((a, b) => b.price - a.price);
    }

    return list;
  }, [initialProducts, search, selectedCategories, minPrice, maxPrice, sortOrder]);

  return (
    <div className="max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      {/* breadcrumb */}
      <div className="sp-mono text-xs font-semibold tracking-wider text-[#4A4F78] mb-4">
        <Link href="/" className="text-[#0F42C0] hover:underline">
          HOME
        </Link>{' '}
        / PRODUCTS
      </div>

      {/* header banner */}
      <div className="flex flex-wrap justify-between items-end border-b border-[#D5DCF3] pb-6 mb-6 gap-4">
        <div>
          <h1 className="font-catchye text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#0E0B33] m-0">
            Products
          </h1>
          <div className="sp-mono text-xs text-[#4A4F78] mt-2 uppercase">
            {initialProducts.length} Items · {categories.length} Categories
          </div>
        </div>

        {/* search field */}
        <div className="relative w-full sm:w-[320px]">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or SKU №..."
            aria-label="Filter products"
            className="w-full h-11 sm:h-12 rounded-lg border border-[#C9D2F0] bg-white pl-10 pr-3.5 text-sm text-[#0E0B33] placeholder:text-[#4A4F78] focus:outline-none focus:border-[#1F06AC]"
          />
          <Search
            size={16}
            className="absolute left-3.5 top-3.5 text-[#4A4F78] pointer-events-none"
          />
        </div>
      </div>

      {/* horizontal category pills for mobile matching mobile design board */}
      <nav
        aria-label="Categories"
        className="flex lg:hidden gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none"
      >
        <button
          type="button"
          onClick={() => setSelectedCategories([])}
          className={`flex-shrink-0 h-11 px-4 rounded-lg sp-mono text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            selectedCategories.length === 0
              ? 'bg-[#1F06AC] text-[#E3EF4F]'
              : 'bg-white border border-[#D5DCF3] text-[#0F42C0]'
          }`}
        >
          ALL · {initialProducts.length}
        </button>
        {categories.map((cat, idx) => {
          const isChecked = selectedCategories.includes(cat.id);
          const count = initialProducts.filter((p) => p.category_id === cat.id).length;
          const code = cat.code || `0${idx + 1}`;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.id)}
              className={`flex-shrink-0 h-11 px-4 rounded-lg sp-mono text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isChecked
                  ? 'bg-[#1F06AC] text-[#E3EF4F]'
                  : 'bg-white border border-[#D5DCF3] text-[#0F42C0]'
              }`}
            >
              {code} {cat.name.toUpperCase()} · {count}
            </button>
          );
        })}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-6 items-start">
        {/* filter sidebar matching design board */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-24">
          {/* category filter */}
          <div className="rounded-lg border border-[#D5DCF3] bg-white p-4 flex flex-col gap-2.5">
            <div className="sp-mono text-xs font-semibold tracking-wider text-[#4A4F78] pb-2.5 border-b border-dashed border-[#D5DCF3]">
              CATEGORY
            </div>
            <button
              type="button"
              onClick={() => setSelectedCategories([])}
              className={`w-full flex items-center justify-between h-10 px-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer text-left ${
                selectedCategories.length === 0
                  ? 'bg-[#EAEFFC] text-[#0E0B33] font-semibold'
                  : 'text-[#4A4F78] hover:bg-slate-50'
              }`}
            >
              <span>All specimens</span>
              <span className="sp-mono text-xs text-[#4A4F78]">
                {initialProducts.length}
              </span>
            </button>
            {categories.map((cat, idx) => {
              const isChecked = selectedCategories.includes(cat.id);
              const count = initialProducts.filter((p) => p.category_id === cat.id).length;
              const code = cat.code || `0${idx + 1}`;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`w-full flex items-center justify-between h-10 px-2.5 rounded-md text-sm transition-colors cursor-pointer text-left ${
                    isChecked
                      ? 'bg-[#EAEFFC] text-[#0E0B33] font-semibold'
                      : 'text-[#4A4F78] hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">
                    <span className="sp-mono text-xs text-[#0F42C0] mr-1.5 font-bold">
                      {code}
                    </span>
                    {cat.name}
                  </span>
                  <span className="sp-mono text-xs text-[#4A4F78] shrink-0">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* price filter */}
          <div className="rounded-lg border border-[#D5DCF3] bg-white p-4 flex flex-col gap-3">
            <div className="sp-mono text-xs font-semibold tracking-wider text-[#4A4F78] pb-2.5 border-b border-dashed border-[#D5DCF3]">
              PRICE (₱)
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="1"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                className="w-full h-10 rounded-lg border border-[#C9D2F0] px-3 text-sm sp-mono text-[#0E0B33] focus:outline-none focus:border-[#1F06AC]"
              />
              <span className="text-[#4A4F78] font-bold">–</span>
              <input
                type="number"
                min="0"
                step="1"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                className="w-full h-10 rounded-lg border border-[#C9D2F0] px-3 text-sm sp-mono text-[#0E0B33] focus:outline-none focus:border-[#1F06AC]"
              />
            </div>
          </div>

          {/* sort filter */}
          <div className="rounded-lg border border-[#D5DCF3] bg-white p-4 flex flex-col gap-3">
            <div className="sp-mono text-xs font-semibold tracking-wider text-[#4A4F78] pb-2.5 border-b border-dashed border-[#D5DCF3]">
              SORT BY
            </div>
            <select
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(
                  e.target.value as 'default' | 'price-asc' | 'price-desc'
                )
              }
              aria-label="Sort products by price"
              className="w-full h-10 rounded-lg border border-[#C9D2F0] bg-white px-3 text-sm text-[#0E0B33] focus:outline-none focus:border-[#1F06AC] cursor-pointer"
            >
              <option value="default">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="w-full h-11 rounded-lg border border-[#C9D2F0] bg-white text-[#0F42C0] hover:bg-slate-50 text-sm font-semibold transition-colors cursor-pointer"
          >
            Reset filters
          </button>
        </aside>

        {/* main product listing */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center text-sm">
            <span className="sp-mono text-xs text-[#4A4F78] uppercase">
              Showing <b className="text-[#0E0B33]">{filtered.length}</b>{' '}
              {filtered.length === 1 ? 'Specimen' : 'Specimens'}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-[#D5DCF3] bg-white p-12 text-center flex flex-col items-center gap-3">
              <div className="text-xl font-bold text-[#0E0B33]">
                No specimens found
              </div>
              <p className="text-sm text-[#4A4F78] m-0 max-w-md leading-relaxed">
                No products matched your search or filter settings. Try adjusting
                your price range or clearing selected categories.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-2 rounded-lg bg-[#0F42C0] text-white px-6 h-11 text-sm font-semibold hover:bg-[#1F06AC] transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
