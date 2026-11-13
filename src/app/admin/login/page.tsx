'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@spareparts.demo');
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
        setError(data.error || 'Login failed.');
        setLoading(false);
        return;
      }
      // full navigation so middleware sees the new session cookie immediately
      window.location.assign('/admin');
    } catch {
      setError('Network error during login.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB] text-[#0E0B33] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-[#D5DCF3] shadow-md p-6 sm:p-8 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-[#1F06AC] flex items-center justify-center shrink-0">
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E3EF4F"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3h8M9 3v6l-4.5 9A2 2 0 006.3 21h11.4a2 2 0 001.8-3L15 9V3M7.5 15h9" />
            </svg>
          </span>
          <div>
            <div className="sp-mono text-xs font-bold tracking-wider text-[#0F42C0] uppercase">
              SPARE PARTS · ADMIN
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0E0B33] mt-0.5 mb-0">
              Admin Sign In
            </h1>
          </div>
        </div>

        <div className="rounded-lg bg-[#EAEFFC] border border-[#D5DCF3] p-4 text-xs text-[#0E0B33] leading-relaxed">
          <div className="sp-mono font-bold text-[#0F42C0] mb-1">
            SIMULATED DEMO AUTHENTICATION
          </div>
          For assessment evaluation only — unsuitable for production security.
          <br />
          Email: <b className="sp-mono">admin@spareparts.demo</b> · Password:{' '}
          <b className="sp-mono">cubetech-demo</b>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 text-red-900 p-3.5 text-sm font-medium"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[#0E0B33]">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-[#C9D2F0] px-3.5 h-11 text-base bg-white text-[#0E0B33] focus:outline-none focus:border-[#1F06AC]"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[#0E0B33]">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-[#C9D2F0] px-3.5 h-11 text-base bg-white text-[#0E0B33] focus:outline-none focus:border-[#1F06AC]"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-[#0F42C0] hover:bg-[#1F06AC] text-white h-12 text-base font-bold transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin text-white" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <Link
          href="/"
          className="text-sm text-center text-[#4A4F78] hover:text-[#0E0B33] transition-colors"
        >
          ← Return to Storefront
        </Link>
      </div>
    </div>
  );
}
