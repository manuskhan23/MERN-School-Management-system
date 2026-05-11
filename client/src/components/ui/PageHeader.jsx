export function PageHeader({ title, subtitle }) {
  return (
    <header>
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-sub">{subtitle}</p>}
    </header>
  );
}
