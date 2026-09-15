// ============================================================
// VEIL — Seed Script (Stage 3)
// Creates the first real historical membership record for the
// database gateway: BOL-1385 — Dankwah Kwame Foster.
//
// Security rules honored here:
//   • Only BOL-1385 is created. The remaining 2,981 historical
//     members are NOT fabricated.
//   • The recorded membership journey is preserved: the initiation
//     journey began in 2019; formal approval and full membership
//     were recorded in 2026. Year-level fields only — the exact
//     initiation day is never fabricated.
//   • Unknown fields (initiation date, prefecture, directorate,
//     minerval assembly, cell, insinuator, email, phone, address)
//     remain NULL — nothing is invented.
//   • The password is read from the VEIL_BOL1385_PASSWORD
//     environment variable ONLY. No plaintext password exists in
//     this file or anywhere in source. The store keeps only the
//     argon2 hash.
// ============================================================

import 'dotenv/config';
import argon2 from 'argon2';
import { PrismaClient } from '../lib/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'node:path';

const sqliteUrl = process.env.DATABASE_URL ?? 'file:./dev.db';

const adapter = new PrismaBetterSqlite3({ url: sqliteUrl });
const prisma = new PrismaClient({ adapter });

const MEMBER_ID = 'BOL-1385';

async function main() {
  const plaintext = process.env.VEIL_BOL1385_PASSWORD;
  if (!plaintext) {
    throw new Error(
      'VEIL_BOL1385_PASSWORD is not set. The seed refuses to run without it ' +
        'because no plaintext password is ever stored in source code. Export it ' +
        'in a private environment file, then re-run the seed.',
    );
  }

  const member = await prisma.member.upsert({
    where: { memberId: MEMBER_ID },
    update: {
      firstName: 'Dankwah',
      middleName: 'Kwame',
      lastName: 'Foster',
      fullName: 'Dankwah Kwame Foster',
      membershipType: 'LIFE MEMBER',
      status: 'ACTIVE',
      role: 'MEMBER',
      country: 'Ghana',
      countryInitiator: 'Emmanuel Agyei',
      journeyStartedYear: 2019,
      formalApprovalYear: 2026,
      fullMembershipYear: 2026,
    },
    create: {
      memberId: MEMBER_ID,
      firstName: 'Dankwah',
      middleName: 'Kwame',
      lastName: 'Foster',
      fullName: 'Dankwah Kwame Foster',
      membershipType: 'LIFE MEMBER',
      status: 'ACTIVE',
      role: 'MEMBER',
      country: 'Ghana',
      countryInitiator: 'Emmanuel Agyei',
      journeyStartedYear: 2019,
      formalApprovalYear: 2026,
      fullMembershipYear: 2026,
      // All other fields intentionally left NULL (undefined).
      authAccounts: {
        create: {
          username: MEMBER_ID,
          passwordHash: await argon2.hash(plaintext),
        },
      },
    },
  });

  // Keep the credential hash fresh on re-seed (argon2 re-salt).
  const hash = await argon2.hash(plaintext);
  const account = await prisma.authAccount.upsert({
    where: { memberId: MEMBER_ID },
    update: { passwordHash: hash },
    create: { memberId: MEMBER_ID, username: MEMBER_ID, passwordHash: hash },
  });

  console.log(
    `[seed] member ${member.memberId} — ${member.fullName} — ${member.membershipType} / ${member.status} / ${member.role}`,
  );
  console.log(
    `[seed] auth account ${account.username} — credential stored as argon2 hash only.`,
  );

  const nullFields = [
    member.initiationDate,
    member.prefecture,
    member.directorate,
    member.minervalAssembly,
    member.cell,
    member.insinuatorName,
    member.email,
    member.phone,
    member.address,
  ];
  if (nullFields.some((value) => value !== null && value !== undefined)) {
    console.warn('[seed] WARNING: an unknown field received a value.');
  }

  const journeyOk =
    member.journeyStartedYear === 2019 &&
    member.formalApprovalYear === 2026 &&
    member.fullMembershipYear === 2026;
  if (!journeyOk) {
    console.warn('[seed] WARNING: the recorded membership journey is incomplete.');
  } else {
    console.log('[seed] membership journey — began 2019 · formal approval 2026 · full membership 2026.');
  }

  await prisma.$disconnect();
}

main()
  .catch(async (error) => {
    console.error('[seed] failed:', error instanceof Error ? error.message : error);
    await prisma.$disconnect().catch(() => undefined);
    process.exit(1);
  });