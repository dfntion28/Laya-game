// Heuristic AI players. Level sets how sharp the decisions are; style sets what they like to buy.
// Also drives the headless balance simulations.
import { stocks, ftDeals } from '../data/cards.js';
import { LOAN_STEP, FIVE_SIX_RATE } from '../data/constants.js';
import {
  getCard, dealDown, dealCards, stockPrice, skillById, skillCost, dreamById, landingPreview,
} from './engine.js';
import { maxBankLoan, bankRate, monthlyCashflow, insuranceCost } from './finance.js';

export const BOT_LEVELS = ['easy', 'normal', 'hard'];
export const BOT_STYLES = {
  balanced: 'Balanced',
  landlord: 'Landlord',
  hustler: 'Hustler',
  trader: 'Trader',
  saver: 'Saver',
};

const SPACE_SCORE = {
  oport: 3, sahod: 2.5, koneksyon: 1.5, aral: 1, tulong: 1, merkado: 1, buhay: 0,
  gastos: -2, tanggal: -3,
  cfday: 2.5, ftdeal: 3, gamble: 1, pangarap: 2, foundation: 1, sakuna: -4,
};

// Deterministic 0..1 value so easy bots can be erratic without Math.random.
function wobble(s, salt) {
  let x = (s.rng ^ Math.imul(salt + s.turn, 2654435761)) >>> 0;
  x ^= x >>> 13;
  x = Math.imul(x, 1274126177) >>> 0;
  return (x % 10_000) / 10_000;
}

function tuning(p) {
  const level = p.botLevel || 'normal';
  const t = {
    minRoi: { easy: 0.012, normal: 0.018, hard: 0.015 }[level],
    borrowEdge: { easy: 1.6, normal: 1.2, hard: 1.05 }[level],
    reserve: { easy: 5_000, normal: 10_000, hard: 15_000 }[level],
    diskarteGain: { easy: Infinity, normal: 2, hard: 1.5 }[level],
    stockBuy: { easy: 0.6, normal: 0.25, hard: 0.35 }[level],
    stockSell: { easy: 0.9, normal: 0.55, hard: 0.5 }[level],
    stockBudget: 150_000,
    reMult: 1,
    bizMult: 1,
  };
  switch (p.botStyle) {
    case 'landlord': t.reMult = 0.75; t.bizMult = 1.4; break;
    case 'hustler': t.bizMult = 0.75; t.reMult = 1.4; break;
    case 'trader': t.stockBudget = 400_000; t.stockBuy += 0.1; break;
    case 'saver': t.borrowEdge = Infinity; t.reserve = 50_000; break;
    default: break;
  }
  return t;
}

// Rough net peso value of a card option (positive = good for the player).
function optionValue(p, effects) {
  const e = effects || {};
  let v = 0;
  if (e.cash) v += e.cash;
  if (e.medical) v -= e.medical * (p.insured ? 0.2 : 1);
  if (e.installment) v -= e.installment.payment * e.installment.months * 0.8;
  if (e.living) v -= e.living * 24;
  if (e.koneksyon) v += 20_000;
  if (e.diskarte) v += e.diskarte * 12_000;
  if (e.gamble) v += e.gamble.win / 6 - e.gamble.cost;
  if (e.abroad) v += (p.salaryBase - 15_000) * 18;
  return v;
}

function stockAction(s, p, card, t) {
  const st = stocks[card.symbol];
  const price = stockPrice(s, card);
  const r = (price - st.low) / (st.high - st.low);
  const holding = p.assets.find(a => a.kind === 'stock' && a.symbol === card.symbol);
  if (holding && price > holding.avgCost * 1.3 && r >= t.stockSell) return { type: 'SELL', qty: holding.shares };
  const crypto = card.symbol === 'BYC';
  const cap = crypto && p.botStyle !== 'trader' ? 30_000 : t.stockBudget;
  const budget = Math.min(p.cash - t.reserve, cap);
  const buyBelow = st.dps ? t.stockBuy + 0.15 : t.stockBuy;
  if (r <= buyBelow && budget > price * 100) {
    const qty = Math.floor(budget / price / 100) * 100;
    if (qty > 0) return { type: 'BUY', qty };
  }
  return { type: 'PASS' };
}

