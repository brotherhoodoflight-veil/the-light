// ============================================================
// VEIL — Empty State
// ============================================================

interface EmptyStateProps {
  label: string;
  description?: string;
  seal?: boolean;
}

export default function EmptyState({ label, description, seal }: EmptyStateProps) {
  return (
    <div className="dash-empty">
      {seal ? <span className="dash-empty-seal" aria-hidden="true">◇</span> : null}
      <p className="dash-empty-label">{label}</p>
      {description ? <p className="dash-empty-desc">{description}</p> : null}
    </div>
  );
}