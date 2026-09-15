import type { StatCard as StatCardData } from '../../../lib/types';

// ============================================================
// VEIL — Stat Card
// ============================================================

export default function StatCard({ label, value, subtitle, href }: StatCardData) {
  const isEmpty = value === '—' || value === 0;
  const inner = (
    <div className="dash-card dash-stat">
      <div className="dash-stat-rule" aria-hidden="true" />
      <p className="dash-stat-label">{label}</p>
      <p className={`dash-stat-value ${isEmpty ? 'is-empty' : ''}`}>{value}</p>
      {subtitle ? <p className="dash-stat-sub">{subtitle}</p> : null}
    </div>
  );

  return href && !isEmpty ? (
    <a href={href} className="dash-stat-link">
      {inner}
    </a>
  ) : (
    inner
  );
}