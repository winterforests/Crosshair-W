import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import CrosshairPreview from './components/CrosshairPreview.jsx';
import { DEFAULT_CROSSHAIR, normalizeConfig } from './defaults.js';

function OverlayApp() {
  const [config, setConfig] = useState(DEFAULT_CROSSHAIR);

  useEffect(() => {
    if (!window.overlayApi) return undefined;
    return window.overlayApi.onConfig((next) => {
      if (next) setConfig(normalizeConfig(next));
    });
  }, []);

  const size =
    config.mode === 'image'
      ? Math.round((config.image?.size || 64) * (config.scale || 1) + 40)
      : Math.round(280 * (config.scale || 1) + (config.lines?.length || 0) * 4 + 80);
  const x = config.position?.x ?? 0;
  const y = config.position?.y ?? 0;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'grid',
        placeItems: 'center',
        background: 'transparent',
        pointerEvents: 'none',
      }}
    >
      <div style={{ transform: `translate(${x}px, ${y}px)` }}>
        <CrosshairPreview config={config} size={size} />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <OverlayApp />
  </StrictMode>
);
