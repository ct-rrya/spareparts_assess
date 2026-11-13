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

  // format specimen number like № 01.1
  const specNumber = product.specimen_code.replace('SP-', '№ ');

  return (
    <article className="rounded-lg border border-[#D5DCF3] bg-white overflow-hidden flex flex-col hover:border-[#0F42C0]/40 hover:shadow-md transition-all">
      {/* card top meta header with dashed border */}
      <div className="sp-mono flex justify-between items-center px-2.5 sm:px-3.5 py-1.5 sm:py-2 border-b border-dashed border-[#D5DCF3] text-[10px] sm:text-xs text-[#4A4F78]">
        <span className="font-medium">{specNumber}</span>
        <span className="flex items-center gap-1.5 font-medium">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOutOfStock ? 'bg-slate-400' : 'bg-[#0F42C0]'
            }`}
          />
          {isOutOfStock ? 'OUT' : 'IN STOCK'}
        </span>
      </div>

      {/* full product image without corner brackets and fig text */}
      <Link
        href={`/products/${product.slug}`}
        className="relative flex items-center justify-center aspect-square w-full bg-[#F6F7FB] overflow-hidden group"
      >
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* product info */}
      <div className="p-3 sm:p-4 flex flex-col gap-1 sm:gap-1.5 flex-1">
        <span className="sp-mono text-[10px] sm:text-xs font-semibold tracking-wider text-[#0F42C0] uppercase">
          {product.category?.name?.split('&')[0].trim() || 'SUPPLIES'}
        </span>

        <h3 className="font-catchye text-base sm:text-[20px] font-normal text-[#0E0B33] leading-snug line-clamp-2 min-h-[40px] sm:min-h-[50px] m-0">
          <Link
            href={`/products/${product.slug}`}
            className="hover:text-[#0F42C0] transition-colors"
          >
            {product.name}
          </Link>
        </h3>

        <div className="sp-mono text-[11px] sm:text-xs text-[#4A4F78]">
          {product.stock > 0 ? `${product.stock} units` : 'Restocking'}
        </div>

        {/* price and cta action row */}
        <div className="mt-auto pt-2.5 sm:pt-3 border-t border-[#EEF1FB] flex flex-col gap-2 sm:gap-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-base sm:text-[20px] font-bold text-[#1F06AC]">
              {formatPHP(product.price)}
            </span>
            <Link
              href={`/products/${product.slug}`}
              className="text-[11px] sm:text-xs font-semibold text-[#0F42C0] hover:underline hidden sm:inline"
            >
              Details →
            </Link>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAdd}
            className={`w-full h-10 sm:h-12 rounded-lg text-xs sm:text-base font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-[#0F42C0] hover:bg-[#1F06AC] text-white active:scale-[0.99]'
            }`}
          >
            <ShoppingCart size={15} className="sm:w-[18px] sm:h-[18px]" />
            <span>
              {feedback ? feedback : isOutOfStock ? 'Out' : 'Add to Cart'}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
