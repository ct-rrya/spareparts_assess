import React from 'react';
import Link from 'next/link';
import { getOrderByIdOrNumber } from '@/lib/db';
import { AdminOrderDetailsClient } from '@/components/admin/AdminOrderDetailsClient';

export const dynamic = 'force-dynamic';

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderByIdOrNumber(id);

  if (!order) {
    return (
      <div className="border-[1.5px] border-[#1F06AC] bg-white p-8 flex flex-col gap-4 items-start">
        <div className="sp-mono text-[#4A4F8A]">NOT FOUND</div>
        <h1 className="text-2xl font-bold m-0">Order not found</h1>
        <Link
          href="/admin/orders"
          className="bg-[#1F06AC] text-white px-5 py-3 sp-mono"
        >
          BACK TO ORDERS →
        </Link>
      </div>
    );
  }

  return <AdminOrderDetailsClient initialOrder={order} />;
}
