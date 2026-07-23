import CrosshairPreview from './CrosshairPreview.jsx';
import { SliderRow, ToggleRow, ColorRow } from './ControlRows.jsx';
import { SHAPES, applyShape, shapeLabel } from '../defaults.js';

/** Shared editor columns used by Crosshair + Designer */
export default function CrosshairEditor({
  title = 'Crosshair',
  config,
  setConfig,
  onReset,
  onApply,
  overlayOn,
  applyLabel,
  appliedLabel = 'Applied',
  headerExtra = null,
}) {
  const update = (path, value) => {
    setConfig((prev) => {
      const next = structuredClone(prev);
      next.mode = 'shape';
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const cycleShape = (dir) => {
    const current = SHAPES.includes(config.shape) ? config.shape : 'cross';
    const i = SHAPES.indexOf(current);
    const next = SHAPES[(i + dir + SHAPES.length) % SHAPES.length];
    setConfig((prev) => applyShape(prev, next));
  };

  return (
    <div className="crosshair-page">
      <section className="col">
        <div className="col-head">
          <h2 className="col-title">{title}</h2>
          {headerExtra}
        </div>
        <div className="control-list scroll">
          <div className="ctrl">
            <label>Type</label>
            <div className="ctrl-right">
              <div className="type-picker">
                <button type="button" onClick={() => cycleShape(-1)} aria-label="Previous type">
                  ‹
                </button>
                <span>{shapeLabel(config.shape)}</span>
                <button type="button" onClick={() => cycleShape(1)} aria-label="Next type">
                  ›
                </button>
              </div>
            </div>
          </div>

          <ToggleRow
            label="Lines"
            on={config.lines.enabled}
            onToggle={() => update('lines.enabled', !config.lines.enabled)}
          />
          <ColorRow
            label="Line Color"
            value={config.lines.color}
            onChange={(v) => update('lines.color', v)}
          />
          <SliderRow
            label="Thickness"
            value={config.lines.thickness}
            min={1}
            max={12}
            onChange={(v) => update('lines.thickness', v)}
          />
          <SliderRow
            label="Length"
            value={config.lines.length}
            min={1}
            max={40}
            onChange={(v) => update('lines.length', v)}
          />
          <SliderRow
            label="Gap"
            value={config.lines.gap}
            min={0}
            max={30}
            onChange={(v) => update('lines.gap', v)}
          />
          <SliderRow
            label="Line Opacity"
            value={config.lines.opacity}
            min={0}
            max={100}
            suffix="%"
            onChange={(v) => update('lines.opacity', v)}
          />

          <ToggleRow
            label="Outline"
            on={config.outline.enabled}
            onToggle={() => update('outline.enabled', !config.outline.enabled)}
          />
          <ColorRow
            label="Outline Color"
            value={config.outline.color}
            onChange={(v) => update('outline.color', v)}
          />
          <SliderRow
            label="Outline Thickness"
            value={config.outline.thickness}
            min={0}
            max={8}
            onChange={(v) => update('outline.thickness', v)}
          />
          <SliderRow
            label="Outline Opacity"
            value={config.outline.opacity}
            min={0}
            max={100}
            suffix="%"
            onChange={(v) => update('outline.opacity', v)}
          />

          <ToggleRow
            label="Dot"
            on={config.dot.enabled}
            onToggle={() => update('dot.enabled', !config.dot.enabled)}
          />
          <ColorRow
            label="Dot Color"
            value={config.dot.color}
            onChange={(v) => update('dot.color', v)}
          />
          <SliderRow
            label="Dot Size"
            value={config.dot.size}
            min={1}
            max={20}
            onChange={(v) => update('dot.size', v)}
          />
          <SliderRow
            label="Dot Opacity"
            value={config.dot.opacity}
            min={0}
            max={100}
            suffix="%"
            onChange={(v) => update('dot.opacity', v)}
          />

          <SliderRow
            label="Rotation"
            value={config.rotation}
            min={0}
            max={360}
            suffix="°"
            onChange={(v) => update('rotation', v)}
          />
          <SliderRow
            label="Blur"
            value={config.blur}
            min={0}
            max={8}
            step={0.5}
            onChange={(v) => update('blur', v)}
          />
          <SliderRow
            label="Scale"
            value={Number(config.scale.toFixed(2))}
            min={0.5}
            max={3}
            step={0.05}
            onChange={(v) => update('scale', v)}
          />
        </div>

        {onReset && (
          <button type="button" className="reset-btn" onClick={onReset}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
            </svg>
            Reset
          </button>
        )}
      </section>

      <section className="col">
        <h2 className="col-title">Preview</h2>
        <div className="preview-box">
          <CrosshairPreview config={config} size={180} />
        </div>
        <div className="apply-wrap">
          <button
            type="button"
            className={`apply-btn ${overlayOn ? 'active' : ''}`}
            onClick={onApply}
          >
            {overlayOn ? appliedLabel : applyLabel || 'Apply'}
          </button>
        </div>
      </section>
    </div>
  );
}
