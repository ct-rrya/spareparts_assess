import React from 'react';
import Link from 'next/link';
import { getOrderByIdOrNumber } from '@/lib/db';
import { formatPHP } from '@/lib/money';
import { StoreHeader } from '@/components/store/StoreHeader';
import { StoreFooter } from '@/components/store/StoreFooter';
import { CheckCircle2 } from 'lucide-react';

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
            <h1 className="text-2xl font-bold m-0 text-[#0E0B33]">
              Order {orderNumber} Not Found
            </h1>
            <Link
              href="/products"
              className="mt-2 rounded-lg bg-[#0F42C0] hover:bg-[#1F06AC] text-white px-6 h-11 inline-flex items-center text-sm font-semibold transition-colors"
            >
              Return to Catalog
            </Link>
          </div>
        </main>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7FB] text-[#0E0B33]">
      <StoreHeader />

      <main className="max-w-[1040px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
        {/* breadcrumb */}
        <div className="sp-mono text-xs font-semibold tracking-wider text-[#4A4F78] mb-4">
          <Link href="/" className="text-[#0F42C0] hover:underline">
            HOME
          </Link>{' '}
          / REQUISITION CONFIRMED
        </div>

        {/* confirmation banner matching design board */}
        <div className="rounded-lg border border-[#D5DCF3] bg-white p-6 sm:p-8 mb-8 flex flex-wrap justify-between items-center gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#EAEFFC] text-[#0F42C0] flex items-center justify-center shrink-0">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <div className="sp-mono text-xs font-bold tracking-widest text-[#0F42C0] uppercase">
                REQUISITION PLACED SUCCESSFULLY
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0E0B33] mt-1 mb-0">
                {order.order_number}
              </h1>
            </div>
          </div>
          <span className="sp-mono rounded-md border border-[#D5DCF3] bg-[#F6F7FB] px-4 py-2 text-xs font-bold text-[#0E0B33]">
            STATUS: {order.status.toUpperCase()}
          </span>
        </div>

        {sp.email === 'sent' && (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 mb-6 text-sm text-indigo-950">
            A confirmation receipt has been sent to <b>{order.customer_email}</b>.
          </div>
        )}
        {sp.email === 'skipped' && (
          <div className="rounded-lg border border-[#D5DCF3] bg-white p-4 mb-6 text-sm text-[#4A4F78]">
            Order saved successfully. Resend email delivery skipped (no API key).
          </div>
        )}
        {sp.email === 'failed' && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-6 text-sm text-amber-900">
            Order saved, but the confirmation email could not be sent.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* customer details */}
          <div className="rounded-lg border border-[#D5DCF3] bg-white p-6 flex flex-col gap-3.5 text-sm shadow-sm">
            <div className="sp-mono text-xs font-semibold tracking-wider text-[#4A4F78] pb-2 border-b border-dashed border-[#D5DCF3]">
              CUSTOMER &amp; DELIVERY
            </div>
            <div className="flex justify-between border-t border-[#EEF1FB] pt-2.5">
              <span className="text-[#4A4F78]">Name</span>
              <span className="font-semibold text-[#0E0B33]">
                {order.customer_name}
              </span>
            </div>
            <div className="flex justify-between border-t border-[#EEF1FB] pt-2.5">
              <span className="text-[#4A4F78]">Email</span>
              <span className="text-[#0E0B33]">{order.customer_email}</span>
            </div>
            <div className="flex justify-between border-t border-[#EEF1FB] pt-2.5">
              <span className="text-[#4A4F78]">Contact</span>
              <span className="text-[#0E0B33]">{order.contact_number}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-[#EEF1FB] pt-2.5">
              <span className="text-[#4A4F78] shrink-0">Address</span>
              <span className="text-right text-[#0E0B33]">
                {order.delivery_address}
              </span>
            </div>
          </div>

          {/* payment & totals */}
          <div className="rounded-lg border border-[#D5DCF3] bg-white p-6 flex flex-col gap-3.5 text-sm shadow-sm">
            <div className="sp-mono text-xs font-semibold tracking-wider text-[#4A4F78] pb-2 border-b border-dashed border-[#D5DCF3]">
              PAYMENT &amp; TOTALS
            </div>
            <div className="flex justify-between border-t border-[#EEF1FB] pt-2.5">
              <span className="text-[#4A4F78]">Payment Method</span>
              <span className="font-semibold text-[#0E0B33]">
                {order.payment_method}
              </span>
            </div>
            <div className="flex justify-between border-t border-[#EEF1FB] pt-2.5">
              <span className="text-[#4A4F78]">Subtotal</span>
              <span className="text-[#0E0B33]">{formatPHP(order.subtotal)}</span>
            </div>
            <div className="flex justify-between border-t border-[#D5DCF3] pt-3 text-lg font-bold items-baseline">
              <span className="text-[#0E0B33]">Total</span>
              <span className="text-2xl font-bold text-[#1F06AC]">
                {formatPHP(order.total)}
              </span>
            </div>
            {order.order_notes && (
              <div className="border-t border-[#EEF1FB] pt-2.5">
                <span className="text-[#4A4F78] block mb-0.5">Notes</span>
                <span className="text-[#0E0B33]">{order.order_notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* item snapshot table */}
        <div className="rounded-lg border border-[#D5DCF3] bg-white overflow-hidden shadow-sm mb-8">
          <div className="sp-mono text-xs font-semibold tracking-wider text-[#4A4F78] p-4 bg-[#F6F7FB] border-b border-[#D5DCF3]">
            PURCHASED SPECIMENS
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[500px] text-sm">
              <thead>
                <tr className="border-b border-[#EEF1FB] text-left sp-mono text-xs text-[#4A4F78]">
                  <th className="p-3.5">ITEM SNAPSHOT</th>
                  <th className="p-3.5">UNIT PRICE</th>
                  <th className="p-3.5">QTY</th>
                  <th className="p-3.5 text-right">LINE TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#EEF1FB] last:border-b-0"
                  >
                    <td className="p-3.5">
                      <div className="font-bold text-base text-[#0E0B33]">
                        {item.product_name_snapshot}
                      </div>
                      {item.specimen_code_snapshot && (
                        <div className="sp-mono text-xs text-[#4A4F78]">
                          {item.specimen_code_snapshot.replace('SP-', '№ ')}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-[#0E0B33]">
                      {formatPHP(item.unit_price_snapshot)}
                    </td>
                    <td className="p-3.5 sp-mono font-bold text-[#0E0B33]">
                      {item.quantity}
                    </td>
                    <td className="p-3.5 text-right font-bold text-base text-[#1F06AC]">
                      {formatPHP(item.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/products"
            className="rounded-lg bg-[#0F42C0] hover:bg-[#1F06AC] text-white px-7 h-12 inline-flex items-center text-base font-bold transition-colors cursor-pointer"
          >
            Browse More Specimens
          </Link>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
