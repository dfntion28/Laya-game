import { passiveIncome, totalExpenses, freedomRatio } from '../engine/finance.js';
import { dreamById } from '../engine/engine.js';
import { FT_WIN_GAIN } from '../data/constants.js';
import { fmtShort, pct } from '../lib/format.js';
import CountUp from './CountUp.jsx';

function Bar({ ratio, tone }) {
  const w = Math.max(3, Math.min(99, ratio * 99));
  return (
    <svg viewBox="0 0 100 12" preserveAspectRatio="none" className="h-4 w-full" aria-hidden="true">
      <rect x="0.5" y="0.5" width="99" height="11" rx="5.5" className="fill-white stroke-ink" strokeWidth="1.2" />
      <rect x="0.5" y="0.5" width={w} height="11" rx="5.5" className={`${tone} transition-all duration-700`} />
      <rect x="2" y="2" width={Math.max(0, w - 3)} height="3" rx="1.5" className="fill-white/50" />
    </svg>
  );
}

export default function FreedomMeter({ p }) {
  if (p.track === 'fast') {
    const dream = dreamById[p.dreamId];
    const gain = p.ft.cashflow - p.ft.start;
    return (
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl border-[3px] border-ink bg-paper p-2.5 pop-shadow">
          <div className="flex justify-between font-display text-sm"><span>Cashflow goal</span><span>{pct(gain / FT_WIN_GAIN)}</span></div>
          <Bar ratio={gain / FT_WIN_GAIN} tone="fill-lettuce" />
          <div className="mt-0.5 text-xs font-extrabold text-ink-soft">+{fmtShort(gain)} of {fmtShort(FT_WIN_GAIN)}</div>
        </div>
        <div className="rounded-2xl border-[3px] border-ink bg-paper p-2.5 pop-shadow">
          <div className="flex justify-between font-display text-sm"><span>{dream.emoji} Dream</span><span>{pct(p.cash / dream.cost)}</span></div>
          <Bar ratio={p.cash / dream.cost} tone="fill-berry" />
          <div className="mt-0.5 text-xs font-extrabold text-ink-soft"><CountUp value={p.cash} short /> of {fmtShort(dream.cost)}</div>
        </div>
      </div>
    );
  }
  const passive = passiveIncome(p);
  const exp = totalExpenses(p);
  const r = freedomRatio(p);
  return (
    <div className="rounded-2xl border-[3px] border-ink bg-paper px-3 py-2.5 pop-shadow">
      <div className="flex items-center justify-between">
        <span className="font-display text-lg tracking-wide">Freedom meter</span>
        <span className="font-display text-2xl">{pct(r)}</span>
      </div>
      <Bar ratio={r} tone={r >= 1 ? 'fill-mustard' : 'fill-lettuce'} />
      <div className="mt-1.5 grid grid-cols-3 gap-1 text-center">
        <div><div className="text-[11px] font-extrabold uppercase text-ink-soft">Passive</div><div className="font-display text-lg text-green-700"><CountUp value={passive} short /></div></div>
        <div><div className="text-[11px] font-extrabold uppercase text-ink-soft">Expenses</div><div className="font-display text-lg text-red-600"><CountUp value={exp} short /></div></div>
        <div><div className="text-[11px] font-extrabold uppercase text-ink-soft">Cash</div><div className="font-display text-lg"><CountUp value={p.cash} short /></div></div>
      </div>
    </div>
  );
}
