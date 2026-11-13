'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { ORDER_PROGRESS_STEPS, Order, OrderStatus } from '@/types';
import { formatPHP } from '@/lib/money';
import { getAllowedNextStatuses } from '@/lib/orders';

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

  const currentStepIdx = ORDER_PROGRESS_STEPS.indexOf(
    order.status as (typeof ORDER_PROGRESS_STEPS)[number]
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <div className="text-xs sp-mono text-[#4A4F78] mb-1">
            <Link href="/admin/orders" className="hover:text-[#0F42C0] transition-colors">
              ORDERS
            </Link>{' '}
            / {order.order_number}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E0B33] m-0">
            Order {order.order_number}
          </h1>
        </div>

        <span
          className={`rounded-full px-3.5 py-1 text-xs sp-mono font-bold ${
            order.status === 'Completed'
              ? 'bg-emerald-100 text-emerald-800'
              : order.status === 'Cancelled'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-[#EAEFFC] text-[#1F06AC]'
          }`}
        >
          {order.status}
        </span>
      </div>

      {/* status stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-5 rounded-lg border border-[#D5DCF3] bg-white overflow-hidden shadow-sm">
        {ORDER_PROGRESS_STEPS.map((step, idx) => {
          const isReached =
            order.status !== 'Cancelled' && currentStepIdx >= idx;
          return (
            <div
              key={step}
              className={`p-3.5 border-b sm:border-b-0 sm:border-r border-[#D5DCF3] last:border-r-0 transition-colors ${
                isReached ? 'bg-[#EAEFFC] text-[#1F06AC]' : 'bg-white text-[#4A4F78]'
              }`}
            >
              <div className="text-[11px] sp-mono font-bold tracking-wider uppercase text-[#4A4F78]">
                STEP 0{idx + 1}
              </div>
              <b className="text-sm font-bold block mt-0.5">{step}</b>
            </div>
          );
        })}
      </div>

      {feedback && (
        <div
          className={`rounded-lg border p-3.5 text-sm font-medium ${
            feedback.ok
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-lg border border-[#D5DCF3] bg-white p-6 flex flex-col gap-3 text-sm shadow-sm">
          <h3 className="text-base font-bold text-[#0E0B33] m-0">
            Customer Information
          </h3>
          <div className="flex justify-between border-t border-[#D5DCF3]/60 pt-2.5">
            <span className="text-[#4A4F78]">Name</span>
            <span className="font-semibold text-[#0E0B33]">
              {order.customer_name}
            </span>
          </div>
          <div className="flex justify-between border-t border-[#D5DCF3]/60 pt-2.5">
            <span className="text-[#4A4F78]">Email</span>
            <span className="sp-mono text-xs text-[#0E0B33]">{order.customer_email}</span>
          </div>
          <div className="flex justify-between border-t border-[#D5DCF3]/60 pt-2.5">
            <span className="text-[#4A4F78]">Contact</span>
            <span className="sp-mono text-xs text-[#0E0B33]">{order.contact_number}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-[#D5DCF3]/60 pt-2.5">
            <span className="text-[#4A4F78] shrink-0">Address</span>
            <span className="text-right text-[#0E0B33]">{order.delivery_address}</span>
          </div>
        </div>

        <div className="rounded-lg border border-[#D5DCF3] bg-white p-6 flex flex-col gap-3 text-sm shadow-sm">
          <h3 className="text-base font-bold text-[#0E0B33] m-0">
            Payment &amp; Notes
          </h3>
          <div className="flex justify-between border-t border-[#D5DCF3]/60 pt-2.5">
            <span className="text-[#4A4F78]">Method</span>
            <span className="font-semibold text-[#0E0B33]">
              {order.payment_method}
            </span>
          </div>
          <div className="flex justify-between border-t border-[#D5DCF3]/60 pt-2.5">
            <span className="text-[#4A4F78]">Subtotal</span>
            <span className="sp-mono font-semibold text-[#0E0B33]">{formatPHP(order.subtotal)}</span>
          </div>
          <div className="flex justify-between border-t border-[#D5DCF3] pt-2.5 font-bold text-base text-[#1F06AC]">
            <span>Total</span>
            <span className="sp-mono">{formatPHP(order.total)}</span>
          </div>
          <div className="border-t border-[#D5DCF3]/60 pt-2.5">
            <span className="text-[#4A4F78] block mb-0.5">Notes</span>
            <span className="text-[#0E0B33]">{order.order_notes || 'No notes provided.'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
        <div className="rounded-lg border border-[#D5DCF3] bg-white overflow-x-auto shadow-sm">
          <table className="w-full border-collapse min-w-[460px] text-sm">
            <thead>
              <tr className="bg-[#F6F7FB] border-b border-[#D5DCF3] text-xs font-bold uppercase tracking-wider text-[#4A4F78] sp-mono text-left">
                <th className="p-3.5">Purchased Item (Snapshot)</th>
                <th className="p-3.5">Unit Price</th>
                <th className="p-3.5">Qty</th>
                <th className="p-3.5 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[#D5DCF3]/50 last:border-b-0 hover:bg-[#F6F7FB]/50 transition-colors"
                >
                  <td className="p-3.5">
                    <span className="font-semibold text-[#0E0B33]">
                      {item.product_name_snapshot}
                    </span>
                    <span className="text-xs sp-mono text-[#4A4F78] ml-2">
                      {item.specimen_code_snapshot}
                    </span>
                  </td>
                  <td className="p-3.5 sp-mono text-[#0E0B33]">
                    {formatPHP(item.unit_price_snapshot)}
                  </td>
                  <td className="p-3.5 sp-mono text-[#0E0B33]">{item.quantity}</td>
                  <td className="p-3.5 font-bold sp-mono text-right text-[#1F06AC]">
                    {formatPHP(item.line_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form
          onSubmit={handleStatusUpdate}
          className="rounded-lg border border-[#D5DCF3] bg-white p-6 flex flex-col gap-4 shadow-sm"
        >
          <h3 className="text-base font-bold text-[#0E0B33] m-0">
            Update Status
          </h3>

          {allowedNext.length === 0 ? (
            <div className="rounded-md bg-[#F6F7FB] border border-[#D5DCF3] p-3.5 text-xs sp-mono text-[#4A4F78]">
              <b className="text-[#0E0B33]">{order.status}</b> is a final status. No further transitions are permitted.
            </div>
          ) : (
            <>
              <select
                aria-label="Next order status"
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as OrderStatus)
                }
                className="rounded-md border border-[#C9D2F0] px-3 h-10 text-sm bg-white text-[#0E0B33] focus:outline-none focus:border-[#0F42C0]"
              >
                {allowedNext.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-[#0F42C0] hover:bg-[#1F06AC] text-white h-11 text-sm font-bold flex items-center justify-center cursor-pointer transition-colors"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Update Status'
                )}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
