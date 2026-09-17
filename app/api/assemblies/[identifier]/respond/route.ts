// ============================================================
// VEIL — The Assemblies · Respond to a Call
// POST /api/assemblies/[identifier]/respond
//
// Records a Brother's reply to a genuine summons. Access and the
// response window are enforced server-side from the verified
// session. Nothing here creates an Assembly.
// ============================================================

import { NextResponse, type NextRequest } from 'next/server';
import { getSessionPayload } from '../../../../../lib/auth/session-server';
import { respondToAssembly } from '../../../../../lib/assemblies/service';

export async function POST(
  req: NextRequest,
  { params }: { params: { identifier: string } },
) {
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const { response } = (body ?? {}) as { response?: string };

  const result = await respondToAssembly(
    params.identifier,
    session.user,
    (response ?? '').trim(),
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  return NextResponse.json(result.data);
}