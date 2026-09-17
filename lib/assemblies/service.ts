// ============================================================
// VEIL — The Assemblies · Server Service
// All database access for the Assemblies register.
//
// SECURITY RULES:
//   • Every read receives the authenticated member identity from
//     the verified session — never from a client request.
//   • Every Assembly returned passes canViewAssembly first,
//     server-side. Restricted data is never shipped client-side.
//   • Responses are written only within the response window and
//     only by members authorized to answer the call.
//
// INTEGRITY RULE: this service never creates an Assembly. It reads
// genuine records and records answers to real summonses. Nothing is
// fabricated to fill the register.
//
// Server-only. Do NOT import from client components.
// ============================================================

import { prisma } from '../db';
import type { VeilSessionUser } from '../auth/session-types';
import type { Role } from '../types';
import {
  canRespondToCall,
  canViewAssembly,
  type MemberAccessIdentity,
  type RespondPermission,
} from './access';
import { ACTIVE_STAGES } from './constants';
import type {
  AssembliesIndex,
  AssemblyAccessLevel,
  AssemblyChamberDto,
  AssemblyNameRef,
  AssemblyRecordStatus,
  AssemblyResponse,
  AssemblySeat,
  AssemblySeatRef,
  AssemblyStatus,
  AssemblySummaryDto,
} from './types';

/** Distinguish expected client errors from server failures. */
export class AssemblyError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const RESPONSE_VALUES: ReadonlySet<string> = new Set<string>([
  'WILL_ATTEND',
  'CANNOT_ATTEND',
]);

function toIdentity(user: VeilSessionUser): MemberAccessIdentity {
  return {
    memberId: user.memberId,
    status: user.status,
    role: user.role,
    country: user.country ?? null,
  };
}

function toNameRef(member: {
  memberId: string;
  fullName: string;
  country: string | null;
} | null): AssemblyNameRef | null {
  if (!member) return null;
  return {
    memberId: member.memberId,
    fullName: member.fullName,
    country: member.country,
  };
}

interface AssemblySummaryRow {
  id: string;
  assemblyNumber: string | null;
  title: string;
  classification: string;
  purpose: string;
  status: string;
  accessLevel: string;
  country: string | null;
  location: string | null;
  hourOfDay: string | null;
  convenedAt: Date;
  witnessDeclamation: string | null;
  presidingMemberId: string | null;
  issuedByMemberId: string | null;
  discussionConversationId: string | null;
  presidingMember: { memberId: string; fullName: string; country: string | null } | null;
  issuingMember: { memberId: string; fullName: string; country: string | null } | null;
}

interface SeatRow {
  assemblyId: string;
  memberId: string;
  seat: string;
  response: string;
  respondedAt: Date | null;
  isRemoved: boolean;
}

interface AttendanceRow {
  assemblyId: string;
  memberId: string;
  disposition: string;
  recordedAt: Date;
}

// --- Public registers -----------------------------------------

