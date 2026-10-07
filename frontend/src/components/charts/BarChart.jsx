import React, { useState } from 'react';

export const BarChart = ({
  data = [], // [{ label: 'Mon', value: 45 }, ...]
  height = 220,
  barColor = 'var(--color-terracotta)',
  hoverColor = 'var(--color-gold)',
  valuePrefix = '',
  className = '',
}) => {
  const [hoveredBar, setHoveredBar] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted" style={{ height }}>
        No chart data available
      </div>
    );
  }

  const padding = 35;
  const width = 500;
  const maxVal = Math.max(...data.map((d) => d.value), 10);
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;
  const barWidth = Math.min(32, (chartWidth / data.length) * 0.65);
  const gap = chartWidth / data.length;

  return (
    <div className={`w-full ${className}`} style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      >
        {/* Grid lines */}
        {[0, 0.5, 1].map((pct, idx) => {
          const y = height - padding - pct * chartHeight;
          const val = Math.round(pct * maxVal);
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

        {/* Bars */}
        {data.map((d, idx) => {
          const barH = (d.value / maxVal) * chartHeight;
          const x = padding + idx * gap + (gap - barWidth) / 2;
          const y = height - padding - barH;
          const isHovered = hoveredBar === idx;

          return (
            <g key={idx}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx="4"
                fill={isHovered ? hoverColor : barColor}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  filter: isHovered ? 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.5))' : 'none',
                }}
                onMouseEnter={() => setHoveredBar(idx)}
                onMouseLeave={() => setHoveredBar(null)}
              />
              <text
                x={x + barWidth / 2}
                y={height - 12}
                textAnchor="middle"
                fontSize="11"
                fill={isHovered ? 'var(--color-gold)' : 'var(--text-muted)'}
                fontWeight={isHovered ? '600' : '400'}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating tooltip */}
      {hoveredBar !== null && (
        <div
          style={{
            position: 'absolute',
            left: `${
              ((padding + hoveredBar * gap + gap / 2) / width) * 100
            }%`,
            top: `${
              ((height - padding - (data[hoveredBar].value / maxVal) * chartHeight) / height) * 100 - 10
            }%`,
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
          <span className="font-bold">{data[hoveredBar].label}: </span>
          <span className="text-gold font-bold">
            {valuePrefix}{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(data[hoveredBar].value)}
          </span>
        </div>
      )}
    </div>
  );
};
