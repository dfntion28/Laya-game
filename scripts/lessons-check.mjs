// Plays bot-driven games as if the players were human, to check every lesson can unlock and
// that the coaching notes never crash. Usage: node scripts/lessons-check.mjs [games]
import { createGame, step, getCard } from '../src/engine/engine.js';
import { botAction } from '../src/engine/bot.js';
import { cardCoach, dealCoach, optionMath } from '../src/engine/learn.js';
import { professions } from '../src/data/professions.js';
import { dreams, gastosCards, lifeEvents } from '../src/data/cards.js';
import { lessonList } from '../src/data/lessons.js';

const N = Number(process.argv[2] || 60);
const seen = {};
let actions = 0;
for (let g = 0; g < N; g++) {
  const levels = ['easy', 'normal', 'hard'];
  let s = createGame({
    seed: g + 1,
    players: [0, 1].map(i => ({ name: `H${i}`, isBot: true, botLevel: levels[(g + i) % 3], professionId: professions[(g + i) % professions.length].id, dreamId: dreams[i].id })),
  });
  for (const p of s.players) p.isBot = false;
  let n = 0;
  while (s.phase === 'playing' && n++ < 6000) {
    const pend = s.pending;
    const p = s.players[s.current];
    if (pend.kind === 'card') {
      const c = getCard(pend.cardId);
      cardCoach(p, c);
      for (const o of pend.options) if (!Array.isArray(o.math)) throw new Error(`No math on ${c.id}:${o.key}`);
    }
    if (pend.kind === 'deal' && getCard(pend.cardId).cf !== undefined) dealCoach(p, getCard(pend.cardId), getCard(pend.cardId).down, getCard(pend.cardId).cf, 50_000);
    const a = botAction(s) ?? { type: 'DONE' };
    let r = step(s, a);
    if (r.rejected) {
      const k = pend.kind;
      r = step(s, k === 'roll' ? { type: 'ROLL' } : k === 'deal' ? { type: 'PASS' } : k === 'move' ? { type: 'GO' } : k === 'pitch' ? { type: 'PITCH_DECLINE' } : k === 'loanask' ? { type: 'LOAN_NO' } : { type: 'DONE' });
      if (r.rejected) throw new Error(`Stuck on ${JSON.stringify(pend)}`);
    }
    for (const f of r.fx) if (f.type === 'lesson') seen[f.id] = (seen[f.id] || 0) + 1;
    s = r.state;
    actions++;
  }
}
// Every card's coach note and option math, for every profession at start.
for (const prof of professions) {
  const p = createGame({ seed: 1, players: [{ name: 'x', professionId: prof.id, dreamId: dreams[0].id }] }).players[0];
  for (const c of [...gastosCards, ...lifeEvents]) {
    const note = cardCoach(p, c);
    if (note && /NaN|undefined|Infinity/.test(note)) throw new Error(`Bad coach on ${c.id}: ${note}`);
    for (const e of c.options?.map(o => o.effects) ?? [c.effects]) {
      for (const line of optionMath(p, e)) if (/NaN|undefined|Infinity/.test(line)) throw new Error(`Bad math on ${c.id}: ${line}`);
    }
  }
}
// Paths bots never take: force them directly.
{
  const base = createGame({ seed: 7, players: [{ name: 'x', professionId: 'nars', dreamId: dreams[0].id }, { name: 'y', professionId: 'guro', dreamId: dreams[1].id }] });
  const at = (pending, patch = {}) => {
    const st = structuredClone(base);
    Object.assign(st.players[0], { cash: 2_000_000 }, patch);
    st.pending = { pid: 'p0', ...pending };
    return st;
  };
  const tally = r => { for (const f of r.fx) if (f.type === 'lesson') seen[f.id] = (seen[f.id] || 0) + 1; return r; };
  tally(step(at({ kind: 'deal', size: 'small', cardId: 's24' }), { type: 'BUY' }));
  tally(step(at({ kind: 'deal', size: 'small', cardId: 's26' }), { type: 'BUY' }));
  tally(step(at({ kind: 'deal', size: 'small', cardId: 's18' }), { type: 'BUY', amount: 50_000 }));
  const poor = at({ kind: 'deal', size: 'small', cardId: 's24' }, { cash: 0 });
  tally(step(poor, { type: 'BUY', borrow: true }));
  let r = tally(step(at({ kind: 'deal', size: 'small', cardId: 's20' }), { type: 'BUY' }));
  const owned = r.state;
  owned.current = 0;
  owned.pending = { pid: 'p0', kind: 'offer', cardId: 'm1', space: 'merkado' };
  tally(step(owned, { type: 'SELL_OFFER', pid2: 'p0', assetId: owned.players[0].assets[0].id }));
  const owned2 = structuredClone(r.state);
  owned2.current = 0;
  owned2.pending = { pid: 'p0', kind: 'roll' };
  tally(step(owned2, { type: 'SELL_ASSET', assetId: owned2.players[0].assets[0].id }));
  r = tally(step(at({ kind: 'deal', size: 'small', cardId: 's9' }), { type: 'BUY', qty: 1000 }));
  const st = r.state;
  st.current = 0;
  st.pending = { pid: 'p0', kind: 'deal', size: 'small', cardId: 's6' };
  tally(step(st, { type: 'SELL', qty: 1000 }));
  const ask = at({ kind: 'roll' });
  ask.players[1].cash = 500_000;
  r = step(ask, { type: 'LOAN_ASK', to: 'p1', amount: 100_000, rate: 0.02 });
  tally(step(r.state, { type: 'LOAN_YES' }));
}
const missing = lessonList.filter(l => !seen[l.id]).map(l => l.id);
const unknown = Object.keys(seen).filter(id => !lessonList.some(l => l.id === id));
console.log(`${N} games, ${actions} actions. Lessons unlocked (times):`, seen);
console.log('Never unlocked:', missing.length ? missing : 'none');
if (unknown.length) throw new Error(`Lesson ids not in the book: ${unknown}`);
