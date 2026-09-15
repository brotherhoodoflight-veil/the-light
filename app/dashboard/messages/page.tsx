"use client";

// ============================================================
// VEIL — THE BROTHERHOOD CHAMBER
// /dashboard/messages · Member communication platform
// ============================================================

import dynamic from 'next/dynamic';
import { useSession } from '../../../lib/auth/session-provider';
import './chamber.css';

const BrotherhoodChamber = dynamic(
  () => import('./components/BrotherhoodChamber'),
  { ssr: false, loading: () => <ChamberFallback /> },
);

function ChamberFallback() {
  return (
    <div className="dash-chamber-loading" aria-live="polite">
      <span className="dash-chamber-loading-glyph" aria-hidden="true">
        ◈
      </span>
      <p className="dash-chamber-loading-label">ENTERING THE CHAMBER…</p>
    </div>
  );
}

export default function MessagesPage() {
  const { ready } = useSession();
  if (!ready) return <ChamberFallback />;
  return <BrotherhoodChamber />;
}