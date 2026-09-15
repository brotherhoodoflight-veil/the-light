"use client";

// ============================================================
// VEIL — Chamber Under Preparation
// Catch-all for dashboard modules that will be built in later
// stages. Renders an elegant placeholder within the shell so
// navigation always resolves.
// ============================================================

import { useParams } from 'next/navigation';
import { useSession } from '../../../lib/auth/session-provider';
import { getNavigationForRole } from '../../../lib/navigation';

function matchModule(slug: string[]): string | null {
  const target = `/dashboard/${slug.join('/')}`;
  if (target === '/dashboard') return 'My VEIL';
  const roles = [
    'MEMBER',
    'CANDIDATE',
    'AREOPAGUS',
    'COUNTRY_INITIATOR',
    'PREFECT',
    'DIRECTORATE_OFFICER',
    'MINERVAL_ASSEMBLY_OFFICER',
    'INSINUATOR',
    'SYSTEM_ADMINISTRATOR',
  ] as const;
  for (const role of roles) {
    for (const group of getNavigationForRole(role)) {
      for (const item of group.items) {
        if (item.href === target) return item.label;
      }
    }
  }
  return null;
}

export default function ChamberPage() {
  const { user } = useSession();
  const params = useParams<{ slug: string[] }>();
  const slug = Array.isArray(params?.slug) ? params.slug : [];

  if (!user) return null;

  const moduleName = matchModule(slug) ?? 'This module';

  return (
    <div className="dash-module">
      <section className="dash-hero dash-hero-module">
        <div className="dash-hero-seal" aria-hidden="true">
          <span className="dash-hero-seal-inner">◈</span>
        </div>
        <div className="dash-hero-copy">
          <p className="dash-hero-eyebrow">INNER CHAMBER</p>
          <h1 className="dash-hero-title">{moduleName}</h1>
          <div className="dash-hero-divider" aria-hidden="true" />
        </div>
      </section>

      <div className="dash-panel dash-module-panel" role="status">
        <span className="dash-module-glyph" aria-hidden="true">
          ◇
        </span>
        <h2 className="dash-module-title">THIS CHAMBER IS BEING PREPARED</h2>
        <p className="dash-module-desc">
          The {moduleName} module has not yet been opened. It will arrive in a
          later stage of construction.
        </p>
        <p className="dash-module-note">
          PRESENTED BY THE DEVELOPMENT GATEWAY · NO PRODUCTION RECORDS ARE AFFECTED
        </p>
      </div>
    </div>
  );
}