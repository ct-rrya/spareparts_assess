import React from 'react';
import Link from 'next/link';
import { getAdminOverviewStats, getStorageMode } from '@/lib/db';
import { formatPHP } from '@/lib/money';
import { AdminShell } from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const [stats, storageMode] = await Promise.all([
    getAdminOverviewStats(),
    Promise.resolve(getStorageMode()),
  ]);

  return (
    <AdminShell storageMode={storageMode}>
      <div className="border-b border-[#D5DCF3] pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E0B33] m-0">
          Dashboard Overview
        </h1>
        <p className="text-sm text-[#4A4F78] mt-1 mb-0">
          Store performance, inventory totals, and recent order activity.
        </p>
      </div>

      {/* 4 summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-lg border border-[#D5DCF3] bg-white p-5 flex flex-col gap-1 shadow-sm">
          <div className="sp-mono text-xs font-semibold tracking-wider text-[#4A4F78]">
            TOTAL PRODUCTS
          </div>
          <div className="text-3xl font-bold text-[#0E0B33]">
            {stats.totalProducts}
          </div>
          <div className="sp-mono text-xs text-[#4A4F78]">
            Active &amp; inactive records
          </div>
        </div>

        <div className="rounded-lg border border-[#D5DCF3] bg-white p-5 flex flex-col gap-1 shadow-sm">
          <div className="sp-mono text-xs font-semibold tracking-wider text-[#4A4F78]">
            TOTAL ORDERS
          </div>
          <div className="text-3xl font-bold text-[#0E0B33]">
            {stats.totalOrders}
          </div>
          <div className="sp-mono text-xs text-[#4A4F78]">
            Pending: {stats.pendingOrders} · Completed: {stats.completedOrders}
          </div>
        </div>

        <div className="rounded-lg border border-[#D5DCF3] bg-white p-5 flex flex-col gap-1 shadow-sm">
          <div className="sp-mono text-xs font-semibold tracking-wider text-[#4A4F78]">
            TOTAL CUSTOMERS
          </div>
          <div className="text-3xl font-bold text-[#0E0B33]">
            {stats.totalCustomers}
          </div>
          <div className="sp-mono text-xs text-[#4A4F78]">
            Unique checkout emails
          </div>
        </div>

        <div className="rounded-lg border border-[#D5DCF3] bg-white p-5 flex flex-col gap-1 shadow-sm">
          <div className="sp-mono text-xs font-semibold tracking-wider text-[#4A4F78]">
            COMPLETED SALES
          </div>
          <div className="text-3xl font-bold text-[#1F06AC]">
            {formatPHP(stats.totalSales)}
          </div>
          <div className="sp-mono text-xs text-[#4A4F78]">
            Completed orders only
          </div>
        </div>
      </div>

      {/* recent orders card */}
      <div className="rounded-lg border border-[#D5DCF3] bg-white overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-[#D5DCF3] flex justify-between items-center bg-[#F6F7FB]">
          <div className="sp-mono text-xs font-semibold tracking-wider text-[#4A4F78]">
            RECENT ORDERS
          </div>
          <Link
            href="/admin/orders"
            className="sp-mono text-xs font-bold text-[#0F42C0] hover:underline"
          >
            VIEW ALL →
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#4A4F78]">
            No orders submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-[#EEF1FB] text-left sp-mono text-xs text-[#4A4F78]">
                  <th className="p-3.5">ORDER</th>
                  <th className="p-3.5">CUSTOMER</th>
                  <th className="p-3.5">TOTAL</th>
                  <th className="p-3.5">STATUS</th>
                  <th className="p-3.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#EEF1FB] last:border-b-0 hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-3.5 font-bold sp-mono text-[#0E0B33]">
                      {order.order_number}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-[#0E0B33]">
                        {order.customer_name}
                      </div>
                      <div className="sp-mono text-xs text-[#4A4F78]">
                        {order.customer_email}
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-[#1F06AC]">
                      {formatPHP(order.total)}
                    </td>
                    <td className="p-3.5">
                      <span className="sp-mono inline-block px-2.5 py-1 rounded-md text-xs font-bold border border-[#D5DCF3] bg-[#F6F7FB] text-[#0E0B33]">
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="sp-mono text-xs font-bold text-[#0F42C0] hover:underline"
                      >
                        VIEW →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
