import { useGame } from '../store/gameStore.js';
import { useUi } from '../store/uiStore.js';
import { dreamById, fmt } from '../engine/engine.js';
import { FT_WIN_GAIN } from '../data/constants.js';
import { professionById } from '../data/professions.js';
import Confetti from './Confetti.jsx';

function Shell({ children }) {
  return (
    <div className="fixed inset-0 z-50 flex animate-fade items-center justify-center bg-night/90 p-4 backdrop-blur-sm">
      <Confetti />
      <div className="relative w-full max-w-md animate-pop rounded-3xl bg-gradient-to-b from-panel-2 to-night-2 p-6 text-center shadow-2xl ring-2 ring-gold/60">
        {children}
      </div>
    </div>
  );
}

export function EscapeOverlay() {
  const game = useGame(s => s.game);
  const dispatch = useGame(s => s.dispatch);
  const busy = useUi(s => s.busyCount > 0);
  const pend = game?.pending;
  if (!pend || pend.kind !== 'escape' || busy) return null;
  const p = game.players.find(x => x.id === pend.pid);
  const dream = dreamById[p.dreamId];
  return (
    <Shell>
      <div className="text-6xl animate-float">🕊️</div>
      <h2 className="shine-text mt-2 animate-shine font-display text-4xl font-bold">LAYA KA NA!</h2>
      <p className="mt-1 text-sm text-muted">{p.name} · nakatakas sa Rat Race</p>
      <p className="mt-3 text-sm leading-relaxed">{pend.text}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-left">
        <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10"><div className="text-[10px] uppercase text-muted">Buwan</div><div className="font-display text-xl font-bold">{p.escapedMonth}</div></div>
        <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10"><div className="text-[10px] uppercase text-muted">Turns</div><div className="font-display text-xl font-bold">{p.escapedTurn}</div></div>
        <div className="col-span-2 rounded-xl bg-white/5 p-3 ring-1 ring-white/10"><div className="text-[10px] uppercase text-muted">Fast Track cashflow</div><div className="font-display text-xl font-bold text-good">{fmt(p.ft.cashflow)}</div></div>
      </div>
      <p className="mt-3 text-xs text-muted">Bagong layunin: bilhin ang {dream.emoji} <b className="text-cream">{dream.name}</b> ({fmt(dream.cost)}) o dagdagan ang cashflow ng {fmt(FT_WIN_GAIN)}.</p>
      {!p.isBot ? (
        <button type="button" onClick={() => dispatch({ type: 'DONE' })} className="mt-5 w-full rounded-2xl bg-gradient-to-b from-amber-300 to-gold-deep btn-3d py-3 font-display text-lg font-bold text-night active:scale-95">
          🚀 Tara sa Fast Track!
        </button>
      ) : (
        <p className="mt-5 animate-pulse text-sm text-muted">Tuloy ang laro…</p>
      )}
    </Shell>
  );
}

export function EndScreen() {
  const game = useGame(s => s.game);
  const quit = useGame(s => s.quit);
  if (!game || game.phase !== 'ended') return null;
  const winner = game.players.find(p => p.id === game.winnerId);
  const how = game.pending?.how;
  const dream = dreamById[winner.dreamId];
  const solo = game.players.length === 1;
  return (
    <Shell>
      <div className="text-6xl animate-float">{how === 'dream' ? dream.emoji : '👑'}</div>
      <h2 className="shine-text mt-2 animate-shine font-display text-4xl font-bold">{solo || !winner.isBot ? 'PANALO!' : `${winner.name} ang nanalo`}</h2>
      <p className="mt-1 text-sm text-muted">
        {how === 'dream' ? `Nabili ang pangarap: ${dream.name}` : 'Naabot ang Fast Track cashflow goal'}
      </p>
      <div className="mt-4 flex flex-col gap-2 text-left">
        {[...game.players].sort((a, b) => (b.id === game.winnerId) - (a.id === game.winnerId)).map(p => (
          <div key={p.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
            <span className="text-2xl">{p.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{p.name}{p.id === game.winnerId ? ' 👑' : ''}</div>
              <div className="text-[11px] text-muted">
                {professionById[p.professionId].name} · {p.escapedMonth !== null ? `Nakalaya sa buwan ${p.escapedMonth}` : 'Nasa Rat Race pa'} · {p.turns} turns · {p.stats.deals} deals
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs italic text-violet-200">"Ang mahirap ay nagtatrabaho para sa pera. Ang mayaman ay pinagtatrabaho ang pera para sa kanila."</p>
      <button type="button" onClick={quit} className="mt-5 w-full rounded-2xl bg-gradient-to-b from-amber-300 to-gold-deep btn-3d py-3 font-display text-lg font-bold text-night active:scale-95">
        Maglaro Ulit
      </button>
    </Shell>
  );
}
