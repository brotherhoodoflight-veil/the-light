// ============================================================
// VEIL — Brotherhood Chamber API · Moderation Foundation
// POST /api/messages/conversations/:id/messages/:messageId/moderate
// Owners/administrators may withdraw a message (status → MODERATED).
// Ordinary members are denied server-side.
// ============================================================

import { NextResponse, type NextRequest } from 'next/server';
import { requireRequester, chamberError } from '../../../../../helpers';
import { moderateMessage } from '../../../../../../../../lib/messages/chamber-service';

export async function POST(
  request: NextRequest,
  context: { params: { id: string; messageId: string } },
) {
  const requester = await requireRequester();
  if (requester instanceof NextResponse) return requester;

  try {
    const result = await moderateMessage(
      context.params.id,
      context.params.messageId,
      requester.memberId,
    );
    return NextResponse.json({ message: result });
  } catch (error) {
    return chamberError(error);
  }
}