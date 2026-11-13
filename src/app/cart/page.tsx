'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { calcLineTotal, formatPHP } from '@/lib/money';
import { StoreHeader } from '@/components/store/StoreHeader';
import { StoreFooter } from '@/components/store/StoreFooter';
import { Trash2, Loader2 } from 'lucide-react';

export default function CartPage() {
  const { items, subtotal, total, hydrated, updateQuantity, removeItem } =
    useCart();

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7FB] text-[#0E0B33]">
      <StoreHeader />

      <main className="max-w-[1080px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
        {/* breadcrumb */}
        <div className="sp-mono text-xs font-semibold tracking-wider text-[#4A4F78] mb-4">
          <Link href="/" className="text-[#0F42C0] hover:underline">
            HOME
          </Link>{' '}
          / SHOPPING CART
        </div>

        <div className="flex flex-wrap justify-between items-end border-b border-[#D5DCF3] pb-4 mb-8 gap-4">
          <div>
            <h1 className="font-catchye text-4xl sm:text-5xl font-normal tracking-tight text-[#0E0B33] m-0">
              Your cart
            </h1>
            <div className="sp-mono text-xs text-[#4A4F78] mt-1.5 uppercase">
              {items.length} {items.length === 1 ? 'Line Item' : 'Line Items'}
            </div>
          </div>
          <Link
            href="/products"
            className="sp-mono text-xs font-semibold text-[#0F42C0] hover:underline"
          >
            ← CONTINUE SHOPPING
          </Link>
        </div>

        {!hydrated ? (
          <div className="rounded-lg border border-[#D5DCF3] bg-white p-12 flex justify-center items-center">
            <Loader2 className="h-6 w-6 text-[#0F42C0] animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-[#D5DCF3] bg-white p-12 text-center flex flex-col items-center gap-3">
            <div className="font-catchye text-2xl sm:text-3xl font-normal text-[#0E0B33]">
              Your cart is empty
            </div>
            <p className="text-base text-[#4A4F78] m-0 max-w-md leading-relaxed">
              You haven’t added any specimens or laboratory supplies yet. Browse our
              catalog to begin your requisition.
            </p>
            <Link
              href="/products"
              className="mt-3 rounded-lg bg-[#0F42C0] hover:bg-[#1F06AC] text-white px-7 h-12 inline-flex items-center text-base font-bold transition-colors cursor-pointer"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
            {/* items container */}
            <div className="flex flex-col gap-3">
              {/* mobile card layout matching mobile design board */}
              <div className="flex flex-col gap-3 sm:hidden">
                {items.map((item) => {
                  const lineTotal = calcLineTotal(item.unitPrice, item.quantity);
                  const specCode = item.specimenCode?.replace('SP-', '№ ') || '';
                  return (
                    <article
                      key={item.productId}
                      className="rounded-lg border border-[#D5DCF3] bg-white overflow-hidden shadow-sm"
                    >
                      <div className="flex justify-between items-center px-3.5 py-2 border-b border-dashed border-[#D5DCF3] sp-mono text-[11px] text-[#4A4F78]">
                        <span>{specCode}</span>
                        <span>SKU {item.specimenCode}</span>
                      </div>

                      <div className="flex gap-3.5 p-3.5">
                        <div className="relative w-20 h-20 rounded-md bg-[#F6F7FB] border border-[#D5DCF3] overflow-hidden shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                          <h3 className="font-bold text-base text-[#0E0B33] leading-snug line-clamp-2 m-0">
                            {item.name}
                          </h3>
                          <div className="text-xs text-[#4A4F78]">
                            {formatPHP(item.unitPrice)} each
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center px-3.5 pb-3">
                        <div className="inline-flex rounded-lg border border-[#C9D2F0] overflow-hidden bg-[#F6F7FB]">
                          <button
                            type="button"
                            disabled={item.quantity <= 1}
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            aria-label={`Decrease ${item.name} quantity`}
                            className="w-10 h-10 bg-white text-[#0F42C0] text-lg font-bold disabled:opacity-30 cursor-pointer flex items-center justify-center"
                          >
                            −
                          </button>
                          <span className="w-10 flex items-center justify-center text-sm font-bold sp-mono">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={item.quantity >= item.maxStock}
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            aria-label={`Increase ${item.name} quantity`}
                            className="w-10 h-10 bg-white text-[#0F42C0] text-lg font-bold disabled:opacity-30 cursor-pointer flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-lg font-bold sp-mono text-[#1F06AC]">
                          {formatPHP(lineTotal)}
                        </span>
                      </div>

                      <div className="border-t border-[#EEF1FB] px-3.5 py-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="sp-mono text-xs font-semibold text-[#0F42C0] hover:text-red-600 cursor-pointer"
                        >
                          REMOVE ITEM
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* desktop items table */}
              <div className="hidden sm:block rounded-lg border border-[#D5DCF3] bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[560px] text-sm">
                    <thead>
                      <tr className="bg-[#F6F7FB] border-b border-[#D5DCF3] text-left sp-mono text-xs font-semibold text-[#4A4F78]">
                        <th className="p-3.5">PRODUCT</th>
                        <th className="p-3.5">PRICE</th>
                        <th className="p-3.5">QTY</th>
                        <th className="p-3.5">TOTAL</th>
                        <th className="p-3.5 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => {
                        const lineTotal = calcLineTotal(
                          item.unitPrice,
                          item.quantity
                        );
                        const specCode = item.specimenCode?.replace('SP-', '№ ') || '';
                        return (
                          <tr
                            key={item.productId}
                            className="border-b border-[#EEF1FB] last:border-b-0"
                          >
                            <td className="p-3.5">
                              <div className="flex items-center gap-3.5">
                                <div className="w-14 h-14 rounded-lg bg-[#F6F7FB] border border-[#D5DCF3] overflow-hidden shrink-0 flex items-center justify-center">
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <Link
                                    href={`/products`}
                                    className="font-bold text-base text-[#0E0B33] hover:text-[#0F42C0] leading-snug line-clamp-1"
                                  >
                                    {item.name}
                                  </Link>
                                  <div className="sp-mono text-xs text-[#4A4F78] mt-0.5">
                                    {specCode} · Max: {item.maxStock}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5 text-sm font-semibold text-[#0E0B33]">
                              {formatPHP(item.unitPrice)}
                            </td>
                            <td className="p-3.5">
                              <div className="inline-flex rounded-lg border border-[#C9D2F0] overflow-hidden">
                                <button
                                  type="button"
                                  disabled={item.quantity <= 1}
                                  onClick={() =>
                                    updateQuantity(item.productId, item.quantity - 1)
                                  }
                                  aria-label={`Decrease ${item.name} quantity`}
                                  className="w-8 h-9 bg-white text-[#0E0B33] hover:bg-slate-50 text-base font-bold disabled:opacity-30 cursor-pointer"
                                >
                                  −
                                </button>
                                <span className="min-w-[36px] flex items-center justify-center border-x border-[#C9D2F0] text-sm font-bold sp-mono">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  disabled={item.quantity >= item.maxStock}
                                  onClick={() =>
                                    updateQuantity(item.productId, item.quantity + 1)
                                  }
                                  aria-label={`Increase ${item.name} quantity`}
                                  className="w-8 h-9 bg-white text-[#0E0B33] hover:bg-slate-50 text-base font-bold disabled:opacity-30 cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="p-3.5 text-base font-bold text-[#1F06AC]">
                              {formatPHP(lineTotal)}
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => removeItem(item.productId)}
                                aria-label={`Remove ${item.name}`}
                                className="text-[#4A4F78] hover:text-red-600 p-1.5 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* order summary card */}
            <div className="rounded-lg border border-[#D5DCF3] bg-white p-6 flex flex-col gap-4 shadow-sm">
              <div className="sp-mono text-xs font-semibold tracking-wider text-[#4A4F78] pb-3 border-b border-dashed border-[#D5DCF3]">
                ORDER SUMMARY
              </div>

              <div className="flex justify-between text-sm text-[#4A4F78]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#0E0B33]">
                  {formatPHP(subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-sm text-[#4A4F78]">
                <span>Shipping</span>
                <span className="sp-mono text-xs font-bold text-[#0F42C0]">
                  {subtotal >= 2500 ? 'FREE' : 'PHP 0.00 (Demo)'}
                </span>
              </div>

              <div className="flex justify-between border-t border-[#EEF1FB] pt-4 items-baseline">
                <span className="text-base font-bold text-[#0E0B33]">Total</span>
                <span className="text-2xl font-bold text-[#1F06AC]">
                  {formatPHP(total)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="mt-2 w-full h-12 rounded-lg bg-[#0F42C0] hover:bg-[#1F06AC] text-white text-base font-bold flex items-center justify-center transition-colors cursor-pointer active:scale-[0.99]"
              >
                Proceed to Checkout →
              </Link>

              <div className="sp-mono text-[11px] text-[#4A4F78] text-center mt-1">
                Prices include all items · No hidden assessment fees
              </div>
            </div>
          </div>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}
