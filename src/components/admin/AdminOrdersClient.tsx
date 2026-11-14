'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { formatPHP } from '@/lib/money';

function formatOrderDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
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
  const day = String(d.getDate()).padStart(2, '0');
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function isOverduePending(order: Order, nowMs: number) {
  if (order.status !== 'Pending') return false;
  const created = new Date(order.created_at).getTime();
  return Number.isFinite(created) && nowMs - created >= ONE_DAY_MS;
}

function getMobileStatusBadgeClass(status: OrderStatus) {
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

function getMobileStatusLabel(status: OrderStatus) {
  if (status === 'Completed') return 'DELIVERED';
  if (status === 'Preparing' || status === 'Confirmed') return 'PROCESSING';
  return status.toUpperCase();
}

export function AdminOrdersClient({
  initialOrders,
  nowMs = 0,
}: {
  initialOrders: Order[];
  nowMs?: number;
}) {
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [search, setSearch] = useState('');

  const counts = useMemo(() => {
    const byStatus: Record<OrderStatus, number> = {
      Pending: 0,
      Confirmed: 0,
      Preparing: 0,
      Shipped: 0,
      Completed: 0,
      Cancelled: 0,
    };
    let overduePending = 0;

    for (const o of initialOrders) {
      byStatus[o.status] = (byStatus[o.status] || 0) + 1;
      if (isOverduePending(o, nowMs)) overduePending += 1;
    }

    const needAction =
      byStatus.Pending + byStatus.Confirmed + byStatus.Preparing;

    return {
      all: initialOrders.length,
      byStatus,
      overduePending,
      needAction,
    };
  }, [initialOrders, nowMs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialOrders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (
        q &&
        !o.order_number.toLowerCase().includes(q) &&
        !o.customer_name.toLowerCase().includes(q) &&
        !o.customer_email.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [initialOrders, statusFilter, search]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-catchye m-0 text-[36px] leading-none tracking-[-0.01em] text-[#121212]">
          Orders
        </h1>
        <div className="sp-mono mt-2 flex flex-wrap items-center gap-2.5 text-[11px] uppercase tracking-[0.08em] text-[#7D8292]">
          <span>{counts.all} TOTAL</span>
          {counts.needAction > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter('Pending')}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-[4px] px-2.5 py-0.5 font-semibold transition-opacity hover:opacity-90 ${
                counts.overduePending > 0
                  ? 'bg-[#FEE2E2] text-[#991B1B]'
                  : 'bg-[#FFF6C2] text-[#5A4B00]'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  counts.overduePending > 0 ? 'bg-[#DC2626]' : 'bg-[#B45309]'
                }`}
              />
              {counts.needAction} NEED ACTION
              {counts.overduePending > 0
                ? ` · ${counts.overduePending} PENDING 1D+`
                : ''}
            </button>
          )}
        </div>
      </div>

      {/* filter pills + search bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none sm:flex-wrap sm:overflow-visible sm:pb-0">
          {[
            { key: 'all' as const, label: 'ALL', count: counts.all },
            { key: 'Pending' as const, label: 'PENDING', count: counts.byStatus.Pending },
            { key: 'Confirmed' as const, label: 'CONFIRMED', count: counts.byStatus.Confirmed },
            { key: 'Preparing' as const, label: 'PREPARING', count: counts.byStatus.Preparing },
            { key: 'Shipped' as const, label: 'SHIPPED', count: counts.byStatus.Shipped },
            { key: 'Completed' as const, label: 'COMPLETED', count: counts.byStatus.Completed },
            { key: 'Cancelled' as const, label: 'CANCELLED', count: counts.byStatus.Cancelled },
          ].map((pill) => {
            const active = statusFilter === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => setStatusFilter(pill.key)}
                className={`sp-mono shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.06em] transition-colors ${
                  active
                    ? 'border-[#1F06AC] bg-[#1F06AC] text-white'
                    : 'border-[#E2E4EC] bg-white text-[#5C6072] hover:border-[#1F06AC] hover:text-[#121212]'
                }`}
              >
                {pill.label} · {pill.count}
              </button>
            );
          })}
        </div>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order № or customer"
          className="h-10 min-w-[220px] flex-1 rounded-[8px] border border-[#E2E4EC] bg-white px-3.5 text-sm text-[#121212] placeholder:text-[#9CA3AF] focus:border-[#1F06AC] focus:outline-none"
        />
      </div>

      {/* mobile orders card list */}
      <div className="md:hidden flex flex-col gap-2.5">
        {filtered.length === 0 ? (
          <div className="rounded-[8px] border border-[#E2E4EC] bg-white p-8 text-center text-sm text-[#7D8292]">
            No orders found for the selected status.
          </div>
        ) : (
          filtered.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="rounded-[8px] border border-[#E2E4EC] bg-white p-4 flex flex-col gap-1.5 transition-colors hover:bg-[#F9FAFC]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="sp-mono text-xs font-semibold text-[#1F06AC]">
                  {order.order_number}
                </span>
                {isOverduePending(order, nowMs) ? (
                  <span className="sp-mono rounded-[4px] bg-[#FEE2E2] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-[#991B1B]">
                    PENDING · 1D+
                  </span>
                ) : (
                  <span
                    className={`sp-mono rounded-[4px] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.05em] ${getMobileStatusBadgeClass(
                      order.status
                    )}`}
                  >
                    {getMobileStatusLabel(order.status)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[15px] font-semibold text-[#121212] truncate">
                  {order.customer_name}
                </span>
                <ChevronRight size={15} className="text-[#1C47CC] shrink-0" />
              </div>
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <span className="sp-mono text-[11px] text-[#7D8292]">
                  {formatOrderDate(order.created_at)}
                </span>
                <span className="text-sm font-bold text-[#121212]">
                  {formatPHP(order.total)}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* desktop orders table */}
      <div className="hidden md:block overflow-hidden rounded-[8px] border border-[#E2E4EC] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead>
              <tr className="sp-mono border-b border-[#ECEEF4] bg-[#F7F8FC] text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                <th className="px-5 py-3 font-medium">ORDER #</th>
                <th className="px-5 py-3 font-medium">CUSTOMER</th>
                <th className="px-5 py-3 font-medium">DATE / TIME</th>
                <th className="px-5 py-3 font-medium">PAYMENT</th>
                <th className="px-5 py-3 font-medium">TOTAL</th>
                <th className="px-5 py-3 font-medium">STATUS</th>
                <th className="px-5 py-3 text-right font-medium">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECEEF4]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-[#7D8292]"
                  >
                    No orders found for the selected status.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-[#F9FAFC]"
                  >
                    <td className="sp-mono px-5 py-3.5 text-[12px] font-medium text-[#121212]">
                      {order.order_number}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-[13.5px] font-semibold text-[#121212]">
                        {order.customer_name}
                      </div>
                      <div className="sp-mono mt-0.5 text-[11px] text-[#7D8292]">
                        {order.customer_email}
                      </div>
                    </td>
                    <td className="sp-mono px-5 py-3.5 text-[11px] text-[#5C6072]">
                      {formatOrderDate(order.created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[#5C6072]">
                      {order.payment_method}
                    </td>
                    <td className="px-5 py-3.5 text-[13.5px] font-medium text-[#121212]">
                      {formatPHP(order.total)}
                    </td>
                    <td className="px-5 py-3.5">
                      {isOverduePending(order, nowMs) ? (
                        <span className="sp-mono inline-flex items-center gap-1.5 rounded-[4px] bg-[#FEE2E2] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.05em] text-[#991B1B]">
                          PENDING · 1D+
                        </span>
                      ) : (
                        <span className="sp-mono inline-block rounded-[4px] bg-[#F7F8FC] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.05em] text-[#5C6072]">
                          {order.status.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-[12.5px] font-medium text-[#121212] hover:text-[#1F06AC] hover:underline"
                      >
                        View →
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
