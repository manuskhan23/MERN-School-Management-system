export function Select({ id, label, className = '', children, ...rest }) {
  return (
    <div className={`field ${className}`.trim()}>
      {label && (
        <label className="label" htmlFor={id}>
          {label}
        </label>
      )}
      <select id={id} className="select" {...rest}>
        {children}
      </select>
    </div>
  );
}
