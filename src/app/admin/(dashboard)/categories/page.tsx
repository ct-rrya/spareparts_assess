import React from 'react';
import { listCategories } from '@/lib/db';
import { AdminCategoriesClient } from '@/components/admin/AdminCategoriesClient';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return <AdminCategoriesClient initialCategories={categories} />;
}
