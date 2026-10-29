import { passiveIncome, totalExpenses, freedomRatio, netWorth } from '../engine/finance.js';
import { dreamById } from '../engine/engine.js';
import { FT_WIN_GAIN } from '../data/constants.js';
import { fmtShort, pct } from '../lib/format.js';

function Bar({ ratio, tone }) {
  const w = Math.max(2, Math.min(100, ratio * 100));
  return (
    <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="h-3 w-full" aria-hidden="true">
      <rect x="0" y="0" width="100" height="10" rx="5" className="fill-white/10" />
      <rect x="0" y="0" width={w} height="10" rx="5" className={`${tone} transition-all duration-700`} />
      <line x1="100" y1="0" x2="100" y2="10" className="stroke-white" strokeWidth="1" />
    </svg>
  );
}

export default function FreedomMeter({ p, prices }) {
  if (p.track === 'fast') {
    const dream = dreamById[p.dreamId];
    const gain = p.ft.cashflow - p.ft.start;
    return (
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-panel card-3d p-3 ring-1 ring-line">
          <div className="flex items-baseline justify-between text-[11px] uppercase text-muted"><span>Cashflow goal</span><span>{pct(gain / FT_WIN_GAIN)}</span></div>
          <div className="font-display text-sm font-semibold">+{fmtShort(gain)} / {fmtShort(FT_WIN_GAIN)}</div>
          <Bar ratio={gain / FT_WIN_GAIN} tone="fill-emerald-400" />
        </div>
        <div className="rounded-2xl bg-panel card-3d p-3 ring-1 ring-line">
          <div className="flex items-baseline justify-between text-[11px] uppercase text-muted"><span>{dream.emoji} Pangarap</span><span>{pct(p.cash / dream.cost)}</span></div>
          <div className="font-display text-sm font-semibold">{fmtShort(p.cash)} / {fmtShort(dream.cost)}</div>
          <Bar ratio={p.cash / dream.cost} tone="fill-fuchsia-400" />
        </div>
      </div>
    );
  }
  const passive = passiveIncome(p);
  const exp = totalExpenses(p);
  const r = freedomRatio(p);
  return (
    <div className="rounded-2xl bg-panel card-3d p-3 ring-1 ring-line">
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-sm font-semibold uppercase tracking-wide text-gold">Freedom Meter</span>
        <span className="font-display text-lg font-bold">{pct(r)}</span>
      </div>
      <Bar ratio={r} tone={r >= 1 ? 'fill-amber-300' : 'fill-emerald-400'} />
      <div className="mt-1.5 grid grid-cols-3 gap-1 text-center text-[11px]">
        <div><div className="text-muted">Passive</div><div className="font-display text-sm font-semibold text-good">{fmtShort(passive)}</div></div>
        <div><div className="text-muted">Gastos</div><div className="font-display text-sm font-semibold text-bad">{fmtShort(exp)}</div></div>
        <div><div className="text-muted">Cash</div><div className="font-display text-sm font-semibold">{fmtShort(p.cash)}</div></div>
      </div>
      <div className="mt-1 text-center text-[10px] text-muted">Makakalaya kapag Passive ≥ Gastos · Net worth {fmtShort(netWorth(p, prices))}</div>
    </div>
  );
}
