import { prisma } from '../../lib/db';
async function main() {
  const members = await prisma.member.findMany({ select: { memberId: true, fullName: true, firstName: true, lastName: true, status: true, role: true, country: true, countryInitiator: true, membershipType: true, email: true } });
  console.log('=== MEMBERS ===');
  console.log(JSON.stringify(members, null, 2));
  const accounts = await prisma.authAccount.findMany({ select: { memberId: true, username: true } });
  console.log('=== ACCOUNTS ===');
  console.log(JSON.stringify(accounts, null, 2));
  await prisma.$disconnect();
}
main();
