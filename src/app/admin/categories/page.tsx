import React from 'react';
import { getStorageMode, listCategories } from '@/lib/db';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminCategoriesClient } from '@/components/admin/AdminCategoriesClient';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return (
    <AdminShell storageMode={getStorageMode()}>
      <AdminCategoriesClient initialCategories={categories} />
    </AdminShell>
  );
}

