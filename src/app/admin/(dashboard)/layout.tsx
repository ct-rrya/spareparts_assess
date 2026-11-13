import React from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { getStorageMode } from '@/lib/db';

export const dynamic = 'force-dynamic';

// persistent layout for all admin dashboard views
export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const storageMode = getStorageMode();

  return <AdminShell storageMode={storageMode}>{children}</AdminShell>;
}

