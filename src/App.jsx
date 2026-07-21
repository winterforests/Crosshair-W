import { useEffect, useRef, useState } from 'react';
import TitleBar from './components/TitleBar.jsx';
import Sidebar from './components/Sidebar.jsx';
import CrosshairPage from './components/CrosshairPage.jsx';
import Designer from './components/Designer.jsx';
import Position from './components/Position.jsx';
import Custom from './components/Custom.jsx';
import Presets from './components/Presets.jsx';
import Settings from './components/Settings.jsx';
import About from './components/About.jsx';
import {
  BLANK_CROSSHAIR,
  DEFAULT_CROSSHAIR,
  mergePresets,
  normalizeConfig,
  shapeLabel,
} from './defaults.js';

const LOCAL_KEY = 'crosshairw-save';
const LEGACY_KEYS = ['crosshairw-state-v7', 'crosshairw-state-v6', 'crosshairw-state-v5'];

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw);
    for (const key of LEGACY_KEYS) {
      const legacy = localStorage.getItem(key);
      if (legacy) {
        const parsed = JSON.parse(legacy);
        localStorage.setItem(LOCAL_KEY, legacy);
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function writeLocal(data) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

const api = () => window.crosshairW;

const defaultSettings = {
  toggleHotkey: 'F7',
  monitor: 'primary',
  hideOnAds: false,
  launchMinimized: false,
};

export default function App() {
  const boot = useRef(readLocal());
  const ready = useRef(false);
  const restoredOverlay = useRef(false);

  const [booted, setBooted] = useState(false);
  const [page, setPage] = useState('crosshair');
  const [config, setConfig] = useState(
    normalizeConfig(boot.current?.config ?? structuredClone(DEFAULT_CROSSHAIR))
  );
  const [draft, setDraft] = useState(
    normalizeConfig(boot.current?.draft ?? structuredClone(BLANK_CROSSHAIR))
  );
  const [presets, setPresets] = useState(mergePresets(boot.current?.presets));
  const [settings, setSettings] = useState(boot.current?.settings ?? defaultSettings);
  const [overlayEnabledWanted, setOverlayEnabledWanted] = useState(
    Boolean(boot.current?.overlayEnabled)
  );
  const [overlay, setOverlay] = useState({ enabled: false, visible: false, hotkey: 'F7' });
  const [toast, setToast] = useState('');

  // Prefer disk save from Electron userData on startup
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const disk = await api()?.loadSave?.();
      if (!cancelled && disk?.config) {
        setConfig(normalizeConfig(disk.config));
        if (disk.draft) setDraft(normalizeConfig(disk.draft));
        if (disk.presets) setPresets(mergePresets(disk.presets));
        else setPresets(mergePresets(null));
        if (disk.settings) setSettings({ ...defaultSettings, ...disk.settings });
        if (typeof disk.overlayEnabled === 'boolean') {
          setOverlayEnabledWanted(disk.overlayEnabled);
        }
      }
      if (!cancelled) {
        ready.current = true;
        setBooted(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist last crosshair + overlay state
  useEffect(() => {
    if (!ready.current) return undefined;
    const payload = {
      config,
      draft,
      presets,
      settings,
      overlayEnabled: overlayEnabledWanted,
      savedAt: Date.now(),
    };
    writeLocal(payload);
    const t = setTimeout(() => {
      api()?.writeSave?.(payload);
    }, 150);
    return () => clearTimeout(t);
  }, [config, draft, presets, settings, overlayEnabledWanted]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!booted) return;
    api()?.setOverlayConfig?.(config);
  }, [config, booted]);

  useEffect(() => {
    if (!booted) return;
    api()?.updateSettings?.(settings);
  }, [settings, booted]);

  useEffect(() => {
    let off;
    (async () => {
      const status = await api()?.getOverlayStatus?.();
      if (status) setOverlay(status);
      off = api()?.onOverlayStatus?.((s) => setOverlay(s));
    })();
    return () => off?.();
  }, []);

  // Restore overlay if it was on last time
  useEffect(() => {
    if (!booted || restoredOverlay.current) return;
    restoredOverlay.current = true;
    (async () => {
      await api()?.setOverlayConfig?.(config);
      if (overlayEnabledWanted) {
        const status = await api()?.setOverlayEnabled?.(true);
        if (status) setOverlay((prev) => ({ ...prev, ...status }));
      }
    })();
  }, [booted, overlayEnabledWanted, config]);

  const overlayOn = Boolean(overlay.enabled && overlay.visible);

  const setOverlayEnabled = async (enabled) => {
    const status = await api()?.setOverlayEnabled?.(enabled);
    if (status) setOverlay((prev) => ({ ...prev, ...status }));
    setOverlayEnabledWanted(Boolean(enabled));
  };

  const toggleOverlay = async () => {
    if (!overlay.enabled) {
      await setOverlayEnabled(true);
      setToast('On');
      return;
    }
    await setOverlayEnabled(false);
    setToast('Off');
  };

  const onApply = async () => {
    await api()?.setOverlayConfig?.(config);
    if (!overlay.enabled) await setOverlayEnabled(true);
    else setOverlayEnabledWanted(true);
    setToast('Applied');
  };

  const onReset = () => {
    setConfig((prev) =>
      normalizeConfig({
        ...structuredClone(DEFAULT_CROSSHAIR),
        position: prev.position || { x: 0, y: 0 },
      })
    );
    setToast('Reset');
  };

  const onStartBlank = () => {
    setDraft(
      normalizeConfig({
        ...structuredClone(BLANK_CROSSHAIR),
        position: config.position || { x: 0, y: 0 },
      })
    );
    setToast('Blank');
  };

  const onLoadCurrent = () => {
    setDraft(structuredClone(config));
    setToast('Loaded');
  };

  const onUseDesign = async () => {
    const next = normalizeConfig({
      ...structuredClone(draft),
      mode: 'shape',
      id: `design-${Date.now()}`,
      name: shapeLabel(draft.shape),
      position: config.position || { x: 0, y: 0 },
    });
    setConfig(next);
    await api()?.setOverlayConfig?.(next);
    if (!overlay.enabled) await setOverlayEnabled(true);
    else setOverlayEnabledWanted(true);
    setPage('crosshair');
    setToast('Applied');
  };

  const savePreset = () => {
    const name = window.prompt('Name', shapeLabel(config.shape));
    if (!name) return;
    const next = { ...structuredClone(config), id: `preset-${Date.now()}`, name };
    setPresets((prev) => [next, ...prev]);
    setConfig(next);
    setToast('Saved');
  };

  const selectPreset = (preset) => {
    setConfig(
      normalizeConfig({
        ...structuredClone(preset),
        mode: 'shape',
        position: config.position || { x: 0, y: 0 },
      })
    );
    setPage('crosshair');
    setToast('Loaded');
  };

  const deletePreset = (id) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
    setToast('Deleted');
  };

  return (
    <div className="app">
      <TitleBar />
      <div className="body">
        <Sidebar
          page={page}
          setPage={setPage}
          overlayOn={overlayOn}
          onToggleOverlay={toggleOverlay}
        />
        <main className="main">
          <div className="page">
            {page === 'crosshair' && (
              <CrosshairPage
                config={config}
                setConfig={setConfig}
                onReset={onReset}
                onApply={onApply}
                overlayOn={overlayOn}
              />
            )}
            {page === 'designer' && (
              <Designer
                draft={draft}
                setDraft={setDraft}
                onStartBlank={onStartBlank}
                onLoadCurrent={onLoadCurrent}
                onUseDesign={onUseDesign}
                overlayOn={overlayOn}
              />
            )}
            {page === 'custom' && (
              <Custom
                config={config}
                setConfig={setConfig}
                onApply={onApply}
                overlayOn={overlayOn}
              />
            )}
            {page === 'position' && <Position config={config} setConfig={setConfig} />}
            {page === 'presets' && (
              <Presets
                presets={presets}
                activeId={config.id}
                onSelect={selectPreset}
                onDelete={deletePreset}
                onSaveCurrent={savePreset}
              />
            )}
            {page === 'settings' && (
              <Settings settings={settings} setSettings={setSettings} />
            )}
            {page === 'about' && <About />}
          </div>
        </main>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
