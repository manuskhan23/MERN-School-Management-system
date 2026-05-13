// client/src/utils/navigation.js
import { ROLES } from './constants';

export const NAV_LINKS = [
  { path: '/', label: 'Dashboard', roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { path: '/classes', label: 'Classes', roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { path: '/assignments', label: 'Assignments', roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { path: '/notifications', label: 'Notifications', roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { path: '/profile', label: 'Profile', roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },

  // Admin specific links
  { path: '/users', label: 'Manage Users', roles: [ROLES.ADMIN] },
  { path: '/admin/students', label: 'All Students', roles: [ROLES.ADMIN] },
  { path: '/teachers', label: 'All Teachers', roles: [ROLES.ADMIN] },
  { path: '/reports', label: 'Reports', roles: [ROLES.ADMIN] },

  // Teacher specific links (some might overlap with general or admin)
  // Assuming '/teacher' is a specific teacher dashboard if different from general '/'
  { path: '/attendance', label: 'Attendance', roles: [ROLES.TEACHER] },
  { path: '/students', label: 'My Students', roles: [ROLES.TEACHER] }, // TeacherStudentsPage
  // Student specific links (some might overlap with general)
];