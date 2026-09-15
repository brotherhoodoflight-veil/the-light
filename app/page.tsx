export default function Home() {
  return (
    <main className="veil-home">
      <div className="veil-symbol" aria-hidden="true">
        ◈
      </div>

      <section className="veil-content">
        <p className="eyebrow">THE BROTHERHOOD OF LIGHT</p>

        <h1>VEIL</h1>

        <p className="subtitle">
          PRIVATE GLOBAL FRATERNITY PORTAL
        </p>

        <div className="divider" aria-hidden="true" />

        <p className="intro">
          A private digital sanctuary for recognized members,
          candidates, and authorized officers of The Brotherhood
          of Light.
        </p>

        <a href="/login" className="enter-button">
          ENTER THE VEIL
        </a>

        <p className="restricted">
          PRIVATE ACCESS • INVITATION ONLY
        </p>
      </section>

      <footer className="veil-footer">
        <span>THE BROTHERHOOD OF LIGHT</span>
        <span>•</span>
        <span>VEIL</span>
        <span>•</span>
        <span>AUTHORIZED ACCESS</span>
      </footer>
    </main>
  );
}
