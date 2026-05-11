export function Card({ title, children, className = '', actions }) {
  return (
    <section className={`card ${className}`.trim()}>
      {(title || actions) && (
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1rem',
            flexWrap: 'wrap',
          }}
        >
          {title && <h2 style={{ margin: 0, fontSize: '1.05rem' }}>{title}</h2>}
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
