import { ROLES } from './constants.js';

/** Default landing route after login (and logo home link) for each role. */
export function homePathForRole(role) {
  if (role === ROLES.TEACHER) return '/teacher';
  if (role === ROLES.STUDENT) return '/student';
  return '/';
}
