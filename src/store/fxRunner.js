// Turns engine fx events into timed UI effects: dice toss, token hops, toasts, sounds.
// The screen keeps showing the old game state until the last effect finishes (see `commit`),
// so money, cards and the month never change before the pawn lands.
import { useUi } from './uiStore.js';
import { play, buzz } from '../lib/sfx.js';
import { fmt } from '../engine/engine.js';

const TIMING = {
  normal: { step: 430, dice: 900, settle: 450 },
  fast: { step: 140, dice: 300, settle: 120 },
};

// Which cells the pawn hops through, given where it stands now (it may be parked on a preview).
function hopPlan(ghost, path) {
  if (!ghost) return { hops: path, offset: 0 };
  const at = ghost.path[ghost.path.length - 1];
  const m = path.indexOf(at);
  if (m >= 0) return { hops: path.slice(m), offset: m };
  const end = path[path.length - 1];
  const k = ghost.path.indexOf(end);
  // Stepping back: walk backwards along the preview. Paydays on the way already happened in the rules.
  if (k >= 0) return { hops: ghost.path.slice(k).reverse(), offset: Infinity };
  return { hops: [at, ...path], offset: -1 };
}

export function runFx(fx, state, commit) {
  const ui = useUi.getState();
  const muted = ui.muted;
  const actor = state.players.find(p => p.id === fx.find(f => f.pid)?.pid);
  const speed = actor?.isBot && ui.fastBots ? TIMING.fast : TIMING.normal;
  const multi = state.players.length > 1;
  let ghost = ui.ghost;
  let t = 0;
  let moveStart = 0;
  let offset = 0;
  let moveStep = speed.step;
  const at = (ms, fn) => (ms <= 0 ? fn() : setTimeout(fn, ms));

  // Long Fast Track moves hop quicker so a 12 doesn't take five seconds.
  const stepMs = steps => Math.max(Math.min(speed.step, 260), Math.min(speed.step, 3000 / Math.max(1, steps)));

  const hop = (pid, cells, track) => {
    const steps = cells.length - 1;
    const ms = stepMs(steps);
    at(t, () => useUi.getState().startMove(pid, cells, track, ms));
    for (let i = 1; i <= steps; i++) {
      at(t + i * ms, () => {
        useUi.getState().tickMove();
        play(i === steps ? 'land' : 'step', muted);
        if (i === steps) buzz(15);
      });
    }
    t += steps * ms;
    return ms;
  };

  for (const f of fx) {
    switch (f.type) {
      case 'dice':
        at(t, () => {
          useUi.getState().rollDice(f.dice);
          play('dice', muted);
          buzz(20);
        });
        t += speed.dice;
        at(t, () => useUi.getState().landDice());
        t += 250;
        break;
      case 'preview':
        hop(f.pid, f.path, f.track);
        at(t, () => useUi.getState().park(f.pid, f.path, f.track));
        t += speed.settle;
        break;
      case 'return':
        if (ghost) {
          const g = ghost;
          at(t, () => useUi.getState().startMove(g.pid, [g.path[g.path.length - 1], g.path[0]], g.track));
          at(t + 30, () => useUi.getState().tickMove());
          t += speed.step + 30;
          ghost = null;
        }
        break;
      case 'move': {
        const plan = hopPlan(ghost?.pid === f.pid ? ghost : null, f.path);
        ghost = null;
        moveStart = t;
        offset = plan.offset;
        moveStep = hop(f.pid, plan.hops, f.track);
        t += speed.settle;
        break;
      }
      case 'payday': {
        const when = offset === Infinity ? moveStart : moveStart + Math.max(0, f.atStep - offset) * moveStep;
        at(when, () => {
          const title = f.ft ? 'Cashflow Day' : `Payday · ${f.month}`;
          useUi.getState().pushToast({ text: `${title}  ${f.net >= 0 ? '+' : ''}${fmt(f.net)}`, sub: f.notes?.join(' · '), tone: f.net >= 0 ? 'good' : 'bad', big: true, ms: 3200 });
          if (f.net > 0) useUi.getState().burst();
          play(f.net >= 0 ? 'coin' : 'bad', muted);
          buzz(30);
        });
        break;
      }
      case 'cash':
        at(t, () => useUi.getState().pushToast({ text: `${f.amount >= 0 ? '+' : ''}${fmt(f.amount)}`, sub: f.label, tone: f.amount >= 0 ? 'good' : 'bad' }));
        break;
      case 'buy':
        at(t, () => play('buy', muted));
        break;
      case 'toast':
        at(t, () => {
          useUi.getState().pushToast({ text: f.text, tone: f.tone });
          if (f.tone === 'bad') play('bad', muted);
        });
        break;
      case 'bankrupt':
        at(t, () => {
          play('bad', muted);
          buzz(200);
        });
        break;
      case 'escape':
      case 'win':
        at(t, () => {
          play('win', muted);
          buzz(300);
        });
        break;
      case 'turn': {
        const p = state.players.find(x => x.id === f.pid);
        at(t, () => {
          if (p && !p.isBot) useUi.getState().setView(p.id);
          if (multi && p && !(p.isBot && useUi.getState().fastBots)) {
            useUi.getState().showBanner(p.isBot ? `${p.name}'s turn` : p.name === 'You' ? 'Your turn!' : `${p.name}, you're up!`);
            play('whoosh', muted);
          }
        });
        break;
      }
      default:
        break;
    }
  }
  if (t <= 0) {
    commit();
    return;
  }
  useUi.getState().busy();
  setTimeout(() => {
    commit();
    useUi.getState().endMove();
    useUi.getState().idle();
  }, t);
}
