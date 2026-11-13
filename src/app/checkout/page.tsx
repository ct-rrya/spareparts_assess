'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { calcLineTotal, formatPHP } from '@/lib/money';
import { PAYMENT_METHODS, PaymentMethod } from '@/types';
import { StoreHeader } from '@/components/store/StoreHeader';
import { StoreFooter } from '@/components/store/StoreFooter';
import { Loader2 } from 'lucide-react';

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  'Cash on Delivery': 'Cash on delivery',
  'E-Wallet': 'GCash / e-wallet',
  'Bank Transfer': 'Bank transfer',
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, total, hydrated, clearCart, syncItemStock } =
    useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const [street, setStreet] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('Cash on Delivery');
  const [orderNotes, setOrderNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function refreshCartFromServer() {
    try {
      const res = await fetch('/api/products?active=1');
      if (!res.ok) return;
      const data = await res.json();
      const map = new Map(
        (data.products || []).map(
          (p: { id: string; stock: number; price: number }) => [p.id, p]
        )
      );
      for (const item of items) {
        const latest = map.get(item.productId) as
          | { stock: number; price: number }
          | undefined;
        if (latest) {
          syncItemStock(item.productId, latest.stock, latest.price);
        }
      }
    } catch {
      // ignore refresh error
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!/\d{5,}/.test(contactNumber.replace(/\D/g, ''))) {
      setErrorMsg('Please enter a valid mobile number.');
      return;
    }

    const combinedAddress = [street, barangay, city, province, postalCode]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(', ');

    if (!street.trim() || !city.trim()) {
      setErrorMsg('Street address and city / municipality are required.');
      return;
    }
    if (items.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim(),
          contact_number: contactNumber.trim(),
          delivery_address: combinedAddress,
          payment_method: paymentMethod,
          order_notes: orderNotes.trim(),
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            expectedPrice: i.unitPrice,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.reviewRequired) {
          await refreshCartFromServer();
        }
        setErrorMsg(data.error || 'Failed to place order.');
        setSubmitting(false);
        return;
      }

      clearCart();
      const emailParam = data.emailStatus ? `?email=${data.emailStatus}` : '';
      router.push(
        `/order-confirmation/${data.order.order_number}${emailParam}`
      );
    } catch {
      setErrorMsg('Network error while saving your order. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F7FB] text-[#121212]">
      <StoreHeader />

      <main className="mx-auto w-full max-w-[1160px] flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* step breadcrumb */}
        <div className="sp-mono mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-[#7D8292]">
          <Link href="/cart" className="hover:text-[#1F06AC]">
            CART
          </Link>
          <span>›</span>
          <span className="border-b-2 border-[#E5F24E] pb-0.5 font-semibold text-[#1F06AC]">
            CHECKOUT
          </span>
          <span>›</span>
          <span>CONFIRMED</span>
        </div>

        {/* header */}
        <div className="mb-7">
          <h1 className="font-catchye m-0 text-[40px] leading-none tracking-[-0.01em] text-[#121212] sm:text-[44px]">
            Checkout
          </h1>
        </div>

        {!hydrated ? (
          <div className="flex items-center justify-center rounded-[8px] border border-[#E2E4EC] bg-white p-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#1F06AC]" />
          </div>
        ) : submitting ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-[8px] border border-[#E2E4EC] bg-white p-14 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#1F06AC]" />
            <div className="font-catchye text-3xl text-[#121212]">
              Processing your order
            </div>
            <p className="sp-mono m-0 text-[11px] uppercase tracking-[0.08em] text-[#7D8292]">
              CONFIRMING STOCK &amp; PREPARING YOUR RECEIPT...
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[8px] border border-[#E2E4EC] bg-white p-12 text-center">
            <div className="font-catchye text-3xl text-[#121212]">
              Your cart is empty
            </div>
            <p className="m-0 text-sm text-[#5C6072]">
              You cannot check out with an empty cart.
            </p>
            <Link
              href="/products"
              className="mt-2 inline-flex h-11 cursor-pointer items-center rounded-[6px] bg-[#0F42C0] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#1F06AC]"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[1.6fr_1fr]"
          >
            {/* left form sections */}
            <div className="space-y-6">
              {errorMsg && (
                <div className="rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#991B1B]">
                  {errorMsg}
                </div>
              )}

              {/* 01 contact */}
              <section className="overflow-hidden rounded-[8px] border border-[#E2E4EC] bg-white">
                <div className="flex items-center gap-2.5 border-b border-dashed border-[#E2E4EC] px-5 py-3.5">
                  <span className="sp-mono flex h-6 w-6 items-center justify-center rounded-[4px] bg-[#1F06AC] text-[11px] font-semibold text-white">
                    01
                  </span>
                  <h2 className="sp-mono m-0 text-[11px] font-medium uppercase tracking-[0.08em] text-[#5C6072]">
                    CONTACT
                  </h2>
                </div>

                <div className="space-y-4 p-5">
                  <label className="flex flex-col gap-1.5">
                    <span className="sp-mono text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                      FULL NAME
                    </span>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="h-10 rounded-[6px] border border-[#E2E4EC] px-3 text-sm text-[#121212] focus:border-[#1F06AC] focus:outline-none"
                    />
                  </label>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className="sp-mono text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                        EMAIL
                      </span>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="h-10 rounded-[6px] border border-[#E2E4EC] px-3 text-sm text-[#121212] focus:border-[#1F06AC] focus:outline-none"
                      />
                    </label>

                    <label className="flex flex-col gap-1.5">
                      <span className="sp-mono text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                        MOBILE NUMBER
                      </span>
                      <input
                        type="tel"
                        required
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        className="h-10 rounded-[6px] border border-[#E2E4EC] px-3 text-sm text-[#121212] focus:border-[#1F06AC] focus:outline-none"
                      />
                    </label>
                  </div>
                </div>
              </section>

              {/* 02 delivery address */}
              <section className="overflow-hidden rounded-[8px] border border-[#E2E4EC] bg-white">
                <div className="flex items-center gap-2.5 border-b border-dashed border-[#E2E4EC] px-5 py-3.5">
                  <span className="sp-mono flex h-6 w-6 items-center justify-center rounded-[4px] bg-[#1F06AC] text-[11px] font-semibold text-white">
                    02
                  </span>
                  <h2 className="sp-mono m-0 text-[11px] font-medium uppercase tracking-[0.08em] text-[#5C6072]">
                    DELIVERY ADDRESS
                  </h2>
                </div>

                <div className="space-y-4 p-5">
                  <label className="flex flex-col gap-1.5">
                    <span className="sp-mono text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                      STREET / BUILDING / UNIT
                    </span>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="h-10 rounded-[6px] border border-[#E2E4EC] px-3 text-sm text-[#121212] focus:border-[#1F06AC] focus:outline-none"
                    />
                  </label>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <label className="flex flex-col gap-1.5">
                      <span className="sp-mono text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                        BARANGAY
                      </span>
                      <input
                        type="text"
                        value={barangay}
                        onChange={(e) => setBarangay(e.target.value)}
                        className="h-10 rounded-[6px] border border-[#E2E4EC] px-3 text-sm text-[#121212] focus:border-[#1F06AC] focus:outline-none"
                      />
                    </label>

                    <label className="flex flex-col gap-1.5">
                      <span className="sp-mono text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                        CITY / MUNICIPALITY
                      </span>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="h-10 rounded-[6px] border border-[#E2E4EC] px-3 text-sm text-[#121212] focus:border-[#1F06AC] focus:outline-none"
                      />
                    </label>

                    <label className="flex flex-col gap-1.5">
                      <span className="sp-mono text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                        PROVINCE
                      </span>
                      <input
                        type="text"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="h-10 rounded-[6px] border border-[#E2E4EC] px-3 text-sm text-[#121212] focus:border-[#1F06AC] focus:outline-none"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_2fr]">
                    <label className="flex flex-col gap-1.5">
                      <span className="sp-mono text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                        POSTAL CODE
                      </span>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="h-10 rounded-[6px] border border-[#E2E4EC] px-3 text-sm text-[#121212] focus:border-[#1F06AC] focus:outline-none"
                      />
                    </label>

                    <label className="flex flex-col gap-1.5">
                      <span className="sp-mono text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                        DELIVERY NOTES (OPTIONAL)
                      </span>
                      <input
                        type="text"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="h-10 rounded-[6px] border border-[#E2E4EC] px-3 text-sm text-[#121212] focus:border-[#1F06AC] focus:outline-none"
                      />
                    </label>
                  </div>
                </div>
              </section>

              {/* 03 payment method */}
              <section className="overflow-hidden rounded-[8px] border border-[#E2E4EC] bg-white">
                <div className="flex items-center gap-2.5 border-b border-dashed border-[#E2E4EC] px-5 py-3.5">
                  <span className="sp-mono flex h-6 w-6 items-center justify-center rounded-[4px] bg-[#1F06AC] text-[11px] font-semibold text-white">
                    03
                  </span>
                  <h2 className="sp-mono m-0 text-[11px] font-medium uppercase tracking-[0.08em] text-[#5C6072]">
                    PAYMENT METHOD
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
                  {PAYMENT_METHODS.map((method) => {
                    const active = paymentMethod === method;
                    return (
                      <label
                        key={method}
                        className={`flex cursor-pointer items-center gap-3 rounded-[6px] border px-4 py-3 text-sm transition-colors ${
                          active
                            ? 'border-[#1F06AC] bg-[#F4F6FF] font-semibold text-[#121212]'
                            : 'border-[#E2E4EC] bg-white font-medium text-[#121212] hover:border-[#C9D2F0]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method}
                          checked={active}
                          onChange={() => setPaymentMethod(method)}
                          className="h-4 w-4 accent-[#1F06AC]"
                        />
                        <span>{PAYMENT_LABELS[method]}</span>
                      </label>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* 04 order summary */}
            <aside className="overflow-hidden rounded-[8px] border border-[#E2E4EC] bg-white lg:sticky lg:top-24">
              <div className="flex items-center gap-2.5 border-b border-dashed border-[#E2E4EC] px-5 py-3.5">
                <span className="sp-mono flex h-6 w-6 items-center justify-center rounded-[4px] bg-[#1F06AC] text-[11px] font-semibold text-white">
                  04
                </span>
                <h2 className="sp-mono m-0 text-[11px] font-medium uppercase tracking-[0.08em] text-[#5C6072]">
                  ORDER SUMMARY
                </h2>
              </div>

              <div className="space-y-4 p-5">
                <div className="space-y-3">
                  {items.map((item) => {
                    const lineTotal = calcLineTotal(
                      item.unitPrice,
                      item.quantity
                    );
                    const code = item.specimenCode?.replace('SP-', '') || '';
                    return (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-[6px] border border-[#ECEEF4] bg-[#F7F8FC]">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="m-0 truncate text-[13.5px] font-semibold text-[#121212]">
                              {item.name}
                            </p>
                            <p className="sp-mono m-0 mt-0.5 text-[10.5px] uppercase tracking-[0.05em] text-[#7D8292]">
                              № {code} · QTY {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 text-[13.5px] font-semibold text-[#121212]">
                          {formatPHP(lineTotal)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2 border-t border-dashed border-[#E2E4EC] pt-4 text-sm">
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

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-11 w-full cursor-pointer items-center justify-center rounded-[6px] bg-[#E5F24E] text-sm font-semibold text-[#1F06AC] transition-colors hover:bg-[#dce940] disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Placing order...
                    </span>
                  ) : (
                    `Place order · ${formatPHP(total)}`
                  )}
                </button>

                <p className="sp-mono m-0 text-center text-[10px] leading-relaxed uppercase tracking-[0.05em] text-[#7D8292]">
                  BY PLACING YOUR ORDER YOU AGREE TO THE TERMS OF SALE AND
                  RETURNS POLICY.
                </p>
              </div>
            </aside>
          </form>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}
