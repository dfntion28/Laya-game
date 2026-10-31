import { passiveIncome, totalExpenses, freedomRatio } from '../engine/finance.js';
import { dreamById } from '../engine/engine.js';
import { FT_WIN_GAIN } from '../data/constants.js';
import { fmtShort, pct } from '../lib/format.js';
import CountUp from './CountUp.jsx';

function Bar({ ratio, tone }) {
  const w = Math.max(3, Math.min(99, ratio * 99));
  return (
    <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="h-3.5 w-full" aria-hidden="true">
      <rect x="0.5" y="0.5" width="99" height="9" rx="4.5" className="fill-white stroke-ink" strokeWidth="1" />
      <rect x="0.5" y="0.5" width={w} height="9" rx="4.5" className={`${tone} transition-all duration-700`} />
    </svg>
  );
}

function Num({ label, children, tone = '' }) {
  return (
    <span className="flex items-baseline gap-1">
      <span className="text-[11px] font-extrabold uppercase tracking-wide text-ink-soft">{label}</span>
      <span className={`font-display text-base ${tone}`}>{children}</span>
    </span>
  );
}

// Sits in a plain card in the page. No box of its own.
export default function FreedomMeter({ p }) {
  if (p.track === 'fast') {
    const dream = dreamById[p.dreamId];
    const gain = p.ft.cashflow - p.ft.start;
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between"><span className="font-display text-base">Cashflow goal</span><span className="font-display text-base">{pct(gain / FT_WIN_GAIN)}</span></div>
          <Bar ratio={gain / FT_WIN_GAIN} tone="fill-lettuce" />
        </div>
        <div>
          <div className="flex justify-between"><span className="truncate font-display text-base">{dream.name}</span><span className="font-display text-base">{pct(p.cash / dream.cost)}</span></div>
          <Bar ratio={p.cash / dream.cost} tone="fill-berry" />
        </div>
        <div className="col-span-2 flex justify-between">
          <Num label="Cash"><CountUp value={p.cash} short /></Num>
          <Num label="Dream costs">{fmtShort(dream.cost)}</Num>
        </div>
      </div>
    );
  }
  const r = freedomRatio(p);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-display text-base">Freedom</span>
        <span className="font-display text-base">{pct(r)}</span>
      </div>
      <Bar ratio={r} tone={r >= 1 ? 'fill-mustard' : 'fill-lettuce'} />
      <div className="mt-1 flex justify-between">
        <Num label="Passive" tone="text-green-700"><CountUp value={passiveIncome(p)} short /></Num>
        <Num label="Expenses" tone="text-red-600"><CountUp value={totalExpenses(p)} short /></Num>
        <Num label="Cash"><CountUp value={p.cash} short /></Num>
      </div>
    </div>
  );
}
