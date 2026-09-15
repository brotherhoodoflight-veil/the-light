import EmptyState from './EmptyState';

// ============================================================
// VEIL — Activity Panel
// Currently displays the empty state. Real activity data will
// be connected when the membership / event backends exist.
// ============================================================

export default function ActivityPanel() {
  return (
    <div className="dash-panel dash-activity">
      <h3 className="dash-panel-head">BROTHERHOOD ACTIVITY</h3>
      <EmptyState label="NO ACTIVITY TO REPORT" description="The order's records will surface here as they are entered. Nothing has been fabricated." seal />
    </div>
  );
}