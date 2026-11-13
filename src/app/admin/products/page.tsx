import React from 'react';
import { getStorageMode, listCategories, listProducts } from '@/lib/db';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminProductsClient } from '@/components/admin/AdminProductsClient';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    listProducts(),
    listCategories(),
  ]);

  return (
    <AdminShell storageMode={getStorageMode()}>
      <AdminProductsClient initialProducts={products} categories={categories} />
    </AdminShell>
  );
}

