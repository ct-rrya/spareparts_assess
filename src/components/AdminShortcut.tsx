'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function AdminShortcut() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.repeat) return;
      const isMod = (e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey;
      if (!isMod || e.key.toLowerCase() !== 'a') return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      e.preventDefault();
      if (!pathname.startsWith('/admin')) {
        router.push('/admin');
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pathname, router]);

  return null;
}

