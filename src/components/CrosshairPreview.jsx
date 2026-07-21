function armPath(cx, cy, length, thickness, gap, axis, flip) {
  const halfT = thickness / 2;
  if (axis === 'x') {
    const x1 = cx + (flip ? -(gap + length) : gap);
    const x2 = cx + (flip ? -gap : gap + length);
    return `M ${Math.min(x1, x2)} ${cy - halfT} H ${Math.max(x1, x2)} V ${cy + halfT} H ${Math.min(x1, x2)} Z`;
  }
  const y1 = cy + (flip ? -(gap + length) : gap);
  const y2 = cy + (flip ? -gap : gap + length);
  return `M ${cx - halfT} ${Math.min(y1, y2)} V ${Math.max(y1, y2)} H ${cx + halfT} V ${Math.min(y1, y2)} Z`;
}

export default function CrosshairPreview({ config, size = 220, className = '' }) {
  const cx = size / 2;
  const cy = size / 2;
  const { lines, dot, outline, shape, rotation, blur, scale, mode, image } = config;

  const isImage = mode === 'image' && image?.src;
  const lineOpacity = (lines.opacity ?? 100) / 100;
  const dotOpacity = (dot.opacity ?? 100) / 100;
  const outlineOpacity = (outline.opacity ?? 100) / 100;
  const imageOpacity = (image?.opacity ?? 100) / 100;
  const imageSize = Math.min(size * 0.85, (image?.size ?? 64) * (size / 180));

  const arms = [];
  if (!isImage && lines.enabled) {
    arms.push(armPath(cx, cy, lines.length, lines.thickness, lines.gap, 'x', false));
    arms.push(armPath(cx, cy, lines.length, lines.thickness, lines.gap, 'x', true));
    arms.push(armPath(cx, cy, lines.length, lines.thickness, lines.gap, 'y', false));
    if (shape !== 't') {
      arms.push(armPath(cx, cy, lines.length, lines.thickness, lines.gap, 'y', true));
    }
  }

  const filterId = `b-${size}-${Math.round((blur || 0) * 10)}`;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        transform: `rotate(${rotation || 0}deg) scale(${scale || 1})`,
        filter: blur > 0 ? `url(#${filterId})` : undefined,
      }}
    >
      {blur > 0 && (
        <defs>
          <filter id={filterId}>
            <feGaussianBlur stdDeviation={blur} />
          </filter>
        </defs>
      )}

      {isImage ? (
        <image
          href={image.src}
          x={cx - imageSize / 2}
          y={cy - imageSize / 2}
          width={imageSize}
          height={imageSize}
          opacity={imageOpacity}
          preserveAspectRatio="xMidYMid meet"
        />
      ) : (
        <>
          {outline.enabled &&
            arms.map((d, i) => (
              <path
                key={`o-${i}`}
                d={d}
                fill="none"
                stroke={outline.color}
                strokeOpacity={outlineOpacity}
                strokeWidth={outline.thickness * 2 + lines.thickness}
              />
            ))}

          {outline.enabled && dot.enabled && (
            <circle
              cx={cx}
              cy={cy}
              r={dot.size / 2 + outline.thickness}
              fill={outline.color}
              fillOpacity={outlineOpacity}
            />
          )}

          {arms.map((d, i) => (
            <path key={`a-${i}`} d={d} fill={lines.color} fillOpacity={lineOpacity} />
          ))}

          {dot.enabled && (
            <circle
              cx={cx}
              cy={cy}
              r={dot.size / 2}
              fill={dot.color}
              fillOpacity={dotOpacity}
            />
          )}
        </>
      )}
    </svg>
  );
}
