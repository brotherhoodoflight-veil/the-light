import type { Metadata } from "next";
import Link from "next/link";
import PortalAuthForm from "../../../components/portal/PortalAuthForm";
import VeilEmblem from "../../../components/portal/VeilEmblem";

export const metadata: Metadata = {
  title: "The Grand Chamber — Brotherhood of Light",
  description:
    "The private chamber of the stewards of the Order. Reserved for authorized officers only.",
};

export default function GrandChamberLoginPage() {
  return (
    <main className="gc-page">
      {/* Authoritative geometry — severe, institutional */}
      <div className="gc-lintel" aria-hidden="true" />
      <div className="gc-axis" aria-hidden="true" />

      {/* The seat of officer authority */}
      <div className="gc-shell">
        <header className="gc-header">
          <div className="gc-seal" aria-hidden="true">
            <VeilEmblem className="gc-emblem" />
          </div>

          <p className="gc-kicker">
            THE SACRED ORDER OF THE VEILED LIGHT
          </p>

          <h1 className="gc-wordmark">THE GRAND CHAMBER</h1>

          <div className="gc-rule" aria-hidden="true" />

          <p className="gc-invite">
            THE PRIVATE CHAMBER OF THE STEWARDS OF THE ORDER.
            <br />
            THIS ENTRANCE IS RESERVED FOR AUTHORIZED OFFICERS.
          </p>
        </header>

        <div className="gc-panel">
          <PortalAuthForm
            realm="grand-chamber"
            idLabel="MEMBERSHIP ID"
            idPlaceholder="BOL-XXXX-XXXX-XX/COUNTRY"
            passwordLabel="PASSWORD"
            submitLabel="ENTER THE GRAND CHAMBER"
            loadingLabel="PRESENTING AUTHORIZATION"
            successPath="/grand-chamber"
            note="Credentials are verified against the authorization of the Order. Seats in the Grand Chamber are reserved for officers."
          />
        </div>

        <footer className="gc-footer">
          <p className="gc-security">
            THE GRAND CHAMBER IS RESERVED FOR THE OFFICERS OF THE ORDER.
            <br />
            NO MEMBER WITHOUT AUTHORITY MAY ENTER.
          </p>

          <Link href="/threshold" className="gc-back">
            RETURN TO THE THRESHOLD
          </Link>
        </footer>
      </div>
    </main>
  );
}
