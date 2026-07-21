import { useEffect, useState } from 'react';

export default function Settings({ settings, setSettings }) {
  const [displays, setDisplays] = useState([]);

  useEffect(() => {
    window.crosshairW?.listDisplays?.().then(setDisplays).catch(() => {});
  }, []);

  const update = async (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await window.crosshairW?.updateSettings?.(next);
  };

  return (
    <div className="page-pad">
      <h2 className="page-title">Settings</h2>
      <p className="hint">Windowed / borderless works best.</p>
      <div className="set-list">
        <div className="set-row">
          <div>
            <h3>Toggle hotkey</h3>
            <p>Show / hide overlay</p>
          </div>
          <input
            type="text"
            value={settings.toggleHotkey}
            onChange={(e) => update({ toggleHotkey: e.target.value.trim() || 'F7' })}
          />
        </div>

        <div className="set-row">
          <div>
            <h3>Monitor</h3>
            <p>Which screen</p>
          </div>
          <select value={settings.monitor} onChange={(e) => update({ monitor: e.target.value })}>
            <option value="primary">Primary</option>
            {displays.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div className="set-row">
          <div>
            <h3>Hide while ADS</h3>
            <p>Hide on right click</p>
          </div>
          <button
            type="button"
            className={`switch ${settings.hideOnAds ? 'on' : ''}`}
            onClick={() => update({ hideOnAds: !settings.hideOnAds })}
          />
        </div>

        <div className="set-row">
          <div>
            <h3>Launch minimized</h3>
            <p>Start in tray</p>
          </div>
          <button
            type="button"
            className={`switch ${settings.launchMinimized ? 'on' : ''}`}
            onClick={() => update({ launchMinimized: !settings.launchMinimized })}
          />
        </div>
      </div>
    </div>
  );
}
