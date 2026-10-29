import { useState } from 'react';
import { useGame } from '../store/gameStore.js';
import { useUi } from '../store/uiStore.js';
import { ratRace, fastTrack, cellGrid, spaceTypes } from '../data/board.js';
import { ftDeals } from '../data/cards.js';
import { dreamById } from '../engine/engine.js';
import { spaceTone, playerTone } from '../lib/theme.js';
import { fmtShort } from '../lib/format.js';
import Icon from './Icon.jsx';
import Pawn from './Pawn.jsx';
import BoardCenter from './BoardCenter.jsx';

// Token layer coordinates: each board cell is 1/7 of the inner board.
const LEFT = ['left-[0%]', 'left-[14.2857%]', 'left-[28.5714%]', 'left-[42.8571%]', 'left-[57.1429%]', 'left-[71.4286%]', 'left-[85.7143%]'];
const TOP = ['top-[0%]', 'top-[14.2857%]', 'top-[28.5714%]', 'top-[42.8571%]', 'top-[57.1429%]', 'top-[71.4286%]', 'top-[85.7143%]'];
const XY = cellGrid.map(c => {
  const [, col, row] = c.match(/col-start-(\d) row-start-(\d)/);
  return `${LEFT[col - 1]} ${TOP[row - 1]}`;
});
// When several pawns share a cell, fan them out.
const FAN = ['', '-translate-x-[28%] -translate-y-[12%]', 'translate-x-[28%] -translate-y-[12%]', 'translate-y-[18%]'];

function Cell({ index, type, track, owner, dreamers, onTap }) {
  const meta = spaceTypes[type];
  const corner = index % 6 === 0;
  const deal = track === 'fast' ? ftDeals[index] : null;
  return (
    <button
      type="button"
      onClick={() => onTap(index)}
      className={`relative flex flex-col items-center justify-center overflow-hidden rounded-lg border-[2.5px] border-ink p-0.5 text-center shadow-[inset_0_-4px_0_rgb(0_0_0/0.18),inset_0_3px_0_rgb(255_255_255/0.35)] ${cellGrid[index]} ${spaceTone[meta.tone]}`}
    >
      <Icon name={meta.icon} className={corner ? 'size-[62%]' : 'size-[52%]'} />
      <span className="mt-px w-full truncate font-display text-[8px] leading-none tracking-wide text-white text-stroke-sm sm:text-xs">
        {deal ? fmtShort(deal.cost) : meta.label}
      </span>
      {owner && <span className={`absolute right-0.5 top-0.5 size-2.5 rounded-full border-2 border-ink sm:size-3.5 ${playerTone[owner.color].bg}`} />}
      {dreamers.length > 0 && (
        <span className="absolute left-0.5 top-0 text-[10px] leading-none sm:text-sm">{dreamers.map(d => dreamById[d.dreamId].emoji).join('')}</span>
      )}
    </button>
  );
}

function Tokens({ players, anim, current }) {
  const groups = {};
  const placed = players.map(p => {
    const pos = anim?.pid === p.id ? anim.path[anim.step] : p.position;
    groups[pos] = (groups[pos] ?? 0) + 1;
    return { p, pos, slot: groups[pos] - 1 };
  });
  return (
    <div className="pointer-events-none absolute inset-[5px] sm:inset-2">
      {placed.map(({ p, pos, slot }) => {
        const moving = anim?.pid === p.id;
        return (
          <div
            key={p.id}
            className={`absolute flex h-[14.2857%] w-[14.2857%] items-center justify-center transition-[left,top] duration-[380ms] ease-[cubic-bezier(0.4,0,0.3,1)] ${XY[pos]} ${moving ? 'z-30' : p.id === current ? 'z-20' : 'z-10'}`}
          >
            <div className={`h-[86%] w-[86%] ${FAN[slot % FAN.length]}`}>
              <div key={moving ? `${p.id}-${pos}` : p.id} className={`size-full ${moving ? 'animate-hop' : p.id === current ? 'animate-bob' : ''}`}>
                <Pawn color={p.color} className="size-full drop-shadow-[0_2px_0_rgb(31_22_51/0.35)]" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
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
  const tap = i => setInspect(prev => (prev === i ? null : i));

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[620px] animate-drop-in">
      <div className="relative size-full rounded-[22px] border-[4px] border-ink bg-wood p-[5px] shadow-[0_8px_0_#1f1633] sm:p-2">
        <div className="grid size-full grid-cols-7 grid-rows-7 gap-[3px] sm:gap-1">
          {spaces.map((type, i) => (
            <Cell
              key={`${track}-${i}`}
              index={i}
              type={type}
              track={track}
              owner={track === 'fast' && game.ftOwned[i] ? game.players.find(p => p.id === game.ftOwned[i]) : null}
              dreamers={track === 'fast' && type === 'pangarap' ? game.players.filter(p => p.dreamSpace === i) : []}
              onTap={tap}
            />
          ))}
          <div className="tablecloth col-start-2 col-end-7 row-start-2 row-end-7 overflow-hidden rounded-xl border-[3px] border-ink shadow-[inset_0_4px_0_rgb(0_0_0/0.12)]">
            <BoardCenter inspect={inspect} track={track} onCloseInspect={() => setInspect(null)} />
          </div>
        </div>
        <Tokens players={onTrack} anim={anim} current={current.id} />
      </div>
    </div>
  );
}
