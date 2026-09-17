// ============================================================
// VEIL — The Assemblies · Registers and Ceremonial Language
// The authoritative labels, orders, and canon statements of the
// Assemblies register. No server-only imports.
//
// The six classifications, the lifecycle, and the access levels
// are canonical Brotherhood structures. Nothing here is invented
// to fill a gap in the database — the register stays empty until
// a genuine record exists.
// ============================================================

import type {
  AssemblyAccessLevel,
  AssemblyClassification,
  AssemblyDocumentStatus,
  AssemblyRecordStatus,
  AssemblyResponse,
  AssemblyStatus,
  AttendanceDisposition,
} from './types';

// --- The Six Classifications ---

export const CLASSIFICATIONS: AssemblyClassification[] = [
  'THE OPEN ASSEMBLY',
  'THE INNER ASSEMBLY',
  'THE SILENT ASSEMBLY',
  "THE WATCHER'S ASSEMBLY",
  'THE ASSEMBLY OF LIGHT',
  'THE LAST ASSEMBLY',
];

export const CLASSIFICATION_COPY: Record<
  AssemblyClassification,
  string
> = {
  'THE OPEN ASSEMBLY':
    'A conviction open to the active Brotherhood at large.',
  'THE INNER ASSEMBLY':
    'A gathering of the inner body; attendance is by grant.',
  'THE SILENT ASSEMBLY':
    'Assembled in silence. The record carries no word.',
  "THE WATCHER'S ASSEMBLY":
    'Convoked under witness. What is seen is afterwards recorded.',
  'THE ASSEMBLY OF LIGHT':
    'A ceremonial conviction of the Brotherhood under the Light.',
  'THE LAST ASSEMBLY':
    'The final gathering. The record of an ending.',
};

// --- The Lifecycle (Assembly statuses, not member ranks) ---

export const LIFE_CYCLE: AssemblyStatus[] = [
  'CALLED',
  'ANNOUNCED',
  'GATHERED',
  'OPENED',
  'IN SESSION',
  'CLOSED',
  'SEALED',
  'ARCHIVED',
];

export const STATUS_STAGE: Record<AssemblyStatus, number> = {
  CALLED: 1,
  ANNOUNCED: 2,
  GATHERED: 3,
  OPENED: 4,
  'IN SESSION': 5,
  CLOSED: 6,
  SEALED: 7,
  ARCHIVED: 8,
};

export const STATUS_COPY: Record<AssemblyStatus, string> = {
  CALLED: 'A summons has been issued.',
  ANNOUNCED: 'The summons is known. The hour approaches.',
  GATHERED: 'The invited have come.',
  OPENED: 'The assembly is formally convened.',
  'IN SESSION': 'The assembly deliberates.',
  CLOSED: 'The assembly has ended.',
  SEALED: 'The record is preserved under seal.',
  ARCHIVED: 'The record is entered into the archive.',
};

/** Assemblies still open to a call or deliberation. */
export const ACTIVE_STAGES: AssemblyStatus[] = [
  'CALLED',
  'ANNOUNCED',
  'GATHERED',
  'OPENED',
  'IN SESSION',
];

// --- Access Levels (access controls, not ranks) ---

export const ACCESS_LEVELS: AssemblyAccessLevel[] = [
  'BROTHERHOOD',
  'COUNTRY',
  'INVITED',
  'RESTRICTED',
  'INNER',
];

export const ACCESS_COPY: Record<AssemblyAccessLevel, string> = {
  BROTHERHOOD: 'Every active Brother of the Order.',
  COUNTRY: 'The Brothers of one country of record.',
  INVITED: 'Those named in the call.',
  RESTRICTED: 'Those granted a seat by authority.',
  INNER: 'The innermost chamber. Granted only.',
};

// --- Replies to the summons ---

export const RESPONSE_LABELS: Record<AssemblyResponse, string> = {
  PENDING: 'PENDING',
  WILL_ATTEND: 'I WILL ATTEND',
  CANNOT_ATTEND: 'I CANNOT ATTEND',
};

// --- The Record of Presence ---

export const ATTENDANCE_LABELS: Record<AttendanceDisposition, string> = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  EXCUSED: 'EXCUSED',
};

// --- Record and document conditions ---

export const RECORD_STATUS_LABELS: Record<AssemblyRecordStatus, string> = {
  PENDING: 'PENDING',
  PRESERVED: 'PRESERVED',
  SEALED: 'SEALED',
  INCOMPLETE: 'INCOMPLETE',
  LOST: 'LOST',
};

export const DOCUMENT_STATUS_LABELS: Record<AssemblyDocumentStatus, string> = {
  PRESERVED: 'PRESERVED',
  SEALED: 'SEALED',
  FRAGMENT: 'FRAGMENT',
};

// --- Ceremonial language (used sparingly) ---

export const CEREMONIAL = {
  /** The principal empty-state edict. */
  noAssemblyCalled: 'NO ASSEMBLY HAS BEEN CALLED.',
  noAssemblyCalledSub: 'The Brotherhood has issued no forthcoming summons.',
  noSummonsAwait: 'NO SUMMONS AWAIT YOUR REPLY.',
  noSummonsAwaitSub:
    'When the Brotherhood issues a call, your answer will be recorded here.',
  callsIssued: 'A CALL HAS BEEN ISSUED.',
  attendanceStatement: 'THE VEIL RECORDS BOTH PRESENCE AND ABSENCE.',
  attendanceNotOpen: 'ATTENDANCE RECORD NOT YET OPEN.',
  chamberClosed: 'THE CHAMBER IS CLOSED.',
  recordRemains: 'THE RECORD REMAINS.',
  witnessName: 'THE GREAT AMAL HAMZAAD',
  witnessEpithet: 'THE SECRET HIDDEN ANGEL',
  closingTop: 'EVERY ASSEMBLY ENDS.',
  closingBottom: 'NOT EVERY RECORD DOES.',
  conversationLink: 'ENTER THE CHAMBER DISCUSSION',
} as const;