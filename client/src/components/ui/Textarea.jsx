export function Textarea({ id, label, className = '', ...rest }) {
  return (
    <div className={`field ${className}`.trim()}>
      {label && (
        <label className="label" htmlFor={id}>
          {label}
        </label>
      )}
      <textarea id={id} className="textarea" {...rest} />
    </div>
  );
}
