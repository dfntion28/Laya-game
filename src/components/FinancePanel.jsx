import {
  passiveIncome, totalExpenses, expenseLines, expectedSalary, monthlyCashflow, assetCashflow,
  creditTier, netWorth,
} from '../engine/finance.js';
import { professionById } from '../data/professions.js';
import { dreamById, skillById, fmt } from '../engine/engine.js';
import { FT_WIN_GAIN } from '../data/constants.js';
import { Panel, Stat } from './Ui.jsx';
import Pawn from './Pawn.jsx';
import CountUp from './CountUp.jsx';

function Section({ title, total, tone, children }) {
  return (
    <Panel>
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="font-display text-xl">{title}</h3>
        {total !== undefined && <span className={`font-display text-xl ${tone}`}>{fmt(total)}</span>}
      </div>
      <div className="flex flex-col divide-y-2 divide-dashed divide-ink/10 text-sm font-bold">{children}</div>
    </Panel>
  );
}

function Row({ label, value, tone = '', sub }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="min-w-0">
        <span className="block truncate">{label}</span>
        {sub && <span className="block text-xs text-ink-soft">{sub}</span>}
      </span>
      <span className={`shrink-0 font-display text-base ${tone}`}>{value}</span>
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
          <Row label="Paid every Cashflow Day" value={fmt(p.ft.cashflow)} tone="text-green-700" />
          <Row label="Cashflow added so far" value={`${fmt(p.ft.cashflow - p.ft.start)} of ${fmt(FT_WIN_GAIN)}`} />
          <Row label={`Dream: ${dream.name}`} value={fmt(dream.cost)} sub="Land on your dream space with enough cash to buy it and win." />
        </Section>
        <Section title="Your run">
          <Row label="Left the Rat Race" value={`Month ${p.escapedMonth}, turn ${p.escapedTurn}`} />
          <Row label="Deals bought" value={p.stats.deals} />
          <Row label="Donated" value={fmt(p.stats.donated)} />
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
      <Panel className="flex items-center gap-3">
        <Pawn color={p.color} className="size-12 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="font-display text-2xl leading-tight">{p.name}</div>
          <div className="text-xs font-extrabold text-ink-soft">{prof.name} · dreaming of {dream.name}</div>
          <div className="mt-0.5 text-xs font-bold">{prof.trait}</div>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Cash" value={<CountUp value={p.cash} />} />
        <Stat label="Cashflow / mo" value={`${cf >= 0 ? '+' : ''}${fmt(cf)}`} tone={cf >= 0 ? 'text-green-700' : 'text-red-600'} />
        <Stat label={`Credit · ${tier.label}`} value={p.credit} tone={tier.tone === 'good' ? 'text-green-700' : tier.tone === 'bad' ? 'text-red-600' : 'text-amber-700'} />
        <Stat label="Net worth" value={fmt(netWorth(p, prices))} />
      </div>

      <Section title="Income" total={salary + passive} tone="text-green-700">
        <Row
          label={p.variable ? 'Business / freelance income' : 'Salary'}
          sub={p.jobless > 0 ? `Out of work for ${p.jobless} more payday(s)` : p.variable ? `₱${(p.variable[1] / 1000).toFixed(0)}K × a die roll each payday (average shown)` : 'Active income. Stops if you stop working.'}
          value={fmt(p.jobless > 0 ? 0 : salary - p.spouseIncome)}
        />
        {p.spouseIncome > 0 && <Row label="Spouse / side gig" value={fmt(p.spouseIncome)} />}
        {p.assets.map(a => (
          <Row key={a.id} label={`${a.emoji} ${a.kind === 'stock' ? `${a.shares.toLocaleString()} ${a.symbol}` : a.name}`} value={fmt(assetCashflow(p, a))} tone={assetCashflow(p, a) >= 0 ? 'text-green-700' : 'text-red-600'} />
        ))}
        <Row label="Total passive income" value={fmt(passive)} tone="text-green-700" />
      </Section>

      <Section title="Expenses" total={expenses} tone="text-red-600">
        {expenseLines(p).map((l, i) => <Row key={l.liabilityId ?? i} label={l.label} value={fmt(l.amount)} />)}
      </Section>

      {p.skills.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-1.5 py-1">
            {p.skills.map(id => (
              <span key={id} className="rounded-full border-2 border-ink bg-mustard px-2.5 py-0.5 text-xs font-extrabold">{skillById[id].name}</span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
