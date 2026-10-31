// Coaching: short notes worked out from the player's own numbers, so the same card teaches
// something different depending on your cash, debts, insurance and family.
// Pure functions. The UI shows them; the engine never depends on them.
import {
  CHILD_COST, TUITION_PER_CHILD, MP2_RATE, FIXER_SHARE, FIXER_FINE_MULT, FIXER_CAUGHT_MAX,
  FIXER_CREDIT_HIT, INSURANCE_COST,
} from '../data/constants.js';
import {
  fmt, medicalCost, totalExpenses, passiveIncome, expectedSalary, bankRate, taxFor, insuranceCost,
} from './finance.js';

const pctOf = x => `${Math.round(x * 100)}%`;
const months = n => (n === 1 ? '1 month' : `${n} months`);
// A year of 22 working days a month: what a bill costs in days of your salary.
const workDays = (p, amount) => {
  const daily = expectedSalary(p) / 22;
  return daily > 0 ? Math.max(1, Math.round(amount / daily)) : null;
};
const cushion = p => {
  const exp = totalExpenses(p);
  return exp > 0 ? p.cash / exp : 99;
};
const target = (p, extra) => `Escape target: ${fmt(totalExpenses(p) + extra)}/mo of passive income (now ${fmt(totalExpenses(p))}).`;

// Monthly bill a card would add, used for escape-target lines.
function monthlyAdd(e) {
  return (e.installment?.payment || 0) + (e.living || 0) + (e.child ? CHILD_COST * e.child : 0)
    + (e.revolving ? Math.round(e.revolving.balance * e.revolving.rate) : 0);
}

function cashOut(p, e) {
  return Math.max(0, -(e.cash || 0)) + (e.perChild && p.children ? -e.perChild * p.children : 0);
}

export function fixerMath(bill) {
  const fee = Math.round(bill * FIXER_SHARE / 1000) * 1000;
  const caught = FIXER_CAUGHT_MAX / 6;
  const fine = Math.round(bill * (1 + FIXER_FINE_MULT));
  return { fee, fine, caught, average: Math.round(fee + caught * fine) };
}

// One or two lines under each option: what it really costs.
export function optionMath(p, e = {}) {
  const lines = [];
  const out = cashOut(p, e);
  if (out > 0) {
    if (out > p.cash) lines.push(`You have ${fmt(p.cash)}. The other ${fmt(out - p.cash)} becomes an emergency bank loan.`);
    else lines.push(`Leaves you ${fmt(p.cash - out)} in cash.`);
  }
  if (e.medical) {
    const you = medicalCost(p, e.medical);
    if (p.insured) lines.push(`Insurance pays ${fmt(medicalCost({ ...p, insured: false }, e.medical) - you)}. You pay ${fmt(you)}.`);
    else lines.push(`No insurance, so you pay all ${fmt(you)}. Insured, you would pay ${fmt(medicalCost({ ...p, insured: true }, e.medical))}.`);
  }
  if (e.installment) {
    const { payment, months: n } = e.installment;
    lines.push(`${fmt(payment)} × ${n} = ${fmt(payment * n)} in total, paid over ${n >= 24 ? `${n / 12} years` : months(n)}.`);
  }
  if (e.revolving) {
    const i = Math.round(e.revolving.balance * e.revolving.rate);
    lines.push(`${fmt(i)}/mo in interest (${Math.round(e.revolving.rate * 1200)}% a year) until you pay off ${fmt(e.revolving.balance)}.`);
  }
  if (e.living) lines.push(`${fmt(e.living)}/mo with no end date: ${fmt(e.living * 12)} a year.`);
  if (e.child) lines.push(`${fmt(CHILD_COST)}/mo, plus ${fmt(TUITION_PER_CHILD)} school fees every June.`);
  if (e.spouse) lines.push('Partner income +₱15,000/mo, household costs +₱8,000/mo.');
  if (e.salaryMult) {
    const add = Math.round(expectedSalary(p) * (e.salaryMult - 1));
    lines.push(`Salary +${fmt(add)}/mo. Passive income +₱0.`);
  }
  if (e.salaryAdd) lines.push(`Active income +${fmt(e.salaryAdd)}/mo. Passive income +₱0.`);
  if (e.abroad) lines.push(`Salary +${fmt(expectedSalary(p) - p.spouseIncome)}/mo, costs +₱15,000/mo. Passive income +₱0.`);
  if (e.gamble) {
    const win = (7 - e.gamble.need) / 6;
    const avg = Math.round(win * e.gamble.win - e.gamble.cost);
    lines.push(`Pays on a ${e.gamble.need}${e.gamble.need < 6 ? ' or higher' : ''}: ${Math.round(win * 6)} in 6. On average you ${avg >= 0 ? 'gain' : 'lose'} ${fmt(Math.abs(avg))}.`);
  }
  const gain = (e.cash > 0 ? e.cash : 0) + (e.bonusMonths ? Math.round(expectedSalary(p) * e.bonusMonths) : 0);
  if (gain > 0) lines.push(`+${fmt(gain)}. In a deal returning 24% a year, that is +${fmt(gain * 0.02)}/mo for good.`);
  const add = monthlyAdd(e);
  if (add > 0) lines.push(target(p, add));
  if (!lines.length && !e.koneksyon && !e.diskarte && !e.freeSkill && !e.jobless) lines.push('Costs nothing. Sometimes the best deal is no deal.');
  return lines.slice(0, 3);
}

