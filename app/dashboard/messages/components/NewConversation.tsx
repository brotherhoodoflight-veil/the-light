"use client";

// ============================================================
// VEIL — Brotherhood Chamber · New Conversation
// Open private correspondence or a new group chamber. Member
// picks are real, database-driven, and the server re-verifies
// every choice. Group titles are mandatory; OFFICIAL and
// ASSEMBLY channels are reserved for authorized officers.
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from '../../../../lib/auth/session-provider';
import { chamberFetch } from '../utils';
import type {
  ConversationSummary,
  ConversationType,
  MemberSummary,
} from '../../../../lib/messages/types';

interface NewConversationProps {
  currentMemberId: string;
  existingIds: Set<string>;
  onClose: () => void;
  onCreate: (conversation: ConversationSummary) => void;
}

interface DirectoryResponse {
  total: number;
  members: MemberSummary[];
}

const GROUP_TYPES: ConversationType[] = ['BROTHERHOOD', 'RESTRICTED'];
const OFFICER_TYPES: ConversationType[] = ['ASSEMBLY', 'OFFICIAL'];

const TYPE_BLURBS: Partial<Record<ConversationType, string>> = {
  PRIVATE: 'A private correspondence between you and one Brother.',
  BROTHERHOOD: 'An open chamber across the Brotherhood; any member may be invited.',
  RESTRICTED: 'A closed chamber visible only to invited members.',
  ASSEMBLY: 'An assembly group for members of a Minerval Assembly.',
  OFFICIAL: 'An authoritative channel. Ordinary members may read but not reply.',
};

