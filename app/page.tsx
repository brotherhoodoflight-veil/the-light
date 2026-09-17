import Link from "next/link";

export default function EntrancePage() {
  return (
    <main className="bol-page">
      <div className="bol-void" aria-hidden="true" />
      <div className="bol-grain" aria-hidden="true" />
      <div className="bol-veil" aria-hidden="true">
        <div className="bol-veil-axis" />
        <div className="bol-veil-glow" />
      </div>

      <div className="bol-stage">
        <p className="bol-order">THE SACRED ORDER OF THE VEILED LIGHT</p>

        <h1 className="bol-title">
          <span className="bol-title-line">BROTHERHOOD</span>
          <span className="bol-title-line">OF</span>
          <span className="bol-title-line">LIGHT</span>
        </h1>

        <div className="bol-rule" aria-hidden="true">
          <span className="bol-rule-core" />
        </div>

        <p className="bol-declaration">LIGHT EXISTS BEHIND THE VEIL.</p>

        <p className="bol-charge">
          The Order keeps no public register and receives no casual witness.
          Its knowledge is held in confidence.
          Its authority is closed until granted.
          Its membership is chosen, never requested.
          The institution itself is not displayed here;
          it stands beyond the threshold.
        </p>

        <div className="bol-action">
          <Link href="/threshold" className="bol-approach">
            <span className="bol-approach-text">APPROACH THE THRESHOLD</span>
          </Link>
        </div>
      </div>

      <footer className="bol-foot">
        <span className="bol-foot-text">THE BROTHERHOOD OF LIGHT</span>
        <span className="bol-foot-sep" aria-hidden="true">&middot;</span>
        <span className="bol-foot-text">A PRIVATE INSTITUTION</span>
      </footer>
    </main>
  );
}