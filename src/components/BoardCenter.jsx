import { useGame } from '../store/gameStore.js';
import { useUi } from '../store/uiStore.js';
import { spaceTypes, ratRace as RAT, fastTrack as FAST } from '../data/board.js';
import { MONTHS } from '../data/constants.js';
import { ftDeals } from '../data/cards.js';
import { landingPreview, dreamById, marketLabel } from '../engine/engine.js';
import { fmt } from '../lib/format.js';
import { playerTone } from '../lib/theme.js';
import Dice from './Dice.jsx';

function DiskartePips({ p }) {
  return (
    <span className="flex items-center gap-0.5" title="Diskarte">
      {Array.from({ length: Math.max(p.diskarteMax, p.diskarte) }, (_, i) => (
        <span key={i} className={`size-2 rounded-full sm:size-2.5 ${i < p.diskarte ? 'bg-gold shadow-[0_0_6px] shadow-gold' : 'bg-white/15'}`} />
      ))}
    </span>
  );
}

function MoveChoice({ label, sub, space, onClick, main }) {
  const meta = spaceTypes[space];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-12 flex-1 flex-col items-center justify-center rounded-xl px-1 py-1 font-display leading-tight transition active:scale-95 ${main ? 'bg-gold text-night shadow-[0_4px_0_#b86a00]' : 'bg-black/25 text-cream ring-1 ring-white/25'}`}
    >
      <span className="text-[11px] font-bold sm:text-sm">{label}</span>
      <span className="text-sm sm:text-lg">{meta.emoji}</span>
      <span className="text-[8px] uppercase opacity-80 sm:text-[10px]">{sub ?? meta.label}</span>
    </button>
  );
}

export default function BoardCenter({ inspect, track, onCloseInspect }) {
  const game = useGame(s => s.game);
  const dispatch = useGame(s => s.dispatch);
  const dice = useUi(s => s.dice);
  const busy = useUi(s => s.busyCount > 0);
  const p = game.players[game.current];
  const pend = game.pending;
  const tone = playerTone[p.color];
  const human = !p.isBot;
  return (
    <div className="relative flex size-full flex-col items-center justify-between p-2 sm:p-4">
      <div className="flex w-full items-center justify-between gap-2">
        <span className={`flex min-w-0 items-center gap-1.5 rounded-full px-2 py-0.5 ring-1 ${tone.soft} ${tone.ring}`}>
          <span className="text-sm sm:text-lg">{p.emoji}</span>
          <span className="truncate font-display text-xs font-semibold sm:text-base">{p.name}</span>
          {p.isBot && <span className="rounded bg-white/15 px-1 text-[9px] uppercase">bot</span>}
        </span>
        <DiskartePips p={p} />
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="font-display text-[10px] uppercase tracking-widest text-muted sm:text-xs">
          {p.track === 'fast' ? 'Fast Track' : `Taon ${Math.floor(p.month / 12) + 1} · ${MONTHS[p.month % 12]}`}
        </span>
        <div className="flex gap-2 py-1 sm:gap-3">
          {dice.values.map((v, i) => <Dice key={i} value={v} rollId={dice.rollId} size={dice.values.length > 2 ? 'sm' : 'md'} />)}
        </div>
        <span className="text-[10px] text-muted sm:text-xs">Merkado: {marketLabel(game.market)}</span>
      </div>

      <div className="flex w-full flex-col items-center gap-1">
        {human && pend?.kind === 'roll' && !busy && (
          <button
            type="button"
            onClick={() => dispatch({ type: 'ROLL' })}
            className="w-full max-w-56 animate-glow rounded-2xl bg-gradient-to-b from-amber-300 to-gold-deep btn-3d px-4 py-2.5 font-display text-lg font-bold text-night sm:py-3 sm:text-2xl"
          >
            🎲 I-ROLL
          </button>
        )}
        {human && pend?.kind === 'move' && !busy && (
          <>
            <div className="flex w-full gap-1">
              {pend.total > 1 && (
                <MoveChoice label={`−1 (${pend.total - 1})`} space={landingPreview(game, p, pend.total - 1)} onClick={() => dispatch({ type: 'ADJUST', delta: -1 })} />
              )}
              <MoveChoice main label={`TARA (${pend.total})`} space={landingPreview(game, p, pend.total)} onClick={() => dispatch({ type: 'GO' })} />
              <MoveChoice label={`+1 (${pend.total + 1})`} space={landingPreview(game, p, pend.total + 1)} onClick={() => dispatch({ type: 'ADJUST', delta: 1 })} />
            </div>
            <button type="button" onClick={() => dispatch({ type: 'REROLL' })} className="text-[10px] text-muted underline underline-offset-2 sm:text-xs">
              🎲 Reroll · gumamit ng 1 Diskarte (±1 o reroll)
            </button>
          </>
        )}
        {p.isBot && <span className="animate-pulse font-display text-xs text-muted sm:text-sm">🤖 Nag-iisip si {p.name}…</span>}
        {p.track === 'fast' && p.ft && (
          <span className="text-center text-[9px] text-muted sm:text-xs">
            Pangarap: {dreamById[p.dreamId].emoji} {dreamById[p.dreamId].name} · {fmt(dreamById[p.dreamId].cost)}
          </span>
        )}
      </div>

      {inspect !== null && inspect !== undefined && (
        <InspectBubble index={inspect} track={track} onClose={onCloseInspect} />
      )}
    </div>
  );
}

function InspectBubble({ index, track, onClose }) {
  const game = useGame(s => s.game);
  const type = track === 'fast' ? FAST[index] : RAT[index];
  const meta = spaceTypes[type];
  const deal = track === 'fast' ? ftDeals[index] : null;
  const owner = deal && game.ftOwned[index] ? game.players.find(x => x.id === game.ftOwned[index]) : null;
  return (
    <button type="button" onClick={onClose} className="absolute inset-2 z-30 flex animate-pop flex-col items-center justify-center gap-1 rounded-xl bg-night/95 p-3 text-center ring-1 ring-line">
      <span className="text-3xl">{deal?.emoji ?? meta.emoji}</span>
      <span className="font-display text-base font-semibold text-gold">{deal?.name ?? meta.label}</span>
      {deal && (
        <span className="text-xs text-cream">
          {deal.kind === 'gamble' ? `${fmt(deal.cost)} · Roll ${deal.need}+ = ${fmt(deal.win)}` : `${fmt(deal.cost)} · +${fmt(deal.cf)}/cashflow`}
          {owner ? ` · Pag-aari ni ${owner.name}` : ''}
        </span>
      )}
      <span className="text-xs text-muted">{meta.help}</span>
      <span className="mt-1 text-[10px] text-muted">(i-tap para isara)</span>
    </button>
  );
}

