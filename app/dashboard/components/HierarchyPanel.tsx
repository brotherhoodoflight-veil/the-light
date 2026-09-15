"use client";

// ============================================================
// VEIL — Hierarchy Panel
// Shows the organizational lineage from The Brotherhood to the
// user's current station. Only levels actually available from
// the authenticated context are rendered.
// ============================================================

import type { VeilSessionUser } from '../../../lib/auth/session-types';
import { roleShortLabel } from '../../../lib/auth/role-labels';

interface HierarchyLevel {
  label: string;
  name?: string;
}

function buildHierarchy(user: VeilSessionUser): HierarchyLevel[] {
  const levels: HierarchyLevel[] = [
    { label: 'THE BROTHERHOOD' },
  ];

  const org = user.org;

  if (user.role === 'SYSTEM_ADMINISTRATOR') {
    levels.push({ label: 'TECHNICAL ADMINISTRATION', name: user.scope.entityName });
    return levels;
  }

  if (user.role === 'AREOPAGUS') {
    levels.push({ label: 'GLOBAL' });
    if (user.scope.entityName) {
      levels.push({ label: 'THE AREOPAGUS', name: user.scope.entityName });
    }
    return levels;
  }

  if (user.scope.position === 'GLOBAL') {
    levels.push({ label: 'GLOBAL' });
  }

  if (user.scope.countryName || org?.countryName) {
    levels.push({ label: 'COUNTRY', name: org?.countryName ?? user.scope.countryName });
  }

  if (org?.prefectureName) {
    levels.push({ label: 'PREFECTURE', name: org.prefectureName });
  } else if (user.scope.position === 'PREFECTURE') {
    levels.push({ label: 'PREFECTURE', name: user.scope.entityName });
  }

  if (org?.directorateName) {
    levels.push({ label: 'DIRECTORATE', name: org.directorateName });
  } else if (user.scope.position === 'DIRECTORATE') {
    levels.push({ label: 'DIRECTORATE', name: user.scope.entityName });
  }

  if (org?.assemblyName) {
    levels.push({ label: 'MINERVAL ASSEMBLY', name: org.assemblyName });
  } else if (user.scope.position === 'MINERVAL_ASSEMBLY') {
    levels.push({ label: 'MINERVAL ASSEMBLY', name: user.scope.entityName });
  }

  if (org?.cellName) {
    levels.push({ label: 'CELL', name: org.cellName });
  } else if (user.scope.position === 'CELL') {
    levels.push({ label: 'CELL', name: user.scope.entityName });
  }

  const stationLabel = roleShortLabel(user.role);
  levels.push({ label: stationLabel, name: `${user.firstName} ${user.lastName}` });

  return levels;
}

export default function HierarchyPanel({ user }: { user: VeilSessionUser }) {
  const levels = buildHierarchy(user);

  return (
    <div className="dash-panel dash-hierarchy">
      <h3 className="dash-panel-head">ORGANIZATIONAL POSITION</h3>
      <div className="dash-hierarchy-seal" aria-hidden="true">
        <span className="dash-hierarchy-circle" />
        <span className="dash-hierarchy-diamond">◆</span>
        <span className="dash-hierarchy-circle" />
      </div>
      <ol className="dash-hierarchy-list" aria-label="Organizational hierarchy">
        {levels.map((level, i) => (
          <li
            key={`${level.label}-${i}`}
            className={`dash-hierarchy-level ${i === levels.length - 1 ? 'is-terminal' : ''}`}
          >
            <span className="dash-hierarchy-dot" aria-hidden="true" />
            <span className="dash-hierarchy-line" aria-hidden="true" />
            <span className="dash-hierarchy-name">{level.label}</span>
            {level.name ? (
              <span className="dash-hierarchy-entity">{level.name}</span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}