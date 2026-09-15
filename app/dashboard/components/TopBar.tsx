"use client";

// ============================================================
// VEIL — Top Bar
// Page title, organizational scope, notifications, messages,
// profile menu, and logout.
// ============================================================

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type Permission, type NavGroup } from '../../../lib/types';
import { getNavigationForRole } from '../../../lib/navigation';
import { hasPermission } from '../../../lib/auth/authorization';
import { roleShortLabel } from '../../../lib/auth/role-labels';
import type { VeilSessionUser } from '../../../lib/auth/session-types';

function pageTitle(pathname: string, groups: NavGroup[]): string {
  for (const group of groups) {
    for (const item of group.items) {
      if (item.href === pathname) return item.label;
    }
  }
  if (pathname.startsWith('/dashboard')) return 'My VEIL';
  return 'VEIL';
}

function scopeChip(user: VeilSessionUser): string | null {
  if (user.role === 'SYSTEM_ADMINISTRATOR') return null;
  const org = user.org;
  if (org?.countryName && org.prefectureName) {
    return `${org.countryName.toUpperCase()} • ${org.prefectureName.toUpperCase()}`;
  }
  if (org?.countryName) return org.countryName.toUpperCase();
  if (user.scope.position === 'GLOBAL') return 'THE AREOPAGUS • GLOBAL';
  if (user.scope.countryName) return user.scope.countryName.toUpperCase();
  return null;
}

interface TopBarProps {
  user: VeilSessionUser;
  permissions: Permission[];
  onMenu: () => void;
  logout: () => Promise<void>;
}

export default function TopBar({ user, permissions, onMenu, logout }: TopBarProps) {
  const pathname = usePathname();
  const groups = getNavigationForRole(user.role);
  const title = pageTitle(pathname, groups);
  const chip = scopeChip(user);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onGlobalClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', onGlobalClick);
    return () => document.removeEventListener('mousedown', onGlobalClick);
  }, [menuOpen]);

  const canViewProfile =
    hasPermission(user.role, 'VIEW_OWN_PROFILE', permissions) ||
    hasPermission(user.role, 'VIEW_CANDIDATE_PROFILE', permissions);

  return (
    <header className="dash-topbar">
      <div className="dash-topbar-left">
        <button
          className="dash-menu-button"
          onClick={onMenu}
          aria-label="Open navigation"
          aria-expanded="false"
        >
          <span className="dash-menu-lines" aria-hidden="true" />
        </button>
        <div className="dash-topbar-titleblock">
          <p className="dash-topbar-eyebrow">INNER CHAMBER</p>
          <h2 className="dash-topbar-title">{title}</h2>
        </div>
      </div>

      <div className="dash-topbar-right">
        {chip ? (
          <span className="dash-scope-chip" title="Organizational scope">
            <span className="dash-scope-dot" aria-hidden="true" />
            {chip}
          </span>
        ) : null}

        <div className="dash-topbar-actions">
          <button
            className="dash-icon-button"
            aria-label="Notifications (no new notifications)"
            title="Notifications"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </button>

          <button className="dash-icon-button" aria-label="Messages" title="Messages">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        <div className="dash-profile" ref={menuRef}>
          <button
            className="dash-profile-trigger"
            onClick={() => setMenuOpen((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="dash-avatar" aria-hidden="true">
              {user.initials}
            </span>
            <span className="dash-profile-copy">
              <span className="dash-profile-name">
                {user.role === 'MEMBER' ? user.firstName : `${user.firstName} ${user.lastName}`}
              </span>
              <span className="dash-profile-role">{roleShortLabel(user.role)}</span>
            </span>
            <span className="dash-profile-caret" aria-hidden="true">
              {menuOpen ? '▲' : '▼'}
            </span>
          </button>

          {menuOpen ? (
            <div className="dash-profile-menu" role="menu">
              <div className="dash-profile-menu-head">
                <span className="dash-avatar" aria-hidden="true">
                  {user.initials}
                </span>
                <span className="dash-profile-menu-id">
                  {user.fullName ?? (user.title ? `${user.title} ${user.lastName}` : user.lastName)}
                  <em>{user.memberId}</em>
                </span>
              </div>
              <div className="dash-profile-menu-divider" aria-hidden="true" />
              {canViewProfile ? (
                <Link
                  href="/dashboard/profile"
                  className="dash-profile-menu-item"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  My Profile
                </Link>
              ) : null}
              <button
                type="button"
                className="dash-profile-menu-item is-danger"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  void logout();
                }}
              >
                Sign Out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}