function dealAction(s, p, card) {
  const t = tuning(p);
  if (card.kind === 'stock') return stockAction(s, p, card, t);
  if (card.kind === 'mp2') {
    const saver = p.botStyle === 'saver';
    if (p.cash > (saver ? 150_000 : 400_000)) return { type: 'BUY', amount: Math.floor((p.cash * 0.2) / LOAN_STEP) * LOAN_STEP };
    return { type: 'PASS' };
  }
  const useCard = dealCards(p).find(id => {
    const c = getCard(id);
    return (c.effect === 'down_minus_30' && card.kind === 'realestate') || (c.effect === 'biz_half' && card.kind === 'business');
  });
  const down = dealDown(p, card, useCard);
  const minRoi = t.minRoi * (card.kind === 'realestate' ? t.reMult : t.bizMult);
  if (p.botLevel === 'easy') {
    // Easy bots miss good deals and sometimes fall for bad ones.
    const roll = wobble(s, 7);
    if (card.cf <= 0 && roll < 0.25 && p.cash >= down) return { type: 'BUY', useCard };
    if (roll < 0.2) return { type: 'PASS' };
  }
  if (card.cf <= 0 || card.cf / Math.max(down, 1) < minRoi) return { type: 'PASS' };
  if (p.cash - t.reserve >= down) return { type: 'BUY', useCard };
  const need = Math.ceil((down - p.cash) / LOAN_STEP) * LOAN_STEP;
  // Leverage only when the deal out-earns the loan interest.
  if (need <= maxBankLoan(p) && card.cf > need * bankRate(p) * t.borrowEdge) return { type: 'BUY', borrow: true, useCard };
  return { type: 'PASS' };
}

// Optional chores before rolling: repay costly debt, get insurance, play contact cards.
function housekeeping(s, p) {
  const level = p.botLevel || 'normal';
  for (const id of p.hand) {
    const c = getCard(id);
    if (c.use !== 'anytime') continue;
    if (c.effect === 'paluwagan' && p.cash > 50_000) continue;
    if (c.effect === 'pay_debt_50k' && !p.liabilities.length) continue;
    if (c.effect === 'free_insurance' && p.insured) continue;
    return { type: 'USE_CARD', cardId: id, pid: p.id };
  }
  if (p.track !== 'rat') return null;
  const costly = [...p.liabilities]
    .filter(l => (l.rate || 0) >= 0.03 || l.kind === 'fivesix')
    .sort((a, b) => (b.rate || 0) - (a.rate || 0))[0];
  if (costly && p.cash > 60_000) {
    const amount = Math.min(costly.balance, Math.floor((p.cash - 40_000) / LOAN_STEP) * LOAN_STEP);
    const eager = costly.rate >= FIVE_SIX_RATE || (level !== 'easy' && p.cash > (level === 'hard' ? 100_000 : 150_000));
    if (amount > 0 && eager) return { type: 'REPAY', liabId: costly.id, amount, pid: p.id };
  }
  if (level !== 'easy' && !p.insured && p.cash > 40_000 && monthlyCashflow(p) > insuranceCost({ ...p, insured: true }) + 5_000) {
    return { type: 'INSURANCE', on: true, pid: p.id };
  }
  return null;
}

