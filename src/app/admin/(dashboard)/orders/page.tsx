import React from 'react';
import { listOrders } from '@/lib/db';
import { AdminOrdersClient } from '@/components/admin/AdminOrdersClient';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await listOrders();

  return <AdminOrdersClient initialOrders={orders} nowMs={Date.now()} />;
}
