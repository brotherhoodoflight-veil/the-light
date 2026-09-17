"use client";

// ============================================================
// VEIL — Brotherhood Chamber · Conversation List
// The left pane: directory summary (already in the pane header),
// a conversation search, and the member's conversations with
// preview, timestamp, type, and unread badge.
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import type { ConversationSummary, ConversationType } from '../../../../lib/messages/types';
import { formatListTime, firstWord } from '../utils';

interface ChamberListProps {
  conversations: ConversationSummary[];
  activeId: string | null;
  loaded: boolean;
  unreadConversations: number;
  currentMemberId: string;
  typeLabels: Record<ConversationType, string>;
  onSelect: (conversationId: string) => void;
  onLoaded: () => void;
  onCreate: () => void;
}

export default function ChamberList({
  conversations,
  activeId,
  loaded,
  unreadConversations,
  currentMemberId,
  typeLabels,
  onSelect,
  onLoaded,
  onCreate,
}: ChamberListProps) {
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (conversations.length > 0 && !loaded) onLoaded();
  }, [conversations, loaded, onLoaded]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.displayTitle.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.participants.some((p) =>
          p.displayName.toLowerCase().includes(q),
        ),
    );
  }, [conversations, search]);

  return (
    <>
      <div className="dash-chamber-search">
        <input
          className="dash-chamber-search-input"
          type="search"
          placeholder="SEARCH CONVERSATIONS"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search conversations"
        />
      </div>

      <div className="dash-chamber-conv-actions">
        <button type="button" className="dash-chamber-new-button" onClick={onCreate}>
          <span aria-hidden="true">＋</span> NEW CONVERSATION
        </button>
        {unreadConversations > 0 ? (
          <span className="dash-chamber-new-unread">{unreadConversations} UNREAD</span>
        ) : null}
      </div>

      {conversations.length === 0 ? (
        <div className="dash-chamber-empty">
          <span className="dash-chamber-empty-glyph" aria-hidden="true">
            ◇
          </span>
          <p className="dash-chamber-empty-label">NO CONVERSATIONS</p>
          <p className="dash-chamber-empty-desc">
            Your Brotherhood conversations will appear here when communication begins.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="dash-chamber-empty">
          <span className="dash-chamber-empty-glyph" aria-hidden="true">
            ◇
          </span>
          <p className="dash-chamber-empty-label">NO CONVERSATIONS FOUND</p>
          <p className="dash-chamber-empty-desc">No conversations match that search.</p>
        </div>
      ) : (
        <ul className="dash-chamber-conv-list" aria-label="Conversation list">
          {filtered.map((conversation) => {
            const active = conversation.id === activeId;
            const isPrivate = conversation.type === 'PRIVATE';
            const other = isPrivate
              ? conversation.participants.find((p) => p.memberId !== currentMemberId) ?? null
              : null;
            const present = isPrivate ? other?.present : false;
            return (
              <li key={conversation.id}>
                <button
                  type="button"
                  className={`dash-chamber-conv ${active ? 'is-active' : ''}`}
                  onClick={() => onSelect(conversation.id)}
                  aria-current={active ? 'true' : undefined}
                >
                  <span className="dash-chamber-conv-avatar">
                    <span className="dash-chamber-conv-avatar-inner">
                      {conversation.participants[0]?.photoUrl ? (
                        <img
                          src={conversation.participants[0].photoUrl}
                          alt=""
                          loading="lazy"
                        />
                      ) : (
                        conversation.participants[0]?.initials ?? '◈'
                      )}
                    </span>
                    {present ? (
                      <span className="dash-chamber-conv-presence" aria-label="Present" />
                    ) : null}
                  </span>

                  <span className="dash-chamber-conv-main">
                    <span className="dash-chamber-conv-row">
                      <span className="dash-chamber-conv-name">
                        {conversation.displayTitle}
                      </span>
                      <span className="dash-chamber-conv-time">
                        {conversation.lastMessage
                          ? formatListTime(conversation.lastMessage.createdAt)
                          : ''}
                      </span>
                    </span>
                    <span className="dash-chamber-conv-row">
                      <span className="dash-chamber-conv-preview">
                        {conversation.lastMessage
                          ? `${firstWord(conversation.lastMessage.senderName) === firstWord(conversation.displayTitle) ? '' : `${conversation.lastMessage.senderName}: `}${conversation.lastMessage.body}`
                          : 'No messages yet'}
                      </span>
                      <span className="dash-chamber-conv-meta">
                        <span className="dash-chamber-conv-type">{typeLabels[conversation.type]}</span>
                        {conversation.unreadCount > 0 ? (
                          <span className="dash-chamber-conv-badge">
                            {conversation.unreadCount}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}