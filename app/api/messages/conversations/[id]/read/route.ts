// ============================================================
// VEIL — Brotherhood Chamber API
// POST /api/messages/conversations/:id/read — mark conversation read
// Records MessageRead rows and advances the member's lastReadAt.
// ============================================================

import { NextResponse, type NextRequest } from 'next/server';
import { requireRequester, chamberError } from '../../../helpers';
import { markConversationRead } from '../../../../../../lib/messages/chamber-service';

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const requester = await requireRequester();
  if (requester instanceof NextResponse) return requester;

  try {
    const result = await markConversationRead(context.params.id, requester.memberId);
    return NextResponse.json(result);
  } catch (error) {
    return chamberError(error);
  }
}