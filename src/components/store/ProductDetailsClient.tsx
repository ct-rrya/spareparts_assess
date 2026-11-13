'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { formatPHP } from '@/lib/money';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, X, ZoomIn, ZoomOut } from 'lucide-react';

export function ProductDetailsClient({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [statusMsg, setStatusMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  // hover zoom + lightbox state
  const [isHovering, setIsHovering] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [modalZoomed, setModalZoomed] = useState(false);

  const isOutOfStock = product.stock <= 0;

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
        setModalZoomed(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x, y });
  }

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
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,430px)_1fr] xl:grid-cols-[minmax(0,460px)_1fr] gap-6 lg:gap-10 items-start">
        {/* compact image column with hover zoom + click lightbox */}
        <div className="flex flex-col gap-2.5 w-full max-w-[460px] mx-auto lg:mx-0">
          <div
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setLightboxOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setLightboxOpen(true);
              }
            }}
            aria-label={`Zoom ${product.name} photo`}
            className="relative rounded-lg border border-[#D5DCF3] bg-[#F6F7FB] aspect-square max-h-[420px] sm:max-h-[450px] flex items-center justify-center w-full overflow-hidden shadow-sm cursor-zoom-in group"
          >
            <img
              src={product.image_url}
              alt={product.name}
              style={{
                transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
              }}
              className={`w-full h-full object-cover transition-transform duration-150 ease-out ${
                isHovering ? 'scale-[1.85]' : 'scale-100'
              }`}
            />
            <span className="sp-mono absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-md bg-white/90 backdrop-blur-xs border border-[#D5DCF3] px-2.5 py-1 text-[11px] font-semibold text-[#0E0B33] shadow-xs pointer-events-none">
              <ZoomIn size={13} className="text-[#0F42C0]" />
              <span>Zoom</span>
            </span>
          </div>

          {/* gallery thumbnails */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label="Open full photo"
              className="w-14 h-14 rounded-md border-2 border-[#0F42C0] bg-[#F6F7FB] overflow-hidden cursor-pointer"
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        {/* compact details column sized to fit one viewport */}
        <div className="flex flex-col gap-3.5">
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

            <h1 className="font-sans text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight text-[#0E0B33] mt-1.5 mb-0 leading-tight">
              {product.name}
            </h1>
          </div>

          {/* price & availability banner */}
          <div className="border-y border-[#D5DCF3] py-2.5 flex flex-wrap items-baseline justify-between gap-3">
            <span className="text-2xl sm:text-[28px] font-bold text-[#1F06AC]">
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

          {/* description */}
          <p className="text-sm sm:text-base leading-relaxed text-[#4A4F78] m-0 max-w-prose">
            {product.description}
          </p>

          {/* quantity & action controls */}
          <div className="flex flex-col gap-2.5 pt-1">
            <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
              <div className="inline-flex rounded-lg border border-[#C9D2F0] bg-white self-start overflow-hidden shrink-0">
                <button
                  type="button"
                  disabled={isOutOfStock || quantity <= 1}
                  onClick={() => changeQty(quantity - 1)}
                  aria-label="Decrease quantity"
                  className="w-11 h-11 bg-white text-[#0E0B33] hover:bg-slate-50 text-lg font-bold disabled:opacity-30 cursor-pointer transition-colors"
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
                  className="w-12 text-center border-x border-[#C9D2F0] h-11 font-bold sp-mono text-sm bg-white text-[#0E0B33] focus:outline-none"
                />
                <button
                  type="button"
                  disabled={isOutOfStock || quantity >= product.stock}
                  onClick={() => changeQty(quantity + 1)}
                  aria-label="Increase quantity"
                  className="w-11 h-11 bg-white text-[#0E0B33] hover:bg-slate-50 text-lg font-bold disabled:opacity-30 cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`flex-1 min-w-[150px] h-11 rounded-lg text-sm sm:text-base font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-[#0F42C0] hover:bg-[#1F06AC] text-white active:scale-[0.99]'
                }`}
              >
                <ShoppingCart size={17} />
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className={`w-full sm:w-auto sm:px-6 h-11 rounded-lg text-sm sm:text-base font-bold flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                  isOutOfStock
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-[#E3EF4F] hover:bg-[#d8e63c] text-[#1F06AC] shadow-xs'
                }`}
              >
                Buy Now
              </button>
            </div>
          </div>

          {statusMsg && (
            <div
              role="status"
              className={`rounded-lg border p-2.5 text-sm font-medium ${
                statusMsg.ok
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-red-200 bg-red-50 text-red-900'
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          {/* compact value props + specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="rounded-lg border border-[#D5DCF3] bg-[#F6F7FB]/60 p-3 flex flex-col gap-1.5 text-xs text-[#4A4F78] justify-center">
              <div className="flex gap-2 items-center">
                <span className="sp-mono text-[#0F42C0] font-bold">01</span>
                <span>Ships within 1–2 business days</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="sp-mono text-[#0F42C0] font-bold">02</span>
                <span>Free delivery over ₱2,500</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="sp-mono text-[#0F42C0] font-bold">03</span>
                <span>Returns accepted on unused items</span>
              </div>
            </div>

            <div className="rounded-lg border border-[#D5DCF3] bg-white p-3 flex flex-col gap-1 text-xs">
              <div className="sp-mono text-[10px] font-semibold tracking-wider text-[#4A4F78] pb-1 border-b border-dashed border-[#D5DCF3]">
                SPECIFICATIONS
              </div>
              <div className="flex justify-between gap-2 py-0.5">
                <span className="text-[#4A4F78]">SKU</span>
                <span className="sp-mono font-semibold text-[#0E0B33]">
                  {product.specimen_code}
                </span>
              </div>
              <div className="flex justify-between gap-2 py-0.5">
                <span className="text-[#4A4F78]">Category</span>
                <span className="font-semibold text-[#0E0B33] text-right">
                  {product.category?.name}
                </span>
              </div>
              <div className="flex justify-between gap-2 py-0.5">
                <span className="text-[#4A4F78]">Standard</span>
                <span className="text-[#0E0B33]">Inspected before dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* photo zoom lightbox modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} zoomed image`}
          onClick={() => {
            setLightboxOpen(false);
            setModalZoomed(false);
          }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl flex items-center justify-between text-white mb-3"
          >
            <span className="text-sm sm:text-base font-semibold truncate pr-4">
              {product.name}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setModalZoomed((v) => !v)}
                className="h-9 px-3 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {modalZoomed ? <ZoomOut size={15} /> : <ZoomIn size={15} />}
                <span>{modalZoomed ? '1x Fit' : '2x Zoom'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLightboxOpen(false);
                  setModalZoomed(false);
                }}
                aria-label="Close zoom modal"
                className="h-9 w-9 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              setModalZoomed((v) => !v);
            }}
            className={`relative max-w-4xl w-full max-h-[82vh] bg-white rounded-xl overflow-auto flex items-center justify-center shadow-2xl ${
              modalZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
            }`}
          >
            <img
              src={product.image_url}
              alt={product.name}
              className={`transition-transform duration-200 ${
                modalZoomed
                  ? 'w-full h-auto scale-150 origin-center'
                  : 'max-h-[80vh] w-auto object-contain'
              }`}
            />
          </div>
        </div>
      )}
    </>
  );
}
