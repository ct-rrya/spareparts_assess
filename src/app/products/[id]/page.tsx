import React from 'react';
import Link from 'next/link';
import {
  getProductByIdOrSlug,
  listCategories,
  listProducts,
} from '@/lib/db';
import { StoreHeader } from '@/components/store/StoreHeader';
import { StoreFooter } from '@/components/store/StoreFooter';
import { ProductDetailsClient } from '@/components/store/ProductDetailsClient';
import { ProductCard } from '@/components/store/ProductCard';
import { BackButton } from '@/components/store/BackButton';

export const dynamic = 'force-dynamic';

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [categories, activeProducts, product] = await Promise.all([
    listCategories(),
    listProducts({ activeOnly: true }),
    getProductByIdOrSlug(id, { activeOnly: true }),
  ]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-slate-900">
        <StoreHeader categories={categories} />
        <main className="max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-10 max-w-xl mx-auto text-center flex flex-col gap-3 items-center">
            <h1 className="text-2xl font-bold text-slate-900 m-0">
              Product Not Available
            </h1>
            <p className="text-sm m-0 text-slate-600">
              This product either does not exist or has been marked inactive and
              cannot be ordered.
            </p>
            <Link
              href="/products"
              className="mt-2 rounded-md bg-[#1F06AC] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#170485]"
            >
              Back to Products
            </Link>
          </div>
        </main>
        <StoreFooter />
      </div>
    );
  }

  const related = activeProducts
    .filter(
      (p) => p.category_id === product.category_id && p.id !== product.id
    )
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <StoreHeader categories={categories} />

      <main className="max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-12 flex-1">
        <div className="mb-4">
          <BackButton fallbackHref="/products" />
        </div>

        <ProductDetailsClient product={product} />

        {related.length > 0 && (
          <section className="pt-12 sm:pt-14">
            <div className="flex flex-wrap justify-between items-end border-b border-[#D5DCF3] pb-3 mb-5 gap-3">
              <h2 className="font-catchye text-2xl sm:text-3xl font-normal tracking-tight text-[#0E0B33] m-0">
                Related Products
              </h2>
              <Link
                href={`/products?category=${product.category?.slug || ''}`}
                className="sp-mono text-xs font-semibold text-[#0F42C0] hover:underline uppercase"
              >
                View category →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}
