// ============================================================
// VEIL — The Assemblies · Shared Types
// Structural DTOs for the Assemblies register. No server-only
// imports — safe for client components and API responses.
//
// Honesty rules carried into every DTO:
//   • Identifier/register numbers appear only for genuine records.
//   • No assembly, seat, attendance, or record is synthesized here.
// ============================================================

export type AssemblyClassification =
  | 'THE OPEN ASSEMBLY'
  | 'THE INNER ASSEMBLY'
  | 'THE SILENT ASSEMBLY'
  | "THE WATCHER'S ASSEMBLY"
  | 'THE ASSEMBLY OF LIGHT'
  | 'THE LAST ASSEMBLY';

/** Assembly lifecycle. These are Assembly statuses — NOT member ranks. */
export type AssemblyStatus =
  | 'CALLED'
  | 'ANNOUNCED'
  | 'GATHERED'
  | 'OPENED'
  | 'IN SESSION'
  | 'CLOSED'
  | 'SEALED'
  | 'ARCHIVED';

/** Access controls governing who may see and answer a call. */
export type AssemblyAccessLevel =
  | 'BROTHERHOOD'
  | 'COUNTRY'
  | 'INVITED'
  | 'RESTRICTED'
  | 'INNER';

/** A member's place in an assembly. */
export type AssemblySeat = 'INVITED' | 'SEATED';

/** Reply to the summons. */
export type AssemblyResponse = 'PENDING' | 'WILL_ATTEND' | 'CANNOT_ATTEND';

/** The Record of Presence. */
export type AttendanceDisposition = 'PRESENT' | 'ABSENT' | 'EXCUSED';

export type AssemblyRecordStatus =
  | 'PENDING'
  | 'PRESERVED'
  | 'SEALED'
  | 'INCOMPLETE'
  | 'LOST';

export type AssemblyDocumentStatus = 'PRESERVED' | 'SEALED' | 'FRAGMENT';

/** A Brother named in an assembly record. Never email/phone/address. */
export interface AssemblyNameRef {
  memberId: string;
  fullName: string;
  country: string | null;
}

export interface AssemblySeatRef {
  memberId: string;
  fullName: string;
  country: string | null;
  seat: AssemblySeat;
  response: AssemblyResponse;
}

export interface AssemblyAttendanceRef {
  memberId: string;
  fullName: string;
  country: string | null;
  disposition: AttendanceDisposition;
  recordedAt: string;
}

export interface AssemblyRecordRef {
  status: AssemblyRecordStatus;
  summary: string | null;
  sealedAt: string | null;
}

export interface AssemblyDocumentRef {
  title: string;
  classification: string;
  reference: string | null;
  status: AssemblyDocumentStatus;
  body: string | null;
}

/** A conviction visible to the requesting member. */
export interface AssemblySummaryDto {
  /** Register identity — assemblyNumber when one is recorded, else the
   *  internal id. Never invented to fill a gap. */
  identifier: string;
  id: string;
  title: string;
  classification: AssemblyClassification;
  status: AssemblyStatus;
  accessLevel: AssemblyAccessLevel;
  purpose: string;
  country: string | null;
  location: string | null;
  hourOfDay: string | null;
  convenedAt: string;
  witnessDeclamation: string | null;
  presidingMember: AssemblyNameRef | null;
  issuedByMember: AssemblyNameRef | null;
  discussionConversationId: string | null;

  /** Viewer state — derived server-side from the authenticated call. */
  mySeat: AssemblySeatRef | null;
  response: AssemblyResponse;
  myAttendance: AttendanceDisposition | null;
  authorizedMemberCount: number;
  attendanceCount: number;
}

export interface AssembliesIndex {
  next: AssemblySummaryDto | null;
  calls: AssemblySummaryDto[];
  chambers: AssemblySummaryDto[];
  records: AssemblySummaryDto[];
  sealed: AssemblySummaryDto[];
  archive: AssemblySummaryDto[];
}

/** The Assembly Chamber — full record, only for authorized viewers. */
export interface AssemblyChamberDto extends AssemblySummaryDto {
  seats: AssemblySeatRef[];
  attendance: AssemblyAttendanceRef[];
  record: AssemblyRecordRef | null;
  documents: AssemblyDocumentRef[];
}

export interface AssemblyResponseResult {
  identifier: string;
  response: AssemblyResponse;
  respondedAt: string;
}