'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* left blue blueprint banner */}
      <div className="w-full lg:w-1/2 bg-blueprint-grid min-h-[460px] lg:min-h-screen p-8 sm:p-12 lg:p-16 flex flex-col justify-between text-white relative">
        {/* brand logo */}
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-[#E3EF4F] flex items-center justify-center shadow-sm shrink-0">
            <svg
              aria-hidden="true"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1F06AC"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3h8M9 3v6l-4.5 9A2 2 0 006.3 21h11.4a2 2 0 001.8-3L15 9V3M7.5 15h9" />
            </svg>
          </span>
          <span className="font-catchye text-2xl sm:text-3xl tracking-wide text-white select-none">
            SpareParts
          </span>
        </div>

        {/* main display header with catchye font */}
        <div className="my-auto py-10 lg:py-16">
          <div className="sp-mono text-[11px] sm:text-xs font-bold tracking-[0.18em] text-[#E3EF4F] uppercase mb-4">
            STORE ADMINISTRATION
          </div>
          <h1 className="font-catchye text-4xl sm:text-5xl lg:text-[56px] font-normal leading-[1.12] text-white tracking-tight m-0 max-w-lg">
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

      {/* right sign in form */}
      <div className="w-full lg:w-1/2 min-h-[520px] lg:min-h-screen bg-white flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-[420px] flex flex-col">
          <h2 className="font-catchye text-4xl sm:text-[44px] font-normal text-[#0E0B33] tracking-tight m-0 mb-2">
            Sign in
          </h2>
          <p className="text-sm sm:text-[15px] text-[#4A4F78] m-0 mb-6 leading-relaxed">
            Manage products, orders and customers.
          </p>

          {/* demo credentials notice */}
          <div className="rounded-lg bg-[#F6F7FB] border border-[#D5DCF3] p-3.5 text-xs text-[#4A4F78] mb-6 leading-relaxed">
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
