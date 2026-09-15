import EmptyState from './EmptyState';

// ============================================================
// VEIL — Assemblies Panel
// Uses the existing events functionality/data when it exists.
// Until then an honest, restrained empty state is shown — no
// dates, venues, or Brotherhood events are invented.
// ============================================================

export default function AssembliesPanel() {
  return (
    <div className="dash-panel dash-events">
      <h3 className="dash-panel-head">ASSEMBLIES</h3>
      <EmptyState label="NO ASSEMBLIES CONVENED" description="Convocations and assemblies will be recorded here once scheduled. None are presently set." seal />
    </div>
  );
}