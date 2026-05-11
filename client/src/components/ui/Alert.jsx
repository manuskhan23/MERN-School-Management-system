export function Alert({ type = 'error', message }) {
  if (!message) return null;
  return <div className={type === 'success' ? 'success-banner' : 'error-banner'}>{message}</div>;
}
