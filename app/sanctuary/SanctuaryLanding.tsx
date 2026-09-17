"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import VeilEmblem from "../../components/portal/VeilEmblem";

const NAV_DESTINATIONS = [
  { label: "MY RECORD", available: false },
  { label: "THE JOURNEY", available: false },
  { label: "THE CHAMBER", available: false },
  { label: "CONVOCATIONS", available: false },
  { label: "THE ARCHIVES", available: false },
  { label: "DISPATCHES", available: false },
  { label: "ORDINANCES", available: false },
] as const;

export default function SanctuaryLanding({
  fullName,
  standing,
  memberId,
  country,
}: {
  fullName: string;
  standing: string;
  memberId: string;
  country: string;
}) {
  const router = useRouter();

  const handleDepart = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/sanctuary/login");
  }, [router]);

  return (
    <main className="sc-page">
      {/* Concealed ambient geometry */}
      <div className="sc-aura" aria-hidden="true" />
      <div className="sc-arch" aria-hidden="true" />
      <div className="sc-orbit" aria-hidden="true" />

      <div className="sc-home-shell">
        {/* ── The Seal ── */}
        <div className="sc-home-seal" aria-hidden="true">
          <VeilEmblem className="sc-home-emblem" />
        </div>

        {/* ── Title ── */}
        <h1 className="sc-home-title">THE SANCTUARY</h1>

        <div className="sc-home-rule" aria-hidden="true" />

        {/* ── Ceremonial reception ── */}
        <p className="sc-home-reception">THE VEIL RECEIVES YOU.</p>

        {/* ── Identity Register ── */}
        <div className="sc-home-register">
          <div className="sc-home-register-line" aria-hidden="true" />
          <dl className="sc-home-register-fields">
            <div className="sc-home-register-row">
              <dt className="sc-home-label">NAME</dt>
              <dd className="sc-home-value">{fullName}</dd>
            </div>
            <div className="sc-home-register-row">
              <dt className="sc-home-label">STANDING</dt>
              <dd className="sc-home-value">{standing}</dd>
            </div>
            <div className="sc-home-register-row">
              <dt className="sc-home-label">IDENTIFIER</dt>
              <dd className="sc-home-value sc-home-member-id">{memberId}</dd>
            </div>
            <div className="sc-home-register-row">
              <dt className="sc-home-label">COUNTRY OF RECORD</dt>
              <dd className="sc-home-value">{country}</dd>
            </div>
          </dl>
          <div className="sc-home-register-line" aria-hidden="true" />
        </div>

        {/* ── Ceremonial inscription ── */}
        <p className="sc-home-inscription">
          THAT WHICH IS ENTRUSTED
          <br />
          SHALL REMAIN VEILED.
        </p>

        {/* ── Private Navigation ── */}
        <nav className="sc-home-nav" aria-label="Sanctuary destinations">
          {NAV_DESTINATIONS.map((dest) => (
            <div
              key={dest.label}
              className={`sc-home-nav-entry${dest.available ? "" : " sc-home-nav-inactive"}`}
            >
              <span className="sc-home-nav-diamond" aria-hidden="true">
                ◆
              </span>
              <span className="sc-home-nav-label">{dest.label}</span>
            </div>
          ))}
        </nav>

        {/* ── Departure ── */}
        <footer className="sc-home-footer">
          <div className="sc-home-depart-rule" aria-hidden="true" />
          <button
            type="button"
            onClick={handleDepart}
            className="sc-home-depart"
          >
            DEPART THE SANCTUARY
          </button>
        </footer>
      </div>
    </main>
  );
}
