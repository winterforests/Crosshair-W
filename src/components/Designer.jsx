import CrosshairEditor from './CrosshairEditor.jsx';

export default function Designer({
  draft,
  setDraft,
  onStartBlank,
  onLoadCurrent,
  onUseDesign,
  overlayOn,
}) {
  return (
    <div className="designer-wrap">
      <div className="designer-bar">
        <p className="hint" style={{ marginBottom: 0 }}>
          Build from scratch only
        </p>
        <div className="designer-actions">
          <button type="button" className="btn btn-ghost" onClick={onStartBlank}>
            Start Blank
          </button>
          <button type="button" className="btn btn-ghost" onClick={onLoadCurrent}>
            Load Current
          </button>
          <button type="button" className="btn btn-primary" onClick={onUseDesign}>
            Use
          </button>
        </div>
      </div>
      <CrosshairEditor
        title="Designer"
        config={draft}
        setConfig={setDraft}
        onReset={onStartBlank}
        onApply={onUseDesign}
        overlayOn={overlayOn}
        applyLabel="Use"
        appliedLabel="Using"
      />
    </div>
  );
}
