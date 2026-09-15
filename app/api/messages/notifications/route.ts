// ============================================================
// VEIL — Brotherhood Chamber API
// GET /api/messages/notifications — notification foundation
// Returns the member's unread summary and recent notification
// records. Unread totals are derived from real message state.
// ============================================================

import { NextResponse } from 'next/server';
import { requireRequester, chamberError } from '../helpers';
import { touchActivity, getNotifications } from '../../../../lib/messages/chamber-service';

export async function GET() {
  const requester = await requireRequester();
  if (requester instanceof NextResponse) return requester;

  try {
    await touchActivity(requester.memberId);
    const page = await getNotifications(requester.memberId);
    return NextResponse.json(page);
  } catch (error) {
    return chamberError(error);
  }
}