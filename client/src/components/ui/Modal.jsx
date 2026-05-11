import { Button } from './Button.jsx';

export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.15rem' }}>{title}</h2>
          <Button type="button" variant="ghost" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </header>
        <div style={{ marginTop: '1rem' }}>{children}</div>
        {footer && <footer style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>{footer}</footer>}
      </div>
    </div>
  );
}
