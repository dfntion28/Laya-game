import { useGame } from '../store/gameStore.js';
import { useUi } from '../store/uiStore.js';
import { freedomRatio } from '../engine/finance.js';
import { FT_WIN_GAIN } from '../data/constants.js';
import { pct } from '../lib/format.js';
import Pawn from './Pawn.jsx';

// Tap a player to see their money. The one whose turn it is gets a yellow highlight.
export default function PlayerStrip() {
  const game = useGame(s => s.shown ?? s.game);
  const viewPid = useUi(s => s.viewPid);
  const setView = useUi(s => s.setView);
  if (game.players.length < 2) return null;
  return (
    <div className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto">
      {game.players.map((p, i) => {
        const progress = p.track === 'fast' ? (p.ft.cashflow - p.ft.start) / FT_WIN_GAIN : freedomRatio(p);
        const active = i === game.current;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => setView(p.id)}
            className={`flex shrink-0 items-center gap-1 rounded-full py-0.5 pl-0.5 pr-2.5 ${active ? 'bg-mustard' : ''} ${viewPid === p.id ? 'ring-2 ring-ink' : ''}`}
          >
            <span className={active ? 'animate-bob' : ''}><Pawn color={p.color} job={p.professionId} className="size-7" /></span>
            <span className="text-left leading-none">
              <span className="block max-w-20 truncate text-xs font-extrabold">{p.name}</span>
              <span className="block text-[11px] font-bold text-ink-soft">{p.track === 'fast' ? 'Fast Track · ' : ''}{pct(progress)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
