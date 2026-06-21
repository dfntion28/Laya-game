import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore.js';
import { boardSpaces, freedomTrackSpaces } from '../data/boardSpaces.js';
import SpaceCell from './SpaceCell.jsx';
import BoardInterior from './BoardInterior.jsx';

// Board layout — 24 spaces, 6 per side:
// top   (L→R): spaces 0–5
// right (T→B): spaces 6–11
// bottom (R→L visual): 17,16,15,14,13,12
// left  (T→B visual): 23,22,21,20,19,18
const topRow    = boardSpaces.slice(0, 6);
const rightCol  = boardSpaces.slice(6, 12);
const bottomRow = [...boardSpaces.slice(12, 18)].reverse();
const leftCol   = [...boardSpaces.slice(18, 24)].reverse();

const FREEDOM_CFG = {
  malaking_deal:      { bg: '#0d2e10', border: '#2d5a2d', color: '#4ade80' },
  sahod_day:          { bg: '#2e2510', border: '#5a4a1a', color: '#f59e0b' },
  pangyayari_merkado: { bg: '#1a0d2e', border: '#3a1a5a', color: '#c084fc' },
  gastos:             { bg: '#2e0d0d', border: '#5a1a1a', color: '#f87171' },
  bangko:             { bg: '#0d1b2e', border: '#1a3a5a', color: '#60a5fa' },
  koneksyon:          { bg: '#1a0a2e', border: '#3a1a5a', color: '#e879f9' },
  win_check:          { bg: '#1a2e10', border: '#3a5a2d', color: '#86efac' },
};

function FreedomSpaceCell({ space, players }) {
  const cfg = FREEDOM_CFG[space.type] ?? { bg: '#0d1b2e', border: '#2d4a6a', color: '#8aabcb' };
  const tokens = players.filter(p => p.freedomPosition === space.id);
  return (
    <div
      className="flex-1 min-w-0 flex flex-col items-center justify-between rounded p-1"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        minWidth: 40,
      }}
    >
      <span
        className="text-center leading-tight w-full"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '8px',
          color: cfg.color,
          fontWeight: 700,
        }}
      >
        {space.name}
      </span>
      <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
        {tokens.map(p => {
          const idx = players.indexOf(p);
          return (
            <div
              key={p.id}
              className="w-3 h-3 rounded-full"
              style={{ background: `var(--player-${idx})`, border: '1px solid rgba(255,255,255,0.3)' }}
              title={p.name}
            />
          );
        })}
      </div>
    </div>
  );
}

const INTER_SPACE = '1px solid rgba(201,162,39,0.35)';

