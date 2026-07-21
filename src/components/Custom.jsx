import { useRef } from 'react';
import CrosshairPreview from './CrosshairPreview.jsx';
import { SliderRow } from './ControlRows.jsx';
import { fileToCrosshairImage } from '../defaults.js';

export default function Custom({ config, setConfig, onApply, overlayOn }) {
  const inputRef = useRef(null);
  const image = config.image || { src: '', size: 64, opacity: 100 };
  const hasImage = Boolean(image.src);

  const updateImage = (patch) => {
    setConfig((prev) => ({
      ...prev,
      mode: 'image',
      name: 'Custom',
      image: { ...prev.image, ...patch },
    }));
  };

  const loadFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const src = await fileToCrosshairImage(file);
      setConfig((prev) => ({
        ...prev,
        mode: 'image',
        name: 'Custom',
        id: `custom-${Date.now()}`,
        image: {
          src,
          size: prev.image?.size || 64,
          opacity: prev.image?.opacity ?? 100,
        },
      }));
    } catch {
      // ignore bad files
    }
  };

  const clearImage = () => {
    setConfig((prev) => ({
      ...prev,
      mode: 'shape',
      name: 'Cross',
      image: { ...prev.image, src: '' },
    }));
  };

  return (
    <div className="crosshair-page">
      <section className="col">
        <h2 className="col-title">Custom</h2>
        <p className="hint">Upload an image for your crosshair.</p>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            loadFile(file);
          }}
        />

        <button
          type="button"
          className="upload-zone"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            loadFile(e.dataTransfer.files?.[0]);
          }}
        >
          {hasImage ? (
            <span>Replace</span>
          ) : (
            <>
              <strong>Upload</strong>
              <span>or drag here</span>
            </>
          )}
        </button>

        <div className="control-list" style={{ marginTop: 16 }}>
          <SliderRow
            label="Size"
            value={image.size}
            min={16}
            max={200}
            onChange={(v) => updateImage({ size: v })}
          />
          <SliderRow
            label="Opacity"
            value={image.opacity}
            min={0}
            max={100}
            suffix="%"
            onChange={(v) => updateImage({ opacity: v })}
          />
          <SliderRow
            label="Rotation"
            value={config.rotation}
            min={0}
            max={360}
            suffix="°"
            onChange={(v) => setConfig((prev) => ({ ...prev, rotation: v, mode: 'image' }))}
          />
          <SliderRow
            label="Scale"
            value={Number((config.scale || 1).toFixed(2))}
            min={0.5}
            max={3}
            step={0.05}
            onChange={(v) => setConfig((prev) => ({ ...prev, scale: v, mode: 'image' }))}
          />
        </div>

        {hasImage && (
          <button type="button" className="reset-btn" onClick={clearImage}>
            Clear
          </button>
        )}
      </section>

      <section className="col">
        <h2 className="col-title">Preview</h2>
        <div className="preview-box">
          {hasImage ? (
            <CrosshairPreview config={{ ...config, mode: 'image' }} size={180} />
          ) : (
            <div className="preview-empty">No image</div>
          )}
        </div>
        <div className="apply-wrap">
          <button
            type="button"
            className={`apply-btn ${overlayOn && config.mode === 'image' ? 'active' : ''}`}
            disabled={!hasImage}
            onClick={onApply}
          >
            {overlayOn && config.mode === 'image' ? 'Applied' : 'Apply'}
          </button>
        </div>
      </section>
    </div>
  );
}
