import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F7FB] px-4 font-sans text-[#0E0B33]">
      <div className="max-w-md w-full bg-white border border-[#D5DCF3] rounded-2xl p-8 text-center shadow-sm">
        <div className="sp-mono text-xs font-bold text-[#0F42C0] bg-[#EAEFFC] px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
          404 · NOT FOUND
        </div>
        <h1 className="font-catchye text-3xl font-normal text-[#0E0B33] m-0 mb-2">
          Specimen Not Located
        </h1>
        <p className="text-sm text-[#4A4F78] leading-relaxed mb-6">
          The requested catalog specimen or page could not be found in our requisitions system.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center h-11 px-5 rounded-lg bg-[#0F42C0] hover:bg-[#1F06AC] text-white text-sm font-bold transition-colors cursor-pointer"
          >
            Browse Catalog
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-11 px-5 rounded-lg border border-[#D5DCF3] hover:bg-slate-50 text-[#0E0B33] text-sm font-semibold transition-colors cursor-pointer"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
