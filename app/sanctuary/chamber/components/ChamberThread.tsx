"use client";

// ============================================================
// VEIL — Brotherhood Chamber · Active Conversation Thread
// Message history (paged), day bars, unread divider, read
// receipts, reply architecture, and the composer.
// ============================================================

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type {
  ConversationSummary,
  MessageDto,
} from '../../../../lib/messages/types';
import { firstWord, formatClock, formatDayLabel } from '../utils';

interface ChamberThreadProps {
  conversation: ConversationSummary;
  messages: MessageDto[];
  loading: boolean;
  hasMore: boolean;
  loadingOlder: boolean;
  busySending: boolean;
  replyTarget: MessageDto | null;
  currentMemberId: string;
  onLoadOlder: () => void;
  onSend: (body: string) => Promise<boolean>;
  onCancelReply: () => void;
  onReply: (message: MessageDto) => void;
  onReport: (message: MessageDto) => void;
  onBack?: () => void;
}

function participantNames(conversation: ConversationSummary, selfId: string): string {
  const others = conversation.participants.filter((p) => p.memberId !== selfId);
  if (conversation.type === 'PRIVATE') {
    const other = others[0];
    return other ? `${other.displayName} · ${other.memberId}` : 'PRIVATE CONVERSATION';
  }
  if (others.length === 0) return `${conversation.memberCount} MEMBER${conversation.memberCount === 1 ? '' : 'S'}`;
  const names = others.slice(0, 3).map((m) => m.displayName);
  const rest = others.length - names.length;
  return `${names.join(', ')}${rest > 0 ? ` + ${rest}` : ''}`;
}

