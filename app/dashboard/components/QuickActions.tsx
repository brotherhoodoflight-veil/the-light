"use client";

// ============================================================
// VEIL — Quick Actions
// Generated directly from the role's navigation items.
// No duplicate navigation system is introduced here.
// ============================================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavGroup, Permission } from '../../../lib/types';
import { getNavigationForRole } from '../../../lib/navigation';
import { hasPermission } from '../../../lib/auth/authorization';
import type { VeilSessionUser } from '../../../lib/auth/session-types';

const MEMBER_QUICK_ACCESS: { label: string; href: string }[] = [
  { label: 'MY MEMBERSHIP', href: '/dashboard/membership' },
  { label: 'MY PROFILE', href: '/dashboard/profile' },
  { label: 'THE PATH', href: '/dashboard/path' },
  { label: 'THE CODEX', href: '/dashboard/codex/what-we-serve' },
];

function getQuickActions(
  user: VeilSessionUser,
  permissions: Permission[],
): { label: string; href: string }[] {
  if (user.role === 'MEMBER') return MEMBER_QUICK_ACCESS;

  const groups = getNavigationForRole(user.role);
  const allItems: NavGroup['items'] = [];
  for (const group of groups) {
    allItems.push(...group.items);
  }

  const overviewHrefs = groups
    .flatMap((group) =>
      group.title === 'OVERVIEW' || group.title === 'CANDIDATE'
        ? group.items.map((item) => item.href)
        : [],
    )
    .concat(['#/dashboard']);

  const filtered = allItems
    .filter(
      (item) =>
        item.href !== '/dashboard' &&
        !overviewHrefs.includes(item.href) &&
        (item.requiredPermissions.length === 0 ||
          item.requiredPermissions.every((p) =>
            hasPermission(user.role, p, permissions),
          )),
    )
    .reduce<{ label: string; href: string }[]>((acc, item) => {
      if (acc.length >= 6) return acc;
      if (acc.some((existing) => existing.href === item.href)) return acc;
      acc.push({ label: item.label, href: item.href });
      return acc;
    }, []);

  return filtered.length > 0
    ? filtered
    : [
        { label: 'My Profile', href: '/dashboard/profile' },
        { label: 'Settings', href: '/dashboard/settings' },
      ];
}

export default function QuickActions({
  user,
  permissions,
}: {
  user: VeilSessionUser;
  permissions: Permission[];
}) {
  const pathname = usePathname();
  const actions = getQuickActions(user, permissions);

  return (
    <div className="dash-panel dash-actions">
      <h3 className="dash-panel-head">
        {user.role === 'MEMBER' ? 'QUICK ACCESS' : 'QUICK ACTIONS'}
      </h3>
      <ul className="dash-actions-list">
        {actions.map((action) => {
          const active = pathname === action.href;
          return (
            <li key={action.href}>
              <Link
                href={action.href}
                className={`dash-action-link ${active ? 'is-active' : ''}`}
              >
                {action.label}
                <span className="dash-action-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}