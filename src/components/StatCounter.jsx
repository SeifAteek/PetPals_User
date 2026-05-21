import React, { useEffect, useState } from 'react';

export default function StatCounter({ value, duration = 1200 }) {
  const target = typeof value === 'number' && !Number.isNaN(value) ? value : 0;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setDisplay(0);
      return;
    }

    let start = 0;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    return () => { start = 1; };
  }, [target, duration]);

  if (value == null) return <span className="tabular-nums">—</span>;
  return <span className="tabular-nums">{display.toLocaleString()}</span>;
}