export async function getAssembliesIndex(user: VeilSessionUser): Promise<AssembliesIndex> {
  const identity = toIdentity(user);

  const [assemblies, seats, attendance] = await Promise.all([
    prisma.assembly.findMany({
      orderBy: [{ convenedAt: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        assemblyNumber: true,
        title: true,
        classification: true,
        purpose: true,
        status: true,
        accessLevel: true,
        country: true,
        location: true,
        hourOfDay: true,
        convenedAt: true,
        witnessDeclamation: true,
        presidingMemberId: true,
        issuedByMemberId: true,
        discussionConversationId: true,
        presidingMember: { select: { memberId: true, fullName: true, country: true } },
        issuingMember: { select: { memberId: true, fullName: true, country: true } },
      },
    }),
    prisma.assemblyMember.findMany({
      where: { isRemoved: false },
      select: {
        assemblyId: true,
        memberId: true,
        seat: true,
        response: true,
        respondedAt: true,
        isRemoved: true,
      },
    }),
    prisma.assemblyAttendance.findMany({
      select: { assemblyId: true, memberId: true, disposition: true, recordedAt: true },
    }),
  ]);

  const seatsByAssembly = new Map<string, SeatRow[]>();
  for (const seat of seats) {
    const list = seatsByAssembly.get(seat.assemblyId) ?? [];
    list.push(seat);
    seatsByAssembly.set(seat.assemblyId, list);
  }

  const attendanceByAssembly = new Map<string, AttendanceRow[]>();
  for (const row of attendance) {
    const list = attendanceByAssembly.get(row.assemblyId) ?? [];
    list.push(row);
    attendanceByAssembly.set(row.assemblyId, list);
  }

  const visible: AssemblySummaryDto[] = [];
  for (const row of assemblies as unknown as AssemblySummaryRow[]) {
    const seatRows = seatsByAssembly.get(row.id) ?? [];
    const mySeat = seatRows.find((s) => s.memberId === user.memberId) ?? null;
    const myAttendanceRow = (attendanceByAssembly.get(row.id) ?? []).find(
      (a) => a.memberId === user.memberId,
    ) ?? null;

    const access = {
      id: row.id,
      accessLevel: row.accessLevel as AssemblyAccessLevel,
      status: row.status as AssemblyStatus,
      country: row.country,
      presidingMemberId: row.presidingMemberId,
      issuedByMemberId: row.issuedByMemberId,
    };
    const seatAccess = mySeat
      ? {
          seat: mySeat.seat as AssemblySeat,
          response: mySeat.response as AssemblyResponse,
          isRemoved: mySeat.isRemoved,
        }
      : null;

    if (!canViewAssembly(access, identity, seatAccess)) continue;

    visible.push(
      toSummary({
        row,
        user,
        mySeat: mySeat as unknown as Exclude<typeof mySeat, null> | null,
        myAttendance: myAttendanceRow,
        authorizedMemberCount: authorizedCount(seatRows),
        attendanceCount: (attendanceByAssembly.get(row.id) ?? []).length,
      }),
    );
  }

  const now = Date.now();
  const next =
    visible.find(
      (a) =>
        ACTIVE_STAGES.includes(a.status) &&
        new Date(a.convenedAt).getTime() >= now,
    ) ??
    visible.find((a) => ACTIVE_STAGES.includes(a.status)) ??
    null;

  return {
    next,
    calls: visible.filter((a) => a.status === 'CALLED' || a.status === 'ANNOUNCED'),
    chambers: visible.filter(
      (a) => a.status === 'GATHERED' || a.status === 'OPENED' || a.status === 'IN SESSION',
    ),
    records: visible.filter((a) => a.status === 'CLOSED'),
    sealed: visible.filter((a) => a.status === 'SEALED'),
    archive: visible.filter((a) => a.status === 'ARCHIVED'),
  };
}

function authorizedCount(seatRows: SeatRow[]): number {
  return seatRows.filter((s) => !s.isRemoved).length;
}

function toSummary(args: {
  row: AssemblySummaryRow;
  user: VeilSessionUser;
  mySeat: SeatRow | null;
  myAttendance: AttendanceRow | null;
  authorizedMemberCount: number;
  attendanceCount: number;
}): AssemblySummaryDto {
  const { row, user, mySeat, myAttendance } = args;

  return {
    identifier: row.assemblyNumber ?? row.id,
    id: row.id,
    title: row.title,
    classification: row.classification as AssemblySummaryDto['classification'],
    status: row.status as AssemblySummaryDto['status'],
    accessLevel: row.accessLevel as AssemblySummaryDto['accessLevel'],
    purpose: row.purpose,
    country: row.country,
    location: row.location,
    hourOfDay: row.hourOfDay,
    convenedAt: row.convenedAt.toISOString(),
    witnessDeclamation: row.witnessDeclamation,
    presidingMember: toNameRef(row.presidingMember),
    issuedByMember: toNameRef(row.issuingMember),
    discussionConversationId: row.discussionConversationId,
    mySeat: mySeat
      ? {
          memberId: user.memberId,
          fullName: user.fullName ?? `${user.firstName} ${user.lastName}`,
          country: user.country ?? null,
          seat: (mySeat.seat as AssemblySeat) ?? 'INVITED',
          response: (mySeat.response as AssemblyResponse) ?? 'PENDING',
        }
      : null,
    response: ((mySeat?.response as AssemblyResponse) ?? 'PENDING'),
    myAttendance: myAttendance ? (myAttendance.disposition as AssemblySummaryDto['myAttendance']) : null,
    authorizedMemberCount: args.authorizedMemberCount,
    attendanceCount: args.attendanceCount,
  };
}

// --- The Assembly Chamber -------------------------------------

export interface AssemblyChamberResult {
  found: boolean;
  authorized: boolean;
  chamber: AssemblyChamberDto | null;
}

export async function getAssemblyChamber(
  identifier: string,
  user: VeilSessionUser,
): Promise<AssemblyChamberResult> {
  const id = (identifier ?? '').trim();
  if (!id) return { found: false, authorized: false, chamber: null };

  const row = await prisma.assembly.findFirst({
    where: { OR: [{ assemblyNumber: id }, { id }] },
    select: {
      id: true,
      assemblyNumber: true,
      title: true,
      classification: true,
      purpose: true,
      status: true,
      accessLevel: true,
      country: true,
      location: true,
      hourOfDay: true,
      convenedAt: true,
      witnessDeclamation: true,
      presidingMemberId: true,
      issuedByMemberId: true,
      discussionConversationId: true,
      presidingMember: { select: { memberId: true, fullName: true, country: true } },
      issuingMember: { select: { memberId: true, fullName: true, country: true } },
      seats: {
        where: { isRemoved: false },
        select: {
          memberId: true,
          seat: true,
          response: true,
          respondedAt: true,
          member: { select: { fullName: true, country: true } },
        },
        orderBy: [{ seat: 'desc' }, { member: { fullName: 'asc' } }],
      },
      attendance: {
        select: {
          memberId: true,
          disposition: true,
          recordedAt: true,
          member: { select: { fullName: true, country: true } },
        },
        orderBy: [{ recordedAt: 'asc' }],
      },
      records: {
        orderBy: [{ createdAt: 'desc' }],
        take: 1,
        select: { status: true, summary: true, sealedAt: true },
      },
      documents: {
        select: {
          title: true,
          classification: true,
          reference: true,
          status: true,
          body: true,
          createdAt: true,
        },
        orderBy: [{ createdAt: 'asc' }],
      },
    },
  });

  if (!row) return { found: false, authorized: false, chamber: null };

  const identity = toIdentity(user);
  const mySeatRow = row.seats.find((s) => s.memberId === user.memberId) ?? null;
  const access = {
    id: row.id,
    accessLevel: row.accessLevel as AssemblyAccessLevel,
    status: row.status as AssemblyStatus,
    country: row.country,
    presidingMemberId: row.presidingMemberId,
    issuedByMemberId: row.issuedByMemberId,
  };
  const seatAccess = mySeatRow
    ? {
        seat: mySeatRow.seat as AssemblySeat,
        response: mySeatRow.response as AssemblyResponse,
        isRemoved: false,
      }
    : null;

  if (!canViewAssembly(access, identity, seatAccess)) {
    return { found: true, authorized: false, chamber: null };
  }

  const myAttendanceRow =
    row.attendance.find((a) => a.memberId === user.memberId) ?? null;

  const seats: AssemblySeatRef[] = row.seats
    .map((s) => ({
      memberId: s.memberId,
      fullName: s.member.fullName,
      country: s.member.country,
      seat: s.seat as AssemblySeat,
      response: s.response as AssemblyResponse,
    }))
    .sort((a, b) => {
      const aSeat = a.seat === 'SEATED' ? 0 : 1;
      const bSeat = b.seat === 'SEATED' ? 0 : 1;
      if (aSeat !== bSeat) return aSeat - bSeat;
      return a.fullName.localeCompare(b.fullName);
    });

  const attendance = row.attendance
    .map((a) => ({
      memberId: a.memberId,
      fullName: a.member.fullName,
      country: a.member.country,
      disposition: a.disposition as AssemblyChamberDto['attendance'][number]['disposition'],
      recordedAt: a.recordedAt.toISOString(),
    }))
    .sort((a, b) => {
      const order: Record<string, number> = { PRESENT: 0, EXCUSED: 1, ABSENT: 2 };
      return (order[a.disposition] ?? 3) - (order[b.disposition] ?? 3) ||
        a.fullName.localeCompare(b.fullName);
    });

  const chamber: AssemblyChamberDto = {
    identifier: row.assemblyNumber ?? row.id,
    id: row.id,
    title: row.title,
    classification: row.classification as AssemblyChamberDto['classification'],
    status: row.status as AssemblyChamberDto['status'],
    accessLevel: row.accessLevel as AssemblyChamberDto['accessLevel'],
    purpose: row.purpose,
    country: row.country,
    location: row.location,
    hourOfDay: row.hourOfDay,
    convenedAt: row.convenedAt.toISOString(),
    witnessDeclamation: row.witnessDeclamation,
    presidingMember: toNameRef(row.presidingMember),
    issuedByMember: toNameRef(row.issuingMember),
    discussionConversationId: row.discussionConversationId,
    mySeat: mySeatRow
      ? {
          memberId: user.memberId,
          fullName: user.fullName ?? `${user.firstName} ${user.lastName}`,
          country: user.country ?? null,
          seat: mySeatRow.seat as AssemblySeat,
          response: mySeatRow.response as AssemblyResponse,
        }
      : null,
    response: ((mySeatRow?.response as AssemblyResponse) ?? 'PENDING'),
    myAttendance: myAttendanceRow
      ? (myAttendanceRow.disposition as AssemblyChamberDto['myAttendance'])
      : null,
    authorizedMemberCount: row.seats.length,
    attendanceCount: row.attendance.length,
    seats,
    attendance,
    record: row.records[0]
      ? {
          status: row.records[0].status as AssemblyRecordStatus,
          summary: row.records[0].summary,
          sealedAt: row.records[0].sealedAt ? row.records[0].sealedAt.toISOString() : null,
        }
      : null,
    documents: row.documents.map((d) => ({
      title: d.title,
      classification: d.classification,
      reference: d.reference,
      status: d.status as AssemblyChamberDto['documents'][number]['status'],
      body: d.body,
    })),
  };

  return { found: true, authorized: true, chamber };
}

// --- Responding to a call ------------------------------------

export type RespondOutcome =
  | { ok: true; data: { identifier: string; response: AssemblyResponse; respondedAt: string } }
  | { ok: false; status: number; message: string };

export async function respondToAssembly(
  identifier: string,
  user: VeilSessionUser,
  responseValue: string,
): Promise<RespondOutcome> {
  const id = (identifier ?? '').trim();
  const response = responseValue as AssemblyResponse;

  if (!id) return { ok: false, status: 404, message: 'No such assembly is recorded.' };
  if (!RESPONSE_VALUES.has(response)) {
    return {
      ok: false,
      status: 400,
      message: 'A reply must be either "I WILL ATTEND" or "I CANNOT ATTEND".',
    };
  }

  const row = await prisma.assembly.findFirst({
    where: { OR: [{ assemblyNumber: id }, { id }] },
    select: {
      id: true,
      assemblyNumber: true,
      status: true,
      accessLevel: true,
      country: true,
      presidingMemberId: true,
      issuedByMemberId: true,
    },
  });
  if (!row) return { ok: false, status: 404, message: 'No such assembly is recorded.' };

  const identity = toIdentity(user);
  const current = await prisma.assemblyMember.findUnique({
    where: {
      assemblyId_memberId: { assemblyId: row.id, memberId: user.memberId },
    },
  });

  const seatAccess = current
    ? {
        seat: current.seat as AssemblySeat,
        response: current.response as AssemblyResponse,
        isRemoved: current.isRemoved,
      }
    : null;

  const permission: RespondPermission = canRespondToCall(
    {
      id: row.id,
      accessLevel: row.accessLevel as AssemblyAccessLevel,
      status: row.status as AssemblyStatus,
      country: row.country,
      presidingMemberId: row.presidingMemberId,
      issuedByMemberId: row.issuedByMemberId,
    },
    identity,
    seatAccess,
  );

  if (permission === 'FORBIDDEN') {
    return {
      ok: false,
      status: 403,
      message: 'You are not authorized to answer this call.',
    };
  }
  if (permission === 'CLOSED') {
    return {
      ok: false,
      status: 409,
      message: 'The time for answering this call has passed.',
    };
  }
  if (permission === 'RECORDED') {
    return {
      ok: true,
      data: {
        identifier: row.assemblyNumber ?? row.id,
        response: current?.response as AssemblyResponse,
        respondedAt: (current?.respondedAt ?? new Date()).toISOString(),
      },
    };
  }

  const now = new Date();
  const seat = await prisma.$transaction(async (tx) => {
    const existing = await tx.assemblyMember.findUnique({
      where: { assemblyId_memberId: { assemblyId: row.id, memberId: user.memberId } },
      select: { seat: true },
    });
    return tx.assemblyMember.upsert({
      where: { assemblyId_memberId: { assemblyId: row.id, memberId: user.memberId } },
      create: {
        assemblyId: row.id,
        memberId: user.memberId,
        seat: 'INVITED',
        response,
        respondedAt: now,
      },
      update: {
        response,
        respondedAt: now,
        isRemoved: false,
        seat: existing?.seat ?? 'INVITED',
      },
    });
  });

  return {
    ok: true,
    data: {
      identifier: row.assemblyNumber ?? row.id,
      response: seat.response as AssemblyResponse,
      respondedAt: seat.respondedAt?.toISOString() ?? now.toISOString(),
    },
  };
}

export { isAssemblyOfficer } from './access';