// LAYA rules engine. Pure: step(state, action) -> { state, fx }.
// The state is plain JSON (safe to persist). Randomness comes from a seeded RNG stored in state.rng,
// so a saved game resumes deterministically.
import {
  SAVE_VERSION, LOAN_STEP, FIVE_SIX_RATE, FIVE_SIX_CAP, CREDIT_START, CREDIT_MIN, CREDIT_MAX,
  INSURANCE_COVER, CHILD_COST, MAX_CHILDREN, TUITION_PER_CHILD, DISKARTE_START, DISKARTE_MAX,
  HAND_MAX, TYPHOON_MONTHS, TYPHOON_DAMAGE_PER_PROPERTY, FT_CASHFLOW_MULT, FT_WIN_GAIN,
  FT_CHARITY_COST, MONTHS, PLAYER_COLORS, PITCH_STEP, PITCH_MAX, PLAYER_LOAN_MAX, PLAYER_LOAN_RATES,
  FIXER_SHARE, FIXER_MIN_BILL, FIXER_CAUGHT_MAX, FIXER_FINE_MULT, FIXER_CREDIT_HIT, PERMIT_HOLD_COST,
  PERMIT_HOLD_FEE, PERMIT_CAUGHT_FINE,
} from '../data/constants.js';
import { professionById } from '../data/professions.js';
import { ratRace, fastTrack, BOARD_SIZE } from '../data/board.js';
import {
  stocks, smallDeals, bigDeals, gastosCards, lifeEvents, marketEvents, networkCards,
  skills, dreams, ftDeals, ftDisasters, dreamSpaces,
} from '../data/cards.js';
import {
  has, cycleMult, passiveIncome, totalExpenses, expectedSalary, monthlyCashflow,
  maxBankLoan, bankRate, canEscape, assetCashflow,
} from './finance.js';

const DECKS = {
  small: smallDeals, big: bigDeals, gastos: gastosCards, buhay: lifeEvents,
  merkado: marketEvents, koneksyon: networkCards,
};
const CARD_INDEX = Object.fromEntries(
  Object.values(DECKS).flat().map(c => [c.id, c]),
);
export const getCard = id => CARD_INDEX[id];
export const skillById = Object.fromEntries(skills.map(s => [s.id, s]));
export const dreamById = Object.fromEntries(dreams.map(d => [d.id, d]));

export const fmt = n => {
  const v = Math.round(n || 0);
  return (v < 0 ? '−₱' : '₱') + Math.abs(v).toLocaleString('en-US');
};

// ─── RNG ────────────────────────────────────────────────────────────────────

function rand(s) {
  let t = (s.rng = (s.rng + 0x6d2b79f5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const d6 = s => 1 + Math.floor(rand(s) * 6);

function shuffled(s, arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand(s) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function draw(s, deck) {
  const d = s.decks[deck];
  if (d.draw.length === 0) {
    d.draw = shuffled(s, d.discard);
    d.discard = [];
  }
  const id = d.draw.pop();
  d.discard.push(id);
  return CARD_INDEX[id];
}

// ─── Setup ──────────────────────────────────────────────────────────────────

const uid = (s, prefix) => `${prefix}${++s.uid}`;

function makePlayer(s, cfg, index) {
  const prof = professionById[cfg.professionId];
  const extra = prof.traitKey === 'extra_diskarte' ? 1 : 0;
  const dreamIdx = dreams.findIndex(d => d.id === cfg.dreamId);
  const p = {
    id: `p${index}`,
    name: cfg.name || `Player ${index + 1}`,
    color: PLAYER_COLORS[index % PLAYER_COLORS.length],
    isBot: !!cfg.isBot,
    botLevel: cfg.botLevel || 'normal',
    botStyle: cfg.botStyle || 'balanced',
    // How good a buyer offer must be (x down payment) before a bot sells.
    botSellAt: { easy: 2.5, normal: 1.6, hard: 1.3 }[cfg.botLevel || 'normal'],
    professionId: prof.id,
    emoji: prof.emoji,
    traitKey: prof.traitKey,
    thirteenth: prof.thirteenth,
    dreamId: cfg.dreamId,
    dreamSpace: dreamSpaces[Math.max(0, dreamIdx) % dreamSpaces.length],
    salaryBase: prof.salary,
    variable: prof.variable || null,
    spouseIncome: 0,
    tax: prof.tax,
    living: prof.living,
    family: prof.family || 0,
    children: 0,
    cash: prof.cash,
    assets: [],
    liabilities: [],
    credit: CREDIT_START,
    diskarte: DISKARTE_START + extra,
    diskarteMax: DISKARTE_MAX + extra,
    hand: [],
    handMax: HAND_MAX,
    skills: [],
    insured: false,
    freeInsurance: 0,
    jobless: 0,
    charityTurns: 0,
    month: 0,
    position: 0,
    track: 'rat',
    turns: 0,
    married: false,
    abroad: false,
    revealStocks: false,
    cleanPaydays: 0,
    ft: null,
    escapedMonth: null,
    escapedTurn: null,
    stats: { deals: 0, sold: 0, gains: 0, bankruptcies: 0, paidOff: 0, donated: 0 },
  };
  for (const l of prof.liabilities) {
    p.liabilities.push(makeLiability(s, l.name, l.balance, l, 'consumer'));
  }
  return p;
}

function makeLiability(s, name, balance, opts = {}, kind = 'consumer') {
  const l = { id: uid(s, 'L'), name, balance, kind, payment: 0 };
  if (opts.months) {
    l.months = opts.months;
    l.payment = opts.payment ?? Math.round(balance / opts.months);
  } else {
    l.rate = opts.rate ?? 0.03;
    l.payment = opts.payment ?? Math.round(balance * l.rate);
  }
  return l;
}

export function createGame({ players, seed }) {
  const s = {
    version: SAVE_VERSION,
    rng: (seed ?? Date.now()) | 0,
    uid: 0,
    phase: 'playing',
    turn: 0,
    current: 0,
    market: 'normal',
    prices: Object.fromEntries(Object.entries(stocks).map(([k, v]) => [k, Math.round((v.low + v.high) / 2)])),
    decks: {},
    ftOwned: {},
    players: [],
    pending: null,
    log: [],
    winnerId: null,
  };
  for (const [name, cards] of Object.entries(DECKS)) {
    s.decks[name] = { draw: shuffled(s, cards.map(c => c.id)), discard: [] };
  }
  s.players = players.map((cfg, i) => makePlayer(s, cfg, i));
  const fx = [];
  startTurn({ s, fx });
  return s;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const cur = s => s.players[s.current];
const byId = (s, id) => s.players.find(p => p.id === id);
// Pending decisions that belong to a player other than the one whose turn it is.
const RESPONSE_KINDS = new Set(['pitch', 'loanask']);
export const actorOf = s => (s.pending && RESPONSE_KINDS.has(s.pending.kind) ? byId(s, s.pending.pid) : cur(s));
export const rivals = (s, p) => s.players.filter(o => o.id !== p.id && o.track === 'rat');
const clampCredit = v => Math.max(CREDIT_MIN, Math.min(CREDIT_MAX, v));
const board = p => (p.track === 'fast' ? fastTrack : ratRace);

function log(ctx, p, text, tone = 'info') {
  const { s } = ctx;
  s.log.unshift({ id: uid(s, 'g'), turn: s.turn, pid: p?.id ?? null, text, tone });
  if (s.log.length > 80) s.log.length = 80;
}

function cash(ctx, p, amount, label) {
  if (!amount) return;
  p.cash += amount;
  ctx.fx.push({ type: 'cash', pid: p.id, amount, label });
}

function toast(ctx, text, tone = 'info', pid = null) {
  ctx.fx.push({ type: 'toast', text, tone, pid });
}

function addDiskarte(p, n) {
  if (n > 0) p.diskarte = Math.min(p.diskarteMax, p.diskarte + n);
  else p.diskarte = Math.max(0, p.diskarte + n);
}

function medicalCost(p, amount) {
  let c = amount;
  if (p.traitKey === 'medical_half') c *= 0.5;
  if (p.insured) c *= 1 - INSURANCE_COVER;
  return Math.round(c);
}

function gainKoneksyon(ctx, p) {
  const card = draw(ctx.s, 'koneksyon');
  if (p.hand.length >= p.handMax) p.hand.shift();
  p.hand.push(card.id);
  log(ctx, p, `New contact: ${card.name}`, 'good');
  return card;
}

function addBankLoan(ctx, p, amount, emergency) {
  const existing = p.liabilities.find(l => l.kind === 'bank');
  const rate = bankRate(p);
  if (existing) {
    existing.balance += amount;
    existing.rate = rate;
    existing.payment = Math.round(existing.balance * rate);
  } else {
    p.liabilities.push(makeLiability(ctx.s, 'Bank Loan', amount, { rate }, 'bank'));
  }
  p.cash += amount;
  ctx.fx.push({ type: 'cash', pid: p.id, amount, label: emergency ? 'Emergency loan' : 'Bank loan' });
  if (emergency) {
    p.credit = clampCredit(p.credit - 10);
    p.cleanPaydays = 0;
  }
}

function addFiveSix(ctx, p, amount) {
  const existing = p.liabilities.find(l => l.kind === 'fivesix');
  if (existing) {
    existing.balance += amount;
    existing.payment = Math.round(existing.balance * FIVE_SIX_RATE);
  } else {
    p.liabilities.push(makeLiability(ctx.s, '5-6 Lender', amount, { rate: FIVE_SIX_RATE }, 'fivesix'));
  }
  p.cash += amount;
  p.credit = clampCredit(p.credit - 40);
  p.cleanPaydays = 0;
  ctx.fx.push({ type: 'cash', pid: p.id, amount, label: '5-6 loan' });
  toast(ctx, `${p.name} had to borrow from a 5-6 lender (20%/mo)`, 'bad', p.id);
  log(ctx, p, `Borrowed ${fmt(amount)} from a 5-6 lender.`, 'bad');
}

// Cover negative cash: bank first, then 5-6, then bankruptcy.
function settle(ctx, p) {
  if (p.cash >= 0 || p.track !== 'rat') {
    if (p.cash < 0) p.cash = 0;
    return;
  }
  const amount = Math.ceil(-p.cash / LOAN_STEP) * LOAN_STEP;
  if (maxBankLoan(p) >= amount) {
    addBankLoan(ctx, p, amount, true);
    log(ctx, p, `Short on cash. Emergency bank loan: ${fmt(amount)}.`, 'warn');
    return;
  }
  const fiveSix = p.liabilities.find(l => l.kind === 'fivesix')?.balance || 0;
  if (fiveSix + amount <= FIVE_SIX_CAP) {
    addFiveSix(ctx, p, amount);
    return;
  }
  bankrupt(ctx, p);
}

function bankrupt(ctx, p) {
  const { s } = ctx;
  let recovered = 0;
  for (const a of p.assets) {
    if (a.kind === 'realestate' || a.kind === 'business') recovered += Math.max(0, a.down * 0.5);
    else if (a.kind === 'stock') recovered += a.shares * (s.prices[a.symbol] || 0) * 0.5;
    else if (a.kind === 'mp2') recovered += a.amount;
  }
  p.assets = p.assets.filter(a => a.kind === 'ip' || a.kind === 'iou');
  p.liabilities = p.liabilities
    .filter(l => l.kind !== 'fivesix')
    .map(l => ({ ...l, balance: Math.round(l.balance / 2), payment: Math.round(l.payment / 2) }));
  for (const l of p.liabilities) if (l.kind === 'player') syncIou(s, l);
  p.cash = Math.max(0, p.cash + Math.round(recovered));
  p.credit = 450;
  p.diskarte = 0;
  p.stats.bankruptcies++;
  ctx.fx.push({ type: 'bankrupt', pid: p.id });
  toast(ctx, `${p.name} went bankrupt. Assets sold.`, 'bad', p.id);
  log(ctx, p, 'Bankrupt. Assets sold at half price, debts cut in half.', 'bad');
}

// ─── Turn flow ──────────────────────────────────────────────────────────────

function startTurn(ctx) {
  const { s } = ctx;
  const p = cur(s);
  s.turn++;
  p.turns++;
  // Economy drifts on its own every 8 turns.
  if (s.turn % 8 === 0 && rand(s) < 0.3) {
    const options = ['bull', 'normal', 'bear'].filter(c => c !== s.market);
    s.market = options[Math.floor(rand(s) * options.length)];
    toast(ctx, `Market shift: ${marketLabel(s.market)}`, 'info');
    log(ctx, null, `Market shift: ${marketLabel(s.market)}.`);
  }
  s.pending = { kind: 'roll', pid: p.id };
  ctx.fx.push({ type: 'turn', pid: p.id });
}

export const marketLabel = m => (m === 'bull' ? 'Bull market' : m === 'bear' ? 'Bear market' : 'Steady market');

function endTurn(ctx) {
  const { s } = ctx;
  const p = cur(s);
  if (s.phase !== 'playing') return;
  if (canEscape(p) && passiveIncome(p) > 0) {
    enterFastTrack(ctx, p);
    return;
  }
  s.current = (s.current + 1) % s.players.length;
  startTurn(ctx);
}

function enterFastTrack(ctx, p) {
  const passive = passiveIncome(p);
  const cf = passive * FT_CASHFLOW_MULT;
  p.track = 'fast';
  p.position = 0;
  p.ft = { cashflow: cf, start: cf };
  p.escapedMonth = p.month;
  p.escapedTurn = p.turns;
  p.charityTurns = 0;
  p.cash += cf;
  for (const l of p.liabilities.filter(x => x.kind === 'player')) repay(ctx, p, l.id, l.balance);
  ctx.fx.push({ type: 'escape', pid: p.id });
  log(ctx, p, `Out of the Rat Race in month ${p.month}. Fast Track cashflow: ${fmt(cf)}.`, 'great');
  ctx.s.pending = {
    kind: 'escape', pid: p.id,
    title: 'You\'re out!',
    text: `Your passive income (${fmt(passive)}) now covers your expenses. Work is optional from here.`,
  };
}

function rollDice(ctx, p) {
  const { s } = ctx;
  let count = p.track === 'fast' ? 2 : 1;
  if (p.charityTurns > 0) {
    count += 1;
    p.charityTurns--;
  }
  const dice = Array.from({ length: count }, () => d6(s));
  ctx.fx.push({ type: 'dice', pid: p.id, dice });
  return dice;
}

function doRoll(ctx) {
  const { s } = ctx;
  const p = cur(s);
  const dice = rollDice(ctx, p);
  const total = dice.reduce((a, b) => a + b, 0);
  s.pending = { kind: 'move', pid: p.id, dice, total, used: false };
  if (p.diskarte <= 0) {
    doMove(ctx, total);
    return;
  }
  // The rules wait for the Diskarte choice, but the UI hops the pawn to the rolled space first.
  ctx.fx.push({ type: 'preview', pid: p.id, path: movePath(p.position, total), track: p.track });
}

function movePath(from, steps) {
  const path = [from];
  for (let i = 1; i <= steps; i++) path.push((from + i) % BOARD_SIZE);
  return path;
}

function doMove(ctx, steps) {
  const { s } = ctx;
  const p = cur(s);
  const track = board(p);
  const path = [p.position];
  let pos = p.position;
  const paydays = [];
  for (let i = 1; i <= steps; i++) {
    pos = (pos + 1) % BOARD_SIZE;
    path.push(pos);
    const t = track[pos];
    if (t === 'sahod' || t === 'cfday') paydays.push(i);
  }
  p.position = pos;
  ctx.fx.push({ type: 'move', pid: p.id, path, track: p.track });
  for (const atStep of paydays) payday(ctx, p, atStep, atStep === steps);
  if (s.phase !== 'playing') return;
  resolveSpace(ctx, p);
}

function salaryThisMonth(ctx, p) {
  if (p.jobless > 0) return p.spouseIncome;
  if (p.variable) return p.variable[1] * d6(ctx.s) + p.spouseIncome;
  return p.salaryBase + p.spouseIncome;
}

function payday(ctx, p, atStep, exact) {
  const { s } = ctx;
  if (p.track === 'fast') {
    p.cash += p.ft.cashflow;
    ctx.fx.push({ type: 'payday', pid: p.id, net: p.ft.cashflow, atStep, ft: true });
    log(ctx, p, `Cashflow Day: +${fmt(p.ft.cashflow)}`, 'good');
    return;
  }
  const m = p.month % 12;
  const salary = salaryThisMonth(ctx, p);
  const passive = passiveIncome(p);
  const expenses = totalExpenses(p);
  const net = salary + passive - expenses;
  p.cash += net;
  const notes = [];

  if (m === 11) {
    if (p.thirteenth && p.jobless === 0) {
      p.cash += p.salaryBase;
      notes.push(`13th month pay +${fmt(p.salaryBase)}`);
    } else if (p.variable) {
      p.cash += 20_000;
      notes.push('Holiday rush +₱20,000');
    }
    const pasko = 10_000 + p.children * 3_000;
    p.cash -= pasko;
    notes.push(`Pasko spending −${fmt(pasko)}`);
  }
  if (m === 5 && p.children > 0) {
    const tuition = p.children * TUITION_PER_CHILD;
    p.cash -= tuition;
    notes.push(`School fees −${fmt(tuition)}`);
  }
  if (TYPHOON_MONTHS.includes(m) && d6(s) === 1) {
    const props = p.assets.filter(a => a.kind === 'realestate').length;
    let dmg = 8_000 + props * TYPHOON_DAMAGE_PER_PROPERTY;
    if (has(p, 'property_mgmt')) dmg *= 0.5;
    if (p.insured) dmg *= 1 - INSURANCE_COVER;
    dmg = Math.round(dmg);
    p.cash -= dmg;
    notes.push(`Typhoon damage −${fmt(dmg)}`);
  }
  if (p.traitKey === 'family_risk' && d6(s) === 1) {
    p.cash -= 25_000;
    notes.push('Family emergency −₱25,000');
  }

  // Amortizing loans shrink; finished ones free up cashflow.
  for (const l of p.liabilities) {
    if (!l.months) continue;
    l.balance = Math.max(0, Math.round(l.balance - l.balance / l.months));
    l.months--;
  }
  const done = p.liabilities.filter(l => l.months !== undefined && l.months <= 0);
  if (done.length) {
    p.liabilities = p.liabilities.filter(l => !done.includes(l));
    for (const l of done) {
      p.credit = clampCredit(p.credit + 20);
      p.stats.paidOff++;
      notes.push(`Paid off ${l.name}`);
    }
  }

  if (p.freeInsurance > 0) p.freeInsurance--;
  if (p.jobless > 0) p.jobless--;
  p.cleanPaydays++;
  if (p.cleanPaydays % 6 === 0) p.credit = clampCredit(p.credit + 10);
  if (exact) {
    addDiskarte(p, 1);
    notes.push('Exact landing: +1 Diskarte');
  }
  const month = MONTHS[m];
  p.month++;
  ctx.fx.push({ type: 'payday', pid: p.id, net, salary, passive, expenses, atStep, month, notes });
  log(ctx, p, `Payday (${month}): ${net >= 0 ? '+' : ''}${fmt(net)}${notes.length ? ' · ' + notes.join(' · ') : ''}`, net >= 0 ? 'good' : 'bad');
  settle(ctx, p);
}

// ─── Space resolution ──────────────────────────────────────────────────────

function resolveSpace(ctx, p) {
  const { s } = ctx;
  const type = board(p)[p.position];
  const base = { pid: p.id, space: type };
  switch (type) {
    case 'sahod':
    case 'cfday':
      endTurn(ctx);
      return;
    case 'oport':
      s.pending = { ...base, kind: 'oport' };
      return;
    case 'gastos': {
      const card = draw(s, 'gastos');
      s.pending = { ...base, kind: 'card', deck: 'gastos', cardId: card.id, options: cardOptions(p, card, 'gastos', s.players.length > 1) };
      return;
    }
    case 'buhay': {
      let card = draw(s, 'buhay');
      for (let i = 0; i < 6 && !lifeEligible(p, card); i++) card = draw(s, 'buhay');
      s.pending = { ...base, kind: 'card', deck: 'buhay', cardId: card.id, options: cardOptions(p, card, 'buhay') };
      return;
    }
    case 'merkado':
      resolveMarket(ctx, p, draw(s, 'merkado'));
      return;
    case 'aral':
      openAral(ctx, p, false);
      return;
    case 'tulong': {
      const amount = Math.max(5_000, Math.round((expectedSalary(p) + passiveIncome(p)) * 0.1 / 1000) * 1000);
      s.pending = {
        ...base, kind: 'tulong', amount,
        options: [
          { key: 'give', label: `Donate ${fmt(amount)}`, sub: 'Roll 2 dice for 3 turns, +1 Diskarte', disabled: p.cash < amount },
          { key: 'skip', label: 'Not now' },
        ],
      };
      return;
    }
    case 'tanggal': {
      if (p.traitKey === 'job_secure') {
        info(ctx, p, '🛡️', 'Layoffs, but not you', 'Government job security. Nothing happens.');
      } else {
        p.jobless = 2;
        log(ctx, p, 'Laid off. No salary for the next 2 paydays.', 'bad');
        info(ctx, p, '📦', 'Laid off', 'No salary for the next 2 paydays. Only your passive income keeps coming in.');
      }
      return;
    }
    case 'koneksyon': {
      const card = gainKoneksyon(ctx, p);
      info(ctx, p, card.emoji, `Koneksyon: ${card.name}`, `${card.text} It goes in your hand until you need it.`);
      return;
    }
    case 'ftdeal':
    case 'gamble': {
      const deal = ftDeals[p.position];
      const ownerId = s.ftOwned[p.position];
      if (type === 'ftdeal' && ownerId) {
        const owner = byId(s, ownerId);
        info(ctx, p, deal.emoji, deal.name, `${owner.name} already owns this.`);
        return;
      }
      s.pending = {
        ...base, kind: type, pos: p.position,
        options: [
          { key: 'buy', label: type === 'gamble' ? `Invest ${fmt(deal.cost)}` : `Buy for ${fmt(deal.cost)}`, disabled: p.cash < deal.cost },
          { key: 'pass', label: 'Pass' },
        ],
      };
      return;
    }
    case 'pangarap': {
      const dream = dreamById[p.dreamId];
      if (p.dreamSpace === p.position) {
        s.pending = {
          ...base, kind: 'dream', dreamId: dream.id,
          options: [
            { key: 'buy', label: `Buy it for ${fmt(dream.cost)}`, disabled: p.cash < dream.cost },
            { key: 'pass', label: 'Not yet, keep saving' },
          ],
        };
      } else {
        const owners = s.players.filter(o => o.dreamSpace === p.position).map(o => o.name);
        info(ctx, p, '🌟', 'Someone else\'s dream', owners.length ? `This is ${owners.join(', ')}'s dream. Yours is on another space.` : 'Nice dream, but not yours.');
      }
      return;
    }
    case 'sakuna': {
      const d = ftDisasters[p.position];
      const loss = Math.round(p.cash * d.pct);
      const shield = p.hand.find(id => getCard(id).use === 'expense');
      const options = [{ key: 'ok', label: `Take the hit (−${fmt(loss)})` }];
      if (shield) options.unshift({ key: `use:${shield}`, label: `Use ${getCard(shield).name}`, sub: 'Cancels this' });
      s.pending = { ...base, kind: 'sakuna', pos: p.position, loss, options };
      return;
    }
    case 'foundation':
      s.pending = {
        ...base, kind: 'foundation',
        options: [
          { key: 'give', label: `Donate ${fmt(FT_CHARITY_COST)}`, sub: 'Roll 3 dice for 3 turns', disabled: p.cash < FT_CHARITY_COST },
          { key: 'skip', label: 'Not now' },
        ],
      };
      return;
    default:
      endTurn(ctx);
  }
}

function info(ctx, p, emoji, title, text, tone = 'info') {
  ctx.s.pending = { kind: 'info', pid: p.id, emoji, title, text, tone };
}

function lifeEligible(p, card) {
  const e = card.effects || {};
  if (card.id === 'l7' && p.married) return false;
  if (card.id === 'l11' && (p.abroad || p.professionId === 'seaman')) return false;
  if (e.child && p.children >= MAX_CHILDREN) return false;
  return true;
}

function describeEffects(p, effects) {
  const parts = [];
  const e = effects || {};
  if (e.cash) parts.push(`${e.cash > 0 ? '+' : ''}${fmt(e.cash)}`);
  if (e.medical) parts.push(`−${fmt(medicalCost(p, e.medical))}${p.insured ? ' (insured)' : ''}`);
  if (e.perChild && p.children) parts.push(`${fmt(e.perChild * p.children)} (kids)`);
  if (e.installment) parts.push(`+${fmt(e.installment.payment)}/mo × ${e.installment.months}`);
  if (e.revolving) parts.push(`+${fmt(e.revolving.balance)} debt`);
  if (e.living) parts.push(`+${fmt(e.living)}/mo`);
  if (e.child) parts.push(`+${fmt(CHILD_COST)}/mo`);
  return parts.join(' · ');
}

// Biggest cash hit a card can deal, used to price the fixer.
function cardBill(p, card) {
  const one = e => Math.max(0, -(e?.cash || 0)) + (e?.medical ? medicalCost(p, e.medical) : 0);
  return card.options ? Math.max(...card.options.map(o => one(o.effects))) : one(card.effects);
}

const fixerFee = bill => Math.round(bill * FIXER_SHARE / 1000) * 1000;

function cardOptions(p, card, deck, multi = false) {
  let options;
  if (card.options) {
    options = card.options.map(o => ({ key: o.key, label: o.label, sub: describeEffects(p, o.effects) }));
  } else {
    const sub = describeEffects(p, card.effects);
    options = [{ key: 'ok', label: deck === 'gastos' ? 'Pay' : 'OK', sub }];
  }
  if (deck === 'gastos') {
    const shield = p.hand.find(id => getCard(id).use === 'expense');
    if (shield) options.push({ key: `use:${shield}`, label: `Use ${getCard(shield).name}`, sub: 'Cancels this expense' });
    const bill = cardBill(p, card);
    if (multi && bill >= FIXER_MIN_BILL) {
      options.push({ key: 'fixer', label: `Pay a fixer ${fmt(fixerFee(bill))}`, sub: 'Makes it go away. 1 in 3 chance you get caught', fixer: true });
    }
  }
  return options;
}

function applyEffects(ctx, p, e, label) {
  const { s } = ctx;
  if (e.cash) cash(ctx, p, e.cash, label);
  if (e.medical) cash(ctx, p, -medicalCost(p, e.medical), label);
  if (e.perChild && p.children) cash(ctx, p, e.perChild * p.children, label);
  if (e.installment) {
    const i = e.installment;
    p.liabilities.push(makeLiability(s, i.name, i.payment * i.months, { payment: i.payment, months: i.months }, 'consumer'));
    toast(ctx, `${i.name}: +${fmt(i.payment)}/mo`, 'bad', p.id);
  }
  if (e.revolving) {
    const r = e.revolving;
    const existing = p.liabilities.find(l => l.name === r.name && l.rate);
    if (existing) {
      existing.balance += r.balance;
      existing.payment = Math.round(existing.balance * existing.rate);
    } else {
      p.liabilities.push(makeLiability(s, r.name, r.balance, { rate: r.rate }, 'consumer'));
    }
    p.credit = clampCredit(p.credit - 20);
  }
  if (e.living) {
    p.living += e.living;
    toast(ctx, `Expenses +${fmt(e.living)}/mo`, 'bad', p.id);
  }
  if (e.koneksyon) gainKoneksyon(ctx, p);
  if (e.diskarte) addDiskarte(p, e.diskarte);
  if (e.child) {
    p.children = Math.min(MAX_CHILDREN, p.children + e.child);
  }
  if (e.salaryMult) {
    if (p.variable) p.variable = [p.variable[0], Math.round(p.variable[1] * e.salaryMult)];
    else p.salaryBase = Math.round(p.salaryBase * e.salaryMult);
  }
  if (e.salaryAdd) p.spouseIncome += e.salaryAdd;
  if (e.bonusMonths) cash(ctx, p, Math.round(expectedSalary(p) * e.bonusMonths), label);
  if (e.jobless && p.traitKey !== 'job_secure') p.jobless = Math.max(p.jobless, e.jobless);
  if (e.spouse) {
    p.married = true;
    p.spouseIncome += 15_000;
    p.living += 8_000;
  }
  if (e.abroad) {
    p.abroad = true;
    p.salaryBase = Math.round(p.salaryBase * 2);
    if (p.variable) p.variable = [p.variable[0], p.variable[1] * 2];
    p.family += 15_000;
  }
  if (e.gamble) {
    const roll = d6(s);
    ctx.fx.push({ type: 'dice', pid: p.id, dice: [roll] });
    cash(ctx, p, -e.gamble.cost, 'Invest');
    if (roll >= e.gamble.need) {
      cash(ctx, p, e.gamble.win, 'Panalo!');
      log(ctx, p, `Rolled ${roll} and it paid off: +${fmt(e.gamble.win)}`, 'good');
    } else {
      log(ctx, p, `Rolled ${roll}. It was a scam. Lost ${fmt(e.gamble.cost)}.`, 'bad');
      toast(ctx, `Rolled ${roll}. Scam! −${fmt(e.gamble.cost)}`, 'bad', p.id);
    }
  }
  settle(ctx, p);
}

function resolveCardOption(ctx, key) {
  const { s } = ctx;
  const p = cur(s);
  const pend = s.pending;
  const card = getCard(pend.cardId);
  if (key === 'fixer') {
    payFixer(ctx, p, card);
    return;
  }
  if (key.startsWith('use:')) {
    const cardId = key.slice(4);
    if (!p.hand.includes(cardId)) return;
    p.hand = p.hand.filter(id => id !== cardId);
    log(ctx, p, `Used ${getCard(cardId).name} to skip ${card.name}.`, 'good');
    toast(ctx, `Skipped ${card.name}`, 'good', p.id);
    endTurn(ctx);
    return;
  }
  let effects = card.effects || {};
  if (card.options) {
    const opt = card.options.find(o => o.key === key);
    if (!opt) return;
    effects = opt.effects;
    log(ctx, p, `${card.name}: ${opt.label}`, pend.deck === 'gastos' ? 'bad' : 'info');
  } else {
    log(ctx, p, `${card.name}${describeEffects(p, effects) ? ': ' + describeEffects(p, effects) : ''}`, pend.deck === 'gastos' ? 'bad' : 'info');
  }
  applyEffects(ctx, p, effects, card.name);
  if (effects.freeSkill) {
    openAral(ctx, p, true);
    return;
  }
  endTurn(ctx);
}

// ─── Market ────────────────────────────────────────────────────────────────

export function offerPrice(s, card, a) {
  const m = cycleMult(s.market);
  if (card.cfMult) return Math.max(0, Math.round(a.cf * card.cfMult * m / 1000) * 1000);
  return Math.round(a.cost * card.mult * m / 1000) * 1000;
}

export function offerMatches(card, a) {
  if (card.type !== 'offer') return false;
  if (card.subs.includes('business')) return a.kind === 'business';
  return a.kind === 'realestate' && card.subs.includes(a.sub);
}

function resolveMarket(ctx, p, card) {
  const { s } = ctx;
  const base = { pid: p.id, space: 'merkado', cardId: card.id };
  const realEstateOf = o => o.assets.filter(a => a.kind === 'realestate');
  switch (card.type) {
    case 'offer': {
      // Bots decide on the spot; humans get a sell list.
      for (const o of s.players) {
        if (!o.isBot || o.track !== 'rat') continue;
        for (const a of [...o.assets]) {
          if (!offerMatches(card, a)) continue;
          const proceeds = offerPrice(s, card, a) - a.mortgage;
          if (proceeds > a.down * o.botSellAt || (a.cf <= 0 && proceeds >= 0)) sellAsset(ctx, o, a, proceeds, card.name);
        }
      }
      const anyHuman = s.players.some(o => !o.isBot && o.track === 'rat' && o.assets.some(a => offerMatches(card, a)));
      s.pending = { ...base, kind: 'offer', anyHuman };
      return;
    }
    case 'cycle':
      s.market = card.cycle;
      log(ctx, null, `${card.name}: ${marketLabel(card.cycle)}`);
      break;
    case 'split':
      for (const o of s.players) {
        for (const a of o.assets) {
          if (a.kind === 'stock' && a.symbol === card.symbol) {
            a.shares = Math.floor(a.shares * card.ratio);
            a.avgCost = a.avgCost / card.ratio;
          }
        }
        o.assets = o.assets.filter(a => a.kind !== 'stock' || a.shares > 0);
      }
      s.prices[card.symbol] = Math.max(1, Math.round(s.prices[card.symbol] / card.ratio));
      break;
    case 'damage':
      for (const o of s.players) {
        const n = realEstateOf(o).length;
        if (!n || o.track !== 'rat') continue;
        let c = n * card.perProperty;
        if (o.insured) c *= 1 - INSURANCE_COVER;
        if (has(o, 'property_mgmt')) c *= 0.5;
        cash(ctx, o, -Math.round(c), card.name);
        log(ctx, o, `${card.name}: −${fmt(c)}`, 'bad');
        settle(ctx, o);
      }
      break;
    case 'inflation':
      for (const o of s.players) if (o.track === 'rat') o.living += card.amount;
      log(ctx, null, `${card.name}: everyone +${fmt(card.amount)}/mo.`, 'bad');
      break;
    case 'tenant': {
      const rentals = realEstateOf(p).filter(a => a.sub !== 'land');
      if (rentals.length && !has(p, 'property_mgmt')) {
        cash(ctx, p, -card.cost, card.name);
        log(ctx, p, `${card.name}: −${fmt(card.cost)}`, 'bad');
        settle(ctx, p);
      }
      break;
    }
    case 'rentup':
      for (const o of s.players) {
        for (const a of o.assets) {
          if (a.kind === 'realestate' && (a.sub === 'apartment' || a.sub === 'house') && a.cf > 0) {
            a.cf = Math.round(a.cf * (1 + card.pct));
          }
        }
      }
      break;
    case 'peso':
      for (const o of s.players) {
        if (o.track !== 'rat') continue;
        if (o.abroad || o.professionId === 'seaman') o.salaryBase = Math.round(o.salaryBase * 1.1);
        o.living += 500;
      }
      break;
    default:
      break;
  }
  s.pending = { ...base, kind: 'market' };
}

function sellAsset(ctx, p, a, proceeds, label) {
  p.assets = p.assets.filter(x => x.id !== a.id);
  p.cash += proceeds;
  const gain = proceeds - (a.down ?? 0);
  p.stats.sold++;
  p.stats.gains += gain;
  ctx.fx.push({ type: 'cash', pid: p.id, amount: proceeds, label: `Sold ${a.name}` });
  log(ctx, p, `Sold ${a.name} (${label}) for ${fmt(proceeds)} cash${gain ? `, ${gain >= 0 ? 'profit' : 'loss'} ${fmt(Math.abs(gain))}` : ''}.`, gain >= 0 ? 'good' : 'bad');
  settle(ctx, p);
}

// ─── Deals ─────────────────────────────────────────────────────────────────

export function stockPrice(s, card) {
  return Math.max(1, Math.round(card.price * cycleMult(s.market)));
}

export function dealDown(p, card, useCardId) {
  let down = card.down;
  if (card.kind === 'realestate' && p.traitKey === 're_discount') down *= 0.85;
  if (has(p, 'negotiation')) down *= 0.9;
  const use = useCardId ? getCard(useCardId) : null;
  if (use?.effect === 'down_minus_30' && card.kind === 'realestate') down *= 0.7;
  if (use?.effect === 'biz_half' && card.kind === 'business') down *= 0.5;
  // A rival paid a fixer to hold your permit: the next property or business costs extra.
  const hold = p.permitHold && (card.kind === 'realestate' || card.kind === 'business') ? PERMIT_HOLD_FEE : 0;
  return Math.round(down / 1000) * 1000 + hold;
}

export function dealCards(p) {
  return p.hand.filter(id => {
    const c = getCard(id);
    return c.use === 'deal';
  });
}

function openDeal(ctx, p, size) {
  const { s } = ctx;
  if (size === 'big' && has(p, 'real_estate')) {
    const a = draw(s, 'big');
    let b = draw(s, 'big');
    if (b.id === a.id) b = draw(s, 'big');
    s.pending = { pid: p.id, kind: 'pick', cards: [a.id, b.id] };
    return;
  }
  showDeal(ctx, p, draw(s, size).id, size);
}

function showDeal(ctx, p, cardId, size) {
  const { s } = ctx;
  const card = getCard(cardId);
  if (card.kind === 'stock') s.prices[card.symbol] = stockPrice(s, card);
  s.pending = { pid: p.id, kind: 'deal', size, cardId };
}

function buyDeal(ctx, a) {
  const { s } = ctx;
  const p = cur(s);
  const card = getCard(s.pending.cardId);
  if (card.kind === 'stock') {
    const price = stockPrice(s, card);
    const qty = Math.max(0, Math.floor(a.qty || 0));
    if (!qty || qty * price > p.cash) return false;
    p.cash -= qty * price;
    const existing = p.assets.find(x => x.kind === 'stock' && x.symbol === card.symbol);
    if (existing) {
      existing.avgCost = (existing.avgCost * existing.shares + price * qty) / (existing.shares + qty);
      existing.shares += qty;
    } else {
      p.assets.push({ id: uid(s, 'A'), kind: 'stock', symbol: card.symbol, name: stocks[card.symbol].name, emoji: stocks[card.symbol].emoji, shares: qty, avgCost: price, down: qty * price, mortgage: 0 });
    }
    ctx.fx.push({ type: 'cash', pid: p.id, amount: -qty * price, label: `${qty.toLocaleString()} ${card.symbol}` });
    log(ctx, p, `Bought ${qty.toLocaleString()} ${card.symbol} at ₱${price}.`, 'good');
    p.stats.deals++;
    return true;
  }
  if (card.kind === 'mp2') {
    const amount = Math.floor((a.amount || 0) / LOAN_STEP) * LOAN_STEP;
    if (amount <= 0 || amount > p.cash) return false;
    p.cash -= amount;
    const existing = p.assets.find(x => x.kind === 'mp2');
    if (existing) existing.amount += amount;
    else p.assets.push({ id: uid(s, 'A'), kind: 'mp2', name: 'Pag-IBIG MP2', emoji: '🐷', amount, down: amount, mortgage: 0 });
    ctx.fx.push({ type: 'cash', pid: p.id, amount: -amount, label: 'MP2 deposit' });
    log(ctx, p, `Put ${fmt(amount)} into MP2.`, 'good');
    return true;
  }
  const useCardId = a.useCard && p.hand.includes(a.useCard) ? a.useCard : null;
  return buyAsset(ctx, p, card, useCardId, a.borrow);
}

// Can `p` cover `down` after first paying `extra` in cash (borrowing the rest from the bank)?
function bankGap(p, down, extra = 0) {
  const left = p.cash - extra;
  if (left < 0) return null;
  if (left >= down) return 0;
  const need = Math.ceil((down - left) / LOAN_STEP) * LOAN_STEP;
  return maxBankLoan(p) >= need ? need : null;
}

function buyAsset(ctx, p, card, useCardId, borrow) {
  const { s } = ctx;
  const down = dealDown(p, card, useCardId);
  if (p.cash < down) {
    if (!borrow) return false;
    const need = bankGap(p, down);
    if (need === null) return false;
    addBankLoan(ctx, p, need, false);
    p.credit = clampCredit(p.credit - 5);
    log(ctx, p, `Bank loan of ${fmt(need)} for the down payment.`, 'warn');
  }
  if (useCardId) p.hand = p.hand.filter(id => id !== useCardId);
  if (p.permitHold) {
    log(ctx, p, `Paid ${fmt(PERMIT_HOLD_FEE)} extra to get a held permit released.`, 'bad');
    p.permitHold = null;
  }
  p.cash -= down;
  p.assets.push({
    id: uid(s, 'A'), kind: card.kind, sub: card.sub, name: card.name, emoji: card.emoji,
    cost: card.cost, down, mortgage: card.cost - card.down, cf: card.cf, units: card.units || 1,
  });
  p.stats.deals++;
  ctx.fx.push({ type: 'cash', pid: p.id, amount: -down, label: card.name });
  ctx.fx.push({ type: 'buy', pid: p.id, cf: card.cf });
  log(ctx, p, `Bought ${card.name} (${fmt(down)} down, ${card.cf >= 0 ? '+' : ''}${fmt(card.cf)}/mo).`, card.cf >= 0 ? 'good' : 'warn');
  return true;
}

function sellStockOnCard(ctx, a) {
  const { s } = ctx;
  const p = cur(s);
  const card = getCard(s.pending.cardId);
  const holding = p.assets.find(x => x.kind === 'stock' && x.symbol === card.symbol);
  if (!holding) return false;
  const qty = Math.min(holding.shares, Math.max(0, Math.floor(a.qty || holding.shares)));
  sellShares(ctx, p, holding, qty, stockPrice(s, card));
  return true;
}

function sellShares(ctx, p, holding, qty, price) {
  if (qty <= 0) return;
  const proceeds = qty * price;
  const gain = Math.round((price - holding.avgCost) * qty);
  holding.shares -= qty;
  holding.down = Math.round(holding.avgCost * holding.shares);
  if (holding.shares <= 0) p.assets = p.assets.filter(x => x.id !== holding.id);
  p.cash += proceeds;
  p.stats.sold++;
  p.stats.gains += gain;
  ctx.fx.push({ type: 'cash', pid: p.id, amount: proceeds, label: `Sold ${holding.symbol}` });
  log(ctx, p, `Sold ${qty.toLocaleString()} ${holding.symbol} at ₱${price}: ${gain >= 0 ? 'profit' : 'loss'} ${fmt(Math.abs(gain))}.`, gain >= 0 ? 'good' : 'bad');
}

// ─── Aral (skills) ─────────────────────────────────────────────────────────

export function skillCost(p, skill) {
  return Math.round(skill.cost * (p.traitKey === 'cheap_skills' ? 0.5 : 1));
}

function openAral(ctx, p, free) {
  const { s } = ctx;
  const available = skills.filter(k => !has(p, k.id));
  if (!available.length) {
    info(ctx, p, '🎓', 'Nothing left to learn', 'You have every skill already.');
    return;
  }
  const offer = shuffled(s, available).slice(0, 3).map(k => k.id);
  s.pending = { pid: p.id, kind: 'aral', skills: offer, free };
}

function learnSkill(ctx, p, skillId, free) {
  const skill = skillById[skillId];
  const cost = free ? 0 : skillCost(p, skill);
  if (p.cash < cost) return false;
  p.cash -= cost;
  p.skills.push(skillId);
  if (cost) ctx.fx.push({ type: 'cash', pid: p.id, amount: -cost, label: skill.name });
  switch (skillId) {
    case 'frugal':
      p.living = Math.round(p.living * 0.9);
      break;
    case 'networking':
      p.handMax += 1;
      gainKoneksyon(ctx, p);
      break;
    case 'mindset':
      p.diskarteMax += 1;
      addDiskarte(p, 1);
      break;
    case 'digital':
      p.assets.push({ id: uid(ctx.s, 'A'), kind: 'ip', name: 'E-course (Digital Product)', emoji: '📘', cf: 4_000, down: 0, mortgage: 0 });
      break;
    case 'stocks':
      p.revealStocks = true;
      break;
    default:
      break;
  }
  log(ctx, p, `Learned ${skill.name}${cost ? ` (${fmt(cost)})` : ' (free)'}.`, 'good');
  return true;
}

// ─── Anytime finance actions ───────────────────────────────────────────────

function repay(ctx, p, liabId, amount) {
  const l = p.liabilities.find(x => x.id === liabId);
  if (!l) return false;
  const pay = Math.min(l.balance, Math.max(0, Math.round(amount)), p.cash);
  if (pay <= 0) return false;
  const ratio = (l.balance - pay) / l.balance;
  p.cash -= pay;
  l.balance -= pay;
  l.payment = l.rate ? Math.round(l.balance * l.rate) : Math.round(l.payment * ratio);
  ctx.fx.push({ type: 'cash', pid: p.id, amount: -pay, label: `Paid ${l.name}` });
  if (l.kind === 'player') payLender(ctx, l, pay);
  if (l.balance <= 0) {
    p.liabilities = p.liabilities.filter(x => x.id !== l.id);
    p.credit = clampCredit(p.credit + (l.kind === 'fivesix' ? 30 : 20));
    p.stats.paidOff++;
    toast(ctx, `${l.name} paid off`, 'good', p.id);
    log(ctx, p, `Fully paid: ${l.name}.`, 'good');
  }
  return true;
}

function fireSale(ctx, p, assetId, qty) {
  const { s } = ctx;
  const a = p.assets.find(x => x.id === assetId);
  if (!a || a.kind === 'ip' || a.kind === 'iou') return false;
  if (a.kind === 'stock') {
    sellShares(ctx, p, a, Math.min(a.shares, qty || a.shares), s.prices[a.symbol]);
    return true;
  }
  if (a.kind === 'mp2') {
    p.assets = p.assets.filter(x => x.id !== a.id);
    p.cash += a.amount;
    ctx.fx.push({ type: 'cash', pid: p.id, amount: a.amount, label: 'MP2 withdraw' });
    log(ctx, p, `Withdrew ${fmt(a.amount)} from MP2.`);
    return true;
  }
  const proceeds = fireSalePrice(s, a) - a.mortgage;
  sellAsset(ctx, p, a, proceeds, 'fire sale');
  return true;
}

export function fireSalePrice(s, a) {
  // A rushed business sale fetches ~1 year of its cashflow.
  if (a.kind === 'business') return Math.round(Math.max(a.cf, 0) * 12 * cycleMult(s.market) / 1000) * 1000;
  return Math.round(a.cost * 0.85 * cycleMult(s.market) / 1000) * 1000;
}

function applyAnytimeCard(ctx, p, cardId) {
  const card = getCard(cardId);
  if (!card || card.use !== 'anytime' || !p.hand.includes(cardId)) return false;
  switch (card.effect) {
    case 'salary_up':
      if (p.variable) p.variable = [p.variable[0], Math.round(p.variable[1] * 1.1)];
      else p.salaryBase = Math.round(p.salaryBase * 1.1);
      break;
    case 'pay_debt_50k': {
      const target = [...p.liabilities].filter(l => l.kind !== 'player').sort((a, b) => (b.rate || 0) - (a.rate || 0))[0];
      if (!target) return false;
      const cut = Math.min(50_000, target.balance);
      const ratio = (target.balance - cut) / target.balance;
      target.balance -= cut;
      target.payment = target.rate ? Math.round(target.balance * target.rate) : Math.round(target.payment * ratio);
      if (target.balance <= 0) p.liabilities = p.liabilities.filter(l => l.id !== target.id);
      log(ctx, p, `${card.name}: −${fmt(cut)} off ${target.name}.`, 'good');
      break;
    }
    case 'paluwagan':
      p.liabilities.push(makeLiability(ctx.s, 'Paluwagan', 60_000, { payment: 6_000, months: 10 }, 'paluwagan'));
      cash(ctx, p, 60_000, 'Paluwagan');
      break;
    case 'diskarte_2':
      p.diskarte += 2;
      break;
    case 'free_insurance':
      p.insured = true;
      p.freeInsurance = 6;
      break;
    case 'cash_40k':
      cash(ctx, p, 40_000, card.name);
      break;
    case 'reveal_stock':
      p.revealStocks = true;
      break;
    default:
      return false;
  }
  p.hand = p.hand.filter(id => id !== cardId);
  if (card.effect !== 'pay_debt_50k') log(ctx, p, `Used ${card.name}.`, 'good');
  toast(ctx, `Used ${card.name}`, 'good', p.id);
  return true;
}

// ─── Fast Track resolution ─────────────────────────────────────────────────

function checkFtWin(ctx, p) {
  if (p.ft.cashflow >= p.ft.start + FT_WIN_GAIN) {
    win(ctx, p, 'cashflow');
    return true;
  }
  return false;
}

function win(ctx, p, how) {
  const { s } = ctx;
  s.phase = 'ended';
  s.winnerId = p.id;
  s.pending = { kind: 'win', pid: p.id, how };
  ctx.fx.push({ type: 'win', pid: p.id });
  log(ctx, p, how === 'dream' ? `Won by buying the dream: ${dreamById[p.dreamId].name}.` : 'Won by hitting the Fast Track cashflow goal.', 'great');
}

// ─── Player to player ──────────────────────────────────────────────────────

const steps = (v, step, max) => Math.max(0, Math.min(max, Math.round((v || 0) / step) * step));

// Sell the deal card you landed on to another player.
function pitchDeal(ctx, p, a) {
  const { s } = ctx;
  const pend = s.pending;
  const card = getCard(pend.cardId);
  if (card.kind !== 'realestate' && card.kind !== 'business') return false;
  const to = byId(s, a.to);
  const pitched = pend.pitched || [];
  if (!to || !rivals(s, p).includes(to) || pitched.includes(to.id)) return false;
  const price = steps(a.price, PITCH_STEP, PITCH_MAX);
  s.pending = { kind: 'pitch', pid: to.id, seller: p.id, buyer: to.id, cardId: card.id, size: pend.size, price, countered: false, pitched: [...pitched, to.id] };
  log(ctx, p, `Offered ${card.name} to ${to.name} for ${fmt(price)}.`);
  toast(ctx, `${p.name} offers ${to.name} a deal`, 'info', to.id);
  return true;
}

function backToDeal(s, pend) {
  s.pending = { pid: pend.seller, kind: 'deal', size: pend.size, cardId: pend.cardId, pitched: pend.pitched };
}

// Buyer pays the seller, then buys the deal as if they had landed on it.
function closePitch(ctx, pend, price, borrow) {
  const { s } = ctx;
  const buyer = byId(s, pend.buyer);
  const seller = byId(s, pend.seller);
  const card = getCard(pend.cardId);
  const gap = bankGap(buyer, dealDown(buyer, card, null), price);
  if (gap === null || (gap > 0 && !borrow)) return false;
  buyer.cash -= price;
  seller.cash += price;
  if (price) {
    ctx.fx.push({ type: 'cash', pid: buyer.id, amount: -price, label: `Paid ${seller.name}` });
    ctx.fx.push({ type: 'cash', pid: seller.id, amount: price, label: `${buyer.name} bought your deal` });
  }
  if (!buyAsset(ctx, buyer, card, null, true)) return false;
  log(ctx, seller, `Sold the ${card.name} deal to ${buyer.name} for ${fmt(price)}.`, 'good');
  endTurn(ctx);
  return true;
}

function askLoan(ctx, p, a) {
  const { s } = ctx;
  const pend = s.pending;
  if (p.track !== 'rat' || !['roll', 'deal'].includes(pend.kind)) return false;
  const to = byId(s, a.to);
  const amount = steps(a.amount, LOAN_STEP, PLAYER_LOAN_MAX);
  if (!to || !rivals(s, p).includes(to) || amount <= 0 || to.cash < amount) return false;
  if (!PLAYER_LOAN_RATES.includes(a.rate)) return false;
  const asked = pend.loanAsked || [];
  if (asked.includes(to.id)) return false;
  s.pending = { kind: 'loanask', pid: to.id, borrower: p.id, amount, rate: a.rate, resume: { ...pend, loanAsked: [...asked, to.id] } };
  log(ctx, p, `Asked ${to.name} for a ${fmt(amount)} loan at ${Math.round(a.rate * 100)}%/mo.`);
  toast(ctx, `${p.name} asks ${to.name} for a loan`, 'info', to.id);
  return true;
}

function lend(ctx, lender, borrower, amount, rate) {
  const { s } = ctx;
  const l = makeLiability(s, `Loan from ${lender.name}`, amount, { rate }, 'player');
  l.lenderId = lender.id;
  borrower.liabilities.push(l);
  lender.assets.push({ id: uid(s, 'A'), kind: 'iou', name: `Loan to ${borrower.name}`, emoji: '🤝', amount, rate, cf: l.payment, borrowerId: borrower.id, liabId: l.id, down: amount, mortgage: 0 });
  lender.cash -= amount;
  borrower.cash += amount;
  ctx.fx.push({ type: 'cash', pid: lender.id, amount: -amount, label: `Lent to ${borrower.name}` });
  ctx.fx.push({ type: 'cash', pid: borrower.id, amount, label: `Loan from ${lender.name}` });
  log(ctx, lender, `Lent ${fmt(amount)} to ${borrower.name} at ${Math.round(rate * 100)}%/mo (+${fmt(l.payment)}/mo).`, 'good');
}

function syncIou(s, l) {
  const lender = byId(s, l.lenderId);
  const iou = lender?.assets.find(x => x.liabId === l.id);
  if (!iou) return;
  iou.amount = l.balance;
  iou.cf = l.payment;
  if (l.balance <= 0) lender.assets = lender.assets.filter(x => x !== iou);
}

function payLender(ctx, l, pay) {
  const lender = byId(ctx.s, l.lenderId);
  if (lender) {
    lender.cash += pay;
    ctx.fx.push({ type: 'cash', pid: lender.id, amount: pay, label: 'Loan repaid' });
  }
  syncIou(ctx.s, l);
}

function respond(ctx, actor, a) {
  const { s } = ctx;
  const pend = s.pending;
  if (!actor) return false;
  if (pend.kind === 'loanask') {
    const borrower = byId(s, pend.borrower);
    if (a.type === 'LOAN_YES') {
      if (actor.cash < pend.amount) return false;
      lend(ctx, actor, borrower, pend.amount, pend.rate);
      toast(ctx, `${actor.name} lent ${borrower.name} ${fmt(pend.amount)}`, 'good');
    } else if (a.type === 'LOAN_NO') {
      log(ctx, actor, `Turned down ${borrower.name}'s loan request.`);
      toast(ctx, `${actor.name} said no to the loan`, 'bad', borrower.id);
    } else {
      return false;
    }
    s.pending = pend.resume;
    return true;
  }
  // pitch: first the buyer answers; after a counter, the seller does.
  if (a.type === 'PITCH_ACCEPT') return closePitch(ctx, pend, pend.countered ? pend.counter : pend.price, pend.countered ? pend.borrow : a.borrow);
  if (a.type === 'PITCH_DECLINE') {
    log(ctx, actor, pend.countered ? 'Turned down the counteroffer.' : `Passed on ${byId(s, pend.seller).name}'s deal.`);
    toast(ctx, `${actor.name} said no`, 'bad');
    backToDeal(s, pend);
    return true;
  }
  if (a.type === 'PITCH_COUNTER' && !pend.countered) {
    const counter = steps(a.price, PITCH_STEP, PITCH_MAX);
    if (bankGap(actor, dealDown(actor, getCard(pend.cardId), null), counter) === null) return false;
    s.pending = { ...pend, pid: pend.seller, countered: true, counter, borrow: !!a.borrow };
    log(ctx, actor, `Countered with ${fmt(counter)}.`);
    toast(ctx, `${actor.name} counters: ${fmt(counter)}`, 'info', pend.seller);
    return true;
  }
  return false;
}

// Pay a fixer to make an expense card disappear. Caught = pay it anyway, plus a fine.
function payFixer(ctx, p, card) {
  const { s } = ctx;
  const bill = cardBill(p, card);
  const fee = fixerFee(bill);
  const roll = d6(s);
  ctx.fx.push({ type: 'dice', pid: p.id, dice: [roll] });
  cash(ctx, p, -fee, 'Fixer');
  if (roll <= FIXER_CAUGHT_MAX) {
    const fine = Math.round(bill * (1 + FIXER_FINE_MULT));
    cash(ctx, p, -fine, 'Caught');
    p.credit = clampCredit(p.credit - FIXER_CREDIT_HIT);
    log(ctx, p, `Fixer got caught on ${card.name}. Paid ${fmt(fee + fine)} in total.`, 'bad');
    settle(ctx, p);
    info(ctx, p, '🚨', `Rolled ${roll}. Caught!`, `You paid the fixer ${fmt(fee)}, the bill, and a fine: ${fmt(fine)} more. Credit score −${FIXER_CREDIT_HIT}.`, 'bad');
    return;
  }
  log(ctx, p, `Paid a fixer ${fmt(fee)} to skip ${card.name}.`, 'warn');
  settle(ctx, p);
  info(ctx, p, '🤫', `Rolled ${roll}. It worked`, `The fixer made ${card.name} go away for ${fmt(fee)}. Next time you might not be so lucky.`, 'good');
}

// Pay a fixer to hold a rival's permit: their next property or business costs extra.
function holdPermit(ctx, p, a) {
  const { s } = ctx;
  const target = byId(s, a.to);
  if (s.pending.kind !== 'roll' || p.track !== 'rat' || p.fixerTurn === s.turn) return false;
  if (!target || !rivals(s, p).includes(target) || target.permitHold || p.cash < PERMIT_HOLD_COST) return false;
  p.fixerTurn = s.turn;
  const roll = d6(s);
  ctx.fx.push({ type: 'dice', pid: p.id, dice: [roll] });
  cash(ctx, p, -PERMIT_HOLD_COST, 'Fixer');
  if (roll <= FIXER_CAUGHT_MAX) {
    cash(ctx, p, -PERMIT_CAUGHT_FINE, 'Caught');
    p.credit = clampCredit(p.credit - FIXER_CREDIT_HIT);
    log(ctx, p, `Tried to hold ${target.name}'s permit and got caught. Fine ${fmt(PERMIT_CAUGHT_FINE)}.`, 'bad');
    toast(ctx, `${p.name} got caught bribing! −${fmt(PERMIT_HOLD_COST + PERMIT_CAUGHT_FINE)}`, 'bad');
    settle(ctx, p);
    return true;
  }
  target.permitHold = p.id;
  log(ctx, p, `Paid a fixer to hold ${target.name}'s permit.`, 'warn');
  log(ctx, target, `Permit held by a fixer. Next property or business costs ${fmt(PERMIT_HOLD_FEE)} more.`, 'bad');
  toast(ctx, `${target.name}'s permit is on hold`, 'bad', target.id);
  return true;
}

// ─── step ──────────────────────────────────────────────────────────────────

const ANYTIME = new Set(['BORROW', 'REPAY', 'INSURANCE', 'SELL_ASSET', 'USE_CARD']);

export function step(state, action) {
  const s = structuredClone(state);
  const ctx = { s, fx: [] };
  const ok = reduce(ctx, action);
  if (ok === false) return { state, fx: [], rejected: true };
  return { state: s, fx: ctx.fx };
}

function reduce(ctx, a) {
  const { s } = ctx;
  if (s.phase !== 'playing') return false;
  const p = cur(s);
  const pend = s.pending;

  if (ANYTIME.has(a.type)) {
    const who = a.pid ? byId(s, a.pid) : p;
    if (!who) return false;
    return anytime(ctx, who, a);
  }

  if (!pend) return false;
  if (RESPONSE_KINDS.has(pend.kind)) return respond(ctx, byId(s, pend.pid), a);
  if (pend.pid && pend.pid !== p.id) return false;
  if (a.type === 'LOAN_ASK') return askLoan(ctx, p, a);
  if (a.type === 'PERMIT_HOLD') return holdPermit(ctx, p, a);

  switch (pend.kind) {
    case 'roll':
      if (a.type !== 'ROLL') return false;
      doRoll(ctx);
      return true;
    case 'move':
      if (a.type === 'GO') {
        doMove(ctx, pend.total);
        return true;
      }
      if (pend.used || p.diskarte <= 0) return false;
      if (a.type === 'ADJUST') {
        const total = pend.total + (a.delta > 0 ? 1 : -1);
        if (total < 1) return false;
        p.diskarte--;
        doMove(ctx, total);
        return true;
      }
      if (a.type === 'REROLL') {
        p.diskarte--;
        ctx.fx.push({ type: 'return', pid: p.id });
        const dice = rollDice(ctx, p);
        doMove(ctx, dice.reduce((x, y) => x + y, 0));
        return true;
      }
      return false;
    case 'oport':
      if (a.type !== 'CHOOSE_DEAL' || !['small', 'big'].includes(a.size)) return false;
      openDeal(ctx, p, a.size);
      return true;
    case 'pick': {
      if (a.type !== 'PICK') return false;
      const id = pend.cards[a.index];
      if (!id) return false;
      showDeal(ctx, p, id, 'big');
      return true;
    }
    case 'deal':
      if (a.type === 'PITCH') return pitchDeal(ctx, p, a);
      if (a.type === 'BUY') {
        if (!buyDeal(ctx, a)) return false;
        endTurn(ctx);
        return true;
      }
      if (a.type === 'SELL') {
        if (!sellStockOnCard(ctx, a)) return false;
        endTurn(ctx);
        return true;
      }
      if (a.type === 'PASS') {
        endTurn(ctx);
        return true;
      }
      return false;
    case 'card':
      if (a.type !== 'OPTION') return false;
      if (!pend.options.some(o => o.key === a.key)) return false;
      resolveCardOption(ctx, a.key);
      return true;
    case 'offer':
      if (a.type === 'SELL_OFFER') {
        const owner = byId(s, a.pid2);
        const card = getCard(pend.cardId);
        const asset = owner?.assets.find(x => x.id === a.assetId);
        if (!asset || owner.isBot || !offerMatches(card, asset)) return false;
        sellAsset(ctx, owner, asset, offerPrice(s, card, asset) - asset.mortgage, card.name);
        return true;
      }
      if (a.type === 'DONE') {
        endTurn(ctx);
        return true;
      }
      return false;
    case 'market':
    case 'info':
      if (a.type !== 'DONE') return false;
      endTurn(ctx);
      return true;
    case 'escape':
      if (a.type !== 'DONE') return false;
      s.current = (s.current + 1) % s.players.length;
      startTurn(ctx);
      return true;
    case 'aral':
      if (a.type === 'LEARN') {
        if (!pend.skills.includes(a.skillId)) return false;
        if (!learnSkill(ctx, p, a.skillId, pend.free)) return false;
        endTurn(ctx);
        return true;
      }
      if (a.type === 'SKIP') {
        endTurn(ctx);
        return true;
      }
      return false;
    case 'tulong':
      if (a.type !== 'OPTION') return false;
      if (a.key === 'give') {
        if (p.cash < pend.amount) return false;
        cash(ctx, p, -pend.amount, 'Donasyon');
        p.charityTurns = 3;
        p.stats.donated += pend.amount;
        addDiskarte(p, 1);
        log(ctx, p, `Donated ${fmt(pend.amount)}. 2 dice for 3 turns.`, 'good');
        settle(ctx, p);
      }
      endTurn(ctx);
      return true;
    case 'ftdeal':
    case 'gamble': {
      if (a.type !== 'OPTION') return false;
      const deal = ftDeals[pend.pos];
      if (a.key === 'buy') {
        if (p.cash < deal.cost) return false;
        cash(ctx, p, -deal.cost, deal.name);
        if (pend.kind === 'ftdeal') {
          s.ftOwned[pend.pos] = p.id;
          p.ft.cashflow += deal.cf;
          p.stats.deals++;
          log(ctx, p, `Bought ${deal.name}: +${fmt(deal.cf)} cashflow.`, 'good');
          ctx.fx.push({ type: 'buy', pid: p.id, cf: deal.cf });
          if (checkFtWin(ctx, p)) return true;
        } else {
          const roll = d6(s);
          ctx.fx.push({ type: 'dice', pid: p.id, dice: [roll] });
          if (roll >= deal.need) {
            cash(ctx, p, deal.win, 'Jackpot!');
            log(ctx, p, `${deal.name}: rolled ${roll}, won ${fmt(deal.win)}.`, 'great');
            info(ctx, p, deal.emoji, `Rolled ${roll}. It hit!`, `${deal.name} paid out ${fmt(deal.win)}.`, 'good');
          } else {
            log(ctx, p, `${deal.name}: rolled ${roll}, lost ${fmt(deal.cost)}.`, 'bad');
            info(ctx, p, deal.emoji, `Rolled ${roll}. No luck.`, `${deal.name} flopped. You needed ${deal.need} or higher.`, 'bad');
          }
          return true;
        }
      }
      endTurn(ctx);
      return true;
    }
    case 'dream': {
      if (a.type !== 'OPTION') return false;
      const dream = dreamById[pend.dreamId];
      if (a.key === 'buy') {
        if (p.cash < dream.cost) return false;
        cash(ctx, p, -dream.cost, dream.name);
        win(ctx, p, 'dream');
        return true;
      }
      endTurn(ctx);
      return true;
    }
    case 'sakuna': {
      if (a.type !== 'OPTION') return false;
      if (a.key.startsWith('use:')) {
        const id = a.key.slice(4);
        if (!p.hand.includes(id)) return false;
        p.hand = p.hand.filter(x => x !== id);
        log(ctx, p, `Used ${getCard(id).name}. Disaster avoided.`, 'good');
      } else {
        cash(ctx, p, -pend.loss, ftDisasters[pend.pos].name);
        log(ctx, p, `${ftDisasters[pend.pos].name}: −${fmt(pend.loss)}.`, 'bad');
      }
      endTurn(ctx);
      return true;
    }
    case 'foundation':
      if (a.type !== 'OPTION') return false;
      if (a.key === 'give') {
        if (p.cash < FT_CHARITY_COST) return false;
        cash(ctx, p, -FT_CHARITY_COST, 'Foundation');
        p.charityTurns = 3;
        p.stats.donated += FT_CHARITY_COST;
        log(ctx, p, `Donated ${fmt(FT_CHARITY_COST)} to the foundation.`, 'good');
      }
      endTurn(ctx);
      return true;
    default:
      return false;
  }
}

function anytime(ctx, p, a) {
  const { s } = ctx;
  if (p.track !== 'rat' && a.type !== 'USE_CARD') return false;
  // Finance actions are blocked mid-roll so dice outcomes cannot be gamed.
  if (s.pending?.kind === 'move' && s.pending.pid === p.id) return false;
  switch (a.type) {
    case 'BORROW': {
      const amount = Math.floor((a.amount || 0) / LOAN_STEP) * LOAN_STEP;
      if (amount <= 0 || amount > maxBankLoan(p)) return false;
      addBankLoan(ctx, p, amount, false);
      p.credit = clampCredit(p.credit - 5);
      log(ctx, p, `Bank loan: ${fmt(amount)} at ${Math.round(bankRate(p) * 100)}%/mo.`, 'warn');
      return true;
    }
    case 'REPAY':
      return repay(ctx, p, a.liabId, a.amount);
    case 'INSURANCE':
      p.insured = !!a.on;
      if (!p.insured) p.freeInsurance = 0;
      log(ctx, p, p.insured ? 'Got insurance.' : 'Cancelled insurance.');
      return true;
    case 'SELL_ASSET':
      return fireSale(ctx, p, a.assetId, a.qty);
    case 'USE_CARD':
      return applyAnytimeCard(ctx, p, a.cardId);
    default:
      return false;
  }
}

// ─── Selectors used by UI & bots ───────────────────────────────────────────

export function currentPlayer(s) {
  return cur(s);
}

export function landingPreview(s, p, steps) {
  const pos = (p.position + steps) % BOARD_SIZE;
  return board(p)[pos];
}

export { monthlyCashflow, assetCashflow };
