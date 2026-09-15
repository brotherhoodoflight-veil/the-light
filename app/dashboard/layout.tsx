// ============================================================
// VEIL — Dashboard Layout
// Server-side gate. Verifies the signed session cookie on every
// /dashboard request. Unauthenticated visitors are returned to
// the entrance. The verified user is handed to the client shell.
// ============================================================

import { redirect } from 'next/navigation';
import { getSessionPayload } from '../../lib/auth/session-server';
import DashboardShell from './components/DashboardShell';
import './dashboard.css';
import type { ReactNode } from 'react';

export default async function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await getSessionPayload();

  if (!session) {
    redirect('/login');
  }

  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}