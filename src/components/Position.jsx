import { useEffect, useState } from 'react';
import CrosshairPreview from './CrosshairPreview.jsx';

const STEPS = [1, 5, 10];

export default function Position({ config, setConfig }) {
  const [step, setStep] = useState(1);
  const x = config.position?.x ?? 0;
  const y = config.position?.y ?? 0;

  const move = (dx, dy) => {
    setConfig((prev) => ({
      ...prev,
      position: {
        x: (prev.position?.x ?? 0) + dx,
        y: (prev.position?.y ?? 0) + dy,
      },
    }));
  };

  const setAxis = (axis, value) => {
    const n = Number(value);
    if (Number.isNaN(n)) return;
    setConfig((prev) => ({
      ...prev,
      position: {
        x: axis === 'x' ? n : prev.position?.x ?? 0,
        y: axis === 'y' ? n : prev.position?.y ?? 0,
      },
    }));
  };

  const center = () => {
    setConfig((prev) => ({
      ...prev,
      position: { x: 0, y: 0 },
    }));
  };

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        move(0, -step);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        move(0, step);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        move(-step, 0);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        move(step, 0);
      } else if (e.key === 'Home') {
        e.preventDefault();
        center();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  return (
    <div className="position-page">
      <section className="col">
        <h2 className="col-title">Position</h2>
        <p className="hint">Arrow keys move it. Values are pixels from center.</p>

        <div className="control-list">
          <div className="ctrl">
            <label>Offset X</label>
            <div className="ctrl-right">
              <input
                className="num"
                type="text"
                value={x}
                onChange={(e) => setAxis('x', e.target.value)}
              />
              <input
                className="slider"
                type="range"
                min={-500}
                max={500}
                value={x}
                style={{ '--slider-pct': `${((x + 500) / 1000) * 100}%` }}
                onChange={(e) => setAxis('x', e.target.value)}
              />
            </div>
          </div>
          <div className="ctrl">
            <label>Offset Y</label>
            <div className="ctrl-right">
              <input
                className="num"
                type="text"
                value={y}
                onChange={(e) => setAxis('y', e.target.value)}
              />
              <input
                className="slider"
                type="range"
                min={-500}
                max={500}
                value={y}
                style={{ '--slider-pct': `${((y + 500) / 1000) * 100}%` }}
                onChange={(e) => setAxis('y', e.target.value)}
              />
            </div>
          </div>

          <div className="ctrl">
            <label>Step</label>
            <div className="ctrl-right">
              <div className="seg">
                {STEPS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={step === s ? 'active' : ''}
                    onClick={() => setStep(s)}
                  >
                    {s}px
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="arrow-pad" tabIndex={0}>
          <button type="button" className="arrow-btn ghost" disabled aria-hidden="true" />
          <button type="button" className="arrow-btn" onClick={() => move(0, -step)} title="Up">
            ↑
          </button>
          <button type="button" className="arrow-btn ghost" disabled aria-hidden="true" />
          <button type="button" className="arrow-btn" onClick={() => move(-step, 0)} title="Left">
            ←
          </button>
          <button type="button" className="arrow-btn center" onClick={center} title="Center">
            ●
          </button>
          <button type="button" className="arrow-btn" onClick={() => move(step, 0)} title="Right">
            →
          </button>
          <button type="button" className="arrow-btn ghost" disabled aria-hidden="true" />
          <button type="button" className="arrow-btn" onClick={() => move(0, step)} title="Down">
            ↓
          </button>
          <button type="button" className="arrow-btn ghost" disabled aria-hidden="true" />
        </div>

        <button type="button" className="reset-btn" onClick={center}>
          Center
        </button>
      </section>

      <section className="col">
        <h2 className="col-title">Preview</h2>
        <div className="preview-box position-preview">
          <div className="position-guides" aria-hidden="true" />
          <div
            className="position-cross"
            style={{ transform: `translate(${x}px, ${y}px)` }}
          >
            <CrosshairPreview config={config} size={120} />
          </div>
        </div>
        <div className="position-readout">
          X {x} · Y {y}
        </div>
      </section>
    </div>
  );
}
