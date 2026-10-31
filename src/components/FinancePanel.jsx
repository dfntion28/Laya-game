import {
  passiveIncome, totalExpenses, expenseLines, expectedSalary, monthlyCashflow, assetCashflow,
  creditTier, netWorth,
} from '../engine/finance.js';
import { professionById } from '../data/professions.js';
import { dreamById, skillById, fmt } from '../engine/engine.js';
import { FT_WIN_GAIN } from '../data/constants.js';
import { Surface, SectionTitle, Row, Figure, LIST } from './Ui.jsx';
import Pawn from './Pawn.jsx';
import CountUp from './CountUp.jsx';

export default function FinancePanel({ p, prices }) {
  const prof = professionById[p.professionId];
  const dream = dreamById[p.dreamId];
  const tier = creditTier(p.credit);

  const heading = (
    <div className="flex items-center gap-3 pb-3">
      <Pawn color={p.color} job={p.professionId} className="size-11 shrink-0" />
      <div className="min-w-0">
        <div className="font-display text-2xl leading-tight">{p.name}</div>
        <div className="text-sm font-bold text-ink-soft">{prof.name}. Dream: {dream.name}.</div>
      </div>
    </div>
  );

  if (p.track === 'fast') {
    return (
      <Surface className="p-4">
        {heading}
        <SectionTitle>Fast Track</SectionTitle>
        <div className={LIST}>
          <Row label="Cash" value={fmt(p.cash)} />
          <Row label="Paid every Cashflow Day" value={fmt(p.ft.cashflow)} tone="text-green-700" />
          <Row label="Cashflow added" sub={`Win at ${fmt(FT_WIN_GAIN)}`} value={fmt(p.ft.cashflow - p.ft.start)} />
          <Row label={dream.name} sub="Land on your dream space with enough cash to win" value={fmt(dream.cost)} />
        </div>
        <SectionTitle>Your run</SectionTitle>
        <div className={LIST}>
          <Row label="Left the Rat Race" value={`Month ${p.escapedMonth}`} />
          <Row label="Deals bought" value={p.stats.deals} />
          <Row label="Donated" value={fmt(p.stats.donated)} />
        </div>
      </Surface>
    );
  }

  const salary = expectedSalary(p);
  const passive = passiveIncome(p);
  const expenses = totalExpenses(p);
  const cf = monthlyCashflow(p);
  return (
    <Surface className="p-4">
      {heading}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-y-2 border-ink/10 py-3">
        <Figure label="Cash" value={<CountUp value={p.cash} />} big />
        <Figure label="Each month" value={`${cf >= 0 ? '+' : ''}${fmt(cf)}`} tone={cf >= 0 ? 'text-green-700' : 'text-red-600'} big />
        <Figure label={`Credit score · ${tier.label}`} value={p.credit} tone={tier.tone === 'good' ? 'text-green-700' : tier.tone === 'bad' ? 'text-red-600' : 'text-amber-700'} />
        <Figure label="Net worth" value={fmt(netWorth(p, prices))} />
      </div>
      <p className="pt-2 text-sm font-bold text-ink-soft">{prof.trait}</p>

      <SectionTitle right={<span className="text-green-700">{fmt(salary + passive)}</span>}>Income</SectionTitle>
      <div className={LIST}>
        <Row
          label={p.variable ? 'Business or freelance income' : 'Salary'}
          sub={p.jobless > 0 ? `Out of work for ${p.jobless} more payday(s)` : p.variable ? `₱${(p.variable[1] / 1000).toFixed(0)}K × a die roll, average shown` : 'Stops when you stop working'}
          value={fmt(p.jobless > 0 ? 0 : salary - p.spouseIncome)}
        />
        {p.spouseIncome > 0 && <Row label="Spouse or side gig" value={fmt(p.spouseIncome)} />}
        {p.assets.map(a => (
          <Row key={a.id} label={a.kind === 'stock' ? `${a.shares.toLocaleString()} ${a.symbol}` : a.name} sub="Passive" value={fmt(assetCashflow(p, a))} tone={assetCashflow(p, a) >= 0 ? 'text-green-700' : 'text-red-600'} />
        ))}
        {p.assets.length === 0 && <Row label="Passive income" sub="Buy assets on Deal spaces" value={fmt(0)} />}
      </div>

      <SectionTitle right={<span className="text-red-600">{fmt(expenses)}</span>}>Expenses</SectionTitle>
      <div className={LIST}>
        {expenseLines(p).map((l, i) => <Row key={l.liabilityId ?? i} label={l.label} value={fmt(l.amount)} />)}
      </div>

      {p.skills.length > 0 && (
        <>
          <SectionTitle>Skills</SectionTitle>
          <p className="text-[15px] font-bold">{p.skills.map(id => skillById[id].name).join(', ')}</p>
        </>
      )}
    </Surface>
  );
}
