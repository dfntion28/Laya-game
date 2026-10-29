import { useGame } from '../store/gameStore.js';
import { useUi } from '../store/uiStore.js';
import { spaceTypes, ratRace, fastTrack } from '../data/board.js';
import { ftDeals } from '../data/cards.js';
import { landingPreview, fmt } from '../engine/engine.js';
import { spaceTone } from '../lib/theme.js';
import Dice from './Dice.jsx';
import Icon from './Icon.jsx';
import { useNet, useControls } from '../store/netStore.js';
import { actorOf } from '../engine/engine.js';

function DiskartePips({ p }) {
  return (
    <span className="flex items-center gap-1" title="Diskarte: spend one to move ±1 or reroll">
      <span className="text-[11px] font-extrabold uppercase tracking-wide text-ink-soft">Diskarte left</span>
      {Array.from({ length: Math.max(p.diskarteMax, p.diskarte) }, (_, i) => (
        <span key={i} className={`size-2.5 rounded-full border-2 border-ink ${i < p.diskarte ? 'bg-mustard' : 'bg-white'}`} />
      ))}
    </span>
  );
}

function MoveChoice({ label, space, onClick }) {
  const meta = spaceTypes[space];
  return (
    <button
      type="button"
      onClick={onClick}
      className="press pop-shadow-sm flex min-h-11 flex-1 flex-col items-center justify-center rounded-xl border-[2.5px] border-ink bg-paper px-1 py-1 leading-none"
    >
      <span className="font-display text-xs sm:text-base">{label}</span>
      <span className="mt-0.5 flex items-center gap-0.5 text-[9px] font-extrabold uppercase sm:text-[11px]">
        <span className={`grid size-4 place-items-center rounded border border-ink sm:size-5 ${spaceTone[meta.tone]}`}><Icon name={meta.icon} className="size-3 sm:size-4" /></span>
        {meta.label}
      </span>
    </button>
  );
}

// Shown once the pawn has landed on the rolled space.
function Landed({ space, children }) {
  const meta = spaceTypes[space];
  return (
    <div className="flex animate-land-in flex-col items-center gap-0.5">
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-ink-soft sm:text-xs">You landed on</span>
      <span className="flex items-center gap-1.5">
        <span className={`grid size-8 place-items-center rounded-lg border-[2.5px] border-ink sm:size-10 ${spaceTone[meta.tone]}`}><Icon name={meta.icon} className="size-6 sm:size-8" /></span>
        <span className="font-display text-2xl leading-none sm:text-3xl">{meta.label}</span>
      </span>
      {children}
    </div>
  );
}

function InspectBubble({ index, track, onClose }) {
  const game = useGame(s => s.shown ?? s.game);
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
  const game = useGame(s => s.shown ?? s.game);
  const dispatch = useGame(s => s.dispatch);
  const dice = useUi(s => s.dice);
  const busy = useUi(s => s.busyCount > 0);
  const canAct = useControls(game);
  const online = useNet(s => s.mode !== 'local');
  const p = game.players[game.current];
  const pend = game.pending;
  const human = canAct(p.id);
  const mine = online ? human : !p.isBot && p.name === 'You';
  const waitingOn = actorOf(game);
  const deciding = pend?.kind === 'move' && !busy;
  const go = steps => landingPreview(game, p, steps);

  return (
    <div className="relative flex size-full flex-col items-center justify-center gap-2 p-2 sm:gap-4 sm:p-4">
      {game.players.length > 1 && (
        <div className="font-display text-base leading-none sm:text-2xl">{mine ? 'Your turn' : `${p.name}'s turn`}</div>
      )}

      {!deciding && (
        <div className="flex gap-3 sm:gap-4">
          {dice.values.map((v, i) => <Dice key={i} value={v} rollId={dice.rollId} rolling={dice.rolling} size={dice.values.length > 2 ? 'sm' : 'md'} />)}
        </div>
      )}

      {human && pend?.kind === 'roll' && !busy && (
        <button
          type="button"
          onClick={() => dispatch({ type: 'ROLL' })}
          className="press pop-shadow w-full max-w-48 animate-breathe rounded-2xl border-[3px] border-ink bg-mustard py-2 font-display text-3xl tracking-wide text-white text-stroke-sm sm:py-3 sm:text-4xl"
        >
          ROLL!
        </button>
      )}

      {deciding && (
        <Landed space={go(pend.total)}>
          {human ? (
            <div className="mt-1.5 flex w-full max-w-72 flex-col items-center gap-1.5">
              <button type="button" onClick={() => dispatch({ type: 'GO' })} className="press pop-shadow w-full rounded-xl border-[3px] border-ink bg-mustard py-1.5 font-display text-xl sm:py-2 sm:text-2xl">
                Stay here
              </button>
              <span className="flex items-center gap-1.5 pt-0.5"><DiskartePips p={p} /></span>
              <div className="flex w-full gap-1">
                {pend.total > 1 && <MoveChoice label="Back 1" space={go(pend.total - 1)} onClick={() => dispatch({ type: 'ADJUST', delta: -1 })} />}
                <MoveChoice label="Forward 1" space={go(pend.total + 1)} onClick={() => dispatch({ type: 'ADJUST', delta: 1 })} />
              </div>
              <button type="button" onClick={() => dispatch({ type: 'REROLL' })} className="press pop-shadow-sm rounded-lg border-2 border-ink bg-paper px-3 py-0.5 font-display text-xs sm:text-sm">
                Reroll from start
              </button>
            </div>
          ) : (
            <span className="animate-pulse font-display text-sm">{p.isBot ? 'thinking...' : `Waiting for ${p.name}`}</span>
          )}
        </Landed>
      )}

      {!deciding && p.diskarte > 0 && pend?.kind === 'roll' && <DiskartePips p={p} />}
      {!deciding && !busy && pend && !canAct(waitingOn.id) && (pend.kind !== 'roll' || !waitingOn.isBot) && (
        <span className="animate-pulse font-display text-sm">{waitingOn.isBot ? 'thinking...' : `Waiting for ${waitingOn.name}`}</span>
      )}

      {inspect !== null && inspect !== undefined && <InspectBubble index={inspect} track={track} onClose={onCloseInspect} />}
    </div>
  );
}
