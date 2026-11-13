import React from 'react';
import { listCategories, listProducts } from '@/lib/db';
import { AdminProductsClient } from '@/components/admin/AdminProductsClient';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    listProducts(),
    listCategories(),
  ]);

  return <AdminProductsClient initialProducts={products} categories={categories} />;
}
