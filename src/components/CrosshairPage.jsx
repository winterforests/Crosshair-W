import { useState } from 'react';
import CrosshairEditor from './CrosshairEditor.jsx';
import Designer from './Designer.jsx';
import Custom from './Custom.jsx';
import Position from './Position.jsx';

export default function CrosshairPage({
  config,
  setConfig,
  onReset,
  onApply,
  overlayOn,
  draft,
  setDraft,
  onStartBlank,
  onLoadCurrent,
  onUseDesign,
}) {
  const [subTab, setSubTab] = useState('tweak');

  return (
    <div className="crosshair-tab-wrap">
      <div className="sub-nav">
        <button
          type="button"
          className={`sub-nav-item ${subTab === 'tweak' ? 'active' : ''}`}
          onClick={() => setSubTab('tweak')}
        >
          Tweak
        </button>
        <button
          type="button"
          className={`sub-nav-item ${subTab === 'designer' ? 'active' : ''}`}
          onClick={() => setSubTab('designer')}
        >
          Designer
        </button>
        <button
          type="button"
          className={`sub-nav-item ${subTab === 'custom' ? 'active' : ''}`}
          onClick={() => setSubTab('custom')}
        >
          Custom Image
        </button>
        <button
          type="button"
          className={`sub-nav-item ${subTab === 'position' ? 'active' : ''}`}
          onClick={() => setSubTab('position')}
        >
          Position
        </button>
      </div>

      {subTab === 'tweak' && (
        <CrosshairEditor
          title="Crosshair"
          config={config}
          setConfig={setConfig}
          onReset={onReset}
          onApply={onApply}
          overlayOn={overlayOn}
        />
      )}
      {subTab === 'designer' && (
        <Designer
          draft={draft}
          setDraft={setDraft}
          onStartBlank={onStartBlank}
          onLoadCurrent={onLoadCurrent}
          onUseDesign={onUseDesign}
          overlayOn={overlayOn}
        />
      )}
      {subTab === 'custom' && (
        <Custom
          config={config}
          setConfig={setConfig}
          onApply={onApply}
          overlayOn={overlayOn}
        />
      )}
      {subTab === 'position' && <Position config={config} setConfig={setConfig} />}
    </div>
  );
}
