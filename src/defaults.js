export const ACCENT = '#00a3ff';

export const DEFAULT_CROSSHAIR = {
  id: 'builtin-cross',
  name: 'Cross',
  mode: 'shape', // shape | image
  shape: 'cross', // cross | t | x | dot
  lines: {
    enabled: true,
    length: 10,
    thickness: 2,
    gap: 4,
    color: ACCENT,
    opacity: 100,
  },
  dot: {
    enabled: false,
    size: 3,
    color: ACCENT,
    opacity: 100,
  },
  outline: {
    enabled: true,
    thickness: 2,
    color: '#000000',
    opacity: 100,
  },
  image: {
    src: '',
    size: 64,
    opacity: 100,
  },
  rotation: 0,
  blur: 0,
  scale: 1,
  position: { x: 0, y: 0 },
};

/** Blank canvas — everything off so you build from scratch */
export const BLANK_CROSSHAIR = {
  id: 'blank',
  name: 'Cross',
  mode: 'shape',
  shape: 'cross',
  lines: {
    enabled: false,
    length: 10,
    thickness: 2,
    gap: 4,
    color: ACCENT,
    opacity: 100,
  },
  dot: {
    enabled: false,
    size: 3,
    color: ACCENT,
    opacity: 100,
  },
  outline: {
    enabled: false,
    thickness: 2,
    color: '#000000',
    opacity: 100,
  },
  image: {
    src: '',
    size: 64,
    opacity: 100,
  },
  rotation: 0,
  blur: 0,
  scale: 1,
  position: { x: 0, y: 0 },
};

function preset(id, name, patch = {}) {
  const base = structuredClone(DEFAULT_CROSSHAIR);
  return {
    ...base,
    ...patch,
    id,
    name,
    mode: 'shape',
    lines: { ...base.lines, ...(patch.lines || {}) },
    dot: { ...base.dot, ...(patch.dot || {}) },
    outline: { ...base.outline, ...(patch.outline || {}) },
    image: { ...base.image, ...(patch.image || {}) },
    position: { ...base.position, ...(patch.position || {}) },
  };
}

export const SAMPLE_PRESETS = [
  preset('builtin-cross', 'Cross', { shape: 'cross' }),
  preset('builtin-x', 'X Classic', { shape: 'x' }),
  preset('builtin-t', 'T-Shape', { shape: 't' }),
  preset('builtin-dot', 'Dot', {
    shape: 'dot',
    lines: { enabled: false },
    dot: { enabled: true, size: 4 },
  }),
];

export const BUILTIN_PRESET_IDS = new Set(SAMPLE_PRESETS.map((p) => p.id));

/** Drop old bulk built-ins, keep built-ins + user presets */
export function mergePresets(saved) {
  const user = (saved || []).filter(
    (p) => !BUILTIN_PRESET_IDS.has(p.id) && !String(p.id).startsWith('builtin-')
  );
  return [...SAMPLE_PRESETS.map((p) => structuredClone(p)), ...user];
}

export const SHAPES = ['cross', 't', 'x', 'dot'];

export function shapeLabel(shape) {
  if (shape === 't') return 'T';
  if (shape === 'x') return 'X';
  if (shape === 'dot') return 'Dot';
  return 'Cross';
}

export function applyShape(config, shape) {
  const next = structuredClone(config);
  next.mode = 'shape';
  next.shape = shape;
  next.name = shapeLabel(shape);
  if (shape === 'dot') {
    next.lines.enabled = false;
    next.dot.enabled = true;
  } else {
    next.lines.enabled = true;
  }
  return next;
}

export function overlayRenderSize(config) {
  if (!config) return 200;
  if (config.mode === 'image') {
    return Math.min(320, Math.round((config.image?.size || 64) * (config.scale || 1) + 48));
  }
  const len = config.lines?.length || 10;
  const scale = config.scale || 1;
  return Math.min(320, Math.round((len * 2 + 32) * scale + 48));
}

export function normalizeConfig(config) {
  const base = structuredClone(DEFAULT_CROSSHAIR);
  if (!config) return base;
  return {
    ...base,
    ...config,
    mode: config.mode === 'image' ? 'image' : 'shape',
    lines: { ...base.lines, ...(config.lines || {}) },
    dot: { ...base.dot, ...(config.dot || {}) },
    outline: { ...base.outline, ...(config.outline || {}) },
    image: { ...base.image, ...(config.image || {}) },
    position: { ...base.position, ...(config.position || {}) },
  };
}

/** Resize/compress image for storage + overlay use */
export function fileToCrosshairImage(file, maxSize = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
