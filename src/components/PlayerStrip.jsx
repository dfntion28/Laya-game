import { useGame } from '../store/gameStore.js';
import { useUi } from '../store/uiStore.js';
import { freedomRatio } from '../engine/finance.js';
import { FT_WIN_GAIN } from '../data/constants.js';
import { pct } from '../lib/format.js';
import Pawn from './Pawn.jsx';

export default function PlayerStrip() {
  const game = useGame(s => s.game);
  const viewPid = useUi(s => s.viewPid);
  const setView = useUi(s => s.setView);
  if (game.players.length < 2) return null;
  return (
    <div className="scrollbar-none flex gap-2 overflow-x-auto px-3 pb-2 pt-1">
      {game.players.map((p, i) => {
        const progress = p.track === 'fast' ? (p.ft.cashflow - p.ft.start) / FT_WIN_GAIN : freedomRatio(p);
        const active = i === game.current;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => setView(p.id)}
            className={`press flex shrink-0 items-center gap-1.5 rounded-full border-[2.5px] border-ink py-0.5 pl-0.5 pr-3 pop-shadow-sm ${viewPid === p.id ? 'bg-mustard' : 'bg-paper'} ${active ? '-translate-y-0.5' : ''}`}
          >
            <span className={active ? 'animate-bob' : ''}><Pawn color={p.color} className="size-7" /></span>
            <span className="text-left leading-tight">
              <span className="block max-w-24 truncate text-xs font-extrabold">{p.name}</span>
              <span className="block font-display text-xs">{p.track === 'fast' ? 'Fast Track ' : ''}{pct(progress)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
