'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Wifi, WifiOff, X } from 'lucide-react';

interface NetworkInformation extends EventTarget {
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

function getConnection(): NetworkInformation | undefined {
  if (typeof navigator === 'undefined') return undefined;
  const nav = navigator as Navigator & {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  };
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
}

function isConnectionSlow(conn: NetworkInformation): boolean {
  if (conn.saveData) return true;
  if (
    conn.effectiveType === 'slow-2g' ||
    conn.effectiveType === '2g' ||
    conn.effectiveType === '3g'
  ) {
    return true;
  }
  if (typeof conn.rtt === 'number' && conn.rtt > 400) return true;
  if (typeof conn.downlink === 'number' && conn.downlink > 0 && conn.downlink < 1.5) {
    return true;
  }
  return false;
}

export function NetworkStatusToast() {
  const [status, setStatus] = useState<'ok' | 'slow' | 'offline'>('ok');
  const [dismissed, setDismissed] = useState(false);
  const statusRef = useRef<'ok' | 'slow' | 'offline'>('ok');

  useEffect(() => {
    const applyStatus = (next: 'ok' | 'slow' | 'offline') => {
      if (statusRef.current !== next) {
        statusRef.current = next;
        setStatus(next);
        setDismissed(false);
      }
    };

    const evaluate = () => {
      if (!navigator.onLine) {
        applyStatus('offline');
        return;
      }

      const conn = getConnection();
      if (conn && isConnectionSlow(conn)) {
        applyStatus('slow');
      } else {
        applyStatus('ok');
      }
    };

    evaluate();

    const handleOffline = () => applyStatus('offline');
    const handleOnline = () => evaluate();
    const handleSlowFallback = () => {
      if (navigator.onLine) {
        applyStatus('slow');
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    window.addEventListener('spareparts:slow-network', handleSlowFallback);

    const conn = getConnection();
    conn?.addEventListener?.('change', evaluate);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('spareparts:slow-network', handleSlowFallback);
      conn?.removeEventListener?.('change', evaluate);
    };
  }, []);

  // auto-hide the toast after 10 seconds
  useEffect(() => {
    if (status === 'ok' || dismissed) return;
    const timer = setTimeout(() => setDismissed(true), 10000);
    return () => clearTimeout(timer);
  }, [status, dismissed]);

  if (status === 'ok' || dismissed) return null;

  const isOffline = status === 'offline';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-sm bg-white border border-[#D5DCF3] shadow-xl rounded-lg px-4 py-3 flex items-start gap-3 text-sm text-[#0E0B33]"
    >
      <div
        className={`mt-0.5 shrink-0 rounded-full p-1.5 ${
          isOffline ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
        }`}
      >
        {isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#0E0B33]">
          {isOffline ? 'No internet connection' : 'Slow network detected'}
        </p>
        <p className="text-xs text-[#4A4F78] mt-0.5 leading-relaxed">
          {isOffline
            ? 'Check your connection and try again.'
            : 'Pages may load slower due to your current network.'}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss notification"
        className="shrink-0 text-[#4A4F78] hover:text-[#0E0B33] p-0.5 rounded transition-colors cursor-pointer"
      >
        <X size={15} />
      </button>
    </div>
  );
}

