// ============================================================
// VEIL — Brotherhood Chamber · Server Service
// All database operations for the communication platform.
//
// SECURITY RULES:
//   • Every operation receives the authenticated memberId from the
//     verified session — never from a client request.
//   • A member can only read/send where a live ConversationMember
//     row exists (isRemoved = false).
//   • senderId is always derived from the session, never a body param.
//   • Moderated/deleted messages are withheld from ordinary readers.
//
// Server-only. Do NOT import from client components.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '../db';
import type { Member } from '../db';
import { memberInitials, memberPhotoPath } from '../member-name';
import type {
  ConversationSummary,
  ConversationType,
  MemberSummary,
  MemberDirectoryPage,
  MessageDto,
  MessagesPage,
  NotificationPage,
  UnreadSummary,
} from './types';

/** A member is considered "present" when active within this window. */
export const PRESENCE_WINDOW_MS = 5 * 60 * 1000;
/** Throttle lastActiveAt writes to at most once per interval. */
const ACTIVITY_WRITE_MS = 2 * 60 * 1000;
const MESSAGE_BODY_MAX = 4000;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

/** Distinguish expected client errors from server failures. */
export class ChamberError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

// --- Public photo availability (authorized photographs only) ---

const photoCache = new Map<string, boolean>();

function memberHasPhoto(memberId: string): boolean {
  const cached = photoCache.get(memberId);
  if (cached !== undefined) return cached;
  const safe = memberId.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const exists = fs.existsSync(
    path.join(process.cwd(), 'public', 'members', `${safe}.jpg`),
  );
  photoCache.set(memberId, exists);
  return exists;
}

// --- Presence ---

/** Lustrous activity tick: marks the member active using real database
 *  activity, throttled so presence never becomes a write-per-keystroke. */
export async function touchActivity(memberId: string): Promise<void> {
  if (!memberId) return;
  try {
    const row = await prisma.member.findUnique({
      where: { memberId },
      select: { lastActiveAt: true },
    });
    const last = row?.lastActiveAt?.getTime() ?? 0;
    if (Date.now() - last >= ACTIVITY_WRITE_MS) {
      await prisma.member.updateMany({
        where: { memberId },
        data: { lastActiveAt: new Date() },
      });
    }
  } catch {
    // Presence is cosmetic; never fail a communication request for it.
  }
}

// --- Mapping helpers ---

function toMemberSummary(member: {
  memberId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  fullName: string;
  country: string | null;
  status: string;
  role: string;
  lastActiveAt: Date | null;
}): MemberSummary {
  const present =
    member.lastActiveAt !== null &&
    Date.now() - member.lastActiveAt.getTime() < PRESENCE_WINDOW_MS;
  const summary: MemberSummary = {
    memberId: member.memberId,
    displayName: member.fullName,
    firstName: member.firstName,
    lastName: member.lastName,
    initials: memberInitials(member.firstName, member.middleName, member.lastName),
    status: member.status,
    role: member.role,
    present,
  };
  if (member.country) summary.country = member.country;
  if (memberHasPhoto(member.memberId)) summary.photoUrl = memberPhotoPath(member.memberId);
  return summary;
}

const memberSummarySelect = {
  memberId: true,
  firstName: true,
  middleName: true,
  lastName: true,
  fullName: true,
  country: true,
  status: true,
  role: true,
  lastActiveAt: true,
} as const;

type MemberSummaryRow = {
  memberId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  fullName: string;
  country: string | null;
  status: string;
  role: string;
  lastActiveAt: Date | null;
};

function isOwnedBy(memberRole: string | undefined | null, type: ConversationType): boolean {
  // OFFICIAL channels are read-only for ordinary members.
  if (type === 'OFFICIAL') return true;
  return false;
}

// --- Conversation listing -------------------------------------

