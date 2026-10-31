import { useEffect, useRef, useState } from 'react';
import { fmt } from '../engine/engine.js';
import { fmtShort } from '../lib/format.js';

// Rolls the number toward its new value so money changes are felt, not just read.
export default function CountUp({ value, short = false }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current;
    if (start === value) return undefined;
    const t0 = performance.now();
    let raf;
    const tick = now => {
      const k = Math.min(1, (now - t0) / 700);
      const eased = 1 - (1 - k) ** 3;
      const v = Math.round(start + (value - start) * eased);
      from.current = v;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{short ? fmtShort(shown) : fmt(shown)}</>;
}
