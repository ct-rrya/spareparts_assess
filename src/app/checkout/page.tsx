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

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, total, hydrated, clearCart, syncItemStock } =
    useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
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
      setErrorMsg('Customer name is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!/\d{5,}/.test(contactNumber.replace(/\D/g, ''))) {
      setErrorMsg('Please enter a valid contact number.');
      return;
    }
    if (!deliveryAddress.trim()) {
      setErrorMsg('Delivery address is required.');
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
          delivery_address: deliveryAddress.trim(),
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
    <div className="min-h-screen flex flex-col bg-[#F6F7FB] text-[#0E0B33]">
      <StoreHeader />

      <main className="max-w-[1040px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
        {/* checkout progress stepper matching mobile design board */}
        <div className="flex justify-center items-center gap-2 sm:gap-3 py-3 px-4 bg-white border border-[#D5DCF3] rounded-lg mb-6 sp-mono text-[11px] sm:text-xs tracking-wider">
          <Link href="/cart" className="text-[#4A4F78] hover:text-[#0F42C0]">
            CART
          </Link>
          <span className="text-[#5882E8]">›</span>
          <span className="text-[#1F06AC] font-bold border-b-2 border-[#E3EF4F] pb-0.5">
            CHECKOUT
          </span>
          <span className="text-[#5882E8]">›</span>
          <span className="text-[#4A4F78]">CONFIRMED</span>
        </div>

        <div className="border-b border-[#D5DCF3] pb-4 mb-6 sm:mb-8">
          <h1 className="font-catchye text-4xl sm:text-5xl font-normal tracking-tight text-[#0E0B33] m-0">
            Checkout
          </h1>
          <div className="sp-mono text-xs text-[#4A4F78] mt-1.5 uppercase">
            {items.length} {items.length === 1 ? 'Specimen' : 'Specimens'} · Total {formatPHP(total)}
          </div>
        </div>

        {!hydrated ? (
          <div className="rounded-lg border border-[#D5DCF3] bg-white p-12 flex justify-center items-center">
            <Loader2 className="h-6 w-6 text-[#0F42C0] animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-[#D5DCF3] bg-white p-12 text-center flex flex-col items-center gap-3">
            <div className="font-catchye text-2xl sm:text-3xl font-normal text-[#0E0B33]">Your cart is empty</div>
            <p className="text-base text-[#4A4F78] m-0">
              You cannot check out with an empty cart.
            </p>
            <Link
              href="/products"
              className="mt-2 rounded-lg bg-[#0F42C0] hover:bg-[#1F06AC] text-white px-7 h-12 inline-flex items-center text-base font-bold transition-colors cursor-pointer"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start"
          >
            <div className="flex flex-col gap-6">
              {errorMsg && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 text-red-900 p-4 text-sm font-medium"
                >
                  {errorMsg}
                </div>
              )}

              {/* customer info card */}
              <div className="rounded-lg border border-[#D5DCF3] bg-white p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-dashed border-[#D5DCF3]">
                  <span className="w-7 h-7 rounded bg-[#1F06AC] text-[#E3EF4F] flex items-center justify-center sp-mono text-xs font-bold shrink-0">
                    01
                  </span>
                  <span className="sp-mono text-xs font-semibold tracking-wider text-[#0E0B33]">
                    CONTACT &amp; DELIVERY
                  </span>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-[#0E0B33]">
                    Customer Name *
                  </span>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Juan Dela Cruz"
                    className="rounded-lg border border-[#C9D2F0] px-3.5 h-12 text-base bg-white text-[#0E0B33] focus:outline-none focus:border-[#1F06AC]"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-semibold text-[#0E0B33]">
                      Email Address *
                    </span>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="juan@example.com"
                      className="rounded-lg border border-[#C9D2F0] px-3.5 h-12 text-base bg-white text-[#0E0B33] focus:outline-none focus:border-[#1F06AC]"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-semibold text-[#0E0B33]">
                      Contact Number *
                    </span>
                    <input
                      type="tel"
                      required
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="+63 917 555 0199"
                      className="rounded-lg border border-[#C9D2F0] px-3.5 h-12 text-base bg-white text-[#0E0B33] focus:outline-none focus:border-[#1F06AC]"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-[#0E0B33]">
                    Delivery Address *
                  </span>
                  <textarea
                    required
                    rows={3}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Room/Dept, Street, Barangay, City, Province"
                    className="rounded-lg border border-[#C9D2F0] p-3 text-base bg-white text-[#0E0B33] focus:outline-none focus:border-[#1F06AC]"
                  />
                </label>
              </div>

              {/* payment & notes card */}
              <div className="rounded-lg border border-[#D5DCF3] bg-white p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-dashed border-[#D5DCF3]">
                  <span className="w-7 h-7 rounded bg-[#1F06AC] text-[#E3EF4F] flex items-center justify-center sp-mono text-xs font-bold shrink-0">
                    02
                  </span>
                  <span className="sp-mono text-xs font-semibold tracking-wider text-[#0E0B33]">
                    PAYMENT METHOD
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map((method) => {
                    const checked = paymentMethod === method;
                    return (
                      <label
                        key={method}
                        className={`flex flex-col gap-1 rounded-lg border p-3.5 cursor-pointer transition-colors ${
                          checked
                            ? 'border-2 border-[#0F42C0] bg-[#EAEFFC]'
                            : 'border-[#D5DCF3] hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method}
                            checked={checked}
                            onChange={() => setPaymentMethod(method)}
                            className="w-4 h-4 accent-[#0F42C0]"
                          />
                          <span className="font-bold text-sm text-[#0E0B33]">
                            {method}
                          </span>
                        </div>
                        <span className="text-xs text-[#4A4F78] pl-6">
                          {method === 'Cash on Delivery'
                            ? 'Pay upon delivery'
                            : method === 'E-Wallet'
                              ? 'GCash / Maya (Demo)'
                              : 'BDO / BPI (Demo)'}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <label className="flex flex-col gap-1.5 mt-2">
                  <span className="text-sm font-semibold text-[#0E0B33]">
                    Order Notes (Optional)
                  </span>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="e.g. Leave with science department receptionist"
                    className="rounded-lg border border-[#C9D2F0] px-3.5 h-12 text-base bg-white text-[#0E0B33] focus:outline-none focus:border-[#1F06AC]"
                  />
                </label>
              </div>
            </div>

            {/* order review sidebar */}
            <div className="rounded-lg border border-[#D5DCF3] bg-white p-6 flex flex-col gap-4 shadow-sm lg:sticky lg:top-24">
              <div className="sp-mono text-xs font-semibold tracking-wider text-[#4A4F78] pb-2 border-b border-dashed border-[#D5DCF3]">
                REVIEW ITEMS ({items.length})
              </div>

              <div className="flex flex-col divide-y divide-[#EEF1FB] max-h-[300px] overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="py-3 flex justify-between items-center text-sm gap-3"
                  >
                    <div>
                      <div className="font-bold text-[#0E0B33] line-clamp-1">
                        {item.name}
                      </div>
                      <div className="sp-mono text-xs text-[#4A4F78]">
                        Qty: {item.quantity} × {formatPHP(item.unitPrice)}
                      </div>
                    </div>
                    <div className="font-bold text-base text-[#1F06AC] shrink-0">
                      {formatPHP(calcLineTotal(item.unitPrice, item.quantity))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between border-t border-[#D5DCF3] pt-3 text-sm text-[#4A4F78]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#0E0B33]">{formatPHP(subtotal)}</span>
              </div>

              <div className="flex justify-between border-t border-[#EEF1FB] pt-3 text-xl font-bold text-[#0E0B33] items-baseline">
                <span>Total</span>
                <span className="text-2xl font-bold text-[#1F06AC]">
                  {formatPHP(total)}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full h-13 rounded-lg bg-[#0F42C0] hover:bg-[#1F06AC] text-white text-base font-bold transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {submitting ? (
                  <Loader2 size={20} className="animate-spin text-white" />
                ) : (
                  'Place Order'
                )}
              </button>

              <div className="sp-mono text-[11px] text-[#4A4F78] text-center">
                Inventory is reserved immediately upon placement
              </div>
            </div>
          </form>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}
