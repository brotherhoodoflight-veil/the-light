// ============================================================
// VEIL — Brotherhood Chamber API
// POST /api/messages/notifications/read — clear notification badges
// ============================================================

import { NextResponse } from 'next/server';
import { requireRequester, chamberError } from '../../helpers';
import { markNotificationsRead } from '../../../../../lib/messages/chamber-service';

export async function POST() {
  const requester = await requireRequester();
  if (requester instanceof NextResponse) return requester;

  try {
    const result = await markNotificationsRead(requester.memberId);
    return NextResponse.json(result);
  } catch (error) {
    return chamberError(error);
  }
}