import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import CrosshairPreview from './components/CrosshairPreview.jsx';
import { DEFAULT_CROSSHAIR, normalizeConfig, overlayRenderSize } from './defaults.js';

function OverlayApp() {
  const [config, setConfig] = useState(DEFAULT_CROSSHAIR);
  const lastSig = useRef('');

  useEffect(() => {
    if (!window.overlayApi) return undefined;
    return window.overlayApi.onConfig((next) => {
      if (!next) return;
      const normalized = normalizeConfig(next);
      const sig = JSON.stringify(normalized);
      if (sig === lastSig.current) return;
      lastSig.current = sig;
      setConfig(normalized);
    });
  }, []);

  const size = overlayRenderSize(config);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'grid',
        placeItems: 'center',
        background: 'transparent',
        pointerEvents: 'none',
        contain: 'strict',
      }}
    >
      <CrosshairPreview config={config} size={size} />
    </div>
  );
}

createRoot(document.getElementById('root')).render(<OverlayApp />);