export async function getConversationsForMember(
  memberId: string,
): Promise<ConversationSummary[]> {
  const memberships = await prisma.conversationMember.findMany({
    where: { memberId, isRemoved: false },
    select: {
      role: true,
      lastReadAt: true,
      conversation: {
        select: {
          id: true,
          type: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          members: {
            where: { isRemoved: false },
            select: {
              role: true,
              member: { select: memberSummarySelect },
            },
          },
        },
      },
    },
    orderBy: { conversation: { updatedAt: 'desc' } },
    take: 100,
  });

  const results: ConversationSummary[] = [];
  for (const ms of memberships) {
    const conversation = ms.conversation;
    const participants = conversation.members.map((m) => toMemberSummary(m.member));

    // Latest message (single query per conversation; acceptable while a
    // member's conversation count stays modest — see report).
    const lastMessage = await prisma.message.findFirst({
      where: { conversationId: conversation.id, status: 'NORMAL', deletedAt: null },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        body: true,
        createdAt: true,
        senderId: true,
        sender: { select: { firstName: true, lastName: true } },
      },
    });

    // Precise unread count: messages sent by others lacking a read row.
    const unreadCount = await prisma.message.count({
      where: {
        conversationId: conversation.id,
        senderId: { not: memberId },
        status: 'NORMAL',
        deletedAt: null,
        reads: { none: { memberId } },
      },
    });

    const readOnly = isOwnedBy(ms.role, conversation.type as ConversationType);
    results.push({
      id: conversation.id,
      type: conversation.type as ConversationSummary['type'],
      title: conversation.title,
      description: conversation.description,
      status: conversation.status as ConversationSummary['status'],
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
      displayTitle: displayTitleFor(conversation.type as ConversationType, ms.role, conversation.title, participants, memberId),
      lastReadAt: ms.lastReadAt ? ms.lastReadAt.toISOString() : null,
      lastMessage: lastMessage
        ? {
            id: lastMessage.id,
            body: lastMessage.body,
            createdAt: lastMessage.createdAt.toISOString(),
            senderId: lastMessage.senderId,
            senderName: lastMessage.sender ? `${lastMessage.sender.firstName} ${lastMessage.sender.lastName}` : lastMessage.senderId,
          }
        : null,
      unreadCount,
      memberCount: participants.length,
      myRole: (ms.role === 'OWNER' || ms.role === 'ADMIN' || ms.role === 'MEMBER'
        ? ms.role
        : 'MEMBER') as ConversationSummary['myRole'],
      participants,
      readOnly,
    });
  }

  return results;
}

export function displayTitleFor(
  type: string,
  myRole: string,
  title: string,
  participants: MemberSummary[],
  memberId: string,
): string {
  if (title?.trim()) return title;
  if (type === 'PRIVATE') {
    const other = participants.find((p) => p.memberId !== memberId);
    if (other) return other.displayName;
  }
  return type === 'PRIVATE' ? 'PRIVATE CONVERSATION' : title || 'UNNAMED CHAMBER';
}

// --- Conversation access --------------------------------------

/** Resolves a conversation the member belongs to, or null. */
export async function getConversationForMember(
  conversationId: string,
  memberId: string,
): Promise<{ conversationId: string; myRole: ConversationSummary['myRole']; lastReadAt: Date | null } | null> {
  const membership = await prisma.conversationMember.findFirst({
    where: { conversationId, memberId, isRemoved: false },
    select: { role: true, lastReadAt: true },
  });
  if (!membership) return null;
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { status: true },
  });
  if (!conversation || conversation.status !== 'ACTIVE') return null;
  return {
    conversationId: conversationId,
    myRole: (membership.role as ConversationSummary['myRole']) ?? 'MEMBER',
    lastReadAt: membership.lastReadAt,
  };
}

export async function getConversationDetail(
  conversationId: string,
  memberId: string,
): Promise<ConversationSummary | null> {
  const access = await getConversationForMember(conversationId, memberId);
  if (!access) return null;
  const list = await getConversationsForMember(memberId);
  return list.find((c) => c.id === conversationId) ?? null;
}

// --- Messages ------------------------------------------------

const messageDetailSelect = {
  id: true,
  conversationId: true,
  senderId: true,
  body: true,
  createdAt: true,
  updatedAt: true,
  replyToMessageId: true,
  status: true,
  sender: { select: { firstName: true, lastName: true, fullName: true, middleName: true } },
  replyTo: {
    select: { id: true, body: true, senderId: true, sender: { select: { firstName: true, lastName: true } } },
  },
  reads: { select: { memberId: true } },
} as const;

