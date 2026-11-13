import React from 'react';
import Link from 'next/link';
import { getOrderByIdOrNumber } from '@/lib/db';
import { formatPHP } from '@/lib/money';
import { StoreHeader } from '@/components/store/StoreHeader';
import { StoreFooter } from '@/components/store/StoreFooter';
import { Check } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const [{ orderNumber }, sp] = await Promise.all([params, searchParams]);
  const order = await getOrderByIdOrNumber(orderNumber);

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F6F7FB] text-[#0E0B33]">
        <StoreHeader />
        <main className="max-w-[1040px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
          <div className="rounded-lg border border-[#D5DCF3] bg-white p-10 max-w-xl mx-auto text-center flex flex-col items-center gap-3">
            <h1 className="font-catchye text-3xl font-normal m-0 text-[#0E0B33]">
              Order {orderNumber} Not Found
            </h1>
            <p className="text-base text-[#4A4F78] font-sans m-0">
              We couldn&apos;t find this requisition record.
            </p>
            <Link
              href="/products"
              className="mt-2 rounded-lg bg-[#0F42C0] hover:bg-[#1F06AC] text-white px-6 h-11 inline-flex items-center text-sm font-semibold transition-colors"
            >
              Return to Products
            </Link>
          </div>
        </main>
        <StoreFooter />
      </div>
    );
  }

  const placedDate = new Date(order.created_at).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7FB] text-[#0E0B33]">
      <StoreHeader />

      <main className="max-w-[1040px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-10 flex-1">
        {/* breadcrumb */}
        <div className="sp-mono text-[11px] sm:text-xs font-semibold tracking-wider text-[#4A4F78] mb-2.5 sm:mb-4">
          <Link href="/" className="text-[#0F42C0] hover:underline">
            HOME
          </Link>{' '}
          / REQUISITION CONFIRMED
        </div>

        {/* hero confirmation banner */}
        <div className="rounded-xl sm:rounded-2xl bg-blueprint-grid text-white p-4 sm:p-8 lg:p-10 mb-4 sm:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5 sm:gap-6 shadow-md border border-[#5882E8]/40">
          <div className="flex flex-col gap-1.5 sm:gap-3">
            <div className="flex items-center gap-2 sm:flex-col sm:items-start sm:gap-2.5">
              <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-[#E3EF4F] text-[#1F06AC] flex items-center justify-center font-bold shadow-sm shrink-0">
                <Check className="w-3.5 h-3.5 sm:w-[22px] sm:h-[22px]" strokeWidth={3} />
              </div>
              <div className="sp-mono text-[10px] sm:text-[11px] font-bold tracking-widest text-[#E3EF4F] uppercase">
                ORDER CONFIRMED
              </div>
            </div>
            <div>
              <h1 className="font-catchye text-2xl sm:text-4xl lg:text-5xl font-normal text-white m-0 tracking-tight leading-tight">
                Thank you. Your order is in.
              </h1>
              <p className="text-xs sm:text-base text-[#DDE5FB] mt-1 sm:mt-2 mb-0 max-w-lg leading-snug sm:leading-relaxed font-sans">
                A confirmation is on its way to your email. We&apos;ll message you as soon as your order ships.
              </p>
            </div>
          </div>

          {/* right order number badge card */}
          <div className="w-full md:w-auto bg-white text-[#0E0B33] rounded-lg sm:rounded-xl border border-[#D5DCF3] px-3.5 py-2.5 sm:p-6 md:min-w-[220px] shrink-0 shadow-sm flex md:flex-col items-center md:items-start justify-between gap-2 sm:gap-1">
            <div>
              <div className="sp-mono text-[9px] sm:text-[10px] tracking-wider text-[#4A4F78] uppercase font-semibold">
                ORDER №
              </div>
              <div className="sp-mono text-lg sm:text-2xl lg:text-3xl font-bold text-[#1F06AC] tracking-tight leading-tight">
                {order.order_number}
              </div>
            </div>
            <div className="sp-mono text-[10px] sm:text-[11px] text-[#4A4F78] uppercase text-right md:text-left md:mt-1 shrink-0">
              PLACED {placedDate}
            </div>
          </div>
        </div>

        {sp.email === 'sent' && (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-2.5 sm:p-4 mb-4 sm:mb-6 text-xs sm:text-sm text-indigo-950 font-sans">
            A confirmation receipt has been sent to <b>{order.customer_email}</b>.
          </div>
        )}
        {sp.email === 'skipped' && (
          <div className="rounded-lg border border-[#D5DCF3] bg-white px-3.5 py-2.5 sm:p-4 mb-4 sm:mb-6 text-xs sm:text-sm text-[#4A4F78] font-sans">
            Order saved successfully. Resend email delivery skipped (no API key).
          </div>
        )}
        {sp.email === 'failed' && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 sm:p-4 mb-4 sm:mb-6 text-xs sm:text-sm text-amber-900 font-sans">
            Order saved, but the confirmation email could not be sent.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* customer details */}
          <div className="rounded-lg border border-[#D5DCF3] bg-white p-4 sm:p-6 flex flex-col gap-2 sm:gap-3.5 text-xs sm:text-sm shadow-sm">
            <div className="sp-mono text-[11px] sm:text-xs font-semibold tracking-wider text-[#4A4F78] pb-1.5 sm:pb-2 border-b border-dashed border-[#D5DCF3]">
              CUSTOMER DETAILS
            </div>
            <div className="flex justify-between pt-0.5 sm:pt-1">
              <span className="text-[#4A4F78]">Name</span>
              <span className="font-semibold text-[#0E0B33]">
                {order.customer_name}
              </span>
            </div>
            <div className="flex justify-between border-t border-[#EEF1FB] pt-2 sm:pt-2.5">
              <span className="text-[#4A4F78]">Email</span>
              <span className="text-[#0E0B33]">{order.customer_email}</span>
            </div>
            <div className="flex justify-between border-t border-[#EEF1FB] pt-2 sm:pt-2.5">
              <span className="text-[#4A4F78]">Mobile</span>
              <span className="text-[#0E0B33]">{order.contact_number}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-[#EEF1FB] pt-2 sm:pt-2.5">
              <span className="text-[#4A4F78] shrink-0">Deliver to</span>
              <span className="text-right text-[#0E0B33]">
                {order.delivery_address}
              </span>
            </div>
            <div className="flex justify-between border-t border-[#EEF1FB] pt-2 sm:pt-2.5">
              <span className="text-[#4A4F78]">Payment</span>
              <span className="font-semibold text-[#0E0B33]">
                {order.payment_method}
              </span>
            </div>
          </div>

          {/* totals & actions card */}
          <div className="rounded-lg border border-[#D5DCF3] bg-white p-4 sm:p-6 flex flex-col gap-2 sm:gap-3.5 text-xs sm:text-sm shadow-sm">
            <div className="sp-mono text-xs font-semibold tracking-wider text-[#4A4F78] pb-2 border-b border-dashed border-[#D5DCF3]">
              ORDER SUMMARY
            </div>
            <div className="flex justify-between border-t border-[#EEF1FB] pt-2.5">
              <span className="text-[#4A4F78]">Subtotal</span>
              <span className="text-[#0E0B33] font-medium">{formatPHP(order.subtotal)}</span>
            </div>
            <div className="flex justify-between border-t border-[#EEF1FB] pt-2.5">
              <span className="text-[#4A4F78]">Delivery</span>
              <span className="sp-mono text-xs font-bold text-[#0F42C0]">
                {order.subtotal >= 2500 ? 'Free' : '₱0 (Demo)'}
              </span>
            </div>
            <div className="flex justify-between border-t border-[#D5DCF3] pt-3 text-lg font-bold items-baseline">
              <span className="text-[#0E0B33]">Total</span>
              <span className="text-2xl font-bold text-[#1F06AC]">
                {formatPHP(order.total)}
              </span>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Link
                href="/products"
                className="w-full rounded-lg bg-[#0F42C0] hover:bg-[#1F06AC] text-white h-11 inline-flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                Continue shopping
              </Link>
              <Link
                href="/"
                className="w-full rounded-lg border border-[#C9D2F0] bg-white hover:bg-[#F6F7FB] text-[#1F06AC] h-11 inline-flex items-center justify-center text-sm font-semibold transition-colors cursor-pointer"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>

        {/* item snapshot table */}
        <div className="rounded-lg border border-[#D5DCF3] bg-white overflow-hidden shadow-sm mb-8">
          <div className="sp-mono text-[11px] sm:text-xs font-semibold tracking-wider text-[#4A4F78] px-3 py-2.5 sm:p-4 bg-[#F6F7FB] border-b border-[#D5DCF3]">
            PURCHASED ITEMS
          </div>
          <div className="w-full">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#EEF1FB] text-left sp-mono text-[10px] sm:text-xs text-[#4A4F78]">
                  <th className="px-2.5 py-2 sm:p-3.5">ITEM</th>
                  <th className="px-2 py-2 sm:p-3.5 whitespace-nowrap">PRICE</th>
                  <th className="px-2 py-2 sm:p-3.5 text-center whitespace-nowrap">QTY</th>
                  <th className="px-2.5 py-2 sm:p-3.5 text-right whitespace-nowrap">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#EEF1FB] last:border-b-0"
                  >
                    <td className="px-2.5 py-2.5 sm:p-3.5">
                      <div className="font-bold text-[13px] sm:text-base text-[#0E0B33] font-sans leading-snug">
                        {item.product_name_snapshot}
                      </div>
                      {item.specimen_code_snapshot && (
                        <div className="sp-mono text-[10px] sm:text-xs text-[#4A4F78]">
                          {item.specimen_code_snapshot.replace('SP-', '№ ')}
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-2.5 sm:p-3.5 text-[#0E0B33] font-sans whitespace-nowrap text-[11px] sm:text-sm">
                      {formatPHP(item.unit_price_snapshot)}
                    </td>
                    <td className="px-2 py-2.5 sm:p-3.5 sp-mono font-bold text-[#0E0B33] text-center whitespace-nowrap">
                      {item.quantity}
                    </td>
                    <td className="px-2.5 py-2.5 sm:p-3.5 text-right font-bold text-xs sm:text-base text-[#1F06AC] sp-mono whitespace-nowrap">
                      {formatPHP(item.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
