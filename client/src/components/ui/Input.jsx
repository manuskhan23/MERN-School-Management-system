export function Input({ id, label, className = '', ...rest }) {
  return (
    <div className={`field ${className}`.trim()}>
      {label && (
        <label className="label" htmlFor={id}>
          {label}
        </label>
      )}
      <input id={id} className="input" {...rest} />
    </div>
  );
}
