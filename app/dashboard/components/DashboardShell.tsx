"use client";

// ============================================================
// VEIL — Dashboard Shell
// Wraps the sidebar, top bar, and content area. Provides the
// session context to all descendant dashboard components.
// Hydrated from the server-verified session cookie in the
// dashboard layout.
// ============================================================

import { useState } from 'react';
import { SessionProvider } from '../../../lib/auth/session-provider';
import type { VeilSessionUser } from '../../../lib/auth/session-types';
import { useSession } from '../../../lib/auth/session-provider';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import type { ReactNode } from 'react';

function ShellLayout({ children }: { children: ReactNode }) {
  const { user, permissions, logout } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="dash-shell">
      <Sidebar
        user={user}
        permissions={permissions}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="dash-maincolumn">
        <TopBar user={user} permissions={permissions} onMenu={() => setSidebarOpen(true)} logout={logout} />
        <main className="dash-main">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardShell({
  user,
  children,
}: {
  user: VeilSessionUser;
  children: ReactNode;
}) {
  return (
    <SessionProvider user={user}>
      <ShellLayout>{children}</ShellLayout>
    </SessionProvider>
  );
}