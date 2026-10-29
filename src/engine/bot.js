// Simple heuristic player. Used for AI opponents and for headless balance simulations.
import { stocks } from '../data/cards.js';
import { ftDeals } from '../data/cards.js';
import { LOAN_STEP, FIVE_SIX_RATE } from '../data/constants.js';
import {
  getCard, dealDown, dealCards, stockPrice, skillById, skillCost, dreamById, landingPreview,
} from './engine.js';
import { maxBankLoan, bankRate, monthlyCashflow, insuranceCost } from './finance.js';

const SPACE_SCORE = {
  oport: 3, sahod: 2.5, koneksyon: 1.5, aral: 1, tulong: 1, merkado: 1, buhay: 0,
  gastos: -2, tanggal: -3,
  cfday: 2.5, ftdeal: 3, gamble: 1, pangarap: 2, foundation: 1, sakuna: -4,
};

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

function bestDealAction(s, p, card) {
  if (card.kind === 'stock') {
    const st = stocks[card.symbol];
    const price = stockPrice(s, card);
    const r = (price - st.low) / (st.high - st.low);
    const holding = p.assets.find(a => a.kind === 'stock' && a.symbol === card.symbol);
    if (holding && price > holding.avgCost * 1.3 && r >= 0.55) return { type: 'SELL', qty: holding.shares };
    const budget = Math.min(p.cash - 15_000, card.symbol === 'BYC' ? 30_000 : 150_000);
    const buyBelow = st.dps ? 0.4 : 0.25;
    if (r <= buyBelow && budget > price * 100) {
      const qty = Math.floor(budget / price / 100) * 100;
      if (qty > 0) return { type: 'BUY', qty };
    }
    return { type: 'PASS' };
  }
  if (card.kind === 'mp2') {
    if (p.cash > 400_000) return { type: 'BUY', amount: Math.floor((p.cash * 0.2) / LOAN_STEP) * LOAN_STEP };
    return { type: 'PASS' };
  }
  const useCard = dealCards(p).find(id => {
    const c = getCard(id);
    return (c.effect === 'down_minus_30' && card.kind === 'realestate') || (c.effect === 'biz_half' && card.kind === 'business');
  });
  const down = dealDown(p, card, useCard);
  if (card.cf <= 0 || card.cf / Math.max(down, 1) < 0.018) return { type: 'PASS' };
  if (p.cash - 10_000 >= down) return { type: 'BUY', useCard };
  const need = Math.ceil((down - p.cash) / LOAN_STEP) * LOAN_STEP;
  // Leverage only when the deal out-earns the loan interest.
  if (need <= maxBankLoan(p) && card.cf > need * bankRate(p) * 1.2) return { type: 'BUY', borrow: true, useCard };
  return { type: 'PASS' };
}

// Optional housekeeping before acting (repay costly debt, insurance, use cards).
function housekeeping(s, p) {
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
    if (amount > 0 && (costly.rate >= FIVE_SIX_RATE || p.cash > 150_000)) {
      return { type: 'REPAY', liabId: costly.id, amount, pid: p.id };
    }
  }
  if (!p.insured && p.cash > 40_000 && monthlyCashflow(p) > insuranceCost({ ...p, insured: true }) + 5_000) {
    return { type: 'INSURANCE', on: true, pid: p.id };
  }
  return null;
}

export function botAction(s) {
  const p = s.players[s.current];
  const pend = s.pending;
  if (!pend) return null;
  switch (pend.kind) {
    case 'roll':
      return housekeeping(s, p) || { type: 'ROLL' };
    case 'move': {
      if (pend.used || p.diskarte <= 0) return { type: 'GO' };
      const score = d => SPACE_SCORE[landingPreview(s, p, d)] ?? 0;
      const here = score(pend.total);
      const up = score(pend.total + 1);
      const down = pend.total > 1 ? score(pend.total - 1) : -99;
      if (Math.max(up, down) - here >= 2) return { type: 'ADJUST', delta: up >= down ? 1 : -1 };
      return { type: 'GO' };
    }
    case 'oport':
      return { type: 'CHOOSE_DEAL', size: p.cash + maxBankLoan(p) > 350_000 ? 'big' : 'small' };
    case 'pick': {
      const ratios = pend.cards.map(id => {
        const c = getCard(id);
        return c.cf / Math.max(dealDown(p, c), 1);
      });
      return { type: 'PICK', index: ratios[1] > ratios[0] ? 1 : 0 };
    }
    case 'deal':
      return bestDealAction(s, p, getCard(pend.cardId));
    case 'card': {
      const card = getCard(pend.cardId);
      const shield = pend.options.find(o => o.key.startsWith('use:'));
      if (shield && pend.deck === 'gastos') {
        const worst = card.options ? Math.min(...card.options.map(o => optionValue(p, o.effects))) : optionValue(p, card.effects);
        if (worst < -20_000) return { type: 'OPTION', key: shield.key };
      }
      if (!card.options) return { type: 'OPTION', key: 'ok' };
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
      const pref = ['negotiation', 'real_estate', 'digital', 'tax', 'negosyo', 'frugal', 'mindset', 'networking', 'property_mgmt', 'insurance', 'stocks'];
      const choice = pref.find(id => pend.skills.includes(id) && p.cash > skillCost(p, skillById[id]) * 3);
      return choice ? { type: 'LEARN', skillId: choice } : { type: 'SKIP' };
    }
    case 'tulong':
      return { type: 'OPTION', key: p.cash > pend.amount * 4 ? 'give' : 'skip' };
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
