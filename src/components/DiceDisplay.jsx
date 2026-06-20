import { useEffect, useRef, useState } from 'react';

const GLYPH = { 1: '⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅' };

export default function DiceDisplay({ d1, d2 }) {
  const [rolling, setRolling] = useState(false);
  const prevD1 = useRef(d1);

  useEffect(() => {
    if (d1 !== null && d1 !== prevD1.current) {
      setRolling(true);
      const t = setTimeout(() => setRolling(false), 450);
      prevD1.current = d1;
      return () => clearTimeout(t);
    }
    prevD1.current = d1;
  }, [d1]);

  const hasRoll = d1 !== null && d2 !== null;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`flex gap-3 items-center ${rolling ? 'dice-rolling' : ''}`}>
        <span className={`text-4xl leading-none select-none ${hasRoll ? 'text-slate-100' : 'text-slate-700'}`}>
          {hasRoll ? (GLYPH[d1] ?? '⚀') : '⬜'}
        </span>
        <span className={`text-4xl leading-none select-none ${hasRoll ? 'text-slate-100' : 'text-slate-700'}`}>
          {hasRoll ? (GLYPH[d2] ?? '⚀') : '⬜'}
        </span>
      </div>
      {hasRoll ? (
        <span className="text-white font-mono font-bold text-sm">= {d1 + d2}</span>
      ) : (
        <span className="text-slate-600 font-mono text-xs tracking-widest">I-roll!</span>
      )}
    </div>
  );
}
