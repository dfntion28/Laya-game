// Pure derived-number helpers shared by the engine, the bots and the UI.
import {
  CHILD_COST, INSURANCE_COST, MP2_RATE, BANK_RATE_GOOD, BANK_RATE_STD,
  CREDIT_GOOD, CREDIT_BANK_MIN,
} from '../data/constants.js';
import { stocks } from '../data/cards.js';

export const has = (p, skillId) => p.skills.includes(skillId);

export function cycleMult(market) {
  if (market === 'bull') return 1.2;
  if (market === 'bear') return 0.8;
  return 1;
}

export function assetCashflow(p, a) {
  switch (a.kind) {
    case 'realestate':
      return a.cf;
    case 'business': {
      if (a.cf <= 0) return a.cf;
      let m = 1;
      if (p.traitKey === 'biz_boost') m += 0.25;
      if (has(p, 'negosyo')) m += 0.2;
      return Math.round(a.cf * m);
    }
    case 'stock':
      return Math.round(a.shares * (stocks[a.symbol]?.dps || 0));
    case 'mp2':
      return Math.round(a.amount * MP2_RATE);
    case 'ip':
      return a.cf;
    default:
      return 0;
  }
}

export function passiveIncome(p) {
  return p.assets.reduce((sum, a) => sum + assetCashflow(p, a), 0);
}

export function loanPayments(p) {
  return p.liabilities.reduce((sum, l) => sum + l.payment, 0);
}

export function insuranceCost(p) {
  if (!p.insured || p.freeInsurance > 0) return 0;
  let c = INSURANCE_COST;
  if (has(p, 'insurance')) c *= 0.5;
  if (p.traitKey === 'medical_half') c *= 0.5;
  return Math.round(c);
}

export function taxFor(p) {
  if (p.jobless > 0) return 0;
  return Math.round(p.tax * (has(p, 'tax') ? 0.7 : 1));
}

// Itemized monthly expenses, in display order.
export function expenseLines(p) {
  const lines = [
    { label: 'Tax at Kontribusyon', amount: taxFor(p) },
    { label: 'Bahay, Pagkain, Bills', amount: p.living },
  ];
  if (p.family) lines.push({ label: 'Padala sa Pamilya', amount: p.family });
  if (p.children) lines.push({ label: `Mga Anak (${p.children})`, amount: p.children * CHILD_COST });
  const ins = insuranceCost(p);
  if (p.insured) lines.push({ label: p.freeInsurance > 0 ? 'Insurance (libre)' : 'Insurance', amount: ins });
  for (const l of p.liabilities) lines.push({ label: l.name, amount: l.payment, liabilityId: l.id });
  return lines;
}

export function totalExpenses(p) {
  return expenseLines(p).reduce((s, l) => s + l.amount, 0);
}

// Typical (non-random) active income, used for previews and loan checks.
export function expectedSalary(p) {
  if (p.jobless > 0) return p.spouseIncome;
  const base = p.variable ? Math.round(p.variable[1] * 3.5) : p.salaryBase;
  return base + p.spouseIncome;
}

export function monthlyCashflow(p) {
  return expectedSalary(p) + passiveIncome(p) - totalExpenses(p);
}

export function freedomRatio(p) {
  const exp = totalExpenses(p);
  if (exp <= 0) return 1;
  return Math.max(0, passiveIncome(p) / exp);
}

export function canEscape(p) {
  return p.track === 'rat' && passiveIncome(p) >= totalExpenses(p);
}

export function bankRate(p) {
  return p.credit >= CREDIT_GOOD ? BANK_RATE_GOOD : BANK_RATE_STD;
}

// Bank lends while your monthly cashflow stays >= 0 after the new payment.
export function maxBankLoan(p) {
  if (p.credit < CREDIT_BANK_MIN || p.track !== 'rat') return 0;
  const room = monthlyCashflow(p);
  if (room <= 0) return 0;
  return Math.floor(room / bankRate(p) / 10_000) * 10_000;
}

export function assetValue(p, a, prices) {
  switch (a.kind) {
    case 'realestate':
    case 'business':
      return a.cost - a.mortgage;
    case 'stock':
      return a.shares * (prices[a.symbol] ?? 0);
    case 'mp2':
      return a.amount;
    default:
      return 0;
  }
}

export function netWorth(p, prices) {
  const assets = p.assets.reduce((s, a) => s + assetValue(p, a, prices), 0);
  const debt = p.liabilities.reduce((s, l) => s + l.balance, 0);
  return p.cash + assets - debt;
}

export function creditTier(score) {
  if (score >= CREDIT_GOOD) return { label: 'Maganda', tone: 'good' };
  if (score >= CREDIT_BANK_MIN) return { label: 'Okay', tone: 'ok' };
  return { label: 'Masama — 5-6 lang', tone: 'bad' };
}
