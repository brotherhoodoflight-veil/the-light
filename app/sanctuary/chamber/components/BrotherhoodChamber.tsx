"use client";

// ============================================================
// VEIL — THE BROTHERHOOD CHAMBER
// MESSAGES · PRIVATE COMMUNICATION
//
// The real member communication platform. All data is pulled
// from the authenticated API — nothing is fabricated locally.
// Polling-based refresh keeps the interface alive without fake
// real-time; the database is the single source of truth.
// ============================================================

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useSession } from '../../../../lib/auth/session-provider';
import type {
  ConversationSummary,
  ConversationType,
  MemberSummary,
  MessageDto,
  NotificationDto,
  NotificationPage,
  UnreadSummary,
} from '../../../../lib/messages/types';
import { chamberFetch, formatAgo, type ChamberMemberInfo } from '../utils';
import VeilEmblem from '../../../../components/portal/VeilEmblem';
import ChamberList from './ChamberList';
import ChamberThread from './ChamberThread';
import ChamberDirectory from './ChamberDirectory';
import NewConversation from './NewConversation';
import ChamberContextPanel from './ChamberContextPanel';

const CONVERSATIONS_POLL_MS = 8000;
const THREAD_POLL_MS = 4000;

interface ConversationListResponse {
  conversations: ConversationSummary[];
}
interface MessagesResponse {
  messages: MessageDto[];
  hasMore: boolean;
  nextCursor: string | null;
}

function Glyph({ kind }: { kind: 'chamber' | 'members' | 'knowledge' | 'calendar' | 'files' | 'settings' }) {
  const shapes: Record<string, ReactNode> = {
    chamber: (
      <>
        <path d="M9 2.5l6.5 6.5L9 15.5 2.5 9z" />
        <circle cx="9" cy="9" r="2" />
      </>
    ),
    members: (
      <>
        <circle cx="6" cy="6.5" r="2.6" />
        <circle cx="12" cy="6.5" r="2.6" />
        <path d="M2.5 15c.6-2.8 2-4.2 3.5-4.2S9 12.2 9.5 15" />
        <path d="M8.5 15c.5-2.8 2-4.2 3.5-4.2s2.9 1.4 3.5 4.2" />
      </>
    ),
    knowledge: (
      <>
        <path d="M3 4.5c2.5 0 5 1 6 2.2 1-1.2 3.5-2.2 6-2.2v9c-2.5 0-5 1-6 2.2-1-1.2-3.5-2.2-6-2.2z" />
        <path d="M9 6.7v9" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4.5" width="12" height="11" rx="1" />
        <path d="M3 8h12" />
        <path d="M6 2.5v3M12 2.5v3" />
      </>
    ),
    files: (
      <>
        <path d="M3 5.5c3 0 5.5-2.5 7.5-2.5 1.5 0 2.5 1 3 2 .5 1 1 1 2 1v8c-3.5 0-6.5 1-8 2.5-.9.9-2 1.5-3.5 1.5L3 5.5z" />
        <path d="M3 5.5c0-2 1.5-3 3.5-3 1.5 0 2.5 1 2.5 2" />
      </>
    ),
    settings: (
      <>
        <circle cx="9" cy="9" r="2.6" />
        <path d="M9 2.5v2M9 13.5v2M2.5 9h2M13.5 9h2M4.4 4.4l1.4 1.4M12.2 12.2l1.4 1.4M13.6 4.4l-1.4 1.4M5.8 12.2l-1.4 1.4" />
      </>
    ),
  };
  return (
    <span className="cc-nav-glyph" aria-hidden="true">
      <svg viewBox="0 0 18 18" fill="none">
        {shapes[kind]}
      </svg>
    </span>
  );
}

