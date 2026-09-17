import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Threshold — Brotherhood of Light",
  description: "Beyond this point, authority is required.",
};

export default function ThresholdPage() {
  return (
    <main className="thr-page tp-page">
      <div className="thr-void" aria-hidden="true" />
      <div className="thr-ambient" aria-hidden="true" />

      <div className="thr-veil" aria-hidden="true">
        <div className="thr-veil-axis" />
        <div className="thr-veil-glow tp-veil-glow" />
        <div className="thr-veil-line" />
        <div className="thr-veil-halo" />
      </div>

      <section className="tp-threshold" aria-labelledby="threshold-title">
        <div className="tp-inner">
          <div className="tp-seal" aria-hidden="true">
            <span className="tp-seal-diamond" />
          </div>

          <h1 id="threshold-title" className="tp-title">
            THE THRESHOLD
          </h1>

          <div className="tp-rule" aria-hidden="true">
            <span className="tp-rule-diamond" />
          </div>

          <p className="tp-invocation">
            BEYOND THIS POINT, AUTHORITY IS REQUIRED.
          </p>

          <nav className="tp-gates" aria-label="Authorized entrances">
            <Link
              href="/sanctuary/login"
              className="tp-gate"
            >
              <span className="tp-gate-emblem" aria-hidden="true" />

              <span className="tp-gate-name">
                MEMBERS OF THE ORDER
              </span>

              <span className="tp-gate-desc">
                Those entrusted with the private life
                <br />
                of the Brotherhood.
              </span>

              <span className="tp-gate-action">
                ENTER THE SANCTUARY
              </span>
            </Link>

            <span className="tp-gates-seam" aria-hidden="true" />

            <Link
              href="/grand-chamber/login"
              className="tp-gate tp-gate-chamber"
            >
              <span className="tp-gate-emblem" aria-hidden="true" />

              <span className="tp-gate-name">
                STEWARDS OF THE ORDER
              </span>

              <span className="tp-gate-desc">
                Those entrusted with the keeping
                <br />
                of the Order.
              </span>

              <span className="tp-gate-action">
                ENTER THE GRAND CHAMBER
              </span>
            </Link>
          </nav>

          <div className="tp-warning">
            <div className="tp-warning-rule" aria-hidden="true" />

            <p className="tp-warning-text">
              THE UNAUTHORIZED SHALL NOT PROCEED.
            </p>
          </div>
        </div>

        <div className="tp-return">
          <Link href="/" className="tp-return-link">
            RETURN BEYOND THE VEIL
          </Link>
        </div>
      </section>
    </main>
  );
}
