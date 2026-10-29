import { useGame } from '../store/gameStore.js';
import { useUi } from '../store/uiStore.js';
import { freedomRatio } from '../engine/finance.js';
import { FT_WIN_GAIN } from '../data/constants.js';
import { playerTone } from '../lib/theme.js';
import { pct } from '../lib/format.js';

export default function PlayerStrip() {
  const game = useGame(s => s.game);
  const viewPid = useUi(s => s.viewPid);
  const setView = useUi(s => s.setView);
  if (game.players.length < 2) return null;
  return (
    <div className="scrollbar-none flex gap-2 overflow-x-auto px-3 pb-1">
      {game.players.map((p, i) => {
        const tone = playerTone[p.color];
        const progress = p.track === 'fast' ? (p.ft.cashflow - p.ft.start) / FT_WIN_GAIN : freedomRatio(p);
        const active = i === game.current;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => setView(p.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-3 ring-1 transition ${viewPid === p.id ? `bg-night ${tone.ring}` : 'bg-night/75 ring-white/10'} ${active ? 'ring-2' : ''}`}
          >
            <span className={`grid size-7 place-items-center rounded-full text-sm ${tone.bg} ${active ? 'animate-glow' : ''}`}>{p.emoji}</span>
            <span className="text-left leading-tight">
              <span className="block max-w-20 truncate text-xs font-semibold">{p.name}{p.isBot ? ' 🤖' : ''}</span>
              <span className="block text-[10px] text-muted">{p.track === 'fast' ? '🚀 ' : ''}{pct(progress)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
