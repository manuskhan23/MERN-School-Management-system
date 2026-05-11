export function Badge({ role, status, children }) {
  if (children) {
    return <span className="badge">{children}</span>;
  }
  if (role) {
    const c = role === 'admin' ? 'badge-admin' : role === 'teacher' ? 'badge-teacher' : 'badge-student';
    return <span className={`badge ${c}`}>{role}</span>;
  }
  if (status) {
    const c = status === 'active' ? 'badge-active' : 'badge-suspended';
    return <span className={`badge ${c}`}>{status}</span>;
  }
  return null;
}
