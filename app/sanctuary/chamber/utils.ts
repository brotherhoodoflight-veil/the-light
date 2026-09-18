// ============================================================
// VEIL — Brotherhood Chamber · Client Utilities
// Formatting helpers and safe fetch wrappers for the Chamber UI.
// Client module only — never imports server code.
// ============================================================

export async function chamberFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof body?.error === 'string' ? body.error : 'The chamber request failed.';
    throw new Error(message);
  }
  return body as T;
}

function two(value: number): string {
  return value.toString().padStart(2, '0');
}

/** HH:MM in the viewer's local time. */
export function formatClock(iso: string): string {
  const date = new Date(iso);
  return `${two(date.getHours())}:${two(date.getMinutes())}`;
}

/** Conversation-list label: time today, else DAY MONTH. */
export function formatListTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return formatClock(iso);
  return date
    .toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
    .toUpperCase();
}

/** Day label bar used between message groups. */
export function formatDayLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return 'TODAY';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'YESTERDAY';
  return date
    .toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    .toUpperCase();
}

export function firstWord(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

/** Relative time for notice records: "JUST NOW", "X MIN AGO", "X HR AGO". */
export function formatAgo(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'JUST NOW';
  if (minutes < 60) return `${minutes} MIN AGO`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} HR AGO`;
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'YESTERDAY';
  return date
    .toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
    .toUpperCase();
}

/** The member identity handed from the server page to the chamber. */
export interface ChamberMemberInfo {
  memberId: string;
  fullName: string;
  initials: string;
  /** Official membership photograph; only present when one exists. */
  photoUrl?: string;
  role?: string;
  status?: string;
  country?: string;
  membershipType?: string;
  countryInitiator?: string;
}