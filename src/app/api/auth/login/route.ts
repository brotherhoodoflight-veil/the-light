import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth";
import { findMemberByCredential, isHighCircle } from "@/lib/db";

export async function POST(request: NextRequest) {
  let body: { initiateId?: unknown; passphrase?: unknown } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: "State your credentials." },
      { status: 400 },
    );
  }

  const initiateId =
    typeof body.initiateId === "string" ? body.initiateId.trim() : "";
  const passphrase =
    typeof body.passphrase === "string" ? body.passphrase : "";

  if (!initiateId || !passphrase) {
    return NextResponse.json(
      { error: "State your credentials." },
      { status: 400 },
    );
  }

  const member = await findMemberByCredential(initiateId, passphrase);
  if (!member) {
    return NextResponse.json(
      { error: "The veil does not part." },
      { status: 401 },
    );
  }

  const token = createSessionToken(member);
  const response = NextResponse.json({
    ok: true,
    id: member.id,
    circle: member.circle,
    redirectTo: isHighCircle(member) ? "/admin" : "/portal",
  });
  response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
  return response;
}