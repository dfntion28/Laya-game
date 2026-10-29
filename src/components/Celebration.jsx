import { useGame } from '../store/gameStore.js';
import { useUi } from '../store/uiStore.js';
import { dreamById, fmt } from '../engine/engine.js';
import { FT_WIN_GAIN } from '../data/constants.js';
import { professionById } from '../data/professions.js';
import { Btn, Figure } from './Ui.jsx';
import Pawn from './Pawn.jsx';
import { useNet, useControls } from '../store/netStore.js';
import { leaveRoom } from '../net/online.js';

const CONFETTI = [
  'left-[4%] bg-mustard [animation-delay:0s]', 'left-[11%] bg-berry [animation-delay:0.6s]',
  'left-[18%] bg-ocean [animation-delay:1.2s]', 'left-[25%] bg-lettuce [animation-delay:0.3s]',
  'left-[32%] bg-tomato [animation-delay:1.8s]', 'left-[39%] bg-grape [animation-delay:0.9s]',
  'left-[46%] bg-mustard [animation-delay:1.5s]', 'left-[53%] bg-berry [animation-delay:0.2s]',
  'left-[60%] bg-ocean [animation-delay:2.1s]', 'left-[67%] bg-lettuce [animation-delay:0.7s]',
  'left-[74%] bg-tomato [animation-delay:1.1s]', 'left-[81%] bg-grape [animation-delay:0.4s]',
  'left-[88%] bg-mustard [animation-delay:1.6s]', 'left-[95%] bg-berry [animation-delay:1s]',
  'left-[8%] bg-lettuce [animation-delay:2.4s]', 'left-[29%] bg-ocean [animation-delay:2s]',
  'left-[50%] bg-tomato [animation-delay:2.6s]', 'left-[71%] bg-mustard [animation-delay:1.4s]',
];

function Shell({ children }) {
  return (
    <div className="fixed inset-0 z-50 flex animate-fade items-center justify-center bg-ink/55 p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {CONFETTI.map((c, i) => <span key={i} className={`absolute -top-4 h-4 w-2.5 animate-confetti rounded-sm border-2 border-ink ${c}`} />)}
      </div>
      <div className="relative w-full max-w-md animate-pop rounded-[28px] border-[4px] border-ink bg-paper p-6 text-center pop-shadow">{children}</div>
    </div>
  );
}

export function EscapeOverlay() {
  const game = useGame(s => s.shown ?? s.game);
  const dispatch = useGame(s => s.dispatch);
  const busy = useUi(s => s.busyCount > 0);
  const control = useControls(game);
  const pend = game?.pending;
  if (!pend || pend.kind !== 'escape' || busy) return null;
  const p = game.players.find(x => x.id === pend.pid);
  const dream = dreamById[p.dreamId];
  return (
    <Shell>
      <div className="mx-auto w-20 animate-bob"><Pawn color={p.color} job={p.professionId} className="size-20" /></div>
      <h2 className="mt-2 font-display text-5xl leading-none text-mustard text-stroke">LAYA!</h2>
      <p className="mt-2 font-display text-xl">{game.players.length > 1 ? `${p.name} is out of the Rat Race` : 'You\'re out of the Rat Race'}</p>
      <p className="mt-2 text-[15px] font-bold text-ink-soft">{pend.text}</p>
      <div className="mt-4 grid grid-cols-3 gap-2 border-y-2 border-ink/10 py-3">
        <Figure label="Months" value={p.escapedMonth} />
        <Figure label="Turns" value={p.escapedTurn} />
        <Figure label="New cashflow" value={fmt(p.ft.cashflow)} tone="text-green-700" />
      </div>
      <p className="mt-3 text-sm font-bold">Next: buy your {dream.name} ({fmt(dream.cost)}), or add {fmt(FT_WIN_GAIN)} to your cashflow.</p>
      {control(p.id) ? (
        <Btn size="lg" className="mt-5 w-full" onClick={() => dispatch({ type: 'DONE' })}>To the Fast Track</Btn>
      ) : (
        <p className="mt-5 animate-pulse font-display text-lg">{p.isBot ? 'Game continues...' : `Waiting for ${p.name}...`}</p>
      )}
    </Shell>
  );
}

export function EndScreen() {
  const game = useGame(s => s.shown ?? s.game);
  const quit = useGame(s => s.quit);
  const net = useNet();
  if (!game || game.phase !== 'ended') return null;
  const winner = game.players.find(p => p.id === game.winnerId);
  const how = game.pending?.how;
  const dream = dreamById[winner.dreamId];
  const youWon = net.mode === 'local' ? !winner.isBot : winner.id === net.me;
  return (
    <Shell>
      <div className="text-6xl">{how === 'dream' ? dream.emoji : '🏆'}</div>
      <h2 className="mt-2 font-display text-5xl leading-none text-mustard text-stroke">{youWon ? 'YOU WIN!' : `${winner.name.toUpperCase()} WINS`}</h2>
      <p className="mt-2 font-display text-lg">{how === 'dream' ? `Bought the dream: ${dream.name}` : 'Hit the Fast Track cashflow goal'}</p>
      <div className="mt-4 flex flex-col divide-y-2 divide-ink/10 border-y-2 border-ink/10 text-left">
        {[...game.players].sort((a, b) => (b.id === game.winnerId) - (a.id === game.winnerId)).map(p => (
          <div key={p.id} className="flex items-center gap-3 py-2.5">
            <Pawn color={p.color} job={p.professionId} className="size-9 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="font-extrabold">{p.name}{p.id === game.winnerId ? ' (winner)' : ''}</div>
              <div className="text-xs font-bold text-ink-soft">
                {professionById[p.professionId].name} · {p.escapedMonth !== null ? `escaped in month ${p.escapedMonth}` : 'still in the Rat Race'} · {p.turns} turns · {p.stats.deals} deals
              </div>
            </div>
          </div>
        ))}
      </div>
      <Btn size="lg" className="mt-5 w-full" onClick={net.mode === 'local' ? quit : leaveRoom}>Play again</Btn>
    </Shell>
  );
}
