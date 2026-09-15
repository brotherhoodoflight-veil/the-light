// ============================================================
// VEIL — Brotherhood Chamber · End-to-End Verification
// Uses the real database and the real service layer. Creates a
// transient test member, exercises the core communication flows,
// then DELETES the test member and all its data so the database
// is left exactly as before — with only BOL-1385.
//
// Prints a numbered PASS/FAIL report. Exits non-zero on failure.
// ============================================================

import 'dotenv/config';
import { PrismaClient } from '../lib/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import {
  ChamberError,
  findOrCreatePrivateConversation,
  getConversationsForMember,
  getMemberCount,
  getMessagesPage,
  getUnreadSummary,
  markConversationRead,
  searchMembers,
  sendMessage,
  createGroupConversation,
  getConversationDetail,
} from '../lib/messages/chamber-service';

const sqliteUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
const adapter = new PrismaBetterSqlite3({ url: sqliteUrl });
const prisma = new PrismaClient({ adapter });

const SELF = 'BOL-1385';
const TEST = 'BOL-TEST-1';

let passCount = 0;
let failCount = 0;

function pass(test: string, detail = ''): void {
  passCount += 1;
  console.log(`  PASS  ${test}${detail ? ` — ${detail}` : ''}`);
}

function fail(test: string, detail: string): void {
  failCount += 1;
  console.log(`  FAIL  ${test} — ${detail}`);
}

function expect(ok: boolean, test: string, detail = ''): void {
  if (ok) pass(test, detail);
  else fail(test, detail);
}