async function toMessageDto(row: {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  replyToMessageId: string | null;
  status: string;
  sender: {
    firstName: string;
    lastName: string;
    fullName: string;
    middleName: string | null;
  };
  replyTo: {
    id: string;
    body: string;
    senderId: string;
    sender: { firstName: string; lastName: string };
  } | null;
  reads: { memberId: string }[];
}, viewerMemberId: string): Promise<MessageDto> {
  const readBy = row.reads.map((r) => r.memberId);
  const senderName = row.sender.fullName || `${row.sender.firstName} ${row.sender.lastName}`;
  return {
    id: row.id,
    conversationId: row.conversationId,
    senderId: row.senderId,
    senderName,
    senderInitials: memberInitials(row.sender.firstName, row.sender.middleName, row.sender.lastName),
    senderPhotoUrl: memberHasPhoto(row.senderId) ? memberPhotoPath(row.senderId) : undefined,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    replyToMessageId: row.replyToMessageId,
    replyTo: row.replyTo
      ? {
          id: row.replyTo.id,
          body: row.replyTo.body,
          senderName: row.replyTo.sender
            ? `${row.replyTo.sender.firstName} ${row.replyTo.sender.lastName}`
            : row.replyTo.senderId,
        }
      : null,
    readByMe: readBy.includes(viewerMemberId),
    readBy,
    readByCount: readBy.length,
  };
}

function messageViewerWhere(conversationId: string): { conversationId: string; status: string; deletedAt: null } {
  return { conversationId, status: 'NORMAL', deletedAt: null };
}

export async function getMessagesPage(
  conversationId: string,
  memberId: string,
  opts: { before?: string | null; limit?: number },
): Promise<MessagesPage> {
  const access = await getConversationForMember(conversationId, memberId);
  if (!access) throw new ChamberError('Conversation not found or not authorized.', 404);

  const limit = Math.min(Math.max(opts.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  const base = messageViewerWhere(conversationId);
  let where: Record<string, unknown> = { ...base };

  if (opts.before) {
    const cursor = await prisma.message.findUnique({
      where: { id: opts.before },
      select: { id: true, createdAt: true, conversationId: true },
    });
    if (!cursor || cursor.conversationId !== conversationId) {
      throw new ChamberError('Invalid message cursor.', 400);
    }
    where = {
      ...base,
      OR: [
        { createdAt: { lt: cursor.createdAt } },
        { createdAt: cursor.createdAt, id: { lt: cursor.id } },
      ],
    };
  }

  const rows = await prisma.message.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    select: messageDetailSelect,
  });

  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  const ascending = pageRows.reverse();

  const messages: MessageDto[] = [];
  for (const row of ascending) {
    messages.push(await toMessageDto(row, memberId));
  }

  return {
    messages,
    hasMore,
    // The oldest id in this window; pass it as `before` to page older.
    nextCursor: hasMore ? ascending[0].id : null,
  };
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string,
  replyToMessageId?: string | null,
): Promise<MessageDto> {
  const access = await getConversationForMember(conversationId, senderId);
  if (!access) throw new ChamberError('Conversation not found or not authorized.', 404);

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { type: true, status: true },
  });
  if (!conversation || conversation.status !== 'ACTIVE') {
    throw new ChamberError('This conversation is closed.', 409);
  }

  // OFFICIAL channels are read-only for ordinary members.
  if (conversation.type === 'OFFICIAL' && access.myRole === 'MEMBER') {
    throw new ChamberError('This official channel is read-only.', 403);
  }

  const text = (body ?? '').trim();
  if (!text) throw new ChamberError('A message cannot be empty.', 400);
  if (text.length > MESSAGE_BODY_MAX) {
    throw new ChamberError(`Messages are limited to ${MESSAGE_BODY_MAX} characters.`, 400);
  }

  if (replyToMessageId) {
    const replyTarget = await prisma.message.findFirst({
      where: {
        id: replyToMessageId,
        conversationId,
        status: 'NORMAL',
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!replyTarget) throw new ChamberError('The message being replied to was not found.', 400);
  }

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.message.create({
      data: {
        conversationId,
        senderId,
        body: text,
        replyToMessageId: replyToMessageId ?? null,
      },
      select: messageDetailSelect,
    });

    await tx.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // The sender has effectively read up to their own send.
    await tx.conversationMember.update({
      where: { conversationId_memberId: { conversationId, memberId: senderId } },
      data: { lastReadAt: new Date() },
    });

    // Notification records for other members (presentation layer; the
    // source of truth for unread state remains the MessageRead tables).
    const recipients = await tx.conversationMember.findMany({
      where: { conversationId, isRemoved: false, memberId: { not: senderId }, mutedAt: null },
      select: { memberId: true },
    });
    const typeLabel =
      conversation.type === 'PRIVATE'
        ? 'NEW_PRIVATE_MESSAGE'
        : conversation.type === 'OFFICIAL'
          ? 'OFFICIAL_MESSAGE'
          : 'NEW_GROUP_MESSAGE';
    const preview = text.length > 120 ? `${text.slice(0, 120)}…` : text;
    // SQLite does not expose createMany; loop through recipients.
    for (const recipient of recipients) {
      await tx.notification.create({
        data: {
          memberId: recipient.memberId,
          type: typeLabel,
          body: `${senderId} · ${preview}`,
          conversationId,
          messageId: created.id,
        },
      });
    }

    return created;
  });

  return toMessageDto(message, senderId);
}

