import { useState } from 'react';
import { useGame } from '../store/gameStore.js';
import { useUi } from '../store/uiStore.js';
import { ratRace, fastTrack, cellGrid, spaceTypes, BOARD_SIZE } from '../data/board.js';
import { ftDeals } from '../data/cards.js';
import { dreamById } from '../engine/engine.js';
import { spaceTone, playerTone } from '../lib/theme.js';
import { fmtShort } from '../lib/format.js';
import BoardCenter from './BoardCenter.jsx';

function Token({ player, moving, pos }) {
  const tone = playerTone[player.color];
  return (
    <span
      key={moving ? `${player.id}-${pos}` : player.id}
      className={`grid size-5 place-items-center rounded-full text-[11px] shadow-md ring-2 ring-white/90 sm:size-7 sm:text-sm ${tone.bg} ${moving ? 'z-20 animate-hop' : ''}`}
    >
      {player.emoji}
    </span>
  );
}

function Cell({ index, type, track, players, anim, highlight, owners, dreamers, onTap }) {
  const meta = spaceTypes[type];
  const corner = index % 6 === 0;
  const deal = track === 'fast' ? ftDeals[index] : null;
  const here = players.filter(p => {
    const pos = anim?.pid === p.id ? anim.path[anim.step] : p.position;
    return pos === index;
  });
  return (
    <button
      type="button"
      onClick={() => onTap(index)}
      className={`relative flex flex-col items-center justify-center overflow-hidden rounded-md p-0.5 text-center shadow-[inset_0_-3px_0_rgb(0_0_0/0.2),inset_0_2px_0_rgb(255_255_255/0.35)] ring-1 ring-black/20 transition sm:rounded-lg ${cellGrid[index]} ${spaceTone[meta.tone]} ${highlight === 'main' ? 'z-10 scale-110 ring-4 ring-white' : highlight === 'alt' ? 'ring-2 ring-white/70' : ''} ${corner ? 'brightness-110' : ''}`}
    >
      <span className={`leading-none ${corner ? 'text-xl sm:text-3xl' : 'text-base sm:text-2xl'}`}>{deal?.emoji ?? meta.emoji}</span>
      <span className="mt-0.5 w-full truncate font-display text-[6.5px] font-semibold uppercase leading-none tracking-tight sm:text-[10px]">
        {deal ? fmtShort(deal.cost) : meta.label}
      </span>
      {owners && (
        <span className={`absolute right-0.5 top-0.5 size-2 rounded-full ring-1 ring-white sm:size-3 ${playerTone[owners.color].bg}`} />
      )}
      {dreamers.length > 0 && (
        <span className="absolute left-0.5 top-0.5 text-[9px] leading-none sm:text-xs">{dreamers.map(d => dreamById[d.dreamId].emoji).join('')}</span>
      )}
      {here.length > 0 && (
        <span className="absolute inset-x-0 bottom-0.5 flex flex-wrap justify-center -space-x-1.5">
          {here.map(p => <Token key={p.id} player={p} moving={anim?.pid === p.id} pos={index} />)}
        </span>
      )}
    </button>
  );
}

export default function Board() {
  const game = useGame(s => s.game);
  const anim = useUi(s => s.anim);
  const [inspect, setInspect] = useState(null);
  const current = game.players[game.current];
  const track = anim?.track ?? current.track;
  const spaces = track === 'fast' ? fastTrack : ratRace;
  const onTrack = game.players.filter(p => p.track === track);
  const pend = game.pending;

  const targets = {};
  if (pend?.kind === 'move' && !anim && !current.isBot && current.track === track) {
    targets[(current.position + pend.total) % BOARD_SIZE] = 'main';
    if (!pend.used && current.diskarte > 0) {
      for (const d of [-1, 1]) {
        if (pend.total + d >= 1) targets[(current.position + pend.total + d) % BOARD_SIZE] ??= 'alt';
      }
    }
  }

  const tap = i => setInspect(prev => (prev === i ? null : i));

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[640px]">
      <div className="grid size-full grid-cols-7 grid-rows-7 gap-[3px] rounded-2xl bg-wood p-[5px] shadow-[0_7px_0_#6e3a17,0_14px_30px_rgb(0_0_0/0.35)] ring-2 ring-[#6e3a17] sm:gap-1 sm:p-2">
        {spaces.map((type, i) => (
          <Cell
            key={`${track}-${i}`}
            index={i}
            type={type}
            track={track}
            players={onTrack}
            anim={anim}
            highlight={targets[i]}
            owners={track === 'fast' && game.ftOwned[i] ? game.players.find(p => p.id === game.ftOwned[i]) : null}
            dreamers={track === 'fast' && type === 'pangarap' ? game.players.filter(p => p.dreamSpace === i) : []}
            onTap={tap}
          />
        ))}
        <div className="col-start-2 col-end-7 row-start-2 row-end-7 overflow-hidden rounded-xl bg-felt shadow-[inset_0_3px_12px_rgb(0_0_0/0.35)] ring-2 ring-[#0f4d37]">
          <BoardCenter inspect={inspect} track={track} onCloseInspect={() => setInspect(null)} />
        </div>
      </div>
    </div>
  );
}