export default function BrotherhoodChamber({ member }: { member: ChamberMemberInfo }) {
  const { user, logout } = useSession();
  const memberId = user?.memberId ?? member.memberId;

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationLoaded, setConversationLoaded] = useState(false);

  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [unread, setUnread] = useState<UnreadSummary | null>(null);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [threadHasMore, setThreadHasMore] = useState(false);
  const [threadLoadingOlder, setThreadLoadingOlder] = useState(false);
  const [threadLoading, setThreadLoading] = useState(false);

  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);

  const [banner, setBanner] = useState<string | null>(null);
  const [busySending, setBusySending] = useState(false);
  const [replyTarget, setReplyTarget] = useState<MessageDto | null>(null);

  const [noticesOpen, setNoticesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const activeConvo = conversations.find((c) => c.id === activeId) ?? null;

  const loadedActiveRef = useRef<string | null>(null);
  const messagesRef = useRef<MessageDto[]>([]);
  messagesRef.current = messages;
  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;

  const showBanner = useCallback((message: string | null) => {
    setBanner(message);
  }, []);

  // ---- Conversation list + directory count + notices ----------

  const loadConversations = useCallback(async () => {
    if (!memberId) return;
    try {
      const data = await chamberFetch<ConversationListResponse>(
        '/api/messages/conversations',
      );
      setConversations(data.conversations);
    } catch (error) {
      // Silent refresh failures; surfaced only on open.
      void error;
    }
  }, [memberId]);

  const loadOverview = useCallback(async () => {
    if (!memberId) return;
    await loadConversations();
    try {
      const [directory, page] = await Promise.all([
        chamberFetch<{ total: number }>('/api/messages/directory?limit=1'),
        chamberFetch<NotificationPage>('/api/messages/notifications'),
      ]);
      setMemberCount(directory.total);
      setUnread(page.unread);
      setNotifications(page.notifications);
    } catch {
      // Non-critical.
    }
  }, [memberId, loadConversations]);

  useEffect(() => {
    if (!memberId) return;
    void loadOverview();
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      void loadConversations();
    }, CONVERSATIONS_POLL_MS);
    return () => window.clearInterval(interval);
  }, [memberId, loadOverview, loadConversations]);

  // ---- Thread loading ----------------------------------------

  const openConversation = useCallback(
    async (conversationId: string) => {
      setActiveId(conversationId);
      setReplyTarget(null);
      setThreadLoading(true);
      setBanner(null);
      try {
        const page = await chamberFetch<MessagesResponse>(
          `/api/messages/conversations/${conversationId}/messages?limit=50`,
        );
        setMessages(page.messages);
        setThreadHasMore(page.hasMore);
        loadedActiveRef.current = conversationId;
        // The server records the read position; refresh unread totals.
        await chamberFetch(`/api/messages/conversations/${conversationId}/read`, {
          method: 'POST',
        });
        setUnread((prev) =>
          prev ? { unreadMessages: 0, unreadConversations: 0 } : prev,
        );
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c,
          ),
        );
      } catch (error) {
        setBanner(error instanceof Error ? error.message : 'The chamber could not be opened.');
        setActiveId(null);
      } finally {
        setThreadLoading(false);
      }
    },
    [],
  );

  const loadOlder = useCallback(async () => {
    if (!activeId || messagesRef.current.length === 0) return;
    const oldest = messagesRef.current[0];
    setThreadLoadingOlder(true);
    try {
      const page = await chamberFetch<MessagesResponse>(
        `/api/messages/conversations/${activeId}/messages?limit=50&cursor=${oldest.id}`,
      );
      setMessages((prev) => [...page.messages, ...prev]);
      setThreadHasMore(page.hasMore);
    } catch (error) {
      showBanner(error instanceof Error ? error.message : 'Older messages could not be loaded.');
    } finally {
      setThreadLoadingOlder(false);
    }
  }, [activeId, showBanner]);

  // Poll the open thread for new/updated messages.
  useEffect(() => {
    if (!activeId) return;
    const poll = async () => {
      if (document.visibilityState === 'hidden') return;
      try {
        const page = await chamberFetch<MessagesResponse>(
          `/api/messages/conversations/${activeId}/messages?limit=50`,
        );
        setMessages((prev) => {
          const existing = new Map(prev.map((m) => [m.id, m]));
          const newestAt =
            prev.length > 0 ? new Date(prev[prev.length - 1].createdAt).getTime() : 0;
          let appended = false;
          for (const message of page.messages) {
            const prior = existing.get(message.id);
            if (prior) {
              // Live read-receipt/status refresh.
              if (prior.readByCount !== message.readByCount || prior.readByMe !== message.readByMe) {
                existing.set(message.id, message);
              }
              continue;
            }
            if (new Date(message.createdAt).getTime() > newestAt) {
              existing.set(message.id, message);
              appended = true;
            }
          }
          if (!appended) return prev;
          const next = Array.from(existing.values()).sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
          return next;
        });
        void chamberFetch(`/api/messages/conversations/${activeId}/read`, {
          method: 'POST',
        }).catch(() => undefined);
      } catch {
        // Transient; the next poll will retry.
      }
    };
    const interval = window.setInterval(poll, THREAD_POLL_MS);
    return () => window.clearInterval(interval);
  }, [activeId]);

  // ---- Send --------------------------------------------------

  const sendMessage = useCallback(
    async (body: string) => {
      if (!activeId || !body.trim()) return false;
      setBusySending(true);
      try {
        const response = await chamberFetch<{ message: MessageDto }>(
          `/api/messages/conversations/${activeId}/messages`,
          {
            method: 'POST',
            body: JSON.stringify({
              body: body.trim(),
              replyToMessageId: replyTarget?.id ?? null,
            }),
          },
        );
        setMessages((prev) => [...prev, response.message]);
        setReplyTarget(null);
        void loadConversations();
        return true;
      } catch (error) {
        showBanner(error instanceof Error ? error.message : 'The message could not be sent.');
        return false;
      } finally {
        setBusySending(false);
      }
    },
    [activeId, replyTarget, showBanner, loadConversations],
  );

  // ---- Reply / report ----------------------------------------

  const beginReply = useCallback((message: MessageDto) => {
    setReplyTarget(message);
  }, []);

  const reportMessage = useCallback(
    async (message: MessageDto) => {
      if (!activeId) return;
      const reason = window.prompt('State the reason this message is being reported:');
      if (!reason) return;
      try {
        await chamberFetch(
          `/api/messages/conversations/${activeId}/messages/${message.id}/report`,
          { method: 'POST', body: JSON.stringify({ reason }) },
        );
        showBanner('The message has been reported to the chamber stewards.');
      } catch (error) {
        showBanner(error instanceof Error ? error.message : 'The report could not be filed.');
      }
    },
    [activeId, showBanner],
  );

  // ---- Conversation creation ---------------------------------

  const handleCreatedConversation = useCallback((conversation: ConversationSummary) => {
    setComposerOpen(false);
    setDirectoryOpen(false);
    setConversations((prev) => {
      const without = prev.filter((c) => c.id !== conversation.id);
      return [conversation, ...without];
    });
    void openConversation(conversation.id);
  }, [openConversation]);

  const startPrivateConversation = useCallback(
    async (target: MemberSummary) => {
      setDirectoryOpen(false);
      try {
        const response = await chamberFetch<{ conversation: ConversationSummary }>(
          '/api/messages/conversations',
          {
            method: 'POST',
            body: JSON.stringify({ type: 'PRIVATE', memberIds: [target.memberId] }),
          },
        );
        handleCreatedConversation(response.conversation);
      } catch (error) {
        showBanner(error instanceof Error ? error.message : 'The private conversation could not be opened.');
      }
    },
    [handleCreatedConversation, showBanner],
  );

  const canOpenDirectory = memberId !== undefined;

  // ---- Notices (chamber notifications) ------------------------

  const markAllNoticesRead = useCallback(async () => {
    try {
      await chamberFetch<{ marked: number }>('/api/messages/notifications/read', {
        method: 'POST',
      });
      setNotifications((prev) =>
        prev.map((n) => (n.readAt ? n : { ...n, readAt: new Date().toISOString() })),
      );
    } catch {
      // Best-effort; the unread summary still reflects real message state.
    }
  }, []);

  const toggleNotices = useCallback(() => {
    setNoticesOpen((prev) => {
      const next = !prev;
      if (next) void markAllNoticesRead();
      return next;
    });
  }, [markAllNoticesRead]);

  const openNotice = useCallback(
    async (notification: NotificationDto) => {
      setNoticesOpen(false);
      if (notification.conversationId) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, readAt: new Date().toISOString() } : n,
          ),
        );
        await openConversation(notification.conversationId);
      }
    },
    [openConversation],
  );

  // Close popovers when the user interacts elsewhere.
  const noticesRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onGlobalClick(event: MouseEvent) {
      const target = event.target as Node;
      if (noticesRef.current && !noticesRef.current.contains(target)) {
        setNoticesOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onGlobalClick);
    return () => document.removeEventListener('mousedown', onGlobalClick);
  }, []);

  const conversationTypeLabels: Record<ConversationType, string> = {
    PRIVATE: 'PRIVATE',
    BROTHERHOOD: 'BROTHERHOOD',
    ASSEMBLY: 'ASSEMBLY',
    OFFICIAL: 'OFFICIAL',
    RESTRICTED: 'RESTRICTED',
  };

  const unreadNotices = notifications.filter((n) => !n.readAt).length;

  // ---- Columns ------------------------------------------------

  const navRail = (
    <nav className="cc-nav" aria-label="Chamber sections">
      <div className="cc-nav-seal" aria-hidden="true">
        <span className="cc-nav-seal-glyph">
          <span>◈</span>
        </span>
      </div>

      <div className="cc-nav-list">
        <button
          type="button"
          className="cc-nav-item is-active"
          aria-current="true"
          onClick={() => setActiveId(null)}
        >
          <Glyph kind="chamber" />
          <span className="cc-nav-label">CHAMBER</span>
        </button>

        <button
          type="button"
          className="cc-nav-item"
          onClick={() => canOpenDirectory && setDirectoryOpen(true)}
          disabled={!canOpenDirectory}
        >
          <Glyph kind="members" />
          <span className="cc-nav-label">MEMBERS</span>
        </button>

        <Link href="/sanctuary/teachings" className="cc-nav-item">
          <Glyph kind="knowledge" />
          <span className="cc-nav-label">KNOWLEDGE</span>
        </Link>

        <Link href="/sanctuary/convocations" className="cc-nav-item">
          <Glyph kind="calendar" />
          <span className="cc-nav-label">CALENDAR</span>
        </Link>

        <span className="cc-nav-item is-sealed" title="SEALED">
          <Glyph kind="files" />
          <span className="cc-nav-label">FILES</span>
        </span>

        <span className="cc-nav-item is-sealed" title="SEALED">
          <Glyph kind="settings" />
          <span className="cc-nav-label">SETTINGS</span>
        </span>
      </div>

      <div className="cc-nav-foot">THE SANCTUARY · PRIVATE</div>
    </nav>
  );

  const leftColumn = (
    <aside className="dash-chamber-list-pane" aria-label="Conversations">
      <section className="dash-chamber-directory" aria-label="Brotherhood directory summary">
        <div className="dash-chamber-directory-head">
          <p className="dash-chamber-directory-label">BROTHERHOOD MEMBERS</p>
          <p className="dash-chamber-directory-total">
            {memberCount === null ? '—' : memberCount.toLocaleString()}{' '}
            <span className="dash-chamber-directory-unit">MEMBERS</span>
          </p>
        </div>
        <div className="dash-chamber-directory-actions">
          <button
            type="button"
            className="dash-chamber-button"
            onClick={() => canOpenDirectory && setDirectoryOpen(true)}
            disabled={!canOpenDirectory}
          >
            SEARCH THE BROTHERHOOD
          </button>
        </div>
      </section>

      <div className="dash-chamber-list-scope">
        <ChamberList
          conversations={conversations}
          activeId={activeId}
          onSelect={openConversation}
          typeLabels={conversationTypeLabels}
          loaded={conversationLoaded}
          onLoaded={() => setConversationLoaded(true)}
          unreadConversations={unread?.unreadConversations ?? 0}
          currentMemberId={memberId}
          onCreate={() => setComposerOpen(true)}
        />
      </div>
    </aside>
  );

  const rightColumn = (
    <section className="dash-chamber-thread-pane" aria-label="Active conversation">
      {activeConvo ? (
        <ChamberThread
          conversation={activeConvo}
          messages={messages}
          loading={threadLoading}
          hasMore={threadHasMore}
          loadingOlder={threadLoadingOlder}
          onLoadOlder={loadOlder}
          onSend={sendMessage}
          busySending={busySending}
          replyTarget={replyTarget}
          onCancelReply={() => setReplyTarget(null)}
          onReply={beginReply}
          onReport={reportMessage}
          currentMemberId={memberId}
          onBack={activeId ? () => setActiveId(null) : undefined}
        />
      ) : (
        <div className="dash-chamber-thread-empty">
          <div className="dash-chamber-thread-empty-card">
            <span className="dash-chamber-thread-empty-glyph" aria-hidden="true">
              ◈
            </span>
            <p className="dash-chamber-thread-empty-label">NO CONVERSATION OPEN</p>
            <p className="dash-chamber-thread-empty-desc">
              Choose a conversation from the register, or open a new private
              correspondence with a Brother.
            </p>
          </div>
        </div>
      )}
    </section>
  );

  return (
    <div className={`dash-chamber ${activeId ? 'is-thread-open' : ''}`}>
      {/* ── Chamber Threshold ── */}
      <header className="dash-chamber-header">
        <div className="dash-chamber-header-brand">
          <VeilEmblem className="cc-header-emblem" />
          <div className="dash-chamber-header-copy">
            <p className="dash-chamber-header-eyebrow">
              THE BROTHERHOOD OF LIGHT · PRIVATE COMMUNICATIONS
            </p>
            <div className="cc-header-titleline">
              <h1 className="dash-chamber-header-title">THE CHAMBER</h1>
              <p className="cc-header-subtitle">COMMUNICATION AS A SACRED ACT</p>
            </div>
          </div>
        </div>

        <div className="dash-chamber-header-side">
          <span className="cc-presence" title="You are present in the chamber">
            <span className="cc-presence-ember" aria-hidden="true" />
            PRESENT
          </span>

          {unread && unread.unreadConversations > 0 ? (
            <span className="dash-chamber-unread-chip" title="Unread across your conversations">
              <span className="dash-chamber-unread-dot" aria-hidden="true" />
              NEW · {unread.unreadConversations}
            </span>
          ) : null}

          <div className="cc-pop">
            <button
              type="button"
              className="cc-header-action"
              onClick={() => canOpenDirectory && setDirectoryOpen(true)}
              aria-label="Search the Brotherhood"
              title="SEARCH THE BROTHERHOOD"
            >
              <svg viewBox="0 0 18 18" fill="none">
                <circle cx="7.5" cy="7.5" r="4.5" />
                <path d="M11 11l4 4" />
              </svg>
            </button>
          </div>

          <div className="cc-pop" ref={noticesRef}>
            <button
              type="button"
              className="cc-header-action"
              onClick={toggleNotices}
              aria-label="Chamber notices"
              aria-expanded={noticesOpen}
              title="NOTICES"
            >
              <svg viewBox="0 0 18 18" fill="none">
                <path d="M9 2.8A3.2 3.2 0 0 0 5.8 6v3.1L4.6 12.6h8.8L12.2 9.1V6A3.2 3.2 0 0 0 9 2.8z" />
                <path d="M7 12.6c.2 1.2 1 1.9 2 1.9s1.8-.7 2-1.9" />
              </svg>
              {unreadNotices > 0 ? (
                <span className="cc-bell-count">{unreadNotices > 99 ? '99+' : unreadNotices}</span>
              ) : null}
            </button>

            {noticesOpen ? (
              <div className="cc-dropdown">
                <div className="cc-dropdown-head">
                  <p className="cc-dropdown-eyebrow">CHAMBER NOTICES</p>
                  <p className="cc-dropdown-eyebrow">{unread?.unreadMessages ?? 0} NEW</p>
                </div>
                <div className="cc-dropdown-scroll">
                  {notifications.length === 0 ? (
                    <div className="cc-dropdown-empty">THE CHAMBER IS QUIET.</div>
                  ) : (
                    notifications.map((notice) => (
                      <button
                        key={notice.id}
                        type="button"
                        className={notice.readAt ? 'cc-notice' : 'cc-notice is-new'}
                        onClick={() => void openNotice(notice)}
                      >
                        <span className="cc-notice-type">{notice.type}</span>
                        <span className="cc-notice-body">{notice.body}</span>
                        <span className="cc-notice-time">{formatAgo(notice.createdAt)}</span>
                      </button>
                    ))
                  )}
                </div>
                {notifications.length > 0 ? (
                  <button
                    type="button"
                    className="cc-dropdown-action"
                    onClick={() => void markAllNoticesRead()}
                  >
                    MARK ALL READ
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="cc-pop" ref={menuRef}>
            <button
              type="button"
              className="cc-member-control"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-label="Member menu"
            >
              <span className="cc-member-seal">
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt="" />
                ) : (
                  member.initials
                )}
              </span>
              <span className="cc-member-name">{member.fullName}</span>
            </button>

            {menuOpen ? (
              <div className="cc-menu">
                <div className="cc-menu-identity">
                  <p className="cc-menu-name">{member.fullName}</p>
                  <p className="cc-menu-sub">
                    {member.memberId}
                    {member.membershipType ? ` · ${member.membershipType.toUpperCase()}` : ''}
                  </p>
                </div>
                <Link href="/sanctuary/record" className="cc-menu-item" onClick={() => setMenuOpen(false)}>
                  MY RECORD
                </Link>
                <Link href="/sanctuary" className="cc-menu-item" onClick={() => setMenuOpen(false)}>
                  RETURN TO THE SANCTUARY
                </Link>
                <button type="button" className="cc-menu-item is-depart" onClick={() => void logout()}>
                  DEPART
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {banner ? (
        <div className="dash-chamber-banner" role="status">
          <span className="dash-chamber-banner-text">{banner}</span>
          <button
            type="button"
            className="dash-chamber-banner-close"
            onClick={() => setBanner(null)}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ) : null}

      <div className={`dash-chamber-body ${activeConvo ? 'has-context' : ''}`}>
        {navRail}
        {leftColumn}
        {rightColumn}
        {activeConvo ? (
          <ChamberContextPanel conversation={activeConvo} member={member} />
        ) : null}
      </div>

      {directoryOpen ? (
        <ChamberDirectory
          currentMemberId={memberId}
          onClose={() => setDirectoryOpen(false)}
          onMessage={startPrivateConversation}
        />
      ) : null}

      {composerOpen ? (
        <NewConversation
          currentMemberId={memberId}
          existingIds={new Set(conversations.map((c) => c.id))}
          onClose={() => setComposerOpen(false)}
          onCreate={handleCreatedConversation}
        />
      ) : null}
    </div>
  );
}