export async function markConversationRead(
  conversationId: string,
  memberId: string,
): Promise<{ marked: number }> {
  const access = await getConversationForMember(conversationId, memberId);
  if (!access) throw new ChamberError('Conversation not found or not authorized.', 404);

  const unread = await prisma.message.findMany({
    where: {
      conversationId,
      senderId: { not: memberId },
      status: 'NORMAL',
      deletedAt: null,
      reads: { none: { memberId } },
    },
    select: { id: true },
    take: 500,
  });

  let marked = 0;
  // SQLite (better-sqlite3) does not support createMany here; run a
  // bounded insert loop instead. Capped at 500 to keep it cheap.
  for (const message of unread) {
    await prisma.messageRead.upsert({
      where: { messageId_memberId: { messageId: message.id, memberId } },
      create: { messageId: message.id, memberId },
      update: {},
    });
    marked += 1;
  }

  await prisma.conversationMember.update({
    where: { conversationId_memberId: { conversationId, memberId } },
    data: { lastReadAt: new Date() },
  });

  return { marked };
}

// --- Conversation creation ------------------------------------

export async function findOrCreatePrivateConversation(
  authMemberId: string,
  targetMemberId: string,
): Promise<ConversationSummary> {
  const target = await requireDirectoryMember(targetMemberId);
  if (target.memberId === authMemberId) {
    throw new ChamberError('A member cannot hold a private conversation with themselves.', 400);
  }

  const existing = await prisma.conversation.findFirst({
    where: {
      type: 'PRIVATE',
      status: 'ACTIVE',
      members: {
        none: { isRemoved: true },
      },
      AND: [
        { members: { some: { memberId: authMemberId } } },
        { members: { some: { memberId: target.memberId } } },
      ],
    },
    select: { id: true },
  });

  if (existing) {
    const detail = await getConversationDetail(existing.id, authMemberId);
    if (detail) return detail;
  }

  const conversation = await prisma.$transaction(async (tx) => {
    const created = await tx.conversation.create({
      data: {
        type: 'PRIVATE',
        title: target.displayName,
        description: `Private correspondence with ${target.displayName}.`,
        createdBy: authMemberId,
        members: {
          create: [
            { memberId: authMemberId, role: 'OWNER' },
            { memberId: target.memberId, role: 'MEMBER' },
          ],
        },
      },
      select: { id: true },
    });
    await tx.conversationAudit.create({
      data: {
        conversationId: created.id,
        actorMemberId: authMemberId,
        event: 'CONVERSATION_CREATED',
        detail: `PRIVATE · ${target.memberId}`,
      },
    });
    return created;
  });

  const detail = await getConversationDetail(conversation.id, authMemberId);
  if (!detail) throw new ChamberError('The conversation could not be opened.', 500);
  return detail;
}

export const GROUP_TYPES: ConversationType[] = ['BROTHERHOOD', 'RESTRICTED', 'ASSEMBLY', 'OFFICIAL'];

