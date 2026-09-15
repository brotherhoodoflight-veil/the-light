"use client";

// ============================================================
// VEIL — Settings · Sign Out
// Uses the existing authenticated session logout mechanism
// (SessionProvider -> POST /api/auth/logout -> /login). No
// alternative or unsafe logout path is created here.
// ============================================================

import { useSession } from '../../../lib/auth/session-provider';

export default function SignOutButton() {
  const { logout } = useSession();

  return (
    <button
      type="button"
      className="dash-settings-button"
      onClick={() => {
        void logout();
      }}
    >
      SIGN OUT
    </button>
  );
}