import CrosshairPreview from './CrosshairPreview.jsx';
import { BUILTIN_PRESET_IDS, shapeLabel } from '../defaults.js';

export default function Presets({ presets, activeId, onSelect, onDelete, onSaveCurrent }) {
  return (
    <div className="page-pad">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>
          Presets
        </h2>
        <button type="button" className="btn btn-primary" onClick={onSaveCurrent}>
          Save
        </button>
      </div>

      <div className="card-list">
        {presets.map((preset) => {
          const builtin = BUILTIN_PRESET_IDS.has(preset.id);
          return (
            <div key={preset.id} className={`card ${preset.id === activeId ? 'active' : ''}`}>
              <div className="card-thumb">
                <CrosshairPreview config={preset} size={40} />
              </div>
              <div className="card-meta">
                <strong>{preset.name || shapeLabel(preset.shape)}</strong>
                <span>{shapeLabel(preset.shape)}</span>
              </div>
              <div className="card-actions">
                <button type="button" className="btn btn-primary" onClick={() => onSelect(preset)}>
                  Use
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={builtin}
                  onClick={() => onDelete(preset.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
