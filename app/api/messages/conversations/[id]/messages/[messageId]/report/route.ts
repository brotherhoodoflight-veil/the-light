// ============================================================
// VEIL — Brotherhood Chamber API · Moderation Foundation
// POST /api/messages/conversations/:id/messages/:messageId/report
// Members may report a message; a ConversationAudit record is kept.
// ============================================================

import { NextResponse, type NextRequest } from 'next/server';
import { requireRequester, chamberError } from '../../../../../helpers';
import { reportMessage } from '../../../../../../../../lib/messages/chamber-service';

export async function POST(
  request: NextRequest,
  context: { params: { id: string; messageId: string } },
) {
  const requester = await requireRequester();
  if (requester instanceof NextResponse) return requester;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = undefined;
  }

  const { reason } = (body ?? {}) as { reason?: string };

  try {
    const report = await reportMessage(
      context.params.id,
      context.params.messageId,
      requester.memberId,
      typeof reason === 'string' ? reason : '',
    );
    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    return chamberError(error);
  }
}