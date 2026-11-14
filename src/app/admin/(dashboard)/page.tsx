import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getAdminOverviewStats } from '@/lib/db';
import { formatPHP } from '@/lib/money';
import { OrderStatus, Product } from '@/types';

export const dynamic = 'force-dynamic';

function formatShortDate(input: string | Date) {
  const date = typeof input === 'string' ? new Date(input) : input;
  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];
  const day = String(date.getDate()).padStart(2, '0');
  return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatHeaderDate(date: Date) {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return `${days[date.getDay()]} ${formatShortDate(date)}`;
}

function getStatusBadgeClass(status: OrderStatus) {
  switch (status) {
    case 'Pending':
      return 'bg-[#FFF6C2] text-[#5A4B00]';
    case 'Confirmed':
    case 'Preparing':
      return 'bg-[#E8EDFF] text-[#1C47CC]';
    case 'Shipped':
      return 'bg-[#E5F24E] text-[#1A2400]';
    case 'Completed':
      return 'bg-[#1F06AC] text-white';
    case 'Cancelled':
      return 'bg-[#FEE2E2] text-[#991B1B]';
  }
}

function getStatusLabel(status: OrderStatus) {
  if (status === 'Completed') return 'DELIVERED';
  if (status === 'Preparing' || status === 'Confirmed') return 'PROCESSING';
  return status.toUpperCase();
}