export default function Board({ selectedPlayerId, onSelectPlayer }) {
  const players            = useGameStore(s => s.players);
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
  const animatingToken     = useGameStore(s => s.animatingToken);
  const playerJustLanded   = useGameStore(s => s.playerJustLanded);
  const advanceAnimPos     = useGameStore(s => s.advanceAnimPos);
  const endTokenAnimation  = useGameStore(s => s.endTokenAnimation);
  const escapedPlayers     = players.filter(p => p.hasEscapedRatRace);
  const currentPlayer      = players[currentPlayerIndex] ?? null;

  // During animation, show the animating player's token at currentPos instead of final position
  const displayPlayers = players.map(p =>
    animatingToken.active &&
    animatingToken.currentPos !== null &&
    p.id === animatingToken.playerId
      ? { ...p, position: animatingToken.currentPos }
      : p
  );

  // Drive the token glow animation one step at a time
  useEffect(() => {
    if (!animatingToken.active) return;
    if (animatingToken.currentPos === animatingToken.targetPos) {
      endTokenAnimation();
      return;
    }
    const t = setTimeout(advanceAnimPos, 340);
    return () => clearTimeout(t);
  }, [animatingToken.active, animatingToken.currentPos, animatingToken.targetPos]);

  const isAnim   = (id) => animatingToken.active && animatingToken.currentPos === id;
  const isLanded = (id) => playerJustLanded && !animatingToken.active && currentPlayer?.position === id;

  return (
    <div
      className="flex flex-col w-full h-full rounded-[8px] overflow-hidden"
      style={{
        border: '3px solid var(--color-gold)',
        boxShadow: '0 0 28px rgba(201,162,39,0.18), inset 0 0 40px rgba(0,0,0,0.4)',
        background: '#081408',
      }}
    >
      {/* ── Main board grid ── */}
      <div
        className="flex-1 min-h-0"
        style={{
          display: 'grid',
          gridTemplateColumns: '80px 1fr 80px',
          gridTemplateRows: '72px 1fr 64px',
        }}
      >
        {/* Top row — spans all cols */}
        <div
          className="flex"
          style={{ gridColumn: '1 / -1', gridRow: '1', borderBottom: '2px solid var(--color-gold)' }}
        >
          {topRow.map((s, i) => (
            <div
              key={s.id}
              className="flex-1 h-full"
              style={{ borderRight: i < topRow.length - 1 ? INTER_SPACE : undefined }}
            >
              <SpaceCell space={s} players={displayPlayers} isAnimating={isAnim(s.id)} isLanded={isLanded(s.id)} />
            </div>
          ))}
        </div>

        {/* Left col */}
        <div
          className="flex flex-col"
          style={{ gridColumn: '1', gridRow: '2', borderRight: '2px solid var(--color-gold)' }}
        >
          {leftCol.map((s, i) => (
            <div
              key={s.id}
              className="flex-1 w-full"
              style={{ borderBottom: i < leftCol.length - 1 ? INTER_SPACE : undefined }}
            >
              <SpaceCell space={s} players={displayPlayers} isAnimating={isAnim(s.id)} isLanded={isLanded(s.id)} />
            </div>
          ))}
        </div>

        {/* Center — BoardInterior */}
        <div style={{ gridColumn: '2', gridRow: '2' }}>
          <BoardInterior
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={onSelectPlayer}
          />
        </div>

        {/* Right col */}
        <div
          className="flex flex-col"
          style={{ gridColumn: '3', gridRow: '2', borderLeft: '2px solid var(--color-gold)' }}
        >
          {rightCol.map((s, i) => (
            <div
              key={s.id}
              className="flex-1 w-full"
              style={{ borderBottom: i < rightCol.length - 1 ? INTER_SPACE : undefined }}
            >
              <SpaceCell space={s} players={displayPlayers} isAnimating={isAnim(s.id)} isLanded={isLanded(s.id)} />
            </div>
          ))}
        </div>

        {/* Bottom row — spans all cols */}
        <div
          className="flex"
          style={{ gridColumn: '1 / -1', gridRow: '3', borderTop: '2px solid var(--color-gold)' }}
        >
          {bottomRow.map((s, i) => (
            <div
              key={s.id}
              className="flex-1 h-full"
              style={{ borderRight: i < bottomRow.length - 1 ? INTER_SPACE : undefined }}
            >
              <SpaceCell space={s} players={displayPlayers} isAnimating={isAnim(s.id)} isLanded={isLanded(s.id)} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Freedom Track (only when players have escaped) ── */}
      {escapedPlayers.length > 0 && (
        <div
          className="shrink-0 px-2 py-1.5"
          style={{ borderTop: '2px solid var(--color-gold)', background: '#050f05' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="font-bold tracking-wider uppercase"
              style={{ fontFamily: 'var(--font-display)', fontSize: '9px', color: '#4ade80' }}
            >
              Freedom Track 🗺️
            </span>
            <span style={{ fontSize: '9px', color: '#2d5a2d' }}>
              {escapedPlayers.map(p => p.name).join(', ')}
            </span>
          </div>
          <div className="flex gap-1">
            {freedomTrackSpaces.map(s => (
              <FreedomSpaceCell key={s.id} space={s} players={escapedPlayers} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
