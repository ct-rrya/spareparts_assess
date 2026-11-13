import React from 'react';
import Link from 'next/link';
import { listCategories, listProducts } from '@/lib/db';
import { StoreHeader } from '@/components/store/StoreHeader';
import { StoreFooter } from '@/components/store/StoreFooter';
import { ProductCard } from '@/components/store/ProductCard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [categories, activeProducts] = await Promise.all([
    listCategories(),
    listProducts({ activeOnly: true }),
  ]);

  const featuredProducts = activeProducts.filter((p) => p.is_featured).slice(0, 4);
  const displayFeatured = featuredProducts.length > 0 ? featuredProducts : activeProducts.slice(0, 4);

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F6F7FB] text-[#0E0B33]">
      <StoreHeader categories={categories} />

      {/* hero blueprint grid section */}
      <section className="bg-blueprint-grid text-white py-12 sm:py-16 lg:py-20 border-b border-[#5882E8]/30">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
          <div>
            <div className="sp-mono text-xs sm:text-sm font-semibold tracking-widest text-[#E3EF4F] uppercase">
              LABORATORY &amp; SCIENCE SUPPLIES
            </div>

            <h1 className="mt-4 font-catchye text-3xl sm:text-5xl lg:text-[54px] font-normal leading-[1.1] tracking-tight text-white m-0">
              Everything your lab needs. Catalogued.
            </h1>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#DDE5FB] max-w-[540px]">
              Anatomy models, laboratory glassware and specimen tools, supplied
              to schools, laboratories and curious minds across the Philippines.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-3.5">
              <Link
                href="/products"
                className="inline-flex items-center justify-center h-[52px] sm:h-12 px-7 rounded-lg bg-[#E3EF4F] hover:bg-white text-[#1F06AC] text-base font-bold transition-colors cursor-pointer"
              >
                Browse products
              </Link>
              <Link
                href="/products?category=anatomy-physiology"
                className="inline-flex items-center justify-center h-[52px] sm:h-12 px-6 rounded-lg border border-[#5882E8] hover:bg-white/10 text-white text-base font-semibold transition-colors cursor-pointer"
              >
                Anatomy models
              </Link>
            </div>
          </div>

          {/* hero standards advertisement callout replacing figure preview */}
          <div className="rounded-2xl border border-[#D5DCF3] bg-white text-[#0E0B33] p-5 sm:p-7 shadow-2xl flex flex-col gap-4 sm:gap-5">
            {/* promotional ad banner moved from header */}
            <div className="rounded-lg bg-[#E3EF4F] text-[#1F06AC] px-3.5 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold tracking-wider sp-mono flex items-center justify-between gap-2 shadow-sm">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1F06AC] animate-pulse" />
                <span>FREE DELIVERY OVER ₱2,500</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#1F06AC]/80">SHIPS 1–2 DAYS</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="sp-mono text-xs font-bold tracking-widest text-[#0F42C0] uppercase">
                GUARANTEED STANDARDS
              </span>
              <span className="flex-1 h-px bg-[#D5DCF3]" />
            </div>

            <div className="flex flex-col gap-3.5 sm:gap-4">
              <div className="flex items-start gap-3">
                <span className="sp-mono text-xs font-bold text-[#1F06AC] bg-[#EAEFFC] rounded px-2 py-1 shrink-0 mt-0.5">
                  01
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-[#0E0B33] m-0">
                    Inspected Before Dispatch
                  </h4>
                  <p className="text-xs sm:text-sm text-[#4A4F78] leading-relaxed mt-0.5 mb-0">
                    Every model and glassware piece is strictly verified against its technical specs before packing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="sp-mono text-xs font-bold text-[#1F06AC] bg-[#EAEFFC] rounded px-2 py-1 shrink-0 mt-0.5">
                  02
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-[#0E0B33] m-0">
                    Fast, Tracked Nationwide Delivery
                  </h4>
                  <p className="text-xs sm:text-sm text-[#4A4F78] leading-relaxed mt-0.5 mb-0">
                    Orders dispatch within 1–2 business days across the Philippines with active tracking notifications.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="sp-mono text-xs font-bold text-[#1F06AC] bg-[#EAEFFC] rounded px-2 py-1 shrink-0 mt-0.5">
                  03
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-[#0E0B33] m-0">
                    Built for Classrooms &amp; Labs
                  </h4>
                  <p className="text-xs sm:text-sm text-[#4A4F78] leading-relaxed mt-0.5 mb-0">
                    Durable teaching-grade materials, clear labelling, and institutional requisition support.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#D5DCF3] flex items-center justify-between text-[11px] sm:text-xs sp-mono text-[#4A4F78]">
              <span>AUTHENTIC REQUISITIONS</span>
              <span className="text-[#0F42C0] font-semibold">100% VERIFIED</span>
            </div>
          </div>
        </div>
      </section>

      {/* main content */}
      <main className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 flex flex-col gap-10 sm:gap-16 flex-1">
        {/* category index section */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <span className="sp-mono text-xs font-semibold tracking-widest text-[#0F42C0]">
              INDEX
            </span>
            <span className="flex-1 h-px bg-[#D5DCF3]" />
          </div>

          <div className="flex flex-wrap justify-between items-baseline mb-4 sm:mb-6 gap-2">
            <h2 className="font-catchye text-2xl sm:text-3xl lg:text-[34px] font-normal text-[#0E0B33] m-0">
              Shop by category
            </h2>
            <span className="sp-mono text-xs text-[#4A4F78] uppercase">
              {categories.length} Categories · {activeProducts.length} Specimens
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6">
            {categories.map((cat, idx) => {
              const count = activeProducts.filter((p) => p.category_id === cat.id).length;
              const code = cat.code || `0${idx + 1}`;
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="rounded-lg border border-[#D5DCF3] bg-white p-4 sm:p-6 flex items-center md:items-start justify-between gap-4 md:flex-col hover:border-[#0F42C0] hover:shadow-md transition-all group"
                >
                  <div className="flex items-center md:items-start gap-3.5 md:flex-col md:w-full md:justify-between">
                    <span className="sp-mono w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-[#1F06AC] text-[#E3EF4F] text-lg sm:text-xl font-bold flex items-center justify-center shrink-0">
                      {code}
                    </span>
                    <div>
                      <h3 className="font-catchye text-lg sm:text-xl font-normal text-[#0E0B33] leading-snug m-0">
                        {cat.name}
                      </h3>
                      <div className="sp-mono text-[11px] sm:text-xs text-[#4A4F78] mt-1 uppercase">
                        {count} {count === 1 ? 'Specimen' : 'Specimens'}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-[#0F42C0] sp-mono group-hover:translate-x-1 transition-transform shrink-0">
                    BROWSE →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* featured specimens section */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <span className="sp-mono text-xs font-semibold tracking-widest text-[#0F42C0]">
              FEATURED
            </span>
            <span className="flex-1 h-px bg-[#D5DCF3]" />
          </div>

          <div className="flex flex-wrap justify-between items-baseline mb-4 sm:mb-6 gap-2">
            <h2 className="font-catchye text-2xl sm:text-3xl lg:text-[34px] font-normal text-[#0E0B33] m-0">
              Featured specimens
            </h2>
            <Link
              href="/products"
              className="sp-mono text-xs font-semibold text-[#0F42C0] hover:underline"
            >
              VIEW ALL {activeProducts.length} →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {displayFeatured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

      <StoreFooter />
    </div>
  );
}
