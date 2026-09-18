import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { getSessionPayload } from "../../../lib/auth/session-server";
import { SessionProvider } from "../../../lib/auth/session-provider";
import { prisma } from "../../../lib/db";
import { memberInitials, memberPhotoPath } from "../../../lib/member-name";
import BrotherhoodChamber from "./components/BrotherhoodChamber";
import type { ChamberMemberInfo } from "./utils";
import "./chamber.css";

export const metadata: Metadata = {
  title: "THE CHAMBER — Brotherhood of Light",
  description:
    "The private chamber of the Order. Matters exchanged behind closed doors, kept within the Sanctuary.",
};

export default async function SanctuaryChamberPage() {
  const session = await getSessionPayload();

  if (!session?.user) {
    redirect("/sanctuary/login");
  }

  // Authoritative identity comes from the real membership registry.
  // A development-gateway session without a registry record falls
  // back to the identity fields carried by the signed session itself.
  const member = await prisma.member.findUnique({
    where: { memberId: session.user.memberId },
    select: {
      memberId: true,
      firstName: true,
      middleName: true,
      lastName: true,
      fullName: true,
      status: true,
      membershipType: true,
      role: true,
      country: true,
      countryInitiator: true,
    },
  });

  const memberId = member?.memberId ?? session.user.memberId;
  const fullName =
    member?.fullName ??
    session.user.fullName ??
    [session.user.firstName, session.user.lastName].filter(Boolean).join(" ");
  const initials = member
    ? memberInitials(member.firstName, member.middleName, member.lastName)
    : session.user.initials;

  // Official photograph, only when the registry actually holds one.
  const photoPath = join(
    process.cwd(),
    "public",
    "members",
    `${memberId.toLowerCase()}.jpg`,
  );

  const chamberMember: ChamberMemberInfo = {
    memberId,
    fullName: fullName || memberId,
    initials: initials || fullName.slice(0, 3).toUpperCase() || "◈",
    photoUrl: existsSync(photoPath) ? memberPhotoPath(memberId) : undefined,
    role: member?.role ?? session.user.role,
    status: member?.status ?? session.user.status,
    country:
      member?.country?.trim() || session.user.country?.trim() || undefined,
    membershipType:
      member?.membershipType?.trim() ||
      session.user.membershipType?.trim() ||
      undefined,
    countryInitiator:
      member?.countryInitiator?.trim() ||
      session.user.countryInitiator?.trim() ||
      undefined,
  };

  return (
    <main className="cc-page">
      <div className="cc-atmos" aria-hidden="true">
        <div className="cc-atmos-candle" aria-hidden="true" />
        <div className="cc-atmos-arch" aria-hidden="true" />
        <div className="cc-atmos-wheel" aria-hidden="true" />
      </div>

      <div className="cc-frame">
        <SessionProvider user={session.user}>
          <BrotherhoodChamber member={chamberMember} />
        </SessionProvider>
      </div>
    </main>
  );
}