export default function NewConversation({
  currentMemberId,
  existingIds,
  onClose,
  onCreate,
}: NewConversationProps) {
  const { user } = useSession();
  const isOfficer = user?.role !== 'MEMBER' && user?.role !== 'CANDIDATE';

  const [type, setType] = useState<ConversationType>('PRIVATE');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MemberSummary[]>([]);
  const [selected, setSelected] = useState<MemberSummary[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const isGroup = type !== 'PRIVATE';

  const load = useCallback(async (q: string) => {
    try {
      const data = await chamberFetch<DirectoryResponse>(
        `/api/messages/directory?q=${encodeURIComponent(q)}&limit=20`,
      );
      setResults(data.members.filter((m) => m.memberId !== currentMemberId));
    } catch {
      // Search is best-effort inside the composer.
    }
  }, [currentMemberId]);

  useEffect(() => {
    void load('');
  }, [load]);

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

  function togglePick(member: MemberSummary): void {
    setSelected((prev) =>
      prev.some((m) => m.memberId === member.memberId)
        ? prev.filter((m) => m.memberId !== member.memberId)
        : [...prev, member],
    );
  }

  function pickPrivate(member: MemberSummary): void {
    setSelected([member]);
  }

  const primaryLabel =
    type === 'PRIVATE'
      ? selected.length === 1
        ? 'OPEN PRIVATE CONVERSATION'
        : 'SELECT A BROTHER'
      : 'OPEN CHAMBER';

  const canSubmit =
    type === 'PRIVATE'
      ? selected.length === 1
      : title.trim().length > 0 && selected.length > 0;

  async function handleSubmit(): Promise<void> {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await chamberFetch<{ conversation: ConversationSummary }>(
        '/api/messages/conversations',
        {
          method: 'POST',
          body: JSON.stringify({
            type,
            title: isGroup ? title.trim() : undefined,
            description: description.trim() || undefined,
            memberIds: selected.map((m) => m.memberId),
          }),
        },
      );
      onCreate(response.conversation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The conversation could not be opened.');
      setSubmitting(false);
    }
  }

  const allTypes = [...GROUP_TYPES, ...(isOfficer ? OFFICER_TYPES : [])];

  return (
    <div className="dash-chamber-overlay" role="dialog" aria-modal="true" aria-label="New conversation">
      <div className="dash-chamber-overlay-card dash-chamber-compose-card" ref={panelRef}>
        <header className="dash-chamber-overlay-head">
          <div>
            <p className="dash-chamber-overlay-eyebrow">OPEN A CHAMBER</p>
            <h2 className="dash-chamber-overlay-title">NEW CONVERSATION</h2>
          </div>
          <button
            type="button"
            className="dash-chamber-overlay-close"
            onClick={onClose}
            aria-label="Close new conversation"
          >
            ✕
          </button>
        </header>

        <div className="dash-chamber-compose-types">
          <button
            type="button"
            className={`dash-chamber-compose-type ${type === 'PRIVATE' ? 'is-active' : ''}`}
            onClick={() => {
              setType('PRIVATE');
              setSelected([]);
              setError(null);
            }}
          >
            PRIVATE
          </button>
          {allTypes.map((t) => (
            <button
              key={t}
              type="button"
              className={`dash-chamber-compose-type ${type === t ? 'is-active' : ''}`}
              onClick={() => {
                setType(t);
                setSelected([]);
                setError(null);
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <p className="dash-chamber-compose-blurb">{TYPE_BLURBS[type]}</p>

        {isGroup ? (
          <div className="dash-chamber-compose-field">
            <label className="dash-chamber-compose-label" htmlFor="dash-compose-title">
              CHAMBER TITLE
            </label>
            <input
              id="dash-compose-title"
              className="dash-chamber-compose-input"
              value={title}
              maxLength={80}
              placeholder="e.g. THE GHANA PREFECTURE CHAMBER"
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
        ) : null}

        {isGroup ? (
          <div className="dash-chamber-compose-field">
            <label className="dash-chamber-compose-label" htmlFor="dash-compose-desc">
              PURPOSE <span className="dash-chamber-compose-optional">OPTIONAL</span>
            </label>
            <input
              id="dash-compose-desc"
              className="dash-chamber-compose-input"
              value={description}
              maxLength={200}
              placeholder="What this chamber is for"
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        ) : null}

        <div className="dash-chamber-compose-field">
          <label className="dash-chamber-compose-label" htmlFor="dash-compose-search">
            {type === 'PRIVATE' ? 'CHOOSE YOUR CORRESPONDENT' : 'INVITE MEMBERS'}
          </label>
          <input
            id="dash-compose-search"
            className="dash-chamber-compose-input dash-chamber-compose-search"
            type="search"
            value={query}
            placeholder="SEARCH THE BROTHERHOOD"
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
          />
        </div>

        {selected.length > 0 ? (
          <div className="dash-chamber-compose-picks">
            {selected.map((member) => (
              <span key={member.memberId} className="dash-chamber-compose-pick">
                <span className="dash-chamber-compose-pick-initials">{member.initials}</span>
                <span className="dash-chamber-compose-pick-name">{member.displayName}</span>
                <button
                  type="button"
                  className="dash-chamber-compose-pick-remove"
                  onClick={() => togglePick(member)}
                  aria-label={`Remove ${member.displayName}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        ) : null}

        <div className="dash-chamber-compose-results">
          {results.length === 0 ? (
            <p className="dash-chamber-compose-none">NO MEMBERS FOUND</p>
          ) : (
            results.map((member) => {
              const picked = selected.some((m) => m.memberId === member.memberId);
              const already = !picked && existingIds.has(member.memberId);
              return (
                <button
                  key={member.memberId}
                  type="button"
                  className={`dash-chamber-compose-member ${picked ? 'is-picked' : ''}`}
                  onClick={() => (type === 'PRIVATE' ? pickPrivate(member) : togglePick(member))}
                  disabled={already && type === 'PRIVATE'}
                >
                  <span className="dash-chamber-directory-avatar">
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt="" loading="lazy" />
                    ) : (
                      member.initials
                    )}
                  </span>
                  <span className="dash-chamber-compose-member-copy">
                    <span className="dash-chamber-compose-member-name">{member.displayName}</span>
                    <span className="dash-chamber-compose-member-sub">
                      {member.memberId} · {member.country ?? '—'}
                      {already ? ' · ALREADY EXISTS' : ''}
                    </span>
                  </span>
                  <span className="dash-chamber-compose-member-check" aria-hidden="true">
                    {picked ? '✓' : ''}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {error ? <p className="dash-chamber-directory-error">{error}</p> : null}

        <footer className="dash-chamber-compose-foot">
          <button
            type="button"
            className="dash-chamber-button dash-chamber-compose-submit"
            onClick={() => void handleSubmit()}
            disabled={!canSubmit || submitting}
          >
            {submitting ? 'OPENING…' : primaryLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}