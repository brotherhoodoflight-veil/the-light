// ============================================================
// VEIL — Brotherhood Chamber API · Membership administration
// POST   /api/messages/conversations/:id/members — add members
// DELETE /api/messages/conversations/:id/members — remove/leave
// Owners/administrators manage others; any member may leave.
// ============================================================

import { NextResponse, type NextRequest } from 'next/server';
import { requireRequester, chamberError } from '../../../helpers';
import {
  addConversationMembers,
  removeConversationMembers,
} from '../../../../../../lib/messages/chamber-service';

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const requester = await requireRequester();
  if (requester instanceof NextResponse) return requester;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { memberIds } = (body ?? {}) as { memberIds?: string[] };

  try {
    const result = await addConversationMembers(
      context.params.id,
      requester.memberId,
      Array.isArray(memberIds) ? memberIds : [],
    );
    return NextResponse.json(result);
  } catch (error) {
    return chamberError(error);
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  const requester = await requireRequester();
  if (requester instanceof NextResponse) return requester;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { memberIds } = (body ?? {}) as { memberIds?: string[] };

  try {
    const result = await removeConversationMembers(
      context.params.id,
      requester.memberId,
      Array.isArray(memberIds) ? memberIds : [requester.memberId],
    );
    return NextResponse.json(result);
  } catch (error) {
    return chamberError(error);
  }
}