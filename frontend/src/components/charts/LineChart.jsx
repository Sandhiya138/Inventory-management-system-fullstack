import React, { useState } from 'react';

export const LineChart = ({
  data = [], // [{ label: 'Jan', value: 100 }, ...]
  height = 220,
  strokeColor = '#c85a38',
  gradientId = 'wineGradient',
  valuePrefix = '₹',
  className = '',
}) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted" style={{ height }}>
        No chart data available
      </div>
    );
  }

  const padding = 35;
  const width = 500;
  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 10);
  const minVal = 0;

  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * (width - padding * 2);
    const y = height - padding - ((d.value - minVal) / (maxVal - minVal || 1)) * (height - padding * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce(
    (acc, point, index) =>
      index === 0 ? `M ${point.x},${point.y}` : `${acc} L ${point.x},${point.y}`,
    ''
  );

  const areaD = `${pathD} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`;

  return (
    <div className={`w-full ${className}`} style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.45" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const y = height - padding - pct * (height - padding * 2);
          const val = Math.round(minVal + pct * (maxVal - minVal));
          return (
            <g key={idx}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="var(--border-subtle)"
                strokeDasharray="4 4"
              />
              <text
                x={padding - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="var(--text-muted)"
              >
                {valuePrefix}{new Intl.NumberFormat('en-IN').format(val)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill={`url(#${gradientId})`} />

        {/* Main Line */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points & X-Labels */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredPoint === idx ? 6 : 4}
              fill="var(--bg-card)"
              stroke={strokeColor}
              strokeWidth="2.5"
              style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
              onMouseEnter={() => setHoveredPoint(idx)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
            <text
              x={p.x}
              y={height - 12}
              textAnchor="middle"
              fontSize="11"
              fill={hoveredPoint === idx ? 'var(--color-gold)' : 'var(--text-muted)'}
              fontWeight={hoveredPoint === idx ? '600' : '400'}
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Floating tooltip */}
      {hoveredPoint !== null && (
        <div
          style={{
            position: 'absolute',
            left: `${(points[hoveredPoint].x / width) * 100}%`,
            top: `${(points[hoveredPoint].y / height) * 100 - 20}%`,
            transform: 'translate(-50%, -100%)',
            background: 'var(--bg-modal)',
            border: '1px solid var(--color-gold)',
            borderRadius: 'var(--radius-xs)',
            padding: '4px 8px',
            fontSize: '0.75rem',
            color: 'var(--text-main)',
            boxShadow: 'var(--shadow-md)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 10,
          }}
        >
          <span className="font-bold">{points[hoveredPoint].label}: </span>
          <span className="text-gold font-bold">
            {valuePrefix}{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(points[hoveredPoint].value)}
          </span>
        </div>
      )}
    </div>
  );
};