// The "think it through" note for an Expense or Life card. Picks the most relevant point.
export function cardCoach(p, card) {
  const exp = totalExpenses(p);
  const opts = card.options?.map(o => o.effects) ?? [card.effects || {}];
  const all = opts.reduce((acc, e) => ({ ...acc, ...e }), {});

  if (card.fixable) {
    const bill = cashOut(p, card.effects);
    const f = fixerMath(bill);
    return `Honest fine: ${fmt(bill)}. A fixer asks ${fmt(f.fee)}, but ${Math.round(f.caught * 6)} times in 6 you get caught and pay ${fmt(f.fee + f.fine)} plus credit −${FIXER_CREDIT_HIT}. On average the fixer costs ${fmt(f.average)}: barely cheaper, much riskier.`;
  }

  const cashOpt = opts.find(e => e.cash < 0 && !e.installment);
  const instOpt = opts.find(e => e.installment);
  if (cashOpt && instOpt) {
    const price = -cashOpt.cash;
    const { payment, months: n } = instOpt.installment;
    const total = payment * n;
    const extra = total > price ? ` and costs ${fmt(total - price)} more in total` : '';
    if (p.cash < price) return `Cash would take more than you have and the bank would cover the rest at ${Math.round(bankRate(p) * 100)}% a month. The installment avoids that${extra}, but adds ${fmt(payment)} to your bills for ${months(n)}.`;
    if (p.cash - price < exp) return `Paying cash leaves you less than one month of bills. One more surprise and you are borrowing. The installment keeps your cushion${extra}, but adds ${fmt(payment)}/mo for ${months(n)}.`;
    return `You can pay cash and still have ${Math.floor((p.cash - price) / Math.max(exp, 1))} months of bills saved. The installment keeps cash free for a deal${extra}, but adds ${fmt(payment)}/mo to the number your passive income must beat.`;
  }

  if (all.medical) {
    const full = medicalCost({ ...p, insured: false }, all.medical);
    const you = medicalCost(p, all.medical);
    if (p.insured) {
      const prem = insuranceCost(p) || INSURANCE_COST;
      return `Insurance saves you ${fmt(full - you)} on this bill. That is about ${Math.max(1, Math.round((full - you) / prem))} months of premiums, paid back in one day.`;
    }
    if (full >= 15_000) return `No insurance: all ${fmt(full)} comes from you. Insurance costs ${fmt(INSURANCE_COST)}/mo and would have cut this to ${fmt(medicalCost({ ...p, insured: true }, all.medical))}. You can buy it any time in the Money tab.`;
  }

  if (all.revolving) {
    return `That is ${fmt(all.revolving.balance * all.revolving.rate)} of interest every month, forever, until you pay the ${fmt(all.revolving.balance)}. Paying it off is a guaranteed 36% a year. No deal in this game beats that without risk.`;
  }

  if (all.gamble) {
    const g = all.gamble;
    const avg = Math.round(((7 - g.need) / 6) * g.win - g.cost);
    return `"Guaranteed" but it pays only on a ${g.need}. Run it many times and you lose ${fmt(-avg)} on average. Real investments never promise a fixed monthly return.`;
  }

  if (all.salaryMult || all.salaryAdd || all.abroad) {
    const creep = opts.find(e => e.living && e.salaryMult);
    if (creep) return `Same raise either way. Upgrading adds ${fmt(creep.living)}/mo to your bills for good and moves your escape target up. Keeping your lifestyle means the raise can buy assets.`;
    return `More active income. Your Freedom meter will not move, because it only counts passive income. The raise matters only if it goes into assets.`;
  }

  if (all.child) {
    return `Your bills rise ${fmt(CHILD_COST)}/mo, and every June brings school fees. ${target(p, CHILD_COST)}`;
  }

  if (all.jobless) {
    const noJob = p.spouseIncome + passiveIncome(p) - (exp - taxFor(p));
    if (noJob >= 0) return `Your passive income and household income cover your bills. This is what security looks like.`;
    return `Without salary, about ${fmt(-noJob)} a month comes out of your cash. You have ${fmt(p.cash)}${p.cash < -noJob * 2 ? ', not enough for 2 months' : ''}. Passive income covers ${pctOf(passiveIncome(p) / Math.max(exp, 1))} of your bills.`;
  }

  if (all.living) {
    return `${fmt(all.living)} a month feels small. It is ${fmt(all.living * 12)} a year, and it raises the passive income you need to escape, for good.`;
  }

  const gift = (all.cash > 0 ? all.cash : 0) + (all.bonusMonths ? Math.round(expectedSalary(p) * all.bonusMonths) : 0);
  if (gift > 0) return `Spend ${fmt(gift)} and it is gone once. Put it in a deal returning 24% a year and it pays ${fmt(gift * 0.02)} every month, for as long as you own it.`;

  if (card.options && opts.some(e => !Object.keys(e).length)) {
    const priciest = Math.max(...opts.map(e => cashOut(p, e) + (e.installment ? e.installment.payment * e.installment.months : 0)));
    if (priciest > 0) return `One choice costs nothing. The others cost up to ${fmt(priciest)}. Ask what each peso would earn in an asset instead.`;
  }

  const out = Math.max(0, ...opts.map(e => cashOut(p, e)));
  if (out > p.cash) {
    return `This is more than your cash. The gap becomes an emergency loan and your credit score drops. A cushion of 3 to 6 months of bills (${fmt(exp * 3)} to ${fmt(exp * 6)} for you) makes bills like this harmless.`;
  }
  if (out > 0) {
    const days = workDays(p, out);
    const left = cushion({ ...p, cash: p.cash - out });
    return `${fmt(out)} is ${days ? `about ${days} working day${days === 1 ? '' : 's'} of your salary` : 'money your assets have to earn'}. After this you have ${left >= 1 ? `${Math.floor(left)} months of bills saved` : 'less than one month of bills saved'}.`;
  }
  return null;
}

