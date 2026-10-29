// Turns engine fx events into timed UI effects: dice spin, token hops, toasts, sounds.
import { useUi } from './uiStore.js';
import { play, buzz } from '../lib/sfx.js';
import { fmt } from '../engine/engine.js';

export const STEP_MS = 190;
const DICE_MS = 650;

export function runFx(fx, state) {
  const ui = useUi.getState();
  const muted = ui.muted;
  const name = pid => state.players.find(p => p.id === pid)?.name ?? '';
  const multi = state.players.length > 1;
  let t = 0;
  let moveStart = 0;
  const at = (ms, fn) => (ms <= 0 ? fn() : setTimeout(fn, ms));

  for (const f of fx) {
    switch (f.type) {
      case 'dice':
        at(t, () => {
          useUi.getState().rollDice(f.dice);
          play('dice', muted);
          buzz(20);
        });
        t += DICE_MS;
        break;
      case 'move': {
        moveStart = t;
        const steps = f.path.length - 1;
        at(t, () => useUi.getState().startMove(f.pid, f.path, f.track));
        for (let i = 1; i <= steps; i++) {
          at(t + i * STEP_MS, () => {
            useUi.getState().tickMove();
            play('step', muted);
          });
        }
        t += steps * STEP_MS + 120;
        at(t, () => useUi.getState().endMove());
        break;
      }
      case 'payday':
        at(moveStart + f.atStep * STEP_MS, () => {
          const tone = f.net >= 0 ? 'good' : 'bad';
          const title = f.ft ? 'Cashflow Day!' : `Sahod — ${f.month}`;
          useUi.getState().pushToast({ text: `${title} ${f.net >= 0 ? '+' : ''}${fmt(f.net)}`, sub: f.notes?.join(' · '), tone, big: true, ms: 3200 });
          play(f.net >= 0 ? 'coin' : 'bad', muted);
          buzz(30);
        });
        break;
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
          useUi.getState().setCelebrate({ kind: f.type, pid: f.pid });
          play('win', muted);
          buzz(300);
        });
        break;
      case 'turn': {
        const p = state.players.find(x => x.id === f.pid);
        at(t, () => {
          if (p && !p.isBot) useUi.getState().setView(p.id);
          if (multi) useUi.getState().pushToast({ text: `Turno ni ${name(f.pid)}`, tone: 'info', ms: 1400 });
        });
        break;
      }
      default:
        break;
    }
  }
  if (t > 0) {
    useUi.getState().busy();
    setTimeout(() => useUi.getState().idle(), t);
  }
}