async function main(): Promise<void> {
  const before = await prisma.member.count();
  console.log(`[verify] members before: ${before}`);

  // ---- Setup transient test member (mirrors seed shape) ----
  // Idempotent: remove any leftover from an interrupted previous run
  // (order-safe — capture and clear conversations before identity deletes).
  const priorConvs = await prisma.conversation.findMany({
    where: { OR: [{ createdBy: TEST }, { members: { some: { memberId: TEST } } }] },
    select: { id: true },
  });
  for (const conv of priorConvs) {
    await prisma.messageRead.deleteMany({ where: { message: { conversationId: conv.id } } });
    await prisma.notification.deleteMany({ where: { conversationId: conv.id } });
    await prisma.messageReport.deleteMany({ where: { message: { conversationId: conv.id } } });
    await prisma.message.deleteMany({ where: { conversationId: conv.id } });
    await prisma.conversationAudit.deleteMany({ where: { conversationId: conv.id } });
    await prisma.conversationMember.deleteMany({ where: { conversationId: conv.id } });
    await prisma.conversation.delete({ where: { id: conv.id } });
  }
  await prisma.authAccount.deleteMany({ where: { memberId: TEST } });
  await prisma.messageRead.deleteMany({ where: { memberId: TEST } });
  await prisma.messageReport.deleteMany({ where: { reportedByMemberId: TEST } });
  await prisma.conversationAudit.deleteMany({ where: { actorMemberId: TEST } });
  await prisma.message.deleteMany({ where: { senderId: TEST } });
  await prisma.conversationMember.deleteMany({ where: { memberId: TEST } });
  await prisma.conversation.deleteMany({ where: { createdBy: TEST } });
  await prisma.member.deleteMany({ where: { memberId: TEST } });

  await prisma.member.create({
    data: {
      memberId: TEST,
      firstName: 'Test',
      middleName: null,
      lastName: 'Brother',
      fullName: 'Test Brother',
      membershipType: 'MEMBER',
      status: 'ACTIVE',
      role: 'MEMBER',
      country: 'Ghana',
      authAccounts: {
        create: { username: TEST, passwordHash: 'argon2$placeholder-not-a-real-login' },
      },
    },
  });
  console.log('[verify] created ' + TEST);

  // Baseline of conversation ids that existed before this run. Only
  // conversations created DURING the run may be torn down afterwards —
  // this is robust even if a leftover from a crashed run has no member
  // rows left to match.
  const baselineConvIds = new Set(
    (await prisma.conversation.findMany({ select: { id: true } })).map((c) => c.id),
  );

  // ---- 1. Directory reflects the real count ----
  expect((await getMemberCount()) === before + 1, 'directory total reflects real DB count', `= ${before + 1}`);

  const search = await searchMembers('brother', { excludeMemberId: SELF });
  expect(
    search.members.some((m) => m.memberId === TEST),
    'directory search finds the test member',
    JSON.stringify(search.members.map((m) => m.memberId)),
  );
  expect(
    search.members.every((m) => m.memberId !== SELF),
    'directory search excludes the requester',
  );

  // ---- 2. Private conversation create + detail ----
  const first = await findOrCreatePrivateConversation(SELF, TEST);
  const membersP1 = first.participants.map((p) => p.memberId).sort();
  expect(
    membersP1.join(',') === [SELF, TEST].sort().join(','),
    'private conversation opened with both members',
    `participants=${membersP1.join(',')} displayTitle=${first.displayTitle}`,
  );
  expect(
    first.memberCount === 2 && first.type === 'PRIVATE',
    'private conversation shape correct',
  );

  const same = await findOrCreatePrivateConversation(SELF, TEST);
  expect(same.id === first.id, 're-opening a private conversation returns the same chamber', same.id);

  // ---- 3. Sending + reading ----
  const sent = await sendMessage(first.id, SELF, 'The first word in the chamber.', null);
  expect(sent.body === 'The first word in the chamber.', 'SELF can send to the private chamber');
  expect(sent.readByMe === false, 'a fresh message carries no read receipt yet',
    'sender sees DELIVERED until another member reads');

  const sentReply = await sendMessage(first.id, TEST, 'Well met, Brother.', sent.id);
  expect(sentReply.replyToMessageId === sent.id, 'reply chain records the parent message', `replyTo=${sentReply.replyTo?.senderName}`);

  const pageSelf = await getMessagesPage(first.id, SELF, { limit: 50 });
  expect(pageSelf.messages.length === 2, 'SELF page contains both messages');
  const replyByViewer = pageSelf.messages.find((m) => m.id === sentReply.id);
  expect(replyByViewer?.replyTo?.body === 'The first word in the chamber.', 'SELF sees the reply preview body');
  expect(replyByViewer?.readByMe === false, 'SELF has not yet read the reply');

  const unreadSelf = await getUnreadSummary(SELF);
  expect(unreadSelf.unreadMessages >= 1, 'unread summary counts the new message');

  const listBefore = await getConversationsForMember(SELF);
  expect(listBefore.some((c) => c.id === first.id), 'conversation appears in SELF list');
  expect(
    listBefore.find((c) => c.id === first.id)?.unreadCount !== null,
    'unread count present on the list item',
  );

  const marked = await markConversationRead(first.id, SELF);
  expect(marked.marked >= 1, 'mark-read processed', `marked=${marked.marked}`);
  const detailAfter = await getConversationDetail(first.id, SELF);
  expect(detailAfter?.lastReadAt !== null, 'lastReadAt recorded after mark-read');

  const pageAfter = await getMessagesPage(first.id, SELF, { limit: 50 });
  const replyRead = pageAfter.messages.find((m) => m.id === sentReply.id);
  expect(replyRead?.readByMe === true, 'reply now read by SELF after mark-read');
  expect(
    replyRead?.readBy?.includes(SELF) === true && (replyRead?.readByCount ?? 0) >= 1,
    'read receipts record the reader (sender excluded until they read elsewhere)',
    `readBy=${replyRead?.readBy.join(',')}`,
  );

  // ---- 4. Paging ----
  await sendMessage(first.id, TEST, 'Older word.');
  await sendMessage(first.id, SELF, 'Oldest word.');
  const pageFirst = await getMessagesPage(first.id, SELF, { limit: 2 });
  expect(pageFirst.messages.length === 2 && pageFirst.hasMore, 'paged fetch returns limited window with hasMore');
  const pageOlder = await getMessagesPage(first.id, SELF, { limit: 2, before: pageFirst.nextCursor });
  expect(pageOlder.messages[0].body === 'The first word in the chamber.', 'older window loads via cursor', pageOlder.messages[0].body);

  // ---- 5. Group conversations ----
  const group = await createGroupConversation(SELF, 'MEMBER', {
    type: 'BROTHERHOOD',
    title: 'VERIFY HERALD',
    description: 'Temporary verification chamber.',
    memberIds: [TEST],
  });
  expect(group.type === 'BROTHERHOOD' && group.memberCount === 2, 'MEMBER can open a BROTHERHOOD group');

  let officialRejected = false;
  try {
    await createGroupConversation(SELF, 'MEMBER', {
      type: 'OFFICIAL',
      title: 'FORBIDDEN',
      memberIds: [TEST],
    });
  } catch (error) {
    officialRejected = error instanceof ChamberError && error.status === 403;
  }
  expect(officialRejected, 'ordinary MEMBER is refused an OFFICIAL channel (403)');

  await sendMessage(group.id, TEST, 'A word in the group chamber.', null);
  const groupReadOnly = await getConversationDetail(group.id, SELF);
  expect(groupReadOnly?.readOnly === false, 'BROTHERHOOD group is not read-only');

  // ---- 6. Self-referential and missing-target guards ----
  let selfRejected = false;
  try {
    await findOrCreatePrivateConversation(SELF, SELF);
  } catch (error) {
    selfRejected = error instanceof ChamberError && error.status === 400;
  }
  expect(selfRejected, 'a member cannot open a private conversation with themselves');

  let ghostRejected = false;
  try {
    await findOrCreatePrivateConversation(SELF, 'BOL-NOPE-0');
  } catch (error) {
    ghostRejected = error instanceof ChamberError && error.status === 404;
  }
  expect(ghostRejected, 'a private conversation with an unknown member is refused (404)');

  // ---- 7. Unauthorized access to a chamber ----
  let unauthorized = false;
  try {
    await getMessagesPage(first.id, TEST, { limit: 10 }); // TEST IS allowed
    await getMessagesPage(group.id, 'BOL-UNKNOWN', { limit: 10 });
  } catch (error) {
    unauthorized = error instanceof ChamberError && error.status === 404;
  }
  expect(unauthorized, 'a non-member cannot read a chamber (404)');

  // ---- Cleanup ----
  // Order-safe teardown: capture run-created conversation ids (plus any
  // touching the test member) and clear them, then strip identity rows,
  // then the member.
  const allConversations = await prisma.conversation.findMany({ select: { id: true } });
  const convs = allConversations.filter(
    (conv) =>
      !baselineConvIds.has(conv.id) ||
      conv.id === first.id ||
      conv.id === group.id,
  );
  for (const conv of convs) {
    await prisma.messageRead.deleteMany({ where: { message: { conversationId: conv.id } } });
    await prisma.notification.deleteMany({ where: { conversationId: conv.id } });
    await prisma.messageReport.deleteMany({ where: { message: { conversationId: conv.id } } });
    await prisma.message.deleteMany({ where: { conversationId: conv.id } });
    await prisma.conversationAudit.deleteMany({ where: { conversationId: conv.id } });
    await prisma.conversationMember.deleteMany({ where: { conversationId: conv.id } });
    await prisma.conversation.delete({ where: { id: conv.id } });
  }

  await prisma.authAccount.deleteMany({ where: { memberId: TEST } });
  await prisma.messageRead.deleteMany({ where: { memberId: TEST } });
  await prisma.notification.deleteMany({ where: { memberId: TEST } });
  await prisma.messageReport.deleteMany({ where: { reportedByMemberId: TEST } });
  await prisma.conversationAudit.deleteMany({ where: { actorMemberId: TEST } });
  await prisma.message.deleteMany({ where: { senderId: TEST } });
  await prisma.conversation.deleteMany({ where: { createdBy: TEST } });
  await prisma.member.deleteMany({ where: { memberId: TEST } });

  const after = await prisma.member.count();
  expect(after === before, 'database left with only the original membership', `= ${after}`);

  const remainingConvs = await prisma.conversation.count();
  expect(remainingConvs === 0, 'no conversations remain after cleanup', `= ${remainingConvs}`);

  await prisma.$disconnect();
}

main()
  .then(() => {
    console.log(`\n[verify] RESULT  ${passCount} passed · ${failCount} failed`);
    process.exit(failCount > 0 ? 1 : 0);
  })
  .catch(async (error) => {
    console.error('[verify] crashed:', error instanceof Error ? error.stack ?? error.message : error);
    try {
      await prisma.member.delete({ where: { memberId: TEST } }).catch(() => undefined);
    } catch {
      // ignore cleanup error
    }
    await prisma.$disconnect().catch(() => undefined);
    process.exit(1);
  });