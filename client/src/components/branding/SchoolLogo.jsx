import { BRANDING } from '../../utils/constants.js';

export function SchoolLogo({ className = '', height = 48, width = 'auto' }) {
  return (
    <img
      src={BRANDING.LOGO_URL}
      alt={BRANDING.SCHOOL_NAME}
      className={className}
      style={{
        height: height ?? undefined,
        width,
        maxWidth: '100%',
        objectFit: 'contain',
        display: 'block',
      }}
      loading="eager"
      decoding="async"
    />
  );
}
