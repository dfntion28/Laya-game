import { useGame } from '../store/gameStore.js';
import { useUi } from '../store/uiStore.js';
import { spaceTypes, ratRace, fastTrack } from '../data/board.js';
import { MONTHS } from '../data/constants.js';
import { ftDeals } from '../data/cards.js';
import { landingPreview, fmt } from '../engine/engine.js';
import { spaceTone } from '../lib/theme.js';
import Dice from './Dice.jsx';
import Icon from './Icon.jsx';
import Pawn from './Pawn.jsx';

function DiskartePips({ p }) {
  return (
    <span className="flex items-center gap-1 rounded-full border-2 border-ink bg-paper px-1.5 py-0.5" title="Diskarte: spend one to move ±1 or reroll">
      <span className="font-display text-[10px] leading-none sm:text-xs">DISKARTE</span>
      {Array.from({ length: Math.max(p.diskarteMax, p.diskarte) }, (_, i) => (
        <span key={i} className={`size-2.5 rounded-full border-2 border-ink sm:size-3 ${i < p.diskarte ? 'bg-mustard' : 'bg-white'}`} />
      ))}
    </span>
  );
}

function MoveChoice({ label, space, onClick, main }) {
  const meta = spaceTypes[space];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`press pop-shadow-sm flex min-h-12 flex-1 flex-col items-center justify-center rounded-xl border-[2.5px] border-ink px-1 py-1 leading-none ${main ? 'bg-mustard' : 'bg-paper'}`}
    >
      <span className="font-display text-sm sm:text-lg">{label}</span>
      <span className="mt-0.5 flex items-center gap-0.5 text-[9px] font-extrabold uppercase sm:text-[11px]">
        <span className={`grid size-4 place-items-center rounded border border-ink sm:size-5 ${spaceTone[meta.tone]}`}><Icon name={meta.icon} className="size-3 sm:size-4" /></span>
        {meta.label}
      </span>
    </button>
  );
}

function InspectBubble({ index, track, onClose }) {
  const game = useGame(s => s.game);
  const type = track === 'fast' ? fastTrack[index] : ratRace[index];
  const meta = spaceTypes[type];
  const deal = track === 'fast' ? ftDeals[index] : null;
  const owner = deal && game.ftOwned[index] ? game.players.find(x => x.id === game.ftOwned[index]) : null;
  return (
    <button type="button" onClick={onClose} className="absolute inset-2 z-30 flex animate-pop flex-col items-center justify-center gap-1.5 rounded-xl border-[3px] border-ink bg-paper p-3 text-center pop-shadow">
      <span className={`grid size-12 place-items-center rounded-xl border-[2.5px] border-ink ${spaceTone[meta.tone]}`}><Icon name={meta.icon} className="size-8" /></span>
      <span className="font-display text-xl leading-tight">{deal?.name ?? meta.label}</span>
      {deal && (
        <span className="text-xs font-extrabold">
          {deal.kind === 'gamble' ? `${fmt(deal.cost)} · roll ${deal.need}+ to win ${fmt(deal.win)}` : `${fmt(deal.cost)} · +${fmt(deal.cf)} cashflow`}
          {owner ? ` · owned by ${owner.name}` : ''}
        </span>
      )}
      <span className="text-xs font-bold text-ink-soft">{meta.help}</span>
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
  const human = !p.isBot;

  return (
    <div className="relative flex size-full flex-col items-center justify-between p-2 sm:p-4">
      <div className="flex w-full items-start justify-between gap-1.5">
        <span className="flex min-w-0 items-center gap-1 rounded-full border-2 border-ink bg-paper py-0.5 pl-0.5 pr-2 pop-shadow-sm">
          <Pawn color={p.color} className="size-6 sm:size-8" />
          <span className="truncate font-display text-sm leading-none sm:text-lg">{p.name}</span>
        </span>
        <DiskartePips p={p} />
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="rounded-md border-2 border-ink bg-paper px-2 font-display text-xs tracking-wide sm:text-sm">
          {p.track === 'fast' ? 'FAST TRACK' : `${MONTHS[p.month % 12].toUpperCase()} · YEAR ${Math.floor(p.month / 12) + 1}`}
        </span>
        <div className="flex gap-3 py-2 sm:gap-4">
          {dice.values.map((v, i) => <Dice key={i} value={v} rollId={dice.rollId} rolling={dice.rolling} size={dice.values.length > 2 ? 'sm' : 'md'} />)}
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-1">
        {human && pend?.kind === 'roll' && !busy && (
          <button
            type="button"
            onClick={() => dispatch({ type: 'ROLL' })}
            className="press pop-shadow w-full max-w-52 animate-breathe rounded-2xl border-[3px] border-ink bg-mustard py-2 font-display text-3xl tracking-wide text-white text-stroke-sm sm:py-3 sm:text-4xl"
          >
            ROLL!
          </button>
        )}
        {human && pend?.kind === 'move' && !busy && (
          <>
            <span className="rounded-md bg-paper/90 px-1.5 text-[10px] font-extrabold sm:text-xs">Use 1 Diskarte to change your move?</span>
            <div className="flex w-full gap-1">
              {pend.total > 1 && <MoveChoice label="−1" space={landingPreview(game, p, pend.total - 1)} onClick={() => dispatch({ type: 'ADJUST', delta: -1 })} />}
              <MoveChoice main label={`GO ${pend.total}`} space={landingPreview(game, p, pend.total)} onClick={() => dispatch({ type: 'GO' })} />
              <MoveChoice label="+1" space={landingPreview(game, p, pend.total + 1)} onClick={() => dispatch({ type: 'ADJUST', delta: 1 })} />
            </div>
            <button type="button" onClick={() => dispatch({ type: 'REROLL' })} className="press pop-shadow-sm rounded-lg border-2 border-ink bg-paper px-3 py-1 font-display text-xs sm:text-sm">
              Reroll
            </button>
          </>
        )}
        {p.isBot && <span className="animate-pulse rounded-md bg-paper/90 px-2 font-display text-sm">{p.name} is thinking...</span>}
      </div>

      {inspect !== null && inspect !== undefined && <InspectBubble index={inspect} track={track} onClose={onCloseInspect} />}
    </div>
  );
}
