export function Button({ variant = 'primary', className = '', type = 'button', disabled, children, ...rest }) {
  const v = variant === 'ghost' ? 'btn-ghost' : variant === 'danger' ? 'btn-danger' : 'btn-primary';
  return (
    <button type={type} className={`btn ${v} ${className}`.trim()} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}
