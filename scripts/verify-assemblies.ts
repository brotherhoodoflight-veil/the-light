// ============================================================
// VEIL — Assemblies Module Verification
// Asserts the Assemblies register is empty (no fabricated
// records), the new tables exist and are empty, the member
// registry is intact, and the access / respond guard paths
// function correctly against zero-assembly state.
// Exits non-zero on any failure.
// ============================================================

import 'dotenv/config';
import { PrismaClient } from '../lib/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { getAssembliesIndex } from '../lib/assemblies/service';
import { canViewAssembly, canRespondToCall } from '../lib/assemblies/access';

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
  console.log('\n[verify-assemblies] checking Assemblies register and member registry integrity');

  // 1. New Assembly tables exist and are empty (no fabricated records)
  const tables = await prisma.$queryRaw<{ name: string }[]>`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name IN ('Assembly','AssemblyMember','AssemblyAttendance','AssemblyRecord','AssemblyDocument')
    ORDER BY name
  `;
  expect(tables.length === 5, 'all five Assembly tables exist', `found=${tables.length}`);

  expect((await prisma.assembly.count()) === 0, 'Assembly rows = 0 (no fabricated records)');
  expect((await prisma.assemblyMember.count()) === 0, 'AssemblyMember rows = 0');
  expect((await prisma.assemblyAttendance.count()) === 0, 'AssemblyAttendance rows = 0');
  expect((await prisma.assemblyRecord.count()) === 0, 'AssemblyRecord rows = 0');
  expect((await prisma.assemblyDocument.count()) === 0, 'AssemblyDocument rows = 0');

  // 2. Member registry intact
  const total = await prisma.member.count();
  expect(total === EXPECTED_TOTAL, `TOTAL MEMBERS = ${EXPECTED_TOTAL}`, `actual=${total}`);

  const bol = await prisma.member.findUnique({ where: { memberId: 'BOL-1385' } });
  expect(!!bol, 'BOL-1385 exists');
  expect(bol?.status === 'ACTIVE', 'BOL-1385 remains ACTIVE');
  expect(bol?.role === 'MEMBER', 'BOL-1385 remains MEMBER');
  expect(bol?.membershipType === 'LIFE MEMBER', 'BOL-1385 remains LIFE MEMBER');
  expect(bol?.country === 'Ghana', 'BOL-1385 remains Ghana');

  const emmanuel = await prisma.member.findUnique({ where: { memberId: 'BOL-2388' } });
  expect(!!emmanuel, 'Emmanuel Agyei (BOL-2388) exists');
  expect(emmanuel?.fullName === 'Emmanuel Agyei', 'Emmanuel Agyei name intact');
  expect(emmanuel?.status === 'ACTIVE', 'Emmanuel Agyei remains ACTIVE');

  const authCount = await prisma.authAccount.count();
  expect(authCount === 1, 'AuthAccount rows unchanged (1)', `actual=${authCount}`);

  const convCount = await prisma.conversation.count();
  expect(convCount === 41, 'Chamber conversations unchanged (41)', `actual=${convCount}`);

  const memberCount = await prisma.member.count();
  expect(memberCount === EXPECTED_TOTAL, `Final member count = ${EXPECTED_TOTAL}`, `actual=${memberCount}`);

  // 3. getAssembliesIndex returns empty register for every role type
  const fixtures = [
    { memberId: 'BOL-1385', status: 'ACTIVE', role: 'MEMBER', country: 'Ghana' },
    { memberId: 'BOL-2388', status: 'ACTIVE', role: 'COUNTRY_INITIATOR', country: 'Ghana' },
  ] as const;

  for (const fixture of fixtures) {
    const user = {
      ...fixture,
      id: fixture.memberId,
      email: '',
      firstName: '',
      lastName: '',
      initials: '',
      scope: { position: 'COUNTRY' as const, entityId: fixture.country, entityName: fixture.country, countryId: fixture.country, countryName: fixture.country },
    };
    const index = await getAssembliesIndex(user as any);
    expect(index.next === null, `getAssembliesIndex: next=null for ${fixture.memberId}`);
    expect(index.calls.length === 0, `getAssembliesIndex: calls=[] for ${fixture.memberId}`);
    expect(index.chambers.length === 0, `getAssembliesIndex: chambers=[] for ${fixture.memberId}`);
    expect(index.records.length === 0, `getAssembliesIndex: records=[] for ${fixture.memberId}`);
    expect(index.sealed.length === 0, `getAssembliesIndex: sealed=[] for ${fixture.memberId}`);
    expect(index.archive.length === 0, `getAssembliesIndex: archive=[] for ${fixture.memberId}`);
  }

  // 4. Access logic baseline checks
  expect(
    canViewAssembly(
      { id: 'x', accessLevel: 'BROTHERHOOD', status: 'CALLED', country: null, presidingMemberId: null, issuedByMemberId: null },
      { memberId: 'BOL-1385', status: 'ACTIVE', role: 'MEMBER', country: 'Ghana' },
      null,
    ) === true,
    'canViewAssembly: BROTHERHOOD + ACTIVE member = true',
  );

  expect(
    canViewAssembly(
      { id: 'x', accessLevel: 'BROTHERHOOD', status: 'CALLED', country: null, presidingMemberId: null, issuedByMemberId: null },
      { memberId: 'test', status: 'CANDIDATE', role: 'CANDIDATE', country: 'Ghana' },
      null,
    ) === false,
    'canViewAssembly: CANDIDATE status = false (membership not active)',
  );

  expect(
    canRespondToCall(
      { id: 'x', accessLevel: 'BROTHERHOOD', status: 'SEALED', country: null, presidingMemberId: null, issuedByMemberId: null },
      { memberId: 'BOL-1385', status: 'ACTIVE', role: 'MEMBER', country: 'Ghana' },
      null,
    ) === 'CLOSED',
    'canRespondToCall: SEALED assembly = CLOSED',
  );

  expect(
    canRespondToCall(
      { id: 'x', accessLevel: 'BROTHERHOOD', status: 'CALLED', country: null, presidingMemberId: null, issuedByMemberId: null },
      { memberId: 'BOL-1385', status: 'ACTIVE', role: 'MEMBER', country: 'Ghana' },
      null,
    ) === 'RESPOND',
    'canRespondToCall: BROTHERHOOD CALLED + active member = RESPOND',
  );

  // 5. respondToAssembly returns 404 (no assembly registered)
  const { respondToAssembly } = await import('../lib/assemblies/service');
  const result = await respondToAssembly('NONE', fixtures[0] as any, 'WILL_ATTEND');
  expect(result.ok === false, 'respondToAssembly: NONE returns ok=false');
  expect(!result.ok && result.status === 404, 'respondToAssembly: NONE returns status 404');

  console.log(
    `\n[verify-assemblies] ${failCount === 0 ? 'ALL CHECKS PASSED' : `${failCount} CHECK(S) FAILED`}`,
  );
  await prisma.$disconnect();
  process.exit(failCount === 0 ? 0 : 1);
}

main().catch(async (error) => {
  console.error(
    '[verify-assemblies] FATAL:',
    error instanceof Error ? error.message : error,
  );
  await prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});