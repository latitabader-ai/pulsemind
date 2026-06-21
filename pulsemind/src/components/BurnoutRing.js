import React, { useEffect, useState } from 'react';

export default function BurnoutRing({ value = 63, size = 130 }) {
  const [animated, setAnimated] = useState(0);
  const r = (size / 2) - 10;
  const circ = 2 * Math.PI * r;
  const offset = circ - (animated / 100) * circ;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 100);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,0.2)" strokeWidth={10} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="#fff" strokeWidth={10}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
          {value}%
        </span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
          Burnout Risk
        </span>
      </div>
    </div>
  );
}
