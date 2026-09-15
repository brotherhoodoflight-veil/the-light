"use client";

// ============================================================
// VEIL — Session Provider
// Supplies the authenticated user and derived permissions to
// the dashboard. Hydrated from the server-verified session
// cookie by the dashboard layout; this provider is client-only.
// ============================================================

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import type { Permission } from '../types';
import { getPermissionsForRole } from './authorization';
import type { VeilSessionUser } from './session-types';

interface SessionApi {
  user: VeilSessionUser | null;
  permissions: Permission[];
  ready: boolean;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionApi>({
  user: null,
  permissions: [],
  ready: false,
  logout: async () => undefined,
});

export function SessionProvider({
  user,
  children,
}: {
  user: VeilSessionUser | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const [loggedOut, setLoggedOut] = useState(false);

  const logout = useCallback(async () => {
    setLoggedOut(true);
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    router.replace('/login');
  }, [router]);

  const value = useMemo<SessionApi>(() => {
    const activeUser = loggedOut ? null : user;
    return {
      user: activeUser,
      permissions: activeUser ? getPermissionsForRole(activeUser.role) : [],
      ready: true,
      logout,
    };
  }, [user, loggedOut, logout]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionApi {
  return useContext(SessionContext);
}