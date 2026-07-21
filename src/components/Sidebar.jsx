const ICONS = {
  crosshair: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="7" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </svg>
  ),
  designer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  position: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </svg>
  ),
  presets: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  custom: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </svg>
  ),
  about: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6M12 7h.01" />
    </svg>
  ),
};

const NAV = [
  { id: 'crosshair', label: 'Crosshair' },
  { id: 'designer', label: 'Designer' },
  { id: 'custom', label: 'Custom' },
  { id: 'position', label: 'Position' },
  { id: 'presets', label: 'Presets' },
  { id: 'settings', label: 'Settings' },
  { id: 'about', label: 'About' },
];

export default function Sidebar({ page, setPage, overlayOn, onToggleOverlay }) {
  return (
    <aside className="sidebar">
      <nav className="nav">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${page === item.id ? 'active' : ''}`}
            onClick={() => setPage(item.id)}
          >
            {ICONS[item.id]}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="status-label">Status</div>
        <div className="status-row">
          <strong className={overlayOn ? '' : 'off'}>{overlayOn ? 'Active' : 'Inactive'}</strong>
          <button
            type="button"
            className={`switch ${overlayOn ? 'on' : ''}`}
            onClick={onToggleOverlay}
            aria-label="Toggle overlay"
          />
        </div>
        <div className="version">V1.0.0 · Made by winter</div>
      </div>
    </aside>
  );
}
