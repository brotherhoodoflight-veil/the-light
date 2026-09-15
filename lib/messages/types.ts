// ============================================================
// VEIL — Brotherhood Chamber · Shared Types
// Structural DTOs used by both the server API and the Chamber
// client. No server-only imports — safe for client components.
// ============================================================

export type ConversationType =
  | 'PRIVATE'
  | 'BROTHERHOOD'
  | 'ASSEMBLY'
  | 'OFFICIAL'
  | 'RESTRICTED';

export type ConversationStatus = 'ACTIVE' | 'ARCHIVED';
export type ConversationRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type MessageStatus = 'NORMAL' | 'MODERATED' | 'REMOVED';

/** Public directory identity. Never includes email, phone, address,
 *  authentication data, or administrative detail. */
export interface MemberSummary {
  memberId: string;
  displayName: string;
  firstName: string;
  lastName: string;
  initials: string;
  country?: string;
  status: string;
  role: string;
  /** Only present when an authorized membership photograph exists. */
  photoUrl?: string;
  /** True when the member was active within the presence window
   *  (derived from real database activity signals). */
  present: boolean;
}

export interface ReplyPreview {
  id: string;
  body: string;
  senderName: string;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  senderPhotoUrl?: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  replyToMessageId: string | null;
  replyTo: ReplyPreview | null;
  /** True when the current viewer has read this message. */
  readByMe: boolean;
  /** Read receipt digest: memberIds who have read this message. */
  readBy: string[];
  readByCount: number;
}

export interface ConversationLastMessage {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  senderName: string;
}

export interface ConversationSummary {
  id: string;
  type: ConversationType;
  title: string;
  description?: string | null;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  /** Display title as shown to the requesting member. For private
   *  conversations this is the other member's identity. */
  displayTitle: string;
  /** When the requesting member last read this conversation
   *  (drives the unread divider). */
  lastReadAt: string | null;
  lastMessage: ConversationLastMessage | null;
  unreadCount: number;
  memberCount: number;
  myRole: ConversationRole;
  participants: MemberSummary[];
  /** True when this conversation may not be written to by everyone
   *  (OFFICIAL channels are read-only for ordinary members). */
  readOnly: boolean;
}

export interface ConversationDetail extends ConversationSummary {}

export interface MessagesPage {
  messages: MessageDto[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface MemberDirectoryPage {
  total: number;
  members: MemberSummary[];
}

export interface UnreadSummary {
  /** Total unread messages across all of the member's conversations. */
  unreadMessages: number;
  /** Number of conversations containing at least one unread message. */
  unreadConversations: number;
}

export interface NotificationDto {
  id: string;
  type: string;
  body: string;
  conversationId: string | null;
  messageId: string | null;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationPage {
  unread: UnreadSummary;
  notifications: NotificationDto[];
}

export interface CreateConversationInput {
  type: ConversationType;
  title?: string;
  description?: string;
  memberIds?: string[];
}