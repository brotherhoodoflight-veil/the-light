// ============================================================
// VEIL — Brotherhood Chamber API
// GET /api/messages/directory — Brotherhood directory
// Returns the real member count and a case-insensitive search.
// Only permitted directory fields are exposed.
// ============================================================

import { NextResponse, type NextRequest } from 'next/server';
import { requireRequester, chamberError } from '../helpers';
import {
  touchActivity,
  searchMembers,
} from '../../../../lib/messages/chamber-service';

export async function GET(request: NextRequest) {
  const requester = await requireRequester();
  if (requester instanceof NextResponse) return requester;

  const q = request.nextUrl.searchParams.get('q');
  const limitRaw = request.nextUrl.searchParams.get('limit');
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : undefined;

  try {
    await touchActivity(requester.memberId);
    const page = await searchMembers(q, {
      limit: Number.isFinite(limit) ? limit : undefined,
      excludeMemberId: requester.memberId,
    });
    return NextResponse.json(page);
  } catch (error) {
    return chamberError(error);
  }
}