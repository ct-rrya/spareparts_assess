'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { formatPHP } from '@/lib/money';
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';

export function ProductDetailsClient({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [statusMsg, setStatusMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const isOutOfStock = product.stock <= 0;

  function changeQty(next: number) {
    if (isOutOfStock) return;
    const clamped = Math.max(1, Math.min(product.stock, Math.floor(next)));
    setQuantity(clamped);
  }

  function handleAddToCart() {
    const res = addToCart(product, quantity);
    if (res.ok) {
      setStatusMsg({
        ok: true,
        text: `Added ${quantity} × ${product.name} to your cart.`,
      });
    } else {
      setStatusMsg({
        ok: false,
        text: res.message || 'Could not add item to cart.',
      });
    }
    setTimeout(() => setStatusMsg(null), 3000);
  }

  function handleBuyNow() {
    const res = addToCart(product, quantity);
    if (res.ok) {
      router.push('/checkout');
    } else {
      setStatusMsg({
        ok: false,
        text: res.message || 'Could not add item to cart.',
      });
      setTimeout(() => setStatusMsg(null), 3000);
    }
  }

  const specNumber = product.specimen_code.replace('SP-', '№ ');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
      {/* image column without brackets and without fig caption */}
      <div className="flex flex-col gap-3">
        <div className="relative rounded-lg border border-[#D5DCF3] bg-[#F6F7FB] aspect-square flex items-center justify-center w-full overflow-hidden shadow-sm">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* gallery thumbnails */}
        <div className="flex gap-2">
          <div className="w-16 h-16 rounded-lg border-2 border-[#0F42C0] bg-[#F6F7FB] overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* details column */}
      <div className="flex flex-col gap-5">
        <div>
          <div className="flex items-center gap-2 sp-mono text-xs text-[#4A4F78] uppercase">
            <span className="text-[#0F42C0] font-bold">{specNumber}</span>
            <span>·</span>
            <Link
              href={`/products?category=${product.category?.slug || ''}`}
              className="hover:underline text-[#0F42C0] font-semibold"
            >
              {product.category?.name || 'Supplies'}
            </Link>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#0E0B33] mt-2 mb-0 leading-tight">
            {product.name}
          </h1>
        </div>

        {/* price & availability banner */}
        <div className="border-y border-[#D5DCF3] py-4 flex flex-wrap items-baseline justify-between gap-3">
          <span className="text-2xl sm:text-3xl font-bold text-[#1F06AC]">
            {formatPHP(product.price)}
          </span>
          <span className="sp-mono text-xs font-semibold flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isOutOfStock ? 'bg-slate-400' : 'bg-[#0F42C0]'
              }`}
            />
            <span className={isOutOfStock ? 'text-[#4A4F78]' : 'text-[#0E0B33]'}>
              {isOutOfStock
                ? 'OUT OF STOCK'
                : `IN STOCK (${product.stock} units)`}
            </span>
          </span>
        </div>

        {/* description per typography spec: 16px, line length 50-75 chars */}
        <p className="text-base leading-relaxed text-[#4A4F78] m-0 max-w-prose">
          {product.description}
        </p>

        {/* quantity & action controls */}
        <div className="flex flex-col gap-3 pt-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="inline-flex rounded-lg border border-[#C9D2F0] bg-white self-start overflow-hidden">
              <button
                type="button"
                disabled={isOutOfStock || quantity <= 1}
                onClick={() => changeQty(quantity - 1)}
                aria-label="Decrease quantity"
                className="w-12 h-12 bg-white text-[#0E0B33] hover:bg-slate-50 text-xl font-bold disabled:opacity-30 cursor-pointer transition-colors"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                max={Math.max(1, product.stock)}
                disabled={isOutOfStock}
                value={isOutOfStock ? 0 : quantity}
                onChange={(e) => changeQty(Number(e.target.value) || 1)}
                aria-label="Quantity"
                className="w-14 text-center border-x border-[#C9D2F0] h-12 font-bold sp-mono text-base bg-white text-[#0E0B33] focus:outline-none"
              />
              <button
                type="button"
                disabled={isOutOfStock || quantity >= product.stock}
                onClick={() => changeQty(quantity + 1)}
                aria-label="Increase quantity"
                className="w-12 h-12 bg-white text-[#0E0B33] hover:bg-slate-50 text-xl font-bold disabled:opacity-30 cursor-pointer transition-colors"
              >
                +
              </button>
            </div>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className={`w-full sm:flex-1 h-12 sm:h-13 rounded-lg text-base font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-[#0F42C0] hover:bg-[#1F06AC] text-white active:scale-[0.99]'
              }`}
            >
              <ShoppingCart size={18} />
              <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
            </button>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleBuyNow}
            className={`w-full h-12 sm:h-13 rounded-lg text-base font-bold flex items-center justify-center transition-colors cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-[#E3EF4F] hover:bg-white text-[#1F06AC] shadow-sm'
            }`}
          >
            Buy Now
          </button>
        </div>

        {/* 3 bullet value props from mobile design board */}
        <div className="pt-2 flex flex-col gap-2 text-xs sm:text-sm text-[#4A4F78]">
          <div className="flex gap-2.5 items-center">
            <span className="sp-mono text-xs text-[#0F42C0] font-bold">01</span>
            <span>Ships within 1–2 business days</span>
          </div>
          <div className="flex gap-2.5 items-center">
            <span className="sp-mono text-xs text-[#0F42C0] font-bold">02</span>
            <span>Free delivery on orders over ₱2,500</span>
          </div>
          <div className="flex gap-2.5 items-center">
            <span className="sp-mono text-xs text-[#0F42C0] font-bold">03</span>
            <span>Returns accepted on unused items</span>
          </div>
        </div>

        {statusMsg && (
          <div
            role="status"
            className={`rounded-lg border p-3.5 text-sm font-medium ${
              statusMsg.ok
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-red-200 bg-red-50 text-red-900'
            }`}
          >
            {statusMsg.text}
          </div>
        )}

        {/* technical specifications table from design board */}
        <div className="mt-4 rounded-lg border border-[#D5DCF3] bg-white p-4 flex flex-col gap-2">
          <div className="sp-mono text-xs font-semibold tracking-wider text-[#4A4F78] pb-2 border-b border-dashed border-[#D5DCF3]">
            SPECIFICATIONS
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm py-1 border-b border-[#EEF1FB]">
            <span className="text-[#4A4F78]">Specimen Code</span>
            <span className="sp-mono font-semibold text-[#0E0B33]">
              {product.specimen_code}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm py-1 border-b border-[#EEF1FB]">
            <span className="text-[#4A4F78]">Category</span>
            <span className="font-semibold text-[#0E0B33]">
              {product.category?.name}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm py-1">
            <span className="text-[#4A4F78]">Quality Standard</span>
            <span className="text-[#0E0B33]">Inspected before dispatch</span>
          </div>
        </div>
      </div>
    </div>
  );
}