export async function createGroupConversation(
  authMemberId: string,
  authRole: string,
  input: {
    type: ConversationType;
    title?: string;
    description?: string;
    memberIds?: string[];
  },
): Promise<ConversationSummary> {
  if (!GROUP_TYPES.includes(input.type)) {
    throw new ChamberError('Invalid conversation type.', 400);
  }

  // Organizational conversations require a recognized office. Ordinary
  // members may still open a BROTHERHOOD or RESTRICTED group chamber.
  const isOfficer = authRole !== 'MEMBER' && authRole !== 'CANDIDATE';
  if ((input.type === 'ASSEMBLY' || input.type === 'OFFICIAL') && !isOfficer) {
    throw new ChamberError(
      'Assembly groups and official channels can only be opened by authorized officers.',
      403,
    );
  }

  const title = (input.title ?? '').trim();
  const description = (input.description ?? '').trim() || undefined;
  if (!title) throw new ChamberError('A group conversation requires a title.', 400);

  const wanted = Array.from(
    new Set((input.memberIds ?? []).filter((id) => id && id !== authMemberId)),
  );
  if (wanted.length === 0) {
    throw new ChamberError('Add at least one other member to open the chamber.', 400);
  }
  if (wanted.length > 200) throw new ChamberError('Too many members.', 400);

  const members = await prisma.member.findMany({
    where: { memberId: { in: wanted }, status: 'ACTIVE' },
    select: { memberId: true },
  });
  const found = new Set(members.map((m) => m.memberId));
  const missing = wanted.filter((id) => !found.has(id));
  if (missing.length > 0) {
    throw new ChamberError(`Member not found or not active: ${missing.join(', ')}`, 400);
  }

  const conversation = await prisma.$transaction(async (tx) => {
    const created = await tx.conversation.create({
      data: {
        type: input.type,
        title,
        description,
        createdBy: authMemberId,
        members: {
          create: [
            { memberId: authMemberId, role: 'OWNER' },
            ...wanted.map((id) => ({ memberId: id, role: 'MEMBER' as const })),
          ],
        },
      },
      select: { id: true },
    });
    await tx.conversationAudit.create({
      data: {
        conversationId: created.id,
        actorMemberId: authMemberId,
        event: 'CONVERSATION_CREATED',
        detail: `${input.type} · ${wanted.length + 1} members`,
      },
    });
    return created;
  });

  const detail = await getConversationDetail(conversation.id, authMemberId);
  if (!detail) throw new ChamberError('The conversation could not be opened.', 500);
  return detail;
}

// --- Member directory ------------------------------------------

export async function getMemberCount(): Promise<number> {
  return prisma.member.count();
}

/** Case-insensitive, database-driven directory search. */
export async function searchMembers(
  query: string | null | undefined,
  opts: { limit?: number; excludeMemberId?: string },
): Promise<MemberDirectoryPage> {
  const limit = Math.min(Math.max(opts.limit ?? 30, 1), 200);
  const [total, rows] = await Promise.all([
    prisma.member.count(),
    searchRows(query, limit),
  ]);

  let members = rows
    .filter((m) => m.memberId !== opts.excludeMemberId)
    .map(toMemberSummary);

  if (opts.excludeMemberId) {
    // Belts-and-braces: keep the LIMIT honest after exclusion.
    members = members.slice(0, limit);
  }

  return { total, members };
}

async function searchRows(
  query: string | null | undefined,
  limit: number,
): Promise<MemberSummaryRow[]> {
  const q = (query ?? '').trim();
  if (!q) {
    const rows = await prisma.member.findMany({
      select: memberSummarySelect,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      take: limit,
    });
    return rows as unknown as MemberSummaryRow[];
  }

  const needle = `%${q.toLowerCase()}%`;
  const raw = await prisma.$queryRaw<MemberSummaryRow[]>`
    SELECT "memberId", "firstName", "middleName", "lastName", "fullName",
           "country", "status", "role", "lastActiveAt"
    FROM "Member"
    WHERE LOWER("memberId") LIKE ${needle}
       OR LOWER("fullName") LIKE ${needle}
       OR LOWER("firstName") LIKE ${needle}
       OR LOWER(COALESCE("middleName", '')) LIKE ${needle}
       OR LOWER("lastName") LIKE ${needle}
       OR LOWER(COALESCE("country", '')) LIKE ${needle}
    ORDER BY "lastName" COLLATE NOCASE ASC,
             "firstName" COLLATE NOCASE ASC,
             "memberId" COLLATE NOCASE ASC
    LIMIT ${limit}
  `;
  return raw;
}

