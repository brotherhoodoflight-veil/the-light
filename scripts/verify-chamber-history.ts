// ============================================================
// VEIL — Chamber History Verification
// Asserts that the historical Chamber records (2019-2025) are
// complete, consistent, and fully exclude BOL-1385. Also checks
// the member registry totals and idempotent seeding invariants.
// Exits non-zero on any failure.
// ============================================================

import 'dotenv/config';
import { PrismaClient } from '../lib/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import {
  CHAMBER_SEEDS,
  conversationIdFor,
  resolveSeed,
  EXCLUDED_MEMBER_ID,
  MIN_HISTORICAL_DATE,
  MAX_HISTORICAL_DATE,
} from './generate-chamber-history';

const sqliteUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
const adapter = new PrismaBetterSqlite3({ url: sqliteUrl });
const prisma = new PrismaClient({ adapter });

const EXPECTED_TOTAL = 2387;

let failCount = 0;

function expect(ok: boolean, label: string, detail = ''): void {
  if (ok) console.log(`  PASS  ${label}${detail ? ` — ${detail}` : ''}`);
  else {
    failCount += 1;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

async function main(): Promise<void> {
  // 1. Member registry integrity
  const total = await prisma.member.count();
  expect(total === EXPECTED_TOTAL, `TOTAL MEMBERS = ${EXPECTED_TOTAL}`, `actual=${total}`);

  const bol = await prisma.member.findUnique({ where: { memberId: EXCLUDED_MEMBER_ID } });
  expect(!!bol, 'BOL-1385 exists');
  expect(bol?.status === 'ACTIVE', 'BOL-1385 remains ACTIVE');
  expect(bol?.membershipType === 'LIFE MEMBER', 'BOL-1385 remains LIFE MEMBER');
  expect(bol?.role === 'MEMBER', 'BOL-1385 remains MEMBER');
  expect(bol?.country === 'Ghana', 'BOL-1385 remains Ghana');

  const authCount = await prisma.authAccount.count();
  expect(authCount === 1, 'AuthAccount rows unchanged (1)', `actual=${authCount}`);

  // 2. Historical conversations and messages match the seeds exactly
  const seeds = CHAMBER_SEEDS;
  const expectedMessages = seeds.reduce((sum, seed) => sum + seed.msgs.length, 0);
  const expectedConversations = seeds.length;

  const totalConversations = await prisma.conversation.count({
    where: { id: { startsWith: 'veil-h-' } },
  });
  const totalMessages = await prisma.message.count();
  expect(
    totalConversations === expectedConversations,
    `HISTORICAL CONVERSATIONS = ${expectedConversations}`,
    `actual=${totalConversations}`,
  );
  expect(
    totalMessages === expectedMessages,
    `HISTORICAL MESSAGES = ${expectedMessages}`,
    `actual=${totalMessages}`,
  );

  const allowedConversationTypes = new Set(['PRIVATE', 'BROTHERHOOD', 'ASSEMBLY', 'OFFICIAL', 'RESTRICTED']);
  const allowedStatuses = new Set(['ACTIVE', 'ARCHIVED']);
  const allowedRoles = new Set(['OWNER', 'ADMIN', 'MEMBER']);

  let seedChecks = 0;
  for (const seed of seeds) {
    const resolved = await resolveSeed(seed, prisma);
    const conversation = await prisma.conversation.findUnique({
      where: { id: resolved.conversationId },
      select: {
        id: true,
        type: true,
        title: true,
        status: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
        members: {
          where: { isRemoved: false },
          select: { memberId: true, role: true, lastReadAt: true, isRemoved: true },
        },
        messages: {
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            senderId: true,
            body: true,
            type: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            replyToMessageId: true,
          },
        },
        auditLogs: { select: { event: true } },
      },
    });
    expect(!!conversation, `conversation exists: ${resolved.conversationId}`);
    if (!conversation) continue;

    expect(allowedConversationTypes.has(conversation.type), `${seed.key} uses supported type`, conversation.type);
    expect(allowedStatuses.has(conversation.status), `${seed.key} supported status`, conversation.status);
    expect(conversation.createdBy !== EXCLUDED_MEMBER_ID, `${seed.key} createdBy is not BOL-1385`);

    // createdAt / updatedAt within the historical window
    const createdOk = conversation.createdAt >= MIN_HISTORICAL_DATE && conversation.createdAt <= MAX_HISTORICAL_DATE;
    const updatedOk = conversation.updatedAt >= MIN_HISTORICAL_DATE && conversation.updatedAt <= MAX_HISTORICAL_DATE;
    expect(createdOk, `${seed.key} conversation createdAt in window`, conversation.createdAt.toISOString());
    expect(updatedOk, `${seed.key} conversation updatedAt in window`, conversation.updatedAt.toISOString());

    const participantIds = resolved.participants.map((p) => p.memberId);
    const memberIds = conversation.members.map((m) => m.memberId);
    const sameSet =
      memberIds.length === participantIds.length &&
      participantIds.every((id) => memberIds.includes(id)) &&
      memberIds.every((id) => participantIds.includes(id));
    expect(sameSet, `${seed.key} participant set matches the seed`, `${memberIds.length} members`);
    expect(!memberIds.includes(EXCLUDED_MEMBER_ID), `${seed.key} no BOL-1385 participant`);

    // Roles
    const memberById = new Map(conversation.members.map((m) => [m.memberId, m]));
    const roleOk = resolved.participants.every((p, slot) => {
      const expectedRole = slot === seed.createdBy ? 'OWNER' : seed.adminSlots?.includes(slot) ? 'ADMIN' : 'MEMBER';
      return memberById.get(p.memberId)?.role === expectedRole;
    });
    expect(roleOk, `${seed.key} member roles match the seed`, `createdBy=owner`);
    expect(conversation.members.every((m) => allowedRoles.has(m.role)), `${seed.key} roles are supported`);
    expect(conversation.members.every((m) => m.lastReadAt !== null), `${seed.key} every member has a lastReadAt`);

    // Messages
    const msgCountOk = conversation.messages.length === seed.msgs.length;
    expect(msgCountOk, `${seed.key} message count matches`, `${conversation.messages.length}/${seed.msgs.length}`);
    if (!msgCountOk) continue;
    seedChecks += 1;

    const messageIdsMatch = conversation.messages.every((m, i) => m.id === resolved.messages[i].id);
    expect(messageIdsMatch, `${seed.key} message ids are deterministic`);
    const sendersOk = conversation.messages.every((m) => memberIds.includes(m.senderId) && m.senderId !== EXCLUDED_MEMBER_ID);
    expect(sendersOk, `${seed.key} every sender is a participating member, none is BOL-1385`);
    const sendersMatchSeed = conversation.messages.every((m, i) => m.senderId === resolved.messages[i].senderId);
    expect(sendersMatchSeed, `${seed.key} senders match the seed`);
    const bodiesOk = conversation.messages.every((m) => typeof m.body === 'string' && m.body.trim().length > 20);
    expect(bodiesOk, `${seed.key} message bodies are present and substantial`);
    const typesOk = conversation.messages.every((m) => m.type === 'TEXT' && m.status === 'NORMAL');
    expect(typesOk, `${seed.key} messages are TEXT/NORMAL`);
    const windowOk = conversation.messages.every(
      (m) => m.createdAt >= MIN_HISTORICAL_DATE && m.createdAt <= MAX_HISTORICAL_DATE,
    );
    expect(windowOk, `${seed.key} all message dates within 2019-2025`);

    // Reply pointers are internal and reference earlier messages
    const idToIndex = new Map(conversation.messages.map((m, i) => [m.id, i]));
    const repliesOk = conversation.messages.every(
      (m, i) =>
        m.replyToMessageId === null ||
        (idToIndex.has(m.replyToMessageId) && idToIndex.get(m.replyToMessageId)! < i),
    );
    expect(repliesOk, `${seed.key} replyTo pointers are internal and ordered`);

    // Audit trail
    expect(
      conversation.auditLogs.some((a) => a.event === 'CONVERSATION_CREATED'),
      `${seed.key} has a CONVERSATION_CREATED audit record`,
    );
    if (seed.status === 'ARCHIVED') {
      expect(
        conversation.auditLogs.some((a) => a.event === 'CONVERSATION_ARCHIVED'),
        `${seed.key} archived with a CONVERSATION_ARCHIVED record`,
      );
    }
    for (const add of seed.auditAdds ?? []) {
      expect(
        conversation.auditLogs.some((a) => a.event === 'MEMBER_ADDED'),
        `${seed.key} records the later member addition`,
      );
    }

    // Read receipts: only participants; unread member left with unread messages
    const reads = await prisma.messageRead.findMany({
      where: { message: { conversationId: conversation.id } },
      select: { memberId: true },
    });
    const readMembers = new Set(reads.map((r) => r.memberId));
    expect(
      [...readMembers].every((id) => memberIds.includes(id)),
      `${seed.key} read receipts only for participants`,
    );
    if (seed.unreadBy !== undefined && seed.unreadAfter !== undefined) {
      const unreadMember = resolved.participants[seed.unreadBy].memberId;
      const joinedMinutes = resolved.participants[seed.unreadBy].joinedMinutes;
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conversation.id,
          senderId: { not: unreadMember },
          reads: { none: { memberId: unreadMember } },
        },
      });
      const expectedUnread = seed.msgs.filter(
        (m, i) => m.by !== seed.unreadBy && (m.min < joinedMinutes || i >= (seed.unreadAfter ?? Infinity)),
      ).length;
      expect(unreadCount === expectedUnread, `${seed.key} unread state matches the seed`, `unread=${unreadCount}`);
    }
  }
  expect(seedChecks === seeds.length, 'all seed conversations fully verified');

  // 3. BOL-1385 appears nowhere in any Chamber entity
  const memberTables: { label: string; count: Promise<number> }[] = [
    { label: 'Conversation.createdBy', count: prisma.conversation.count({ where: { createdBy: EXCLUDED_MEMBER_ID } }) },
    { label: 'ConversationMember.memberId', count: prisma.conversationMember.count({ where: { memberId: EXCLUDED_MEMBER_ID } }) },
    { label: 'Message.senderId', count: prisma.message.count({ where: { senderId: EXCLUDED_MEMBER_ID } }) },
    { label: 'MessageRead.memberId', count: prisma.messageRead.count({ where: { memberId: EXCLUDED_MEMBER_ID } }) },
    { label: 'ConversationAudit.actorMemberId', count: prisma.conversationAudit.count({ where: { actorMemberId: EXCLUDED_MEMBER_ID } }) },
    { label: 'Notification.memberId', count: prisma.notification.count({ where: { memberId: EXCLUDED_MEMBER_ID } }) },
  ];
  let excludedAnywhere = 0;
  for (const item of memberTables) {
    const count = await item.count;
    excludedAnywhere += count;
    if (count === 0) console.log(`  PASS  no BOL-1385 in ${item.label}`);
    else {
      failCount += 1;
      console.log(`  FAIL  BOL-1385 found in ${item.label}: ${count}`);
    }
  }
  expect(excludedAnywhere === 0, 'BOL-1385 is absent from every Chamber entity');

  // 4. Every participant is an existing ACTIVE member
  const actorCounts = await prisma.conversationMember.count({
    where: { member: { status: { not: 'ACTIVE' } } },
  });
  expect(actorCounts === 0, 'every historical participant is an ACTIVE member', `non-active=${actorCounts}`);

  // 5. Date range summary
  const [minDate, maxDate] = await Promise.all([
    prisma.message.aggregate({ _min: { createdAt: true } }),
    prisma.message.aggregate({ _max: { createdAt: true } }),
  ]);
  if (minDate._min.createdAt && maxDate._max.createdAt) {
    console.log(
      `  INFO  message date range: ${minDate._min.createdAt.toISOString()} -> ${maxDate._max.createdAt.toISOString()}`,
    );
  }

  // 6. Country spread of participants
  const countries = await prisma.conversationMember.findMany({
    where: { isRemoved: false },
    distinct: ['memberId'],
    select: { member: { select: { country: true } } },
  });
  const spread = new Map<string, number>();
  for (const c of countries) {
    const name = c.member.country;
    spread.set(name, (spread.get(name) ?? 0) + 1);
  }
  const top = [...spread.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log(`  INFO  participant countries: ${spread.size}`);
  console.log(`  INFO  most represented: ${top.map(([c, n]) => `${c}=${n}`).join(', ')}`);

  await prisma.$disconnect();

  console.log('');
  if (failCount === 0) {
    console.log('[verify-chamber-history] RESULT  ALL CHECKS PASSED');
  } else {
    console.log(`[verify-chamber-history] RESULT  ${failCount} FAILURES`);
    process.exit(1);
  }
}

main()
  .catch(async (error) => {
    console.error('[verify-chamber-history] failed:', error instanceof Error ? error.stack ?? error.message : error);
    await prisma.$disconnect().catch(() => undefined);
    process.exit(1);
  });