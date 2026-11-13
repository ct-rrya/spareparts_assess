'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { formatPHP } from '@/lib/money';
import { getAllowedNextStatuses } from '@/lib/orders';

function formatPlacedDateTime(iso: string) {
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
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()} · ${hh}:${mm}`;
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

function StatusUpdateCard({
  status,
  allowedNext,
  selectedStatus,
  setSelectedStatus,
  saving,
  onSubmit,
}: {
  status: OrderStatus;
  allowedNext: OrderStatus[];
  selectedStatus: OrderStatus | '';
  setSelectedStatus: (s: OrderStatus) => void;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[8px] border border-[#E2E4EC] bg-white"
    >
      <div className="flex items-center justify-between rounded-t-[8px] border-b border-[#ECEEF4] px-5 py-3.5">
        <h2 className="sp-mono m-0 text-[11px] font-medium uppercase tracking-[0.08em] text-[#5C6072]">
          <span className="lg:hidden">UPDATE STATUS</span>
          <span className="hidden lg:inline">STATUS</span>
        </h2>
        <span
          className={`hidden lg:inline-block sp-mono rounded-[4px] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.05em] ${getStatusBadgeClass(
            status
          )}`}
        >
          {getStatusLabel(status)}
        </span>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        {allowedNext.length === 0 ? (
          <div className="sp-mono rounded-[6px] border border-[#ECEEF4] bg-[#F7F8FC] p-3.5 text-xs text-[#5C6072]">
            <b className="text-[#121212]">{status}</b> is a final status. No
            further transitions are permitted.
          </div>
        ) : (
          <>
            <div ref={menuRef} className="relative">
              <button
                type="button"
                aria-label="Next order status"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="flex h-10 w-full cursor-pointer items-center justify-between rounded-[6px] border border-[#E2E4EC] bg-white px-3 text-sm font-medium text-[#121212] transition-colors hover:border-[#1F06AC] focus:border-[#1F06AC] focus:outline-none"
              >
                <span>{selectedStatus}</span>
                <ChevronDown
                  size={16}
                  className={`text-[#5C6072] transition-transform ${
                    open ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {open && (
                <div
                  role="listbox"
                  className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-[6px] border border-[#D5DCF3] bg-white py-1 shadow-lg"
                >
                  {allowedNext.map((s) => {
                    const active = s === selectedStatus;
                    return (
                      <button
                        key={s}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          setSelectedStatus(s);
                          setOpen(false);
                        }}
                        className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                          active
                            ? 'bg-[#EAEFFC] font-semibold text-[#1F06AC]'
                            : 'text-[#121212] hover:bg-[#F7F8FC]'
                        }`}
                      >
                        <span>{s}</span>
                        {active && <Check size={14} className="text-[#1F06AC]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex h-10 w-full cursor-pointer items-center justify-center rounded-[6px] bg-[#0F42C0] text-[13px] font-semibold text-white transition-colors hover:bg-[#1F06AC] disabled:opacity-60"
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={15} className="animate-spin" />
                  Updating...
                </span>
              ) : (
                'Update status'
              )}
            </button>
          </>
        )}
      </div>
    </form>
  );
}

export function AdminOrderDetailsClient({
  initialOrder,
}: {
  initialOrder: Order;
}) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const allowedNext = getAllowedNextStatuses(order.status);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>(
    allowedNext[0] || ''
  );
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  async function handleStatusUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStatus) return;

    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          ok: false,
          text: data.error || 'Failed to update order status.',
        });
        setSaving(false);
        return;
      }

      setOrder(data.order);
      const nextChoices = getAllowedNextStatuses(data.order.status);
      setSelectedStatus(nextChoices[0] || '');
      setFeedback({
        ok: true,
        text:
          data.order.status === 'Cancelled'
            ? 'Order cancelled and item stock restored.'
            : `Order status updated to ${data.order.status}.`,
      });
    } catch {
      setFeedback({ ok: false, text: 'Network error while updating status.' });
    } finally {
      setSaving(false);
    }
  }

  const isPaid = order.status === 'Completed';

  const statusCard = (
    <StatusUpdateCard
      status={order.status}
      allowedNext={allowedNext}
      selectedStatus={selectedStatus}
      setSelectedStatus={setSelectedStatus}
      saving={saving}
      onSubmit={handleStatusUpdate}
    />
  );

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* mobile header */}
      <div className="flex lg:hidden flex-col gap-2">
        <Link
          href="/admin/orders"
          className="sp-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-[#1C47CC] hover:underline self-start"
        >
          ← ALL ORDERS
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="sp-mono text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
              ORDER №
            </div>
            <h1 className="font-catchye m-0 mt-0.5 text-[30px] leading-none tracking-[-0.01em] text-[#1F06AC]">
              {order.order_number}
            </h1>
          </div>
          <span
            className={`sp-mono rounded-[4px] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.05em] ${getStatusBadgeClass(
              order.status
            )}`}
          >
            {getStatusLabel(order.status)}
          </span>
        </div>
        <p className="sp-mono m-0 text-[11px] uppercase tracking-[0.08em] text-[#7D8292]">
          PLACED {formatPlacedDateTime(order.created_at)}
        </p>
      </div>

      {/* desktop header */}
      <div className="hidden lg:flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-catchye m-0 text-[36px] leading-none tracking-[-0.01em] text-[#121212]">
            Order {order.order_number}
          </h1>
          <p className="sp-mono mt-2 mb-0 text-[11px] uppercase tracking-[0.08em] text-[#7D8292]">
            PLACED {formatPlacedDateTime(order.created_at)}
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="inline-flex h-10 items-center rounded-[6px] border border-[#E2E4EC] bg-white px-4 text-[13px] font-medium text-[#1F06AC] transition-colors hover:border-[#1F06AC]"
        >
          ← All orders
        </Link>
      </div>

      {feedback && (
        <div className="rounded-[8px] border border-[#E2E4EC] bg-white px-4 py-3 text-sm font-medium text-[#121212]">
          {feedback.text}
        </div>
      )}

      {/* mobile status card first */}
      <div className="lg:hidden">{statusCard}</div>

      {/* 2-col layout: items + customer on left (customer first on mobile), status + payment on right */}
      <div className="grid grid-cols-1 items-start gap-5 sm:gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col-reverse lg:flex-col gap-5 sm:gap-6">
          {/* items card */}
          <div className="overflow-hidden rounded-[8px] border border-[#E2E4EC] bg-white">
            <div className="border-b border-[#ECEEF4] px-5 py-3.5">
              <h2 className="sp-mono m-0 text-[11px] font-medium uppercase tracking-[0.08em] text-[#5C6072]">
                ITEMS
              </h2>
            </div>

            {/* mobile compact items list */}
            <div className="md:hidden divide-y divide-[#ECEEF4]">
              {(order.items || []).map((item) => (
                <div
                  key={item.id}
                  className="px-4 py-3 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold text-[#121212]">
                      {item.product_name_snapshot}
                    </div>
                    <div className="sp-mono mt-0.5 text-[10.5px] text-[#7D8292]">
                      № {item.specimen_code_snapshot.replace('SP-', '')} · QTY{' '}
                      {item.quantity}
                    </div>
                  </div>
                  <div className="text-[13.5px] font-bold text-[#121212] shrink-0">
                    {formatPHP(item.line_total)}
                  </div>
                </div>
              ))}
            </div>

            {/* desktop items table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[460px] border-collapse text-left text-sm">
                <thead>
                  <tr className="sp-mono border-b border-[#ECEEF4] bg-[#F7F8FC] text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                    <th className="px-5 py-3 font-medium">PRODUCT</th>
                    <th className="px-5 py-3 font-medium">№</th>
                    <th className="px-5 py-3 font-medium">QTY</th>
                    <th className="px-5 py-3 text-right font-medium">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECEEF4]">
                  {(order.items || []).map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-[#F9FAFC]"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="sp-mono flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] border border-[#ECEEF4] bg-[#F7F8FC] text-[9px] text-[#7D8292]">
                            IMG
                          </div>
                          <span className="text-[13.5px] font-semibold text-[#121212]">
                            {item.product_name_snapshot}
                          </span>
                        </div>
                      </td>
                      <td className="sp-mono px-5 py-3.5 text-[12px] text-[#5C6072]">
                        {item.specimen_code_snapshot.replace('SP-', '')}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#5C6072]">
                        {item.quantity}
                      </td>
                      <td className="px-5 py-3.5 text-right text-[13.5px] font-bold text-[#121212]">
                        {formatPHP(item.line_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* customer card */}
          <div className="overflow-hidden rounded-[8px] border border-[#E2E4EC] bg-white">
            <div className="border-b border-[#ECEEF4] px-5 py-3.5">
              <h2 className="sp-mono m-0 text-[11px] font-medium uppercase tracking-[0.08em] text-[#5C6072]">
                CUSTOMER
              </h2>
            </div>

            <div className="space-y-1.5 p-5 text-[13.5px]">
              <p className="m-0 font-semibold text-[#121212]">
                {order.customer_name}
              </p>
              <p className="m-0 text-[#5C6072]">{order.customer_email}</p>
              <p className="m-0 text-[#5C6072]">{order.contact_number}</p>
              <p className="m-0 text-[#5C6072]">{order.delivery_address}</p>
              {order.order_notes && (
                <p className="mt-3 border-t border-[#ECEEF4] pt-3 text-xs text-[#7D8292]">
                  Note: {order.order_notes}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5 sm:space-y-6">
          {/* desktop status card */}
          <div className="hidden lg:block">{statusCard}</div>

          {/* payment card */}
          <div className="overflow-hidden rounded-[8px] border border-[#E2E4EC] bg-white">
            <div className="border-b border-[#ECEEF4] px-5 py-3.5">
              <h2 className="sp-mono m-0 text-[11px] font-medium uppercase tracking-[0.08em] text-[#5C6072]">
                PAYMENT
              </h2>
            </div>

            <div className="space-y-3 p-5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#5C6072]">Method</span>
                <span className="font-semibold text-[#121212]">
                  {order.payment_method}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5C6072]">Subtotal</span>
                <span className="font-semibold text-[#121212]">
                  {formatPHP(order.subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5C6072]">Delivery</span>
                <span className="font-semibold text-[#121212]">Free</span>
              </div>

              <div className="flex items-baseline justify-between border-t border-[#ECEEF4] pt-3">
                <span className="font-semibold text-[#121212]">Total</span>
                <span className="text-[24px] font-bold leading-none text-[#1F06AC]">
                  {formatPHP(order.total)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[#5C6072]">Payment status</span>
                <span
                  className={`sp-mono rounded-[4px] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.05em] ${
                    isPaid
                      ? 'bg-[#E5F24E] text-[#1A2400]'
                      : 'bg-[#FFF6C2] text-[#5A4B00]'
                  }`}
                >
                  {isPaid ? 'PAID' : 'UNPAID'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
