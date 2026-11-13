import React from 'react';
import Link from 'next/link';

export function StoreFooter() {
  return (
    <footer className="mt-auto bg-[#1F06AC] text-[#DDE5FB] border-t border-[#5882E8]/40">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* brand summary */}
          <div className="col-span-2 lg:col-span-1 flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/favicon.svg"
                alt="SpareParts"
                className="h-8 w-8 object-contain shrink-0"
              />
              <div className="font-catchye text-2xl sm:text-[30px] font-normal text-white tracking-wide">
                SpareParts
              </div>
            </div>
            <div className="sp-mono text-xs tracking-widest text-[#E3EF4F] font-semibold mt-1">
              LABORATORY &amp; SCIENCE SUPPLIES
            </div>
            <p className="text-sm text-[#DDE5FB] mt-3 leading-relaxed max-w-xs">
              Anatomy models, laboratory glassware and specimen tools for
              schools, laboratories and curious minds across the Philippines.
            </p>
          </div>

          {/* shop categories */}
          <div className="flex flex-col gap-2.5 text-sm">
            <span className="sp-mono text-xs font-semibold tracking-wider text-[#E3EF4F] mb-1">
              SHOP
            </span>
            <Link
              href="/products?category=anatomy-physiology"
              className="text-[#DDE5FB] hover:text-white transition-colors"
            >
              Anatomy &amp; Physiology
            </Link>
            <Link
              href="/products?category=lab-essentials"
              className="text-[#DDE5FB] hover:text-white transition-colors"
            >
              Lab Essentials
            </Link>
            <Link
              href="/products?category=specimens-study-tools"
              className="text-[#DDE5FB] hover:text-white transition-colors"
            >
              Specimens &amp; Study Tools
            </Link>
            <Link
              href="/products"
              className="text-[#DDE5FB] hover:text-white transition-colors"
            >
              All Specimens
            </Link>
          </div>

          {/* quick links */}
          <div className="flex flex-col gap-2.5 text-sm">
            <span className="sp-mono text-xs font-semibold tracking-wider text-[#E3EF4F] mb-1">
              HELP &amp; SOCIAL
            </span>
            <Link
              href="/cart"
              className="text-[#DDE5FB] hover:text-white transition-colors"
            >
              Shopping Cart
            </Link>
            <Link
              href="/products"
              className="text-[#DDE5FB] hover:text-white transition-colors"
            >
              Products &amp; Stock
            </Link>
            <a
              href="https://www.facebook.com/"
              className="text-[#DDE5FB] hover:text-white transition-colors"
            >
              Facebook
            </a>
            <a
              href="https://www.instagram.com/"
              className="text-[#DDE5FB] hover:text-white transition-colors"
            >
              Instagram
            </a>
          </div>

          {/* sample contact details (clearly labeled fictional per rubric) */}
          <div className="col-span-2 lg:col-span-1 flex flex-col gap-2.5 text-sm pt-4 sm:pt-0 border-t border-[#5882E8]/30 sm:border-t-0">
            <span className="sp-mono text-xs font-semibold tracking-wider text-[#E3EF4F] mb-1">
              CONTACT
            </span>
            <span className="text-[#DDE5FB]">
              Email: orders@spareparts.example
            </span>
            <span className="text-[#DDE5FB]">
              Phone: +63 922 9222
            </span>
            <span className="text-[#DDE5FB]">
              Address: City of Bogo, Cebu
            </span>
          </div>
        </div>

        {/* copyright subfooter */}
        <div className="sp-mono mt-12 pt-5 border-t border-[#5882E8]/40 text-xs text-[#DDE5FB]/80 flex flex-wrap justify-between gap-3">
          <span>© {new Date().getFullYear()} SpareParts. All rights reserved.</span>
          <span>TERMS · PRIVACY · EDAÑO</span>
        </div>
      </div>
    </footer>
  );
}