export default function ChamberThread({
  conversation,
  messages,
  loading,
  hasMore,
  loadingOlder,
  busySending,
  replyTarget,
  currentMemberId,
  onLoadOlder,
  onSend,
  onCancelReply,
  onReply,
  onReport,
  onBack,
}: ChamberThreadProps) {
  const [draft, setDraft] = useState('');
  const [menuMessage, setMenuMessage] = useState<MessageDto | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);
  const [scrollLocked, setScrollLocked] = useState(true);

  // Unread divider position — captured when the thread mounts.
  const unreadFrom = useMemo(() => {
    if (!conversation.lastReadAt) return null;
    return new Date(conversation.lastReadAt).getTime();
  }, [conversation.id, conversation.lastReadAt]);

  // Initial load: scroll to the unread divider / bottom.
  useEffect(() => {
    if (!loading && scrollRef.current) {
      if (unreadFrom) {
        const target = scrollRef.current.querySelector('[data-unread-divider]');
        if (target) {
          target.scrollIntoView({ block: 'start' });
          setScrollLocked(false);
          return;
        }
      }
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setScrollLocked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Follow the bottom while the panel is scrolled at the bottom.
  useEffect(() => {
    const node = scrollRef.current;
    if (!node || !scrollLocked) return;
    const last = messages[messages.length - 1];
    if (last && messages.length !== lastCountRef.current) {
      requestAnimationFrame(() => {
        node.scrollTop = node.scrollHeight;
      });
    }
    lastCountRef.current = messages.length;
  }, [messages, scrollLocked]);

  const self = conversation.participants.find((p) => p.memberId === currentMemberId);

  function handleScroll(): void {
    const node = scrollRef.current;
    if (!node) return;
    const atBottom = node.scrollHeight - node.scrollTop - node.clientHeight < 48;
    setScrollLocked(atBottom);
  }

  async function handleSend(): Promise<void> {
    const text = draft.trim();
    if (!text || busySending) return;
    const ok = await onSend(text);
    if (ok) {
      setDraft('');
      setScrollLocked(true);
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      });
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  // Group messages into day runs.
  const dayRuns = useMemo(() => {
    const runs: { label: string; messages: MessageDto[] }[] = [];
    for (const message of messages) {
      const label = formatDayLabel(message.createdAt);
      const tail = runs[runs.length - 1];
      if (tail && tail.label === label) tail.messages.push(message);
      else runs.push({ label, messages: [message] });
    }
    return runs;
  }, [messages]);

  const presentOthers = conversation.participants.filter(
    (p) => p.memberId !== currentMemberId && p.present,
  );

  if (!self) return null;

  return (
    <div className="dash-chamber-thread">
      <header className="dash-chamber-thread-head">
        {onBack ? (
          <button
            type="button"
            className="dash-chamber-back"
            onClick={onBack}
            aria-label="Back to conversation list"
          >
            ←
          </button>
        ) : null}
        <div className="dash-chamber-thread-titleblock">
          <span className="dash-chamber-thread-glyph" aria-hidden="true">
            ◈
          </span>
          <span className="dash-chamber-thread-title">
            {conversation.displayTitle}
          </span>
          <span className="dash-chamber-thread-meta">
            {conversation.type} CHAMBER
            {conversation.readOnly ? ' · READ ONLY' : ''} ·{' '}
            {participantNames(conversation, currentMemberId)}
          </span>
        </div>
        <div className="dash-chamber-thread-presence">
          {presentOthers.length > 0 ? (
            <span className="dash-chamber-thread-presence-text">
              <span className="dash-chamber-thread-presence-dot" aria-hidden="true" />
              PRESENT {presentOthers.map((p) => firstWord(p.displayName)).join(', ')}
            </span>
          ) : null}
          <span className="dash-chamber-thread-membercount">
            {conversation.memberCount} MEMBER{conversation.memberCount === 1 ? '' : 'S'}
          </span>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="dash-chamber-thread-scroll"
        onScroll={handleScroll}
        aria-live="polite"
      >
        {hasMore ? (
          <div className="dash-chamber-loadold">
            <button
              type="button"
              className="dash-chamber-loadold-button"
              onClick={onLoadOlder}
              disabled={loadingOlder}
            >
              {loadingOlder ? 'GATHERING…' : 'LOAD OLDER MESSAGES'}
            </button>
          </div>
        ) : null}

        {messages.length === 0 && !loading ? (
          <div className="dash-chamber-thread-empty-inline">
            <span className="dash-chamber-thread-empty-glyph" aria-hidden="true">
              ◇
            </span>
            <p className="dash-chamber-thread-empty-label">NO MESSAGES</p>
            <p className="dash-chamber-thread-empty-desc">The chamber is silent.</p>
          </div>
        ) : null}

        {dayRuns.map((run) => (
          <div className="dash-chamber-day" key={run.label}>
            <div className="dash-chamber-day-bar">
              <span className="dash-chamber-day-label">{run.label}</span>
            </div>

            {run.messages.map((message, index) => {
              const isOwn = message.senderId === currentMemberId;
              const runsFromMe = isOwn
                ? index === 0 || run.messages[index - 1].senderId !== currentMemberId
                : null;
              const isUnreadDividerHere =
                unreadFrom !== null &&
                new Date(message.createdAt).getTime() >= unreadFrom &&
                !isOwn &&
                (index === 0 ||
                  (run.messages[index - 1].senderId === currentMemberId &&
                    new Date(run.messages[index - 1].createdAt).getTime() < unreadFrom));
              const showUnreadDivider =
                unreadFrom !== null && isUnreadDividerHere;
              const sender = conversation.participants.find((p) => p.memberId === message.senderId);

              return (
                <div key={message.id} className="dash-chamber-msgwrap">
                  {showUnreadDivider ? (
                    <div className="dash-chamber-unread" data-unread-divider>
                      <span className="dash-chamber-unread-line" aria-hidden="true" />
                      <span className="dash-chamber-unread-label">UNREAD MESSAGES</span>
                      <span className="dash-chamber-unread-line" aria-hidden="true" />
                    </div>
                  ) : null}

                  <div
                    className={`dash-chamber-msg ${isOwn ? 'is-own' : 'is-other'}`}
                  >
                    {!isOwn ? (
                      <span className="dash-chamber-msg-avatar">
                        {message.senderPhotoUrl ? (
                          <img src={message.senderPhotoUrl} alt="" loading="lazy" />
                        ) : (
                          message.senderInitials
                        )}
                      </span>
                    ) : null}

                    <div className="dash-chamber-msg-body">
                      {!isOwn && conversation.type !== 'PRIVATE' ? (
                        <span className="dash-chamber-msg-sender">
                          {message.senderName}
                        </span>
                      ) : null}

                      <div
                        className="dash-chamber-msg-bubble"
                        title={`${message.senderName} · ${new Date(message.createdAt).toLocaleString()}`}
                      >
                        {message.replyTo ? (
                          <div className="dash-chamber-msg-replyto">
                            <span className="dash-chamber-msg-replyto-name">
                              {message.replyTo.senderName}
                            </span>
                            <span className="dash-chamber-msg-replyto-text">
                              {message.replyTo.body}
                            </span>
                          </div>
                        ) : null}
                        <span className="dash-chamber-msg-text">{message.body}</span>
                      </div>

                      <span className="dash-chamber-msg-meta">
                        <span className="dash-chamber-msg-time">
                          {formatClock(message.createdAt)}
                        </span>
                        {isOwn ? (
                          message.readByCount > 0 ? (
                            <span className="dash-chamber-msg-read">
                              {conversation.type === 'PRIVATE'
                                ? 'READ'
                                : `SEEN BY ${message.readByCount}`}
                            </span>
                          ) : (
                            <span className="dash-chamber-msg-read is-pending">
                              DELIVERED
                            </span>
                          )
                        ) : null}
                      </span>

                      <div className="dash-chamber-msg-actions">
                        <button
                          type="button"
                          onClick={() => onReply(message)}
                          className="dash-chamber-msg-action"
                        >
                          REPLY
                        </button>
                        <button
                          type="button"
                          onClick={() => setMenuMessage(message)}
                          className="dash-chamber-msg-action"
                          aria-label="More options"
                        >
                          …
                        </button>
                      </div>
                    </div>
                  </div>

                  {runsFromMe === true ? (
                    <div className="dash-chamber-msg-run" aria-hidden="true" />
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {menuMessage ? (
        <div
          className="dash-chamber-msgmenu"
          role="menu"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            className="dash-chamber-msgmenu-item"
            onClick={() => {
              onReply(menuMessage);
              setMenuMessage(null);
            }}
          >
            REPLY
          </button>
          <button
            type="button"
            role="menuitem"
            className="dash-chamber-msgmenu-item is-danger"
            onClick={() => {
              onReport(menuMessage);
              setMenuMessage(null);
            }}
          >
            REPORT TO THE STEWARDS
          </button>
        </div>
      ) : null}

      <footer className="dash-chamber-composer">
        {conversation.readOnly ? (
          <div className="dash-chamber-readonly">
            <span className="dash-chamber-readonly-glyph" aria-hidden="true">
              ◈
            </span>
            <p className="dash-chamber-readonly-label">THIS OFFICIAL CHANNEL IS READ-ONLY</p>
            <p className="dash-chamber-readonly-desc">
              Authorized announcements only. Replies are directed to the stewards.
            </p>
          </div>
        ) : (
          <>
            {replyTarget ? (
              <div className="dash-chamber-replybar">
                <span className="dash-chamber-replybar-glyph" aria-hidden="true">
                  ↩
                </span>
                <span className="dash-chamber-replybar-copy">
                  <span className="dash-chamber-replybar-name">
                    REPLYING TO {replyTarget.senderName.toUpperCase()}
                  </span>
                  <span className="dash-chamber-replybar-text">{replyTarget.body}</span>
                </span>
                <button
                  type="button"
                  className="dash-chamber-replybar-cancel"
                  onClick={onCancelReply}
                  aria-label="Cancel reply"
                >
                  ✕
                </button>
              </div>
            ) : null}
            <div className="dash-chamber-composer-row">
              <textarea
                className="dash-chamber-composer-input"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write a message…"
                rows={1}
                aria-label="Write a message"
              />
              <button
                type="button"
                className="dash-chamber-composer-send"
                onClick={() => void handleSend()}
                disabled={busySending || !draft.trim()}
              >
                {busySending ? '…' : 'SEND'}
              </button>
            </div>
          </>
        )}
      </footer>
    </div>
  );
}