function LowStockCard({
  products,
  className = '',
}: {
  products: Product[];
  className?: string;
}) {
  return (
    <div className={`flex-col rounded-[8px] border border-[#E2E4EC] bg-white ${className}`}>
      <div className="border-b border-dashed border-[#E2E4EC] px-5 py-3.5">
        <h2 className="sp-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#5C6072]">
          LOW STOCK
        </h2>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-6 text-center text-[13px] text-[#7D8292]">
          All products are well stocked.
        </div>
      ) : (
        <div className="divide-y divide-[#ECEEF4]">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/admin/products/${product.id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[#F9FAFC]"
            >
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-[#121212]">
                  {product.name}
                </p>
                <p className="sp-mono mt-1 text-[10.5px] uppercase tracking-[0.05em] text-[#7D8292]">
                  SKU {product.specimen_code}
                </p>
              </div>
              <span className="sp-mono shrink-0 rounded-[4px] bg-[#FFF6C2] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.05em] text-[#5A4B00]">
                {product.stock} LEFT
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function AdminOverviewPage() {
  const stats = await getAdminOverviewStats();
  const maxDaySales = Math.max(
    ...stats.last7DaysSales.map((d) => d.total),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-catchye text-[36px] leading-none tracking-[-0.01em] text-[#121212]">
          Overview
        </h1>
        <p className="sp-mono mt-2 text-[11px] uppercase tracking-[0.08em] text-[#7D8292]">
          {formatHeaderDate(new Date())}
        </p>
      </div>

      {/* kpi summary row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-[8px] border border-[#E2E4EC] bg-white p-4 sm:p-5">
          <p className="sp-mono text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
            PRODUCTS
          </p>
          <p className="mt-2 sm:mt-2.5 text-2xl sm:text-[30px] font-bold leading-none tracking-[-0.02em] text-[#121212]">
            {stats.totalProducts}
          </p>
          <p className="sp-mono mt-2.5 sm:mt-3 text-[10px] uppercase tracking-[0.06em] text-[#7D8292]">
            {stats.totalCategories} CATEGORIES
          </p>
        </div>

        <div className="rounded-[8px] border border-[#E2E4EC] bg-white p-4 sm:p-5">
          <p className="sp-mono text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
            ORDERS
          </p>
          <p className="mt-2 sm:mt-2.5 text-2xl sm:text-[30px] font-bold leading-none tracking-[-0.02em] text-[#121212]">
            {stats.totalOrders}
          </p>
          <p className="sp-mono mt-2.5 sm:mt-3 text-[10px] uppercase tracking-[0.06em] text-[#7D8292]">
            {stats.pendingOrders} PENDING · {stats.completedOrders} COMPLETED
          </p>
        </div>

        <div className="rounded-[8px] border border-[#E2E4EC] bg-white p-4 sm:p-5">
          <p className="sp-mono text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
            CUSTOMERS
          </p>
          <p className="mt-2 sm:mt-2.5 text-2xl sm:text-[30px] font-bold leading-none tracking-[-0.02em] text-[#121212]">
            {stats.totalCustomers}
          </p>
          <p className="sp-mono mt-2.5 sm:mt-3 text-[10px] uppercase tracking-[0.06em] text-[#7D8292]">
            FROM ORDERS
          </p>
        </div>

        <div className="rounded-[8px] border border-[#1F06AC] bg-[#1F06AC] p-4 sm:p-5 text-white">
          <p className="sp-mono text-[10px] uppercase tracking-[0.08em] text-white/75">
            TOTAL SALES
          </p>
          <p className="mt-2 sm:mt-2.5 text-2xl sm:text-[30px] font-bold leading-none tracking-[-0.02em] text-white">
            {formatPHP(stats.totalSales)}
          </p>
          <p className="sp-mono mt-2.5 sm:mt-3 text-[10px] uppercase tracking-[0.06em] text-white/80">
            COMPLETED ORDERS
          </p>
        </div>
      </div>

      {/* sales chart + low stock row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.45fr_1fr]">
        <div className="flex flex-col rounded-[8px] border border-[#E2E4EC] bg-white">
          <div className="border-b border-dashed border-[#E2E4EC] px-4 sm:px-5 py-3.5">
            <h2 className="sp-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#5C6072]">
              SALES · LAST 7 DAYS
            </h2>
          </div>

          <div className="flex flex-1 flex-col justify-end px-4 sm:px-6 pb-4 sm:pb-5 pt-5 sm:pt-8">
            <div className="flex h-[160px] sm:h-[200px] items-end justify-between gap-2.5 sm:gap-5">
              {stats.last7DaysSales.map((day) => {
                const isPeak = maxDaySales > 0 && day.total === maxDaySales;
                const heightPct =
                  maxDaySales > 0
                    ? Math.max(
                        day.total > 0 ? 14 : 6,
                        Math.round((day.total / maxDaySales) * 100)
                      )
                    : 8;

                return (
                  <div
                    key={day.date}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-2.5"
                    title={`${day.date}: ${formatPHP(day.total)}`}
                  >
                    <div className="flex w-full flex-1 items-end justify-center">
                      <div
                        className={`w-full max-w-[44px] rounded-t-[4px] transition-all ${
                          day.total === 0 && maxDaySales === 0
                            ? 'bg-[#EEF1F8]'
                            : isPeak
                            ? 'bg-[#1F06AC]'
                            : 'bg-[#5882E8]'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="sp-mono text-[10px] uppercase tracking-[0.06em] text-[#7D8292]">
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <LowStockCard products={stats.lowStockProducts} className="hidden lg:flex" />
      </div>

      {/* mobile recent orders card list */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="sp-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#5C6072]">
            RECENT ORDERS
          </h2>
          <Link
            href="/admin/orders"
            className="sp-mono text-[11px] font-medium uppercase tracking-[0.06em] text-[#1C47CC] hover:underline"
          >
            VIEW ALL →
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="rounded-[8px] border border-[#E2E4EC] bg-white p-6 text-center text-sm text-[#7D8292]">
            No orders placed yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {stats.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="rounded-[8px] border border-[#E2E4EC] bg-white p-4 flex flex-col gap-1.5 transition-colors hover:bg-[#F9FAFC]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="sp-mono text-xs font-semibold text-[#1F06AC]">
                    {order.order_number}
                  </span>
                  <span
                    className={`sp-mono rounded-[4px] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.05em] ${getStatusBadgeClass(
                      order.status
                    )}`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[15px] font-semibold text-[#121212] truncate">
                    {order.customer_name}
                  </span>
                  <ChevronRight size={15} className="text-[#1C47CC] shrink-0" />
                </div>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="sp-mono text-[11px] text-[#7D8292]">
                    {formatShortDate(order.created_at)}
                  </span>
                  <span className="text-sm font-bold text-[#121212]">
                    {formatPHP(order.total)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* desktop recent orders table */}
      <div className="hidden md:block overflow-hidden rounded-[8px] border border-[#E2E4EC] bg-white">
        <div className="flex items-center justify-between px-5 py-3.5">
          <h2 className="sp-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#5C6072]">
            RECENT ORDERS
          </h2>
          <Link
            href="/admin/orders"
            className="sp-mono text-[11px] font-medium uppercase tracking-[0.06em] text-[#1C47CC] hover:underline"
          >
            VIEW ALL →
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="border-t border-[#ECEEF4] p-8 text-center text-sm text-[#7D8292]">
            No orders placed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="sp-mono border-y border-[#ECEEF4] bg-[#F7F8FC] text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                  <th className="px-5 py-3 font-medium">ORDER №</th>
                  <th className="px-5 py-3 font-medium">CUSTOMER</th>
                  <th className="px-5 py-3 font-medium">DATE</th>
                  <th className="px-5 py-3 font-medium">ITEMS</th>
                  <th className="px-5 py-3 font-medium">TOTAL</th>
                  <th className="px-5 py-3 font-medium">STATUS</th>
                  <th className="px-5 py-3 text-right font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEEF4]">
                {stats.recentOrders.map((order) => {
                  const itemCount = (order.items || []).reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  );

                  return (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-[#F9FAFC]"
                    >
                      <td className="sp-mono px-5 py-4 text-[12px] font-medium text-[#1C47CC]">
                        {order.order_number}
                      </td>
                      <td className="px-5 py-4 text-[13.5px] font-semibold text-[#121212]">
                        {order.customer_name}
                      </td>
                      <td className="sp-mono px-5 py-4 text-[11px] text-[#5C6072]">
                        {formatShortDate(order.created_at)}
                      </td>
                      <td className="px-5 py-4 text-[13px] font-medium text-[#121212]">
                        {itemCount}
                      </td>
                      <td className="px-5 py-4 text-[13.5px] font-bold text-[#121212]">
                        {formatPHP(order.total)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`sp-mono inline-block rounded-[4px] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.05em] ${getStatusBadgeClass(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-[12.5px] font-medium text-[#1C47CC] hover:underline"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LowStockCard products={stats.lowStockProducts} className="flex lg:hidden" />
    </div>
  );
}
