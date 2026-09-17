import { PrismaClient } from '../lib/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import argon2 from 'argon2';
import { randomInt } from 'node:crypto';

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! }) });

function generateMembershipId(country: string): string {
  const part = (length: number) =>
    Array.from({ length }, () => randomInt(0, 10)).join('');

  return `BOL-${part(4)}-${part(4)}-${part(2)}/${country.toUpperCase()}`;
}

async function uniqueMembershipId(country: string): Promise<string> {
  let memberId = generateMembershipId(country);

  while (await prisma.member.findUnique({ where: { memberId } })) {
    memberId = generateMembershipId(country);
  }

  return memberId;
}

async function main() {
  console.log('Seeding Brotherhood of Light member registry...');

  const grandmastersInitiator = 'THE GRANDMASTERS';
  const emanuelName = 'EMANUEL NANA AGYEI';

  const dankwahPassword = process.env.BOL_DANKWAH_PASSWORD;
  const emanuelPassword = process.env.BOL_EMANUEL_PASSWORD;

  if (!dankwahPassword || !emanuelPassword) {
    throw new Error(
      'Missing BOL_DANKWAH_PASSWORD or BOL_EMANUEL_PASSWORD environment variable.'
    );
  }

  const dankwahMemberId = await uniqueMembershipId('GHANA');
  const emanuelMemberId = await uniqueMembershipId('GHANA');

  const dankwahPasswordHash = await argon2.hash(dankwahPassword);
  const emanuelPasswordHash = await argon2.hash(emanuelPassword);

  const emanuel = await prisma.member.upsert({
    where: { memberId: emanuelMemberId },
    update: {
      fullName: emanuelName,
      firstName: 'EMANUEL',
      middleName: 'NANA',
      lastName: 'AGYEI',
      membershipType: 'LIFE MEMBER',
      status: 'ACTIVE',
      role: 'COUNTRY_INITIATOR',
      country: 'Ghana',
      nationality: 'Ghanaian',
      sex: 'Male',
      cityOfResidence: 'East Legon, Accra',
      idCardType: 'Passport',
      idCardNumber: 'G0558903',
      maritalStatus: 'Married',
      occupation: 'BusinessMan',
      countryInitiator: grandmastersInitiator,
    },
    create: {
      memberId: emanuelMemberId,
      firstName: 'EMANUEL',
      middleName: 'NANA',
      lastName: 'AGYEI',
      fullName: emanuelName,
      membershipType: 'LIFE MEMBER',
      status: 'ACTIVE',
      role: 'COUNTRY_INITIATOR',
      country: 'Ghana',
      nationality: 'Ghanaian',
      sex: 'Male',
      cityOfResidence: 'East Legon, Accra',
      idCardType: 'Passport',
      idCardNumber: 'G0558903',
      maritalStatus: 'Married',
      occupation: 'BusinessMan',
      countryInitiator: grandmastersInitiator,
      email: 'barimasikapa@thelight.com',
      phone: '+233541765068',
    },
  });

  await prisma.authAccount.upsert({
    where: { memberId: emanuel.memberId },
    update: {
      username: emanuel.memberId,
      passwordHash: emanuelPasswordHash,
    },
    create: {
      memberId: emanuel.memberId,
      username: emanuel.memberId,
      passwordHash: emanuelPasswordHash,
    },
  });

  const dankwah = await prisma.member.upsert({
    where: { memberId: dankwahMemberId },
    update: {
      fullName: 'DANKWAH KWAME FOSTER',
      firstName: 'DANKWAH',
      middleName: 'KWAME',
      lastName: 'FOSTER',
      membershipType: 'LIFE MEMBER',
      status: 'ACTIVE',
      role: 'MEMBER',
      country: 'Ghana',
      nationality: 'Ghanaian',
      sex: 'Male',
      cityOfResidence: 'Kwahu Praso',
      idCardType: 'Voters',
      idCardNumber: '2535001438',
      maritalStatus: 'Married',
      occupation: 'Teaching',
      countryInitiator: emanuelName,
    },
    create: {
      memberId: dankwahMemberId,
      firstName: 'DANKWAH',
      middleName: 'KWAME',
      lastName: 'FOSTER',
      fullName: 'DANKWAH KWAME FOSTER',
      membershipType: 'LIFE MEMBER',
      status: 'ACTIVE',
      role: 'MEMBER',
      country: 'Ghana',
      nationality: 'Ghanaian',
      sex: 'Male',
      cityOfResidence: 'Kwahu Praso',
      idCardType: 'Voters',
      idCardNumber: '2535001438',
      maritalStatus: 'Married',
      occupation: 'Teaching',
      countryInitiator: emanuelName,
      email: 'dankwahfoster@thelight.com',
      phone: '0248081699',
    },
  });

  await prisma.authAccount.upsert({
    where: { memberId: dankwah.memberId },
    update: {
      username: dankwah.memberId,
      passwordHash: dankwahPasswordHash,
    },
    create: {
      memberId: dankwah.memberId,
      username: dankwah.memberId,
      passwordHash: dankwahPasswordHash,
    },
  });

  console.log('Registry seeded successfully.');
  console.log(`EMANUEL NANA AGYEI: ${emanuel.memberId}`);
  console.log(`DANKWAH KWAME FOSTER: ${dankwah.memberId}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
