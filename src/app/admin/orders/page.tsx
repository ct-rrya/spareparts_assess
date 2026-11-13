import React from 'react';
import { getStorageMode, listOrders } from '@/lib/db';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminOrdersClient } from '@/components/admin/AdminOrdersClient';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await listOrders();

  return (
    <AdminShell storageMode={getStorageMode()}>
      <AdminOrdersClient initialOrders={orders} />
    </AdminShell>
  );
}

