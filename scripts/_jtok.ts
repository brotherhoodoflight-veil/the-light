import "dotenv/config";
import { prisma } from "../lib/db";
import { memberToSessionUser } from "../lib/auth/member-record";
import { signSessionToken, SESSION_COOKIE } from "../lib/auth/session-crypto";

async function main() {
  for (const [key, name] of [["dank", "DANKWAH"], ["eman", "EMANUEL"]]) {
    const member = await prisma.member.findFirst({ where: { firstName: name } });
    if (!member) { console.error("missing", name); continue; }
    console.log(`${key} cookie=${SESSION_COOKIE}=${await signSessionToken(memberToSessionUser(member))}`);
  }
}
main().catch((e) => { console.error("ERR", e); process.exit(1); }).finally(() => process.exit(0));
