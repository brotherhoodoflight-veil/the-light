// ============================================================
// VEIL — Brotherhood Chamber API
// GET  /api/messages/conversations  — the member's conversations
// POST /api/messages/conversations  — open a new conversation
// ============================================================

import { NextResponse, type NextRequest } from 'next/server';
import {
  requireRequester,
  chamberError,
} from '../helpers';
import {
  touchActivity,
  getConversationsForMember,
  findOrCreatePrivateConversation,
  createGroupConversation,
} from '../../../../lib/messages/chamber-service';

export async function GET() {
  const requester = await requireRequester();
  if (requester instanceof NextResponse) return requester;

  try {
    await touchActivity(requester.memberId);
    const conversations = await getConversationsForMember(requester.memberId);
    return NextResponse.json({ conversations });
  } catch (error) {
    return chamberError(error);
  }
}

export async function POST(request: NextRequest) {
  const requester = await requireRequester();
  if (requester instanceof NextResponse) return requester;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { type, title, description, memberIds } = (body ?? {}) as {
    type?: string;
    title?: string;
    description?: string;
    memberIds?: string[];
  };

  try {
    await touchActivity(requester.memberId);

    if (type === 'PRIVATE') {
      const target = Array.isArray(memberIds) && memberIds.length === 1 ? memberIds[0] : undefined;
      if (!target) {
        return NextResponse.json(
          { error: 'A private conversation requires exactly one other member.' },
          { status: 400 },
        );
      }
      const conversation = await findOrCreatePrivateConversation(requester.memberId, target);
      return NextResponse.json({ conversation }, { status: 201 });
    }

    const conversation = await createGroupConversation(requester.memberId, requester.role, {
      type: (type ?? 'BROTHERHOOD') as Parameters<typeof createGroupConversation>[2]['type'],
      title,
      description,
      memberIds,
    });
    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    return chamberError(error);
  }
}