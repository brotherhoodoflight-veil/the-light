import EmptyState from './EmptyState';

// ============================================================
// VEIL — Announcements Panel
// ============================================================

export default function AnnouncementsPanel() {
  return (
    <div className="dash-panel dash-announcements">
      <h3 className="dash-panel-head">ANNOUNCEMENTS</h3>
      <EmptyState label="NO NEW DIRECTIVES" description="The Veil is presently silent." seal />
    </div>
  );
}