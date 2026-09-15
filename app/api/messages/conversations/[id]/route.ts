// ============================================================
// VEIL — Brotherhood Chamber API
// GET /api/messages/conversations/:id — conversation detail
// Authorization is verified server-side; non-members receive 404.
// ============================================================

import { NextResponse, type NextRequest } from 'next/server';
import { requireRequester, chamberError } from '../../helpers';
import { touchActivity, getConversationDetail } from '../../../../../lib/messages/chamber-service';

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const requester = await requireRequester();
  if (requester instanceof NextResponse) return requester;

  try {
    await touchActivity(requester.memberId);
    const conversation = await getConversationDetail(context.params.id, requester.memberId);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found or not authorized.' },
        { status: 404 },
      );
    }
    return NextResponse.json({ conversation });
  } catch (error) {
    return chamberError(error);
  }
}