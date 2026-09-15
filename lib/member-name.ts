// ============================================================
// VEIL — Member Name Helpers
// Pure display-name utilities shared by the auth mapping and
// the member record panels. No server-only imports.
// ============================================================

/**
 * Monogram initials from the member's individual names,
 * e.g. "Dankwah Kwame Foster" → "DKF".
 */
export function memberInitials(firstName: string, middleName?: string | null, lastName = ''): string {
  const first = firstName.trim().charAt(0).toUpperCase();
  const middle = middleName && middleName.trim() ? middleName.trim().charAt(0).toUpperCase() : '';
  return `${first}${middle}${lastName.trim().charAt(0).toUpperCase()}`;
}

/**
 * Deterministic path of the official membership photograph
 * stored in the public registry bucket.
 */
export function memberPhotoPath(memberId: string): string {
  return `/members/${memberId.toLowerCase()}.jpg`;
}