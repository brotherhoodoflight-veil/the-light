"use client";

// ============================================================
// VEIL — Sidebar
// Inner-chamber navigation generated exclusively from
// lib/navigation. Items are permission-filtered against the
// authenticated user's role permissions.
// ============================================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavGroup, Permission } from '../../../lib/types';
import { getNavigationForRole } from '../../../lib/navigation';
import { hasPermission } from '../../../lib/auth/authorization';
import type { VeilSessionUser } from '../../../lib/auth/session-types';
import VeilEmblem from '../../login/components/VeilEmblem';

function filterGroups(groups: NavGroup[], role: VeilSessionUser['role'], permissions: Permission[]): NavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.requiredPermissions.length === 0 ||
          item.requiredPermissions.every((permission) =>
            hasPermission(role, permission, permissions),
          ),
      ),
    }))
    .filter((group) => group.items.length > 0);
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface SidebarProps {
  user: VeilSessionUser;
  permissions: Permission[];
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ user, permissions, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const groups = filterGroups(getNavigationForRole(user.role), user.role, permissions);

  return (
    <>
      <div
        className={`dash-sidebar-overlay ${open ? 'is-visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`dash-sidebar ${open ? 'is-open' : ''}`}>
        <header className="dash-sidebar-brand">
          <div className="dash-sidebar-seal">
            <VeilEmblem />
          </div>
          <div className="dash-sidebar-brandcopy">
            <span className="dash-sidebar-wordmark">VEIL</span>
            <span className="dash-sidebar-tagline">
              THE BROTHERHOOD
              <br />
              OF LIGHT
            </span>
          </div>
        </header>

        <div className="dash-sidebar-rule" aria-hidden="true" />

        <nav className="dash-sidebar-nav" aria-label="Primary">
          {groups.map((group) => (
            <div
              className={`dash-nav-group ${group.restricted ? 'is-restricted' : ''}`}
              key={group.title ?? 'root'}
            >
              {group.title ? <p className="dash-nav-title">{group.title}</p> : null}
              <ul className="dash-nav-list">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`dash-nav-link ${active ? 'is-active' : ''}`}
                        aria-current={active ? 'page' : undefined}
                        onClick={onClose}
                      >
                        <span className="dash-nav-glyph" aria-hidden="true">
                          {item.icon ?? (active ? '◆' : '◇')}
                        </span>
                        <span className="dash-nav-labely">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <footer className="dash-sidebar-foot">
          <span className="dash-sidebar-footmark">INNER CHAMBER</span>
          <span className="dash-sidebar-footmeta">VEIL · INVITATION ONLY</span>
          {user.dev ? <span className="dash-sidebar-dev">DEV GATEWAY</span> : null}
        </footer>
      </aside>
    </>
  );
}