export function botAction(s) {
  const p = s.players[s.current];
  const pend = s.pending;
  if (!pend) return null;
  const t = tuning(p);
  switch (pend.kind) {
    case 'roll':
      return housekeeping(s, p) || { type: 'ROLL' };
    case 'move': {
      if (pend.used || p.diskarte <= 0) return { type: 'GO' };
      const score = d => SPACE_SCORE[landingPreview(s, p, d)] ?? 0;
      const here = score(pend.total);
      const up = score(pend.total + 1);
      const down = pend.total > 1 ? score(pend.total - 1) : -99;
      if (Math.max(up, down) - here >= t.diskarteGain) return { type: 'ADJUST', delta: up >= down ? 1 : -1 };
      return { type: 'GO' };
    }
    case 'oport': {
      const bigAt = p.botLevel === 'hard' ? 250_000 : 350_000;
      return { type: 'CHOOSE_DEAL', size: p.cash + maxBankLoan(p) > bigAt ? 'big' : 'small' };
    }
    case 'pick': {
      const ratios = pend.cards.map(id => {
        const c = getCard(id);
        return c.cf / Math.max(dealDown(p, c), 1);
      });
      return { type: 'PICK', index: ratios[1] > ratios[0] ? 1 : 0 };
    }
    case 'deal':
      return dealAction(s, p, getCard(pend.cardId));
    case 'card': {
      const card = getCard(pend.cardId);
      const shield = pend.options.find(o => o.key.startsWith('use:'));
      if (shield && pend.deck === 'gastos') {
        const worst = card.options ? Math.min(...card.options.map(o => optionValue(p, o.effects))) : optionValue(p, card.effects);
        if (worst < -20_000) return { type: 'OPTION', key: shield.key };
      }
      if (!card.options) return { type: 'OPTION', key: 'ok' };
      if (p.botLevel === 'easy') {
        // Easy bots grab whatever costs the least cash today.
        const cashNow = o => -(o.effects.cash || 0);
        const pick = [...card.options].sort((a, b) => cashNow(a) - cashNow(b))[0];
        return { type: 'OPTION', key: pick.key };
      }
      let best = card.options[0];
      let bestV = -Infinity;
      for (const o of card.options) {
        let v = optionValue(p, o.effects);
        if (o.effects.cash && -o.effects.cash > p.cash) v -= 50_000; // avoid forced loans
        if (v > bestV) {
          bestV = v;
          best = o;
        }
      }
      return { type: 'OPTION', key: best.key };
    }
    case 'offer':
    case 'market':
    case 'info':
    case 'escape':
      return { type: 'DONE' };
    case 'aral': {
      if (pend.free) return { type: 'LEARN', skillId: pend.skills[0] };
      if (p.botLevel === 'easy') return { type: 'SKIP' };
      const pref = ['negotiation', 'real_estate', 'digital', 'tax', 'negosyo', 'frugal', 'mindset', 'networking', 'property_mgmt', 'insurance', 'stocks'];
      const mult = p.botLevel === 'hard' ? 2 : 3;
      const choice = pref.find(id => pend.skills.includes(id) && p.cash > skillCost(p, skillById[id]) * mult);
      return choice ? { type: 'LEARN', skillId: choice } : { type: 'SKIP' };
    }
    case 'tulong':
      return { type: 'OPTION', key: p.botLevel !== 'easy' && p.cash > pend.amount * (p.botLevel === 'hard' ? 3 : 4) ? 'give' : 'skip' };
    case 'ftdeal':
      return { type: 'OPTION', key: p.cash >= ftDeals[pend.pos].cost ? 'buy' : 'pass' };
    case 'gamble': {
      const d = ftDeals[pend.pos];
      return { type: 'OPTION', key: p.cash >= d.cost * 2.5 && d.need <= 5 ? 'buy' : 'pass' };
    }
    case 'dream':
      return { type: 'OPTION', key: p.cash >= dreamById[pend.dreamId].cost ? 'buy' : 'pass' };
    case 'sakuna':
      return { type: 'OPTION', key: pend.options[0].key };
    case 'foundation':
      return { type: 'OPTION', key: p.cash > 6_000_000 ? 'give' : 'skip' };
    default:
      return null;
  }
}