async function requireDirectoryMember(memberId: string): Promise<MemberSummary> {
  const member = await prisma.member.findUnique({
    where: { memberId },
    select: memberSummarySelect,
  });
  if (!member) throw new ChamberError('Member not found.', 404);
  if (member.status !== 'ACTIVE') {
    throw new ChamberError('This member is not currently active.', 403);
  }
  return toMemberSummary(member);
}

// --- Unread & notifications ------------------------------------

export async function getUnreadSummary(memberId: string): Promise<UnreadSummary> {
  const unreadMessagesPromise = prisma.message.count({
    where: {
      senderId: { not: memberId },
      status: 'NORMAL',
      deletedAt: null,
      reads: { none: { memberId } },
      conversation: {
        status: 'ACTIVE',
        members: { some: { memberId, isRemoved: false } },
      },
    },
  });

  const membershipRows = await prisma.conversationMember.findMany({
    where: { memberId, isRemoved: false },
    select: {
      conversation: {
        select: {
          id: true,
          status: true,
          messages: {
            where: {
              senderId: { not: memberId },
              status: 'NORMAL',
              deletedAt: null,
              reads: { none: { memberId } },
            },
            select: { id: true },
            take: 1,
          },
        },
      },
    },
  });

  const unreadConversations = membershipRows.filter(
    (row) => row.conversation.status === 'ACTIVE' && row.conversation.messages.length > 0,
  ).length;
  const unreadMessages = await unreadMessagesPromise;

  return { unreadMessages, unreadConversations };
}

export async function getNotifications(memberId: string): Promise<NotificationPage> {
  const [unread, notifications] = await Promise.all([
    getUnreadSummary(memberId),
    prisma.notification.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: {
        id: true,
        type: true,
        body: true,
        conversationId: true,
        messageId: true,
        createdAt: true,
        readAt: true,
      },
    }),
  ]);

  return {
    unread,
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      body: n.body,
      conversationId: n.conversationId,
      messageId: n.messageId,
      createdAt: n.createdAt.toISOString(),
      readAt: n.readAt ? n.readAt.toISOString() : null,
    })),
  };
}

export async function markNotificationsRead(memberId: string): Promise<{ marked: number }> {
  const result = await prisma.notification.updateMany({
    where: { memberId, readAt: null },
    data: { readAt: new Date() },
  });
  return { marked: result.count };
}

// --- Moderation foundation -------------------------------------

export async function reportMessage(
  conversationId: string,
  messageId: string,
  reporterMemberId: string,
  reason: string,
): Promise<{ id: string; status: string }> {
  const access = await getConversationForMember(conversationId, reporterMemberId);
  if (!access) throw new ChamberError('Conversation not found or not authorized.', 404);

  const message = await prisma.message.findFirst({
    where: { id: messageId, conversationId },
    select: { id: true, senderId: true },
  });
  if (!message) throw new ChamberError('Message not found.', 404);

  const text = (reason ?? '').trim();
  if (!text) throw new ChamberError('A report requires a reason.', 400);

  const existing = await prisma.messageReport.findFirst({
    where: { messageId, reportedByMemberId: reporterMemberId, status: 'OPEN' },
    select: { id: true, status: true },
  });
  if (existing) return existing;

  return prisma.$transaction(async (tx) => {
    const report = await tx.messageReport.create({
      data: {
        messageId,
        reportedByMemberId: reporterMemberId,
        reason: text.slice(0, 500),
      },
      select: { id: true, status: true },
    });
    await tx.conversationAudit.create({
      data: {
        conversationId,
        actorMemberId: reporterMemberId,
        event: 'MESSAGE_REPORTED',
        detail: `message=${messageId}`,
      },
    });
    return report;
  });
}

