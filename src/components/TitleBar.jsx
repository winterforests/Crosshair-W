import { useState } from 'react';

export default function TitleBar() {
  const api = window.crosshairW;
  const [imgError, setImgError] = useState(false);

  return (
    <header className="titlebar">
      <div className="titlebar-brand">
        {!imgError ? (
          <img
            src="/logo.png"
            alt="CrosshairW"
            onError={() => setImgError(true)}
          />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="#00a3ff" strokeWidth="2" style={{ width: 20, height: 20 }}>
            <circle cx="12" cy="12" r="7" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        )}
        <span>CrosshairW</span>
      </div>
      <div className="titlebar-controls">
        <button type="button" onClick={() => api?.minimize?.()} title="Minimize" aria-label="Minimize">
          <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M1 5h8" />
          </svg>
        </button>
        <button type="button" onClick={() => api?.maximize?.()} title="Maximize" aria-label="Maximize">
          <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="1.5" y="1.5" width="7" height="7" />
          </svg>
        </button>
        <button type="button" className="close" onClick={() => api?.close?.()} title="Close" aria-label="Close">
          <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M2 2l6 6M8 2L2 8" />
          </svg>
        </button>
      </div>
    </header>
  );
}
