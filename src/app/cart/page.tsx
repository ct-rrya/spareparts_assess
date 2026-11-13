'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { calcLineTotal, formatPHP } from '@/lib/money';
import { StoreHeader } from '@/components/store/StoreHeader';
import { StoreFooter } from '@/components/store/StoreFooter';
import { Loader2 } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const [navigatingCheckout, startTransition] = useTransition();
  const {
    items,
    itemCount,
    subtotal,
    total,
    hydrated,
    updateQuantity,
    removeItem,
  } = useCart();

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F7FB] text-[#121212]">
      <StoreHeader />

      <main className="mx-auto w-full max-w-[1160px] flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* breadcrumb */}
        <div className="sp-mono mb-4 text-[11px] uppercase tracking-[0.08em] text-[#7D8292]">
          <Link href="/" className="text-[#1C47CC] hover:underline">
            HOME
          </Link>{' '}
          / CART
        </div>

        {/* header */}
        <div className="mb-7">
          <h1 className="font-catchye m-0 text-[40px] leading-none tracking-[-0.01em] text-[#121212] sm:text-[44px]">
            Your cart
          </h1>
          <p className="sp-mono mt-2.5 mb-0 text-[11px] uppercase tracking-[0.08em] text-[#7D8292]">
            {itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'} · {items.length}{' '}
            {items.length === 1 ? 'SPECIMEN' : 'SPECIMENS'}
          </p>
        </div>

        {!hydrated ? (
          <div className="flex items-center justify-center rounded-[8px] border border-[#E2E4EC] bg-white p-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#1F06AC]" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[8px] border border-[#E2E4EC] bg-white p-12 text-center">
            <div className="font-catchye text-3xl text-[#121212]">
              Your cart is empty
            </div>
            <p className="m-0 max-w-md text-sm leading-relaxed text-[#5C6072]">
              You haven’t added any specimens or laboratory supplies yet. Browse
              our products to begin your order.
            </p>
            <Link
              href="/products"
              className="mt-3 inline-flex h-11 cursor-pointer items-center rounded-[6px] bg-[#0F42C0] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#1F06AC]"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[1.65fr_1fr]">
            {/* item cards */}
            <div className="space-y-4">
              {items.map((item) => {
                const lineTotal = calcLineTotal(item.unitPrice, item.quantity);
                const code = item.specimenCode?.replace('SP-', '') || '';

                return (
                  <article
                    key={item.productId}
                    className="flex flex-col justify-between gap-4 rounded-[8px] border border-[#E2E4EC] bg-white p-4 sm:flex-row sm:items-center sm:p-5"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[6px] border border-[#E2E4EC] bg-[#F7F8FC] sm:h-24 sm:w-24">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="sp-mono text-[10.5px] uppercase tracking-[0.06em] text-[#7D8292]">
                          № {code} · SKU {item.specimenCode}
                        </div>
                        <h2 className="mt-1 mb-0 truncate text-[16px] font-bold text-[#121212]">
                          {item.name}
                        </h2>
                        <div className="sp-mono mt-0.5 text-[11px] uppercase tracking-[0.05em] text-[#7D8292]">
                          {item.categoryName}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="sp-mono mt-2.5 cursor-pointer text-[10.5px] font-medium uppercase tracking-[0.06em] text-[#1C47CC] hover:text-[#B91C1C] hover:underline"
                        >
                          REMOVE
                        </button>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-between gap-5 sm:justify-end">
                      <div className="inline-flex h-10 items-center rounded-[6px] border border-[#E2E4EC] bg-[#F9FAFC]">
                        <button
                          type="button"
                          disabled={item.quantity <= 1}
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          aria-label={`Decrease ${item.name} quantity`}
                          className="flex h-full w-10 cursor-pointer items-center justify-center text-base font-bold text-[#1C47CC] disabled:opacity-30"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-[#121212]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={item.quantity >= item.maxStock}
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          aria-label={`Increase ${item.name} quantity`}
                          className="flex h-full w-10 cursor-pointer items-center justify-center text-base font-bold text-[#1C47CC] disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <div className="min-w-[96px] text-right">
                        <div className="sp-mono text-[10.5px] uppercase tracking-[0.05em] text-[#7D8292]">
                          {formatPHP(item.unitPrice)} EACH
                        </div>
                        <div className="mt-0.5 text-[18px] font-bold text-[#1F06AC]">
                          {formatPHP(lineTotal)}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

              <div className="pt-1">
                <Link
                  href="/products"
                  className="sp-mono inline-block text-[11px] font-medium uppercase tracking-[0.08em] text-[#1C47CC] hover:underline"
                >
                  ← CONTINUE SHOPPING
                </Link>
              </div>
            </div>

            {/* order summary */}
            <aside className="space-y-4 rounded-[8px] border border-[#E2E4EC] bg-white p-5 sm:p-6 lg:sticky lg:top-24">
              <div className="sp-mono border-b border-dashed border-[#E2E4EC] pb-3 text-[11px] uppercase tracking-[0.08em] text-[#5C6072]">
                ORDER SUMMARY
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#5C6072]">Subtotal</span>
                  <span className="font-semibold text-[#121212]">
                    {formatPHP(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5C6072]">Delivery</span>
                  <span className="font-semibold text-[#121212]">Free</span>
                </div>
              </div>

              <div className="flex items-baseline justify-between border-t border-dashed border-[#E2E4EC] pt-4">
                <span className="text-base font-semibold text-[#121212]">
                  Total
                </span>
                <span className="text-[24px] font-bold leading-none text-[#1F06AC]">
                  {formatPHP(total)}
                </span>
              </div>

              <div className="sp-mono rounded-[6px] bg-[#E5F24E] px-3.5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#1A2400]">
                FREE DELIVERY APPLIED
              </div>

              <button
                type="button"
                disabled={navigatingCheckout}
                onClick={() =>
                  startTransition(() => {
                    router.push('/checkout');
                  })
                }
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[6px] bg-[#0F42C0] text-sm font-semibold text-white transition-colors hover:bg-[#1F06AC] disabled:opacity-70"
              >
                {navigatingCheckout ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Opening checkout...
                  </>
                ) : (
                  'Proceed to checkout'
                )}
              </button>
            </aside>
          </div>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}
