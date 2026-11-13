import React from 'react';
import { listCategories, listProducts } from '@/lib/db';
import { StoreHeader } from '@/components/store/StoreHeader';
import { StoreFooter } from '@/components/store/StoreFooter';
import { ProductListingClient } from '@/components/store/ProductListingClient';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const [categories, activeProducts] = await Promise.all([
    listCategories(),
    listProducts({ activeOnly: true }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1F06AC]">
      <StoreHeader categories={categories} />
      <ProductListingClient
        initialProducts={activeProducts}
        categories={categories}
        initialCategorySlug={sp.category}
        initialQuery={sp.q || ''}
      />
      <StoreFooter />
    </div>
  );
}
