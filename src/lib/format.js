export { fmt } from '../engine/engine.js';

// Compact peso: ₱1.2M, ₱45K, ₱900
export function fmtShort(n) {
  const v = Math.round(n || 0);
  const sign = v < 0 ? '−' : '';
  const a = Math.abs(v);
  if (a >= 1_000_000) return `${sign}₱${(a / 1_000_000).toFixed(a >= 10_000_000 ? 0 : 1).replace(/\.0$/, '')}M`;
  if (a >= 10_000) return `${sign}₱${Math.round(a / 1000)}K`;
  if (a >= 1_000) return `${sign}₱${(a / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${sign}₱${a}`;
}

export const pct = x => `${Math.round(x * 100)}%`;