export async function moderateMessage(
  conversationId: string,
  messageId: string,
  moderatorMemberId: string,
): Promise<{ id: string; status: string }> {
  const access = await getConversationForMember(conversationId, moderatorMemberId);
  if (!access) throw new ChamberError('Conversation not found or not authorized.', 404);
  if (access.myRole === 'MEMBER') {
    throw new ChamberError('Only conversation owners and administrators may moderate.', 403);
  }

  const message = await prisma.message.findFirst({
    where: { id: messageId, conversationId },
    select: { id: true },
  });
  if (!message) throw new ChamberError('Message not found.', 404);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.message.update({
      where: { id: messageId },
      data: { status: 'MODERATED', deletedAt: new Date() },
      select: { id: true, status: true },
    });
    await tx.conversationAudit.create({
      data: {
        conversationId,
        actorMemberId: moderatorMemberId,
        event: 'MESSAGE_MODERATED',
        detail: `message=${messageId}`,
      },
    });
    return updated;
  });
}

// --- Conversation membership administration --------------------

export async function addConversationMembers(
  conversationId: string,
  actorMemberId: string,
  addMemberIds: string[],
): Promise<{ added: number }> {
  const access = await getConversationForMember(conversationId, actorMemberId);
  if (!access) throw new ChamberError('Conversation not found or not authorized.', 404);
  if (access.myRole === 'MEMBER') {
    throw new ChamberError('Only conversation owners and administrators may add members.', 403);
  }

  const existing = await prisma.conversationMember.findMany({
    where: { conversationId },
    select: { memberId: true },
  });
  const already = new Set(existing.map((m) => m.memberId));

  const wanted = Array.from(new Set(addMemberIds.filter((id) => !already.has(id))));
  if (wanted.length === 0) return { added: 0 };

  const members = await prisma.member.findMany({
    where: { memberId: { in: wanted }, status: 'ACTIVE' },
    select: { memberId: true },
  });
  const missing = wanted.filter((id) => !members.some((m) => m.memberId === id));
  if (missing.length > 0) {
    throw new ChamberError(`Member not found or not active: ${missing.join(', ')}`, 400);
  }

  await prisma.$transaction(async (tx) => {
    for (const id of wanted) {
      await tx.conversationMember.upsert({
        where: { conversationId_memberId: { conversationId, memberId: id } },
        create: { conversationId, memberId: id, role: 'MEMBER' },
        update: { isRemoved: false },
      });
    }
    await tx.conversationAudit.create({
      data: {
        conversationId,
        actorMemberId,
        event: 'MEMBER_ADDED',
        detail: wanted.join(', '),
      },
    });
  });

  return { added: wanted.length };
}

export async function removeConversationMembers(
  conversationId: string,
  actorMemberId: string,
  removeMemberIds: string[],
): Promise<{ removed: number }> {
  const access = await getConversationForMember(conversationId, actorMemberId);
  if (!access) throw new ChamberError('Conversation not found or not authorized.', 404);

  // A member may always leave; owners/admins may restrict others.
  const canManage = access.myRole !== 'MEMBER';
  const others = removeMemberIds.filter((id) => id !== actorMemberId);
  if (!canManage && others.length > 0) {
    throw new ChamberError('Only conversation owners and administrators may restrict members.', 403);
  }
  if (removeMemberIds.length === 0) return { removed: 0 };

  await prisma.$transaction(async (tx) => {
    for (const id of removeMemberIds) {
      await tx.conversationMember.updateMany({
        where: { conversationId, memberId: id },
        data: { isRemoved: true },
      });
    }
    await tx.conversationAudit.create({
      data: {
        conversationId,
        actorMemberId,
        event: 'MEMBER_REMOVED',
        detail: removeMemberIds.join(', '),
      },
    });
  });

  return { removed: removeMemberIds.length };
}

// --- Session helper for routes ---------------------------------

import type { SessionPayload } from '../auth/session-crypto';

export function requesterMemberId(session: SessionPayload | null): string | null {
  return session?.user?.memberId ?? null;
}

export function requesterRole(session: SessionPayload | null): string | null {
  return session?.user?.role ?? null;
}

// Re-exported so route handlers can type Member selectively.
export type { Member };
export { MESSAGE_BODY_MAX, DEFAULT_LIMIT, MAX_LIMIT };