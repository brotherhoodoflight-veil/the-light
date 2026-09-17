import "dotenv/config";
import { prisma } from "../lib/db";
import { memberToSessionUser } from "../lib/auth/member-record";
import { signSessionToken, verifySessionToken } from "../lib/auth/session-crypto";

async function main() {
  const m = await prisma.member.findFirst({ where: { firstName: "DANKWAH" } });
  const token = await signSessionToken(memberToSessionUser(m!));
  const verified = await verifySessionToken(token);
  console.log("secret-present:", Boolean(process.env.VEIL_SESSION_SECRET), "secret-len:", process.env.VEIL_SESSION_SECRET?.length);
  console.log("verify-ok:", verified?.user?.memberId ?? null);
}
main().catch((e) => { console.error("ERR", e); process.exit(1); }).finally(() => process.exit(0));
