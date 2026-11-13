'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ORDER_STATUSES, Order } from '@/types';
import { formatPHP } from '@/lib/money';

export function AdminOrdersClient({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return initialOrders;
    return initialOrders.filter((o) => o.status === statusFilter);
  }, [initialOrders, statusFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap justify-between items-end border-b border-[#D5DCF3] pb-4 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E0B33] m-0">
            Orders
          </h1>
          <p className="text-sm text-[#4A4F78] mt-1 mb-0">
            Inspect submitted orders and manage fulfillment statuses.
          </p>
        </div>

        <label className="flex items-center gap-2.5">
          <span className="sp-mono text-xs font-semibold text-[#4A4F78]">STATUS</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[#C9D2F0] px-3 h-11 text-sm bg-white text-[#0E0B33] focus:outline-none focus:border-[#1F06AC]"
          >
            <option value="all">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-lg border border-[#D5DCF3] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px] text-sm">
            <thead>
              <tr className="bg-[#F6F7FB] border-b border-[#D5DCF3] text-left sp-mono text-xs font-semibold text-[#4A4F78]">
                <th className="p-3.5">ORDER #</th>
                <th className="p-3.5">CUSTOMER</th>
                <th className="p-3.5">DATE / TIME</th>
                <th className="p-3.5">PAYMENT</th>
                <th className="p-3.5">TOTAL</th>
                <th className="p-3.5">STATUS</th>
                <th className="p-3.5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#4A4F78]">
                    No orders found for the selected status.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#EEF1FB] last:border-b-0 hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-3.5 font-bold sp-mono text-[#0E0B33]">
                      {order.order_number}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-[#0E0B33]">
                        {order.customer_name}
                      </div>
                      <div className="sp-mono text-xs text-[#4A4F78]">
                        {order.customer_email}
                      </div>
                    </td>
                    <td className="p-3.5 sp-mono text-xs text-[#4A4F78]">
                      {new Date(order.created_at).toLocaleString('en-PH')}
                    </td>
                    <td className="p-3.5 text-[#0E0B33] font-medium">{order.payment_method}</td>
                    <td className="p-3.5 font-bold text-base text-[#1F06AC]">
                      {formatPHP(order.total)}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`sp-mono inline-block rounded-md border px-2.5 py-1 text-xs font-bold ${
                          order.status === 'Completed'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : order.status === 'Cancelled'
                              ? 'border-red-200 bg-red-50 text-red-800'
                              : 'border-[#D5DCF3] bg-[#F6F7FB] text-[#0E0B33]'
                        }`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center rounded-lg border border-[#C9D2F0] px-3.5 py-1.5 text-xs font-bold text-[#0E0B33] bg-white hover:bg-slate-50 transition-colors"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
