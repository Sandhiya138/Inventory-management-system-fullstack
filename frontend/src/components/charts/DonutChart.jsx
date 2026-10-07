import React, { useState } from 'react';

export const DonutChart = ({
  data = [], // [{ label: 'Healthy', value: 10, color: '#7a9a83' }, ...]
  size = 200,
  strokeWidth = 24,
  centerTitle = 'Total',
  centerValue = '',
  className = '',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const total = data.reduce((acc, d) => acc + (d.value || 0), 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center text-muted" style={{ height: size }}>
        No data
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center flex-wrap gap-6 ${className}`}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {data.map((item, idx) => {
            const percent = (item.value || 0) / total;
            const strokeDashoffset = circumference * (1 - percent);
            const rotation = accumulatedPercent * 360 - 90;
            accumulatedPercent += percent;

            const isHovered = hoveredIdx === idx;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color || 'var(--color-terracotta)'}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: hoveredIdx !== null && !isHovered ? 0.6 : 1,
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span className="text-muted text-xs uppercase letter-spacing-1 font-semibold">
            {hoveredIdx !== null ? data[hoveredIdx].label : centerTitle}
          </span>
          <span className="text-main font-bold text-xl font-heading">
            {hoveredIdx !== null ? data[hoveredIdx].value : (centerValue || total)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 text-sm"
            style={{
              cursor: 'pointer',
              opacity: hoveredIdx !== null && hoveredIdx !== idx ? 0.5 : 1,
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: item.color,
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <span className="text-secondary">{item.label}</span>
            <span className="font-bold text-main" style={{ marginLeft: 'auto', paddingLeft: 12 }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
