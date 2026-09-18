import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, readSessionToken } from "@/lib/auth";
import { createMember, publicMember } from "@/lib/db";
import { HIGH_CIRCLE, LEVELS, REGIONS } from "@/lib/levels";

export async function POST(request: NextRequest) {
  const session = await readSessionToken(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );
  if (!session || session.circle !== HIGH_CIRCLE) {
    return NextResponse.json(
      { error: "Only the High Circle may call the register." },
      { status: 403 },
    );
  }

  let body: { name?: unknown; region?: unknown; level?: unknown } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: "Malformed petition." },
      { status: 400 },
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const level =
    typeof body.level === "number" &&
    LEVELS.some((l) => l.level === body.level)
      ? Math.round(body.level)
      : null;
  const region =
    typeof body.region === "string" &&
    (REGIONS as readonly string[]).includes(body.region)
      ? body.region
      : null;

  if (!name || name.length > 80) {
    return NextResponse.json(
      { error: "The name must be spoken clearly." },
      { status: 400 },
    );
  }
  if (level === null) {
    return NextResponse.json(
      { error: "Choose a level from Neophyte to Supreme IX." },
      { status: 400 },
    );
  }
  if (!region) {
    return NextResponse.json(
      { error: "A Ghana region must be declared." },
      { status: 400 },
    );
  }

  const created = await createMember({ name, region, level });
  return NextResponse.json({
    ok: true,
    member: publicMember(created),
    passphrase: created.passphrase,
  });
}