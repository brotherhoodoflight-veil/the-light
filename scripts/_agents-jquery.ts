import "dotenv/config";
import { prisma } from "../lib/db";

async function main() {
  const members = await prisma.member.findMany({
    orderBy: { memberId: "asc" },
    select: {
      memberId: true,
      firstName: true,
      status: true,
      membershipType: true,
      role: true,
      country: true,
      journeyStartedYear: true,
      initiationDate: true,
      formalApprovalYear: true,
      fullMembershipYear: true,
      prefecture: true,
      directorate: true,
      minervalAssembly: true,
      cell: true,
      insinuatorName: true,
    },
  });
  for (const m of members) {
    console.log(JSON.stringify(m));
  }
}
main().catch((e) => { console.error("ERR", e); process.exit(1); }).finally(() => process.exit(0));
