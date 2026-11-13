'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Loader2, Monitor } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@spareparts.ph');
  const [password, setPassword] = useState('cubetech-demo');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Invalid credentials.');
        setLoading(false);
        return;
      }
      // redirect straight to admin dashboard
      window.location.assign('/admin');
    } catch {
      setError('Network error during login.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center bg-blueprint-grid px-5 py-8 lg:p-0 lg:flex-row lg:justify-start lg:bg-none lg:bg-white">
      {/* desktop left blue blueprint banner */}
      <div className="hidden lg:flex w-1/2 bg-blueprint-grid min-h-screen p-12 xl:p-16 flex-col justify-between text-white relative">
        {/* brand logo */}
        <div className="flex items-center gap-3">
          <img
            src="/images/favicon.svg"
            alt="SpareParts"
            className="h-10 w-10 object-contain shrink-0"
          />
          <span className="font-catchye text-3xl tracking-wide text-white select-none">
            SpareParts
          </span>
        </div>

        {/* main display header with catchye font */}
        <div className="my-auto py-16">
          <div className="sp-mono text-xs font-bold tracking-[0.18em] text-[#E3EF4F] uppercase mb-4">
            STORE ADMINISTRATION
          </div>
          <h1 className="font-catchye text-[56px] font-normal leading-[1.12] text-white tracking-tight m-0 max-w-lg">
            Catalog, orders<br />
            and customers in<br />
            one place.
          </h1>
        </div>

        {/* copyright tag */}
        <div className="sp-mono text-xs text-[#DDE5FB]/80 tracking-wider">
          © 2026 SpareParts
        </div>
      </div>

      {/* mobile brand header */}
      <div className="flex lg:hidden flex-col gap-1.5 w-full max-w-[420px] mx-auto mb-5 text-white">
        <div className="flex items-center gap-2.5">
          <img
            src="/images/favicon.svg"
            alt="SpareParts"
            className="h-8 w-8 object-contain shrink-0"
          />
          <span className="font-catchye text-2xl tracking-wide text-white select-none">
            SpareParts
          </span>
        </div>
        <div className="sp-mono text-[11px] font-bold tracking-[0.18em] text-[#E3EF4F] uppercase">
          STORE ADMINISTRATION
        </div>
      </div>

      {/* sign in form (card on mobile, right panel on desktop) */}
      <div className="w-full lg:w-1/2 lg:min-h-screen lg:bg-white flex items-center justify-center lg:p-16">
        <div className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-xl lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none flex flex-col">
          <h2 className="font-catchye text-3xl sm:text-[44px] font-normal text-[#0E0B33] tracking-tight m-0 mb-1.5 sm:mb-2">
            Sign in
          </h2>
          <p className="text-xs sm:text-[15px] text-[#4A4F78] m-0 mb-4 sm:mb-6 leading-relaxed">
            Manage products, orders and customers.
          </p>

          {/* mobile desktop-recommended warning */}
          <div
            role="status"
            className="md:hidden rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-950 mb-4 flex items-start gap-2 leading-snug"
          >
            <Monitor size={15} className="text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Desktop recommended:</strong> Admin dashboard is best experienced on desktop.
            </span>
          </div>

          {/* demo credentials notice */}
          <div className="hidden sm:block rounded-lg bg-[#F6F7FB] border border-[#D5DCF3] p-3.5 text-xs text-[#4A4F78] mb-6 leading-relaxed">
            <span className="sp-mono font-bold text-[#0F42C0] block mb-1">
              DEMO CREDENTIALS
            </span>
            Email: <span className="sp-mono font-semibold text-[#0E0B33]">admin@spareparts.ph</span>
            <br />
            Password: <span className="sp-mono font-semibold text-[#0E0B33]">cubetech-demo</span>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 text-red-900 p-3 text-xs font-medium mb-4"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label
                htmlFor="admin-email"
                className="sp-mono text-xs font-semibold tracking-wider text-[#4A4F78] block mb-2"
              >
                EMAIL
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#D5DCF3] px-4 h-12 text-sm text-[#0E0B33] bg-white focus:outline-none focus:border-[#0F42C0] focus:ring-1 focus:ring-[#0F42C0] transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="sp-mono text-xs font-semibold tracking-wider text-[#4A4F78] block mb-2"
              >
                PASSWORD
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#D5DCF3] px-4 h-12 text-sm text-[#0E0B33] bg-white focus:outline-none focus:border-[#0F42C0] focus:ring-1 focus:ring-[#0F42C0] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-[#0F42C0] hover:bg-[#1F06AC] text-white h-12 text-sm sm:text-base font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin text-white" />
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <Link
            href="/"
            className="sp-mono text-xs font-semibold tracking-widest text-[#0F42C0] hover:text-[#1F06AC] text-center mt-8 block transition-colors uppercase"
          >
            ← Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
