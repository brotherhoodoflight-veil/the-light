import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, readSessionToken } from "@/lib/auth";
import { isHighCircle, publicMember, setMemberLevel } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await readSessionToken(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );
  if (!session || !isHighCircle(session)) {
    return NextResponse.json(
      { error: "Only the High Circle may mend the register." },
      { status: 403 },
    );
  }

  let body: { id?: unknown; level?: unknown } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: "Malformed petition." },
      { status: 400 },
    );
  }

  const id = typeof body.id === "string" ? body.id.trim().toUpperCase() : "";
  const target =
    typeof body.level === "number" && Number.isFinite(body.level)
      ? Math.min(9, Math.max(1, Math.round(body.level)))
      : null;

  if (!id || target === null) {
    return NextResponse.json(
      { error: "Name the initiate and their new level." },
      { status: 400 },
    );
  }

  if (id === session.id) {
    return NextResponse.json(
      { error: "The High Circle does not mend itself." },
      { status: 400 },
    );
  }

  const updated = await setMemberLevel(id, target);
  if (!updated) {
    return NextResponse.json(
      { error: "No such initiate is registered." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    member: publicMember(updated),
  });
}