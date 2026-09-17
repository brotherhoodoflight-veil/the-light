import "dotenv/config";
import { prisma } from "../lib/db";
import { memberToSessionUser } from "../lib/auth/member-record";
import { signSessionToken, SESSION_COOKIE } from "../lib/auth/session-crypto";

async function main() {
  const keys: Array<[string, string]> = [["dankwah", "DANKWAH"], ["emanuel", "EMANUEL"]];
  for (const [key, name] of keys) {
    const member = await prisma.member.findMany({ where: { firstName: { contains: name } } });
    if (member.length === 0) {
      console.error(`NO MEMBER: ${name}`);
      continue;
    }
    const token = await signSessionToken(memberToSessionUser(member[0]));
    console.log(`${key} cookie=${SESSION_COOKIE}=${token}`);
  }
}

main()
  .catch((err) => { console.error("ERR", err); process.exit(1); })
  .finally(() => process.exit(0));
