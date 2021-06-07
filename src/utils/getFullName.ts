/**
 * Returns full name.
 */
export function getFullName(
  firstName: string | undefined,
  lastName: string,
): string {
  return [firstName, lastName].filter(Boolean).join(' ')
}
