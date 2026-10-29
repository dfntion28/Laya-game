// Turns engine fx events into timed UI effects: dice toss, token hops, toasts, sounds.
import { useUi } from './uiStore.js';
import { play, buzz } from '../lib/sfx.js';
import { fmt } from '../engine/engine.js';

const TIMING = {
  normal: { step: 430, dice: 850 },
  fast: { step: 140, dice: 300 },
};

export function runFx(fx, state) {
  const ui = useUi.getState();
  const muted = ui.muted;
  const actor = state.players.find(p => p.id === fx.find(f => f.pid)?.pid);
  const speed = actor?.isBot && ui.fastBots ? TIMING.fast : TIMING.normal;
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
        t += speed.dice;
        at(t, () => {
          useUi.getState().landDice();
          play('land', muted);
        });
        t += 200;
        break;
      case 'move': {
        moveStart = t;
        const steps = f.path.length - 1;
        at(t, () => useUi.getState().startMove(f.pid, f.path, f.track));
        for (let i = 1; i <= steps; i++) {
          at(t + i * speed.step, () => {
            useUi.getState().tickMove();
            play('step', muted);
          });
        }
        t += steps * speed.step + speed.step;
        at(t, () => useUi.getState().endMove());
        break;
      }
      case 'payday':
        at(moveStart + f.atStep * speed.step, () => {
          const title = f.ft ? 'Cashflow Day' : `Payday · ${f.month}`;
          useUi.getState().pushToast({ text: `${title}  ${f.net >= 0 ? '+' : ''}${fmt(f.net)}`, sub: f.notes?.join(' · '), tone: f.net >= 0 ? 'good' : 'bad', big: true, ms: 3200 });
          if (f.net > 0) useUi.getState().burst();
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
  if (t > 0) {
    useUi.getState().busy();
    setTimeout(() => useUi.getState().idle(), t);
  }
}
