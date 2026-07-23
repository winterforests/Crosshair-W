export function SliderRow({ label, value, min, max, step = 1, suffix = '', onChange }) {
  const pct = max === min ? 0 : ((Number(value) - min) / (max - min)) * 100;

  return (
    <div className="ctrl">
      <label>{label}</label>
      <div className="ctrl-right">
        <input
          className="num"
          type="text"
          value={`${value}${suffix}`}
          onChange={(e) => {
            const n = Number(String(e.target.value).replace(/[^\d.-]/g, ''));
            if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
          }}
        />
        <input
          className="slider"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          style={{ '--slider-pct': `${pct}%` }}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
}

export function ToggleRow({ label, on, onToggle }) {
  return (
    <div className="ctrl">
      <label>{label}</label>
      <div className="ctrl-right">
        <button
          type="button"
          className={`switch ${on ? 'on' : ''}`}
          onClick={onToggle}
          aria-pressed={on}
        />
      </div>
    </div>
  );
}

export function ColorRow({ label, value, onChange }) {
  return (
    <div className="ctrl">
      <label>{label}</label>
      <div className="ctrl-right">
        <input
          className="color-swatch"
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export function useConfigUpdate(setConfig) {
  return (path, value) => {
    setConfig((prev) => {
      const next = structuredClone(prev);
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };
}
