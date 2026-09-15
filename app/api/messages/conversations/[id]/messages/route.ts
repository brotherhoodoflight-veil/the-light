// ============================================================
// VEIL — Brotherhood Chamber API
// GET  /api/messages/conversations/:id/messages — message history
// POST /api/messages/conversations/:id/messages — send a message
//
// The sender is resolved from the verified session. A member may
// only see/send messages for conversations they belong to.
// History is paginated (cursor-based) and never loaded whole.
// ============================================================

import { NextResponse, type NextRequest } from 'next/server';
import { requireRequester, chamberError } from '../../../helpers';
import {
  touchActivity,
  getMessagesPage,
  sendMessage,
} from '../../../../../../lib/messages/chamber-service';

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const requester = await requireRequester();
  if (requester instanceof NextResponse) return requester;

  const before = request.nextUrl.searchParams.get('cursor');
  const limitRaw = request.nextUrl.searchParams.get('limit');
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : undefined;

  try {
    await touchActivity(requester.memberId);
    const page = await getMessagesPage(context.params.id, requester.memberId, {
      before,
      limit: Number.isFinite(limit) ? limit : undefined,
    });
    return NextResponse.json(page);
  } catch (error) {
    return chamberError(error);
  }
}

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const requester = await requireRequester();
  if (requester instanceof NextResponse) return requester;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { body: text, replyToMessageId } = (body ?? {}) as {
    body?: string;
    replyToMessageId?: string | null;
  };

  try {
    await touchActivity(requester.memberId);
    const message = await sendMessage(
      context.params.id,
      requester.memberId,
      typeof text === 'string' ? text : '',
      typeof replyToMessageId === 'string' ? replyToMessageId : undefined,
    );
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    return chamberError(error);
  }
}