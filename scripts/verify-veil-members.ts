// ============================================================
// VEIL — Registry Verification (post-generation)
// Asserts the frozen country distribution, total membership,
// BOL-1385 integrity, duplicate-free IDs, and Ghana membership.
// Exits non-zero on any failure.
// ============================================================

import 'dotenv/config';
import { PrismaClient } from '../lib/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { EXISTING_MEMBER_ID, MEMBER_DISTRIBUTION } from './generate-veil-members';

const sqliteUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
const adapter = new PrismaBetterSqlite3({ url: sqliteUrl });
const prisma = new PrismaClient({ adapter });

const EXPECTED_TOTAL = 2387;
const EXPECTED_NEW = 2386;

let failCount = 0;

function expect(ok: boolean, label: string, detail = ''): void {
  if (ok) console.log(`  PASS  ${label}${detail ? ` — ${detail}` : ''}`);
  else {
    failCount += 1;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

async function main(): Promise<void> {
  // 1. Total members
  const total = await prisma.member.count();
  expect(total === EXPECTED_TOTAL, `TOTAL MEMBERS = ${EXPECTED_TOTAL}`, `actual=${total}`);

  // 2. Country counts
  const byCountry = await prisma.member.groupBy({
    by: ['country'],
    _count: { _all: true },
  });
  const countByCountry = new Map(byCountry.map((row) => [row.country, row._count._all]));

  const allowed = new Set<string>(MEMBER_DISTRIBUTION.map((item) => item.country));
  const unknownCountries = [...countByCountry.keys()].filter((c) => !allowed.has(c));
  expect(unknownCountries.length === 0, 'no countries outside the frozen distribution', unknownCountries.join(','));

  let distributionOk = true;
  for (const { country, total: expected } of MEMBER_DISTRIBUTION) {
    const actual = countByCountry.get(country) ?? 0;
    if (actual !== expected) {
      distributionOk = false;
      expect(false, `${country} = ${expected}`, `actual=${actual}`);
    } else {
      console.log(`  OK    ${country} = ${actual} (expected ${expected})`);
    }
  }
  expect(distributionOk, 'all 49 country counts match the frozen distribution exactly');
  expect(countByCountry.size === MEMBER_DISTRIBUTION.length, `exactly ${MEMBER_DISTRIBUTION.length} countries present`, `actual=${countByCountry.size}`);

  // 3. Duplicate member IDs
  const dupIds = await prisma.member.groupBy({
    by: ['memberId'],
    _count: { _all: true },
    having: { memberId: { _count: { gt: 1 } } },
  });
  const dupCount = dupIds.length;
  expect(dupCount === 0, `DUPLICATE MEMBER ID COUNT = 0`, `actual=${dupCount}`);

  // 4. BOL-1385 integrity
  const bol = await prisma.member.findUnique({ where: { memberId: EXISTING_MEMBER_ID } });
  expect(bol !== null, 'BOL-1385 exists');
  expect(bol?.fullName === 'Dankwah Kwame Foster', 'Dankwah Kwame Foster exists', bol?.fullName);
  expect(bol?.country === 'Ghana', 'BOL-1385 remains Ghana', bol?.country);
  expect(bol?.status === 'ACTIVE', 'BOL-1385 remains ACTIVE', bol?.status);
  expect(bol?.membershipType === 'LIFE MEMBER', 'BOL-1385 remains LIFE MEMBER', bol?.membershipType);
  expect(bol?.role === 'MEMBER', 'BOL-1385 remains MEMBER', bol?.role);

  // 5. Ghana membership
  const ghanaTotal = countByCountry.get('Ghana') ?? 0;
  expect(ghanaTotal === 27, 'Ghana contains exactly 27 records', `actual=${ghanaTotal}`);
  const ghanaMembers = await prisma.member.findMany({ where: { country: 'Ghana' } });
  const hasBol = ghanaMembers.some((m) => m.memberId === EXISTING_MEMBER_ID);
  expect(hasBol, 'BOL-1385 is among the 27 Ghanaian records');
  expect(ghanaTotal - 1 === 26, 'exactly 26 new Ghanaian records were created', `new=${ghanaTotal - 1}`);

  // 6. New member count (total minus the pre-existing founding record)
  expect(total - 1 === EXPECTED_NEW, `exactly ${EXPECTED_NEW} new members total`, `new=${total - 1}`);

  // 7. New members carry no auth accounts (architecture gates logins to the founding identity)
  const authAccountCounts = await prisma.authAccount.count();
  console.log(`  INFO  AuthAccount rows: ${authAccountCounts}`);

  await prisma.$disconnect();
}

main()
  .then(() => {
    console.log(`\n[verify] RESULT  ${failCount === 0 ? 'ALL CHECKS PASSED' : `${failCount} CHECK(S) FAILED`}`);
    process.exit(failCount > 0 ? 1 : 0);
  })
  .catch(async (error) => {
    console.error('[verify] crashed:', error instanceof Error ? error.stack ?? error.message : error);
    await prisma.$disconnect().catch(() => undefined);
    process.exit(1);
  });