'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { formatPHP } from '@/lib/money';
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [feedback, setFeedback] = useState<string | null>(null);

  const isOutOfStock = product.stock <= 0;

  function handleAdd() {
    const res = addToCart(product, 1);
    if (res.ok) {
      setFeedback('Added');
    } else {
      setFeedback(res.message || 'Error');
    }
    setTimeout(() => setFeedback(null), 1400);
  }

  const specNumber = product.specimen_code.replace('SP-', '№ ');
  const categoryShort = product.category?.name?.split('&')[0].trim() || 'Supplies';

  return (
    <article className="rounded-md border border-[#D5DCF3] bg-white overflow-hidden flex flex-col hover:border-[#0F42C0] hover:shadow-md transition-all duration-150 group">
      {/* full-bleed product image with corner badge */}
      <Link
        href={`/products/${product.slug}`}
        className="relative flex items-center justify-center aspect-square w-full bg-[#F6F7FB] overflow-hidden"
      >
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span
          className={`sp-mono absolute top-1.5 right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] shadow-xs ${
            isOutOfStock
              ? 'bg-slate-800/85 text-white'
              : product.stock <= 5
                ? 'bg-[#FFF6C2] text-[#5A4B00]'
                : 'bg-[#EAEFFC]/95 text-[#1F06AC]'
          }`}
        >
          {isOutOfStock ? 'OUT' : specNumber}
        </span>
      </Link>

      {/* compact card body */}
      <div className="p-2.5 sm:p-3 flex flex-col gap-1.5 flex-1">
        <h3 className="font-sans text-[13px] sm:text-[14px] font-medium text-[#0E0B33] leading-[1.35] line-clamp-2 min-h-[36px] sm:min-h-[38px] m-0">
          <Link
            href={`/products/${product.slug}`}
            className="hover:text-[#0F42C0] transition-colors"
          >
            {product.name}
          </Link>
        </h3>

        {/* compact tag row */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="border border-[#0F42C0]/30 text-[#0F42C0] bg-[#EAEFFC]/40 text-[10px] font-medium px-1.5 py-[1px] rounded-[2px] leading-tight">
            {categoryShort}
          </span>
          {!isOutOfStock && (
            <span className="border border-[#1F06AC]/20 text-[#1F06AC] bg-[#E3EF4F]/50 text-[10px] font-semibold px-1.5 py-[1px] rounded-[2px] leading-tight">
              In Stock
            </span>
          )}
        </div>

        {/* price and stock count */}
        <div className="mt-auto pt-1.5 flex items-baseline justify-between gap-1">
          <span className="text-[15px] sm:text-[17px] font-bold text-[#1F06AC] tracking-tight">
            {formatPHP(product.price)}
          </span>
          <span className="text-[11px] text-[#4A4F78] whitespace-nowrap">
            {isOutOfStock ? 'Restocking' : `${product.stock} left`}
          </span>
        </div>

        {/* bottom dispatch & quick add row */}
        <div className="pt-1.5 border-t border-[#EEF1FB] flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-[11px] text-[#4A4F78] truncate">
            Ships 1–2 days
          </span>
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAdd}
            className={`h-7 px-2.5 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-[#0F42C0] hover:bg-[#1F06AC] text-white active:scale-[0.98]'
            }`}
          >
            <ShoppingCart size={12} />
            <span>{feedback ? feedback : isOutOfStock ? 'Out' : 'Add'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
