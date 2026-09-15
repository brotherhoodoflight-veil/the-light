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

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from '../../../../lib/auth/session-provider';
import type {
  ConversationSummary,
  ConversationType,
  MemberSummary,
  MessageDto,
  UnreadSummary,
} from '../../../../lib/messages/types';
import { chamberFetch, formatListTime } from '../utils';
import ChamberList from './ChamberList';
import ChamberThread from './ChamberThread';
import ChamberDirectory from './ChamberDirectory';
import NewConversation from './NewConversation';

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
interface UnreadResponse {
  unread: UnreadSummary;
}

export default function BrotherhoodChamber() {
  const { user } = useSession();
  const memberId = user?.memberId;

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationLoaded, setConversationLoaded] = useState(false);

  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [unread, setUnread] = useState<UnreadSummary | null>(null);

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

  const activeConvo = conversations.find((c) => c.id === activeId) ?? null;

  const loadedActiveRef = useRef<string | null>(null);
  const messagesRef = useRef<MessageDto[]>([]);
  messagesRef.current = messages;
  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;

  const showBanner = useCallback((message: string | null) => {
    setBanner(message);
  }, []);

  // ---- Conversation list + directory count -------------------

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
      const [directory, unreadData] = await Promise.all([
        chamberFetch<{ total: number }>('/api/messages/directory?limit=1'),
        chamberFetch<UnreadResponse>('/api/messages/notifications'),
      ]);
      setMemberCount(directory.total);
      setUnread(unreadData.unread);
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

  const conversationTypeLabels: Record<ConversationType, string> = {
    PRIVATE: 'PRIVATE',
    BROTHERHOOD: 'BROTHERHOOD',
    ASSEMBLY: 'ASSEMBLY',
    OFFICIAL: 'OFFICIAL',
    RESTRICTED: 'RESTRICTED',
  };

  const leftColumn = (
    <aside className="dash-chamber-list-pane" aria-label="Conversations">
      <section className="dash-chamber-directory" aria-label="Brotherhood directory summary">
        <div className="dash-chamber-directory-head">
          <p className="dash-chamber-directory-label">BROTHERHOOD MEMBERS</p>
          <p className="dash-chamber-directory-total">
            {memberCount === null ? '—' : memberCount.toLocaleString()}{' '}
            <span className="dash-chamber-directory-unit">MEMBERS</span>
          </p>
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
          currentMemberId={memberId ?? ''}
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
          currentMemberId={memberId ?? ''}
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
              Choose a conversation from the left, or open a new private
              correspondence with a Brother.
            </p>
          </div>
        </div>
      )}
    </section>
  );

  return (
    <div className={`dash-chamber ${activeId ? 'is-thread-open' : ''}`}>
      <header className="dash-chamber-header">
        <div className="dash-chamber-header-copy">
          <p className="dash-chamber-header-eyebrow">THE BROTHERHOOD CHAMBER</p>
          <h1 className="dash-chamber-header-title">MESSAGES · PRIVATE COMMUNICATION</h1>
        </div>
        <div className="dash-chamber-header-side">
          {unread && unread.unreadConversations > 0 ? (
            <span className="dash-chamber-unread-chip" title="Unread across your conversations">
              <span className="dash-chamber-unread-dot" aria-hidden="true" />
              NEW · {unread.unreadConversations}
            </span>
          ) : null}
          <span className="dash-chamber-header-seal" aria-hidden="true">
            ◈
          </span>
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

      <div className="dash-chamber-body">
        {leftColumn}
        {rightColumn}
      </div>

      {directoryOpen ? (
        <ChamberDirectory
          currentMemberId={memberId ?? ''}
          onClose={() => setDirectoryOpen(false)}
          onMessage={startPrivateConversation}
        />
      ) : null}

      {composerOpen ? (
        <NewConversation
          currentMemberId={memberId ?? ''}
          existingIds={new Set(conversations.map((c) => c.id))}
          onClose={() => setComposerOpen(false)}
          onCreate={handleCreatedConversation}
        />
      ) : null}
    </div>
  );
}