'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Category, Product } from '@/types';
import { ProductCard } from './ProductCard';
import { CustomSelect } from '@/components/ui/CustomSelect';

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

  // sync header search updates when already on /products
  useEffect(() => {
    setSearch(initialQuery);
  }, [initialQuery]);
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const pillsRef = useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updatePillsScroll = useCallback(() => {
    const el = pillsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updatePillsScroll();
    window.addEventListener('resize', updatePillsScroll);
    return () => window.removeEventListener('resize', updatePillsScroll);
  }, [updatePillsScroll, categories.length]);

  const activeFilterCount =
    (minPrice.trim() ? 1 : 0) +
    (maxPrice.trim() ? 1 : 0) +
    (selectedCategories.length > 0 ? 1 : 0);

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
    <div className="max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1">
      {/* compact mobile category pills + filter/sort bar */}
      <div className="lg:hidden mb-4 flex flex-col gap-2.5">
        <div className="relative">
          <nav
            ref={pillsRef}
            onScroll={updatePillsScroll}
            aria-label="Categories"
            className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none"
          >
            <button
              type="button"
              onClick={() => setSelectedCategories([])}
              className={`flex-shrink-0 h-8 px-3 rounded-lg sp-mono text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
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
                  className={`flex-shrink-0 h-8 px-3 rounded-lg sp-mono text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
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

          {canScrollLeft && (
            <button
              type="button"
              onClick={() => pillsRef.current?.scrollBy({ left: -140, behavior: 'smooth' })}
              aria-label="Scroll categories left"
              className="absolute left-0 top-0 h-8 pr-3 pl-0.5 flex items-center bg-gradient-to-r from-[#F7F8FC] via-[#F7F8FC]/90 to-transparent text-[#1F06AC] cursor-pointer"
            >
              <span className="h-6 w-6 rounded-full bg-white border border-[#C9D2F0] shadow-xs flex items-center justify-center">
                <ChevronLeft size={14} />
              </span>
            </button>
          )}

          {canScrollRight && (
            <button
              type="button"
              onClick={() => pillsRef.current?.scrollBy({ left: 140, behavior: 'smooth' })}
              aria-label="Swipe or scroll categories right"
              className="absolute right-0 top-0 h-8 pl-4 pr-0.5 flex items-center bg-gradient-to-l from-[#F7F8FC] via-[#F7F8FC]/90 to-transparent text-[#1F06AC] cursor-pointer"
            >
              <span className="h-6 w-6 rounded-full bg-white border border-[#C9D2F0] shadow-xs flex items-center justify-center">
                <ChevronRight size={14} />
              </span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((v) => !v)}
            aria-expanded={mobileFiltersOpen}
            className={`inline-flex items-center justify-between gap-2 h-9 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              mobileFiltersOpen || minPrice.trim() || maxPrice.trim()
                ? 'border-[#1F06AC] bg-[#EAEFFC] text-[#1F06AC]'
                : 'border-[#C9D2F0] bg-white text-[#0E0B33]'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <SlidersHorizontal size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span className="sp-mono text-[10px] bg-[#1F06AC] text-[#E3EF4F] px-1.5 py-0.2 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </span>
            <ChevronDown
              size={14}
              className={`transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <CustomSelect
            value={sortOrder}
            onChange={(val) =>
              setSortOrder(val as 'default' | 'price-asc' | 'price-desc')
            }
            ariaLabel="Sort products by price"
            wrapperClassName="relative flex-1 min-w-0"
            buttonClassName="h-9 w-full rounded-lg border border-[#C9D2F0] bg-white px-2.5 text-xs font-medium text-[#0E0B33] hover:border-[#1F06AC] focus:border-[#1F06AC]"
            options={[
              { value: 'default', label: 'Sort: Featured' },
              { value: 'price-asc', label: 'Sort: Price low to high' },
              { value: 'price-desc', label: 'Sort: Price high to low' },
            ]}
          />
        </div>

        {/* collapsible mobile price & reset drawer */}
        {mobileFiltersOpen && (
          <div className="rounded-lg border border-[#D5DCF3] bg-white p-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="sp-mono text-[11px] font-semibold tracking-wider text-[#4A4F78]">
                PRICE RANGE (₱)
              </span>
              {(activeFilterCount > 0 || sortOrder !== 'default' || search.trim()) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-[#0F42C0] cursor-pointer"
                >
                  Reset all
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="1"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min ₱"
                className="w-full h-9 rounded-lg border border-[#C9D2F0] px-2.5 text-xs sp-mono text-[#0E0B33] focus:outline-none focus:border-[#1F06AC]"
              />
              <span className="text-[#4A4F78] font-bold">–</span>
              <input
                type="number"
                min="0"
                step="1"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max ₱"
                className="w-full h-9 rounded-lg border border-[#C9D2F0] px-2.5 text-xs sp-mono text-[#0E0B33] focus:outline-none focus:border-[#1F06AC]"
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-6 items-start">
        {/* desktop filter sidebar */}
        <aside className="hidden lg:flex flex-col gap-3 lg:sticky lg:top-20">
          {/* category filter */}
          <div className="rounded-lg border border-[#D5DCF3] bg-white p-3 flex flex-col gap-1">
            <div className="sp-mono text-[11px] font-semibold tracking-wider text-[#4A4F78] pb-1.5 mb-0.5 border-b border-dashed border-[#D5DCF3]">
              CATEGORY
            </div>
            <button
              type="button"
              onClick={() => setSelectedCategories([])}
              className={`w-full flex items-center justify-between h-8 px-2 rounded-md text-[13px] font-medium transition-colors cursor-pointer text-left ${
                selectedCategories.length === 0
                  ? 'bg-[#EAEFFC] text-[#0E0B33] font-semibold'
                  : 'text-[#4A4F78] hover:bg-slate-50'
              }`}
            >
              <span>All specimens</span>
              <span className="sp-mono text-[11px] text-[#4A4F78]">
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
                  className={`w-full flex items-center justify-between h-8 px-2 rounded-md text-[13px] transition-colors cursor-pointer text-left ${
                    isChecked
                      ? 'bg-[#EAEFFC] text-[#0E0B33] font-semibold'
                      : 'text-[#4A4F78] hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">
                    <span className="sp-mono text-[11px] text-[#0F42C0] mr-1.5 font-bold">
                      {code}
                    </span>
                    {cat.name}
                  </span>
                  <span className="sp-mono text-[11px] text-[#4A4F78] shrink-0">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* price filter */}
          <div className="rounded-lg border border-[#D5DCF3] bg-white p-3 flex flex-col gap-2">
            <div className="sp-mono text-[11px] font-semibold tracking-wider text-[#4A4F78] pb-1.5 border-b border-dashed border-[#D5DCF3]">
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
                className="w-full h-9 rounded-lg border border-[#C9D2F0] px-2.5 text-[13px] sp-mono text-[#0E0B33] focus:outline-none focus:border-[#1F06AC]"
              />
              <span className="text-[#4A4F78] font-bold">–</span>
              <input
                type="number"
                min="0"
                step="1"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                className="w-full h-9 rounded-lg border border-[#C9D2F0] px-2.5 text-[13px] sp-mono text-[#0E0B33] focus:outline-none focus:border-[#1F06AC]"
              />
            </div>
          </div>

          {/* sort filter */}
          <div className="rounded-lg border border-[#D5DCF3] bg-white p-3 flex flex-col gap-2">
            <div className="sp-mono text-[11px] font-semibold tracking-wider text-[#4A4F78] pb-1.5 border-b border-dashed border-[#D5DCF3]">
              SORT BY
            </div>
            <CustomSelect
              value={sortOrder}
              onChange={(val) =>
                setSortOrder(val as 'default' | 'price-asc' | 'price-desc')
              }
              ariaLabel="Sort products by price"
              buttonClassName="h-9 w-full rounded-lg border border-[#C9D2F0] bg-white px-2.5 text-[13px] text-[#0E0B33] hover:border-[#1F06AC] focus:border-[#1F06AC]"
              options={[
                { value: 'default', label: 'Featured' },
                { value: 'price-asc', label: 'Price: low to high' },
                { value: 'price-desc', label: 'Price: high to low' },
              ]}
            />
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="w-full h-9 rounded-lg border border-[#C9D2F0] bg-white text-[#0F42C0] hover:bg-slate-50 text-[13px] font-semibold transition-colors cursor-pointer"
          >
            Reset filters
          </button>
        </aside>

        {/* main product listing */}
        <div className="flex flex-col gap-3 sm:gap-6">
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
