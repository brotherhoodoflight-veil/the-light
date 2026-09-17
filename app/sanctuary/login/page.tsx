import type { Metadata } from "next";
import Link from "next/link";
import PortalAuthForm from "../../../components/portal/PortalAuthForm";
import VeilEmblem from "../../../components/portal/VeilEmblem";

export const metadata: Metadata = {
  title: "The Sanctuary — Brotherhood of Light",
  description:
    "The private precinct of the Order. Only those whose name is entered into the Register of the Order may pass.",
};

export default function SanctuaryLoginPage() {
  return (
    <main className="sc-page">
      {/* Concealed light geometry — quiet, intimate, private */}
      <div className="sc-aura" aria-hidden="true" />
      <div className="sc-arch" aria-hidden="true" />
      <div className="sc-orbit" aria-hidden="true" />

      {/* The authentication chamber */}
      <div className="sc-shell">
        <header className="sc-header">
          <div className="sc-seal" aria-hidden="true">
            <VeilEmblem className="sc-emblem" />
          </div>

          <p className="sc-eyebrow">
            THE SACRED ORDER OF THE VEILED LIGHT
          </p>

          <h1 className="sc-wordmark">THE SANCTUARY</h1>

          <div className="sc-rule" aria-hidden="true" />

          <p className="sc-invite">
            THE PRIVATE PRECINCT OF THE ORDER.
            <br />
            ONLY THOSE WHOSE NAME IS ENTERED
            <br />
            INTO THE REGISTER MAY PASS.
          </p>
        </header>

        <div className="sc-panel">
          <PortalAuthForm
            realm="sanctuary"
            idLabel="MEMBERSHIP ID"
            idPlaceholder="BOL-XXXX-XXXX-XX/COUNTRY"
            passwordLabel="PASSWORD"
            submitLabel="ENTER THE SANCTUARY"
            loadingLabel="PRESENTING CREDENTIALS"
            successPath="/sanctuary"
            note="Credentials are verified against the Register of the Order."
          />
        </div>

        <footer className="sc-footer">
          <p className="sc-security">
            THIS PRECINCT IS RESERVED FOR MEMBERS OF THE ORDER.
            <br />
            UNAUTHORIZED ACCESS IS NOT PERMITTED.
          </p>

          <Link href="/threshold" className="sc-back">
            RETURN TO THE THRESHOLD
          </Link>
        </footer>
      </div>
    </main>
  );
}