// Headless balance + robustness check: bots play full games; fails on exceptions or NaN.
// Usage: node scripts/simulate.mjs [gamesPerProfession] [players] [botLevel]
//        node scripts/simulate.mjs versus [games]   (easy vs normal vs hard, same professions)
import { createGame, step } from '../src/engine/engine.js';
import { botAction } from '../src/engine/bot.js';
import { professions } from '../src/data/professions.js';
import { dreams } from '../src/data/cards.js';

const VERSUS = process.argv[2] === 'versus';
const N = Number((VERSUS ? process.argv[3] : process.argv[2]) || 200);
const LEVEL = process.argv[4] || 'normal';
const PLAYERS = Number(process.argv[3] || 1);
const MAX_ACTIONS = 6000;

function checkNumbers(obj, path = 's') {
  if (typeof obj === 'number' && !Number.isFinite(obj)) throw new Error(`Non-finite at ${path}`);
  if (obj && typeof obj === 'object') for (const [k, v] of Object.entries(obj)) checkNumbers(v, `${path}.${k}`);
}

const pct = (arr, q) => arr.length ? [...arr].sort((a, b) => a - b)[Math.floor((arr.length - 1) * q)] : '-';
let seed = 1;
const rows = [];

function play(cfg) {
  let s = createGame({ players: cfg, seed: seed++ });
  let actions = 0;
  while (s.phase === 'playing' && actions < MAX_ACTIONS) {
    const a = botAction(s);
    let r = step(s, a);
    if (r.rejected) {
      const fallback = s.pending.kind === 'roll' ? { type: 'ROLL' } : s.pending.kind === 'deal' ? { type: 'PASS' } : { type: 'DONE' };
      r = step(s, fallback);
      if (r.rejected) throw new Error(`Stuck on ${JSON.stringify(s.pending)} action ${JSON.stringify(a)}`);
    }
    s = r.state;
    actions++;
    if (actions % 50 === 0) checkNumbers(s);
  }
  checkNumbers(s);
  return s;
}

if (VERSUS) {
  const levels = ['easy', 'normal', 'hard'];
  const wins = { easy: 0, normal: 0, hard: 0, none: 0 };
  for (let g = 0; g < N; g++) {
    const prof = professions[g % professions.length].id;
    // Rotate seating so turn order doesn't favor a level.
    const order = levels.map((_, i) => levels[(i + g) % 3]);
    const s = play(order.map((lvl, i) => ({ name: lvl, isBot: true, botLevel: lvl, botStyle: 'balanced', professionId: prof, dreamId: dreams[(g + i) % dreams.length].id })));
    const w = s.players.find(p => p.id === s.winnerId);
    wins[w ? w.botLevel : 'none']++;
  }
  console.log('Wins by bot level over', N, 'games:', wins);
  process.exit(0);
}

for (const prof of professions) {
  const esc = [], escMonths = [], winT = [], bk = [];
  let stuck = 0, kinds = { dream: 0, cashflow: 0 };
  for (let g = 0; g < N; g++) {
    const cfg = Array.from({ length: PLAYERS }, (_, i) => ({
      name: `B${i}`, isBot: true, botLevel: LEVEL,
      professionId: i === 0 ? prof.id : professions[(g + i) % professions.length].id,
      dreamId: dreams[(g + i) % dreams.length].id,
    }));
    const s = play(cfg);
    const p = s.players[0];
    if (p.escapedTurn) { esc.push(p.escapedTurn); escMonths.push(p.escapedMonth); }
    bk.push(p.stats.bankruptcies);
    if (s.phase === 'ended') {
      if (s.winnerId === p.id) { winT.push(p.turns); kinds[s.pending.how]++; }
    } else stuck++;
  }
  rows.push({
    prof: prof.id,
    escaped: `${Math.round(esc.length / N * 100)}%`,
    escTurnsP50: pct(esc, 0.5), escTurnsP90: pct(esc, 0.9), escMonthsP50: pct(escMonths, 0.5),
    winTurnsP50: pct(winT, 0.5), winPct: `${Math.round(winT.length / N * 100)}%`,
    dream: kinds.dream, cfWin: kinds.cashflow,
    bankrupt: `${Math.round(bk.filter(x => x > 0).length / N * 100)}%`, unfinished: stuck,
  });
}
console.table(rows);