// Lines under a property or business deal.
export function dealCoach(p, card, down, cf, borrow) {
  const exp = totalExpenses(p);
  const lines = [];
  if (cf < 0) {
    lines.push(`It takes ${fmt(-cf)} out of your pocket every month: ${fmt(-cf * 12)} a year. That makes it a liability until a buyer pays more than you put in.`);
  } else if (cf === 0) {
    lines.push(`It pays nothing monthly. Your ${fmt(down)} sits idle until a buyer shows up.`);
  } else {
    lines.push(`Your ${fmt(down)} comes back as cashflow in ${months(Math.ceil(down / cf))}. It covers ${pctOf(cf / Math.max(exp, 1))} of your monthly bills.`);
  }
  if (borrow > 0) {
    const interest = Math.round(borrow * bankRate(p));
    const net = cf - interest;
    lines.push(`Borrowing ${fmt(borrow)} costs ${fmt(interest)}/mo. After interest you ${net >= 0 ? 'keep' : 'lose'} ${fmt(Math.abs(net))}/mo${net < 0 ? ': bad debt' : ': the tenant pays your loan'}.`);
  } else if (p.cash - down < exp && down <= p.cash) {
    lines.push(`After buying you have ${fmt(p.cash - down)} left, less than one month of bills. A bad card next turn means a loan.`);
  }
  if (cf > 0 && lines.length < 3) lines.push(`The same ${fmt(down)} in MP2 savings would earn ${fmt(down * MP2_RATE)}/mo.`);
  return lines;
}

export function stockCoach(p, st, price, holding) {
  if (holding && price < holding.avgCost) {
    return `You are down ${fmt((holding.avgCost - price) * holding.shares)}. Selling now locks in the loss. Holding is a bet that it recovers.`;
  }
  const r = (price - st.low) / (st.high - st.low);
  if (p.revealStocks && r <= 0.25) return `Near the bottom of its usual range. Cheap, if the company is still sound.`;
  if (p.revealStocks && r >= 0.75) return `Near the top of its usual range. Little room left to rise.${holding ? ' Good time to sell.' : ''}`;
  if (st.dps) return `Dividend: ${pctOf((st.dps * 12) / price)} a year at this price. ${st.note}`;
  return st.note;
}

export function mp2Coach(p) {
  const exp = totalExpenses(p);
  return `To pay your ${fmt(exp)} monthly bills from MP2 alone, you would need ${fmt(exp / MP2_RATE)} saved. Good for an emergency fund. Slow for escaping.`;
}

export function oportCoach(p, loan) {
  const gap = totalExpenses(p) - passiveIncome(p);
  const reach = p.cash + loan;
  const where = reach < 350_000
    ? 'You cannot cover a big down payment yet. Small deals build the cash and cashflow to get there.'
    : 'You can reach a big deal. Compare the return per year, not the size: 30% or more is good.';
  return `You need ${fmt(Math.max(0, gap))}/mo more passive income to escape. ${where}`;
}

const SEMINAR = [
  'Your best investment is your own financial education.',
  'A skill costs once and pays on every turn after. The earlier, the longer it pays.',
  'Knowledge turns luck into a plan. The same deal is better in trained hands.',
];
export const seminarCoach = p => SEMINAR[p.turns % SEMINAR.length];
