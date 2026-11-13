import type { Metadata } from 'next';
import { Suspense } from 'react';
import localFont from 'next/font/local';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { NavigationProgress } from '@/components/NavigationProgress';
import { NetworkStatusToast } from '@/components/NetworkStatusToast';

// catchye display font from local file
const catchye = localFont({
  src: '../fonts/Catchye.otf',
  variable: '--font-catchye',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Spare Parts — Laboratory & Science Supplies',
  description:
    'Anatomy models, lab essentials and study tools, catalogued and ready to order for CubeTech.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={catchye.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=JetBrains+Mono:ital,wght@0,400..700;1,400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="text-base antialiased font-sans">
        <CartProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <NetworkStatusToast />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
