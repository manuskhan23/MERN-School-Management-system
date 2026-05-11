export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

/** Base URL for API + static uploads. Empty string uses Vite dev proxy. */
export const API_BASE = import.meta.env.VITE_API_URL ?? '';

export const BRANDING = {
  SCHOOL_NAME: 'Usman Public School System',
  LOGO_URL: 'https://usman.edu.pk/resources/images/new_logo.png',
  AUTH_BACKGROUND_URL:
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&auto=format&fit=crop&q=80&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c2Nob29sfGVufDB8fDB8fHww',
};
