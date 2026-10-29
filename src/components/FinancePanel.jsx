import {
  passiveIncome, totalExpenses, expenseLines, expectedSalary, monthlyCashflow, assetCashflow,
  creditTier, netWorth,
} from '../engine/finance.js';
import { professionById } from '../data/professions.js';
import { dreamById, skillById, fmt } from '../engine/engine.js';
import { FT_WIN_GAIN } from '../data/constants.js';

function Section({ title, total, tone, children }) {
  return (
    <section className="rounded-2xl bg-panel card-3d p-3 ring-1 ring-line">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-gold">{title}</h3>
        {total !== undefined && <span className={`font-display font-semibold ${tone}`}>{fmt(total)}</span>}
      </div>
      <div className="flex flex-col divide-y divide-white/5 text-sm">{children}</div>
    </section>
  );
}

function Row({ label, value, tone = '', sub }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="min-w-0">
        <span className="block truncate">{label}</span>
        {sub && <span className="block text-[11px] text-muted">{sub}</span>}
      </span>
      <span className={`shrink-0 font-display font-medium ${tone}`}>{value}</span>
    </div>
  );
}

export default function FinancePanel({ p, prices }) {
  const prof = professionById[p.professionId];
  const dream = dreamById[p.dreamId];
  const tier = creditTier(p.credit);

  if (p.track === 'fast') {
    return (
      <div className="flex flex-col gap-3">
        <Section title="Fast Track">
          <Row label="Cash" value={fmt(p.cash)} />
          <Row label="Cashflow kada Cashflow Day" value={fmt(p.ft.cashflow)} tone="text-good" />
          <Row label="Simula ng cashflow" value={fmt(p.ft.start)} />
          <Row label="Goal: dagdag na cashflow" value={`${fmt(p.ft.cashflow - p.ft.start)} / ${fmt(FT_WIN_GAIN)}`} />
          <Row label={`Pangarap: ${dream.emoji} ${dream.name}`} value={fmt(dream.cost)} sub="Tumapak sa iyong Pangarap space at bayaran ito para manalo." />
        </Section>
        <Section title="Kasaysayan">
          <Row label="Nakalaya sa Rat Race" value={`Buwan ${p.escapedMonth} · Turn ${p.escapedTurn}`} />
          <Row label="Deals na nabili" value={p.stats.deals} />
          <Row label="Na-donate" value={fmt(p.stats.donated)} />
        </Section>
      </div>
    );
  }

  const salary = expectedSalary(p);
  const passive = passiveIncome(p);
  const expenses = totalExpenses(p);
  const cf = monthlyCashflow(p);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 rounded-2xl bg-panel card-3d p-3 ring-1 ring-line">
        <span className="text-4xl">{prof.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="font-display text-lg font-bold leading-tight">{p.name}</div>
          <div className="text-xs text-muted">{prof.name} · Pangarap: {dream.emoji} {dream.name}</div>
          <div className="mt-0.5 text-[11px] text-violet-200">{prof.trait}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-panel card-3d p-3 ring-1 ring-line">
          <div className="text-[10px] uppercase text-muted">Cash</div>
          <div className="font-display text-xl font-bold">{fmt(p.cash)}</div>
        </div>
        <div className="rounded-2xl bg-panel card-3d p-3 ring-1 ring-line">
          <div className="text-[10px] uppercase text-muted">Cashflow / buwan</div>
          <div className={`font-display text-xl font-bold ${cf >= 0 ? 'text-good' : 'text-bad'}`}>{cf >= 0 ? '+' : ''}{fmt(cf)}</div>
        </div>
        <div className="rounded-2xl bg-panel card-3d p-3 ring-1 ring-line">
          <div className="text-[10px] uppercase text-muted">Credit score</div>
          <div className={`font-display text-xl font-bold ${tier.tone === 'good' ? 'text-good' : tier.tone === 'bad' ? 'text-bad' : 'text-amber-300'}`}>{p.credit}</div>
          <div className="text-[10px] text-muted">{tier.label}</div>
        </div>
        <div className="rounded-2xl bg-panel card-3d p-3 ring-1 ring-line">
          <div className="text-[10px] uppercase text-muted">Net worth</div>
          <div className="font-display text-xl font-bold">{fmt(netWorth(p, prices))}</div>
        </div>
      </div>

      <Section title="Kita (Income)" total={salary + passive} tone="text-good">
        <Row
          label={p.variable ? 'Kita sa negosyo/freelance' : 'Sahod'}
          sub={p.jobless > 0 ? `Walang trabaho: ${p.jobless} Sahod pa` : p.variable ? `₱${(p.variable[1] / 1000).toFixed(0)}K × 🎲 bawat Sahod (avg)` : 'Active income — kailangan mong magtrabaho'}
          value={fmt(p.jobless > 0 ? 0 : salary - p.spouseIncome)}
        />
        {p.spouseIncome > 0 && <Row label="Asawa / Side gig" value={fmt(p.spouseIncome)} />}
        {p.assets.map(a => (
          <Row key={a.id} label={`${a.emoji} ${a.name}`} sub="Passive" value={fmt(assetCashflow(p, a))} tone={assetCashflow(p, a) >= 0 ? 'text-good' : 'text-bad'} />
        ))}
        <Row label="Kabuuang passive income" value={fmt(passive)} tone="text-good" />
      </Section>

      <Section title="Gastos (Expenses)" total={expenses} tone="text-bad">
        {expenseLines(p).map((l, i) => <Row key={l.liabilityId ?? i} label={l.label} value={fmt(l.amount)} />)}
      </Section>

      {p.skills.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-1.5 py-1">
            {p.skills.map(id => (
              <span key={id} className="rounded-full bg-amber-400/15 px-2.5 py-1 text-xs text-amber-200 ring-1 ring-amber-400/30">{skillById[id].emoji} {skillById[id].name}</span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
