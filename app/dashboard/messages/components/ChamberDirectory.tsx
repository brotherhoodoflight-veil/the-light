"use client";

// ============================================================
// VEIL — Brotherhood Chamber · Member Directory
// Database-driven directory. Shows only permitted fields:
// display name, initials, membership status, country, and an
// authorized photograph when one exists. Private profile data
// (email, phone, address, authentication) is never exposed.
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { chamberFetch } from '../utils';
import type { MemberDirectoryPage, MemberSummary } from '../../../../lib/messages/types';

interface ChamberDirectoryProps {
  currentMemberId: string;
  onClose: () => void;
  onMessage: (member: MemberSummary) => void;
}

interface DirectoryResponse extends MemberDirectoryPage {}

export default function ChamberDirectory({
  currentMemberId,
  onClose,
  onMessage,
}: ChamberDirectoryProps) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState<DirectoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [selected, setSelected] = useState<MemberSummary | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (q: string) => {
    try {
      const data = await chamberFetch<DirectoryResponse>(
        `/api/messages/directory?q=${encodeURIComponent(q)}&limit=40`,
      );
      setPage(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The directory could not be read.');
    }
  }, []);

  useEffect(() => {
    void load('');
  }, [load]);

  // Result list is stable while typing; the input stays controlled.
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(query.trim()), 250);
    return () => window.clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    if (debounced !== '') void load(debounced);
  }, [debounced, load]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    function onGlobalClick(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onGlobalClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onGlobalClick);
    };
  }, [onClose]);

  const total = page?.total ?? null;
  const members = page?.members ?? [];

  async function handleMessage(member: MemberSummary) {
    setPendingMessage(member.memberId);
    try {
      onMessage(member);
    } finally {
      setPendingMessage(null);
    }
  }

  return (
    <div className="dash-chamber-overlay" role="dialog" aria-modal="true" aria-label="Brotherhood directory">
      <div className="dash-chamber-overlay-card dash-chamber-directory-card" ref={panelRef}>
        <header className="dash-chamber-overlay-head">
          <div>
            <p className="dash-chamber-overlay-eyebrow">BROTHERHOOD DIRECTORY</p>
            <h2 className="dash-chamber-overlay-title">
              TOTAL MEMBERS{' '}
              <span className="dash-chamber-overlay-total">
                {total === null ? '—' : total.toLocaleString()}
              </span>
            </h2>
          </div>
          <button
            type="button"
            className="dash-chamber-overlay-close"
            onClick={onClose}
            aria-label="Close directory"
          >
            ✕
          </button>
        </header>

        <div className="dash-chamber-directory-search">
          <span className="dash-chamber-directory-search-glyph" aria-hidden="true">
            ○
          </span>
          <input
            type="search"
            className="dash-chamber-directory-input"
            placeholder="SEARCH THE BROTHERHOOD"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search the Brotherhood"
            autoFocus
          />
        </div>

        {error ? <p className="dash-chamber-directory-error">{error}</p> : null}

        <div className="dash-chamber-directory-results">
          {members.length === 0 ? (
            <div className="dash-chamber-empty">
              <span className="dash-chamber-empty-glyph" aria-hidden="true">
                ◇
              </span>
              <p className="dash-chamber-empty-label">NO MEMBERS FOUND</p>
              <p className="dash-chamber-empty-desc">No Brotherhood members match that name.</p>
            </div>
          ) : (
            <ul className="dash-chamber-directory-list">
              {members.map((member) => {
                const isSelf = member.memberId === currentMemberId;
                const isSelected = selected?.memberId === member.memberId;
                return (
                  <li key={member.memberId} className={isSelected ? 'is-selected' : ''}>
                    <button
                      type="button"
                      className="dash-chamber-directory-row"
                      onClick={() => setSelected(isSelected ? null : member)}
                    >
                      <span className="dash-chamber-directory-avatar">
                        {member.photoUrl ? (
                          <img src={member.photoUrl} alt="" loading="lazy" />
                        ) : (
                          member.initials
                        )}
                        {member.present ? (
                          <span className="dash-chamber-conv-presence" aria-label="Present" />
                        ) : null}
                      </span>
                      <span className="dash-chamber-directory-copy">
                        <span className="dash-chamber-directory-name">{member.displayName}</span>
                        <span className="dash-chamber-directory-sub">
                          {member.memberId} · {member.status} · {member.country ?? '—'}
                          {isSelf ? ' · YOU' : ''}
                        </span>
                      </span>
                      <span className="dash-chamber-directory-arrow" aria-hidden="true">
                        ▸
                      </span>
                    </button>

                    {isSelected && !isSelf ? (
                      <div className="dash-chamber-directory-profile">
                        <span className="dash-chamber-directory-profile-initials">
                          {member.initials}
                        </span>
                        <div className="dash-chamber-directory-profile-copy">
                          <p className="dash-chamber-directory-profile-name">
                            {member.displayName}
                          </p>
                          <p className="dash-chamber-directory-profile-field">
                            MEMBERSHIP ID · {member.memberId}
                          </p>
                          <p className="dash-chamber-directory-profile-field">
                            STATUS · {member.status}
                          </p>
                          <p className="dash-chamber-directory-profile-field">
                            COUNTRY · {member.country ?? 'NOT ASSIGNED'}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="dash-chamber-button dash-chamber-directory-message"
                          onClick={() => void handleMessage(member)}
                          disabled={pendingMessage === member.memberId}
                        >
                          {pendingMessage === member.memberId ? 'OPENING…' : 'MESSAGE'}
                        </button>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="dash-chamber-directory-foot">
          <span>DIRECTORY FIELDS LIMITED TO BROTHERLY DISCLOSURE</span>
        </footer>
      </div>
    </div>
  );
}