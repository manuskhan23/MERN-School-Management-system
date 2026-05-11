import { BRANDING } from '../../utils/constants.js';
import { SchoolLogo } from '../branding/SchoolLogo.jsx';

export function AuthPageLayout({ children }) {
  return (
    <div
      className="auth-page-shell"
      style={{ backgroundImage: `url(${BRANDING.AUTH_BACKGROUND_URL})` }}
    >
      <div className="auth-page-inner">
        <div className="auth-brand">
          <SchoolLogo height={56} className="auth-brand-logo" />
          <p className="auth-brand-tagline">{BRANDING.SCHOOL_NAME}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
