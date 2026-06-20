const SPACE_BG = {
  sahod_day:          '#14532d',
  maliit_deal:        '#78350f',
  malaking_deal:      '#713f12',
  gastos:             '#7f1d1d',
  bir_audit:          '#450a0a',
  bangko:             '#1e3a5f',
  koneksyon:          '#3b1f6e',
  pangyayari_merkado: '#164e63',
  pangyayari_buhay:   '#1a3a2a',
  win_check:          '#1a2e10',
};

const SPACE_ICON = {
  sahod_day:          '💰',
  maliit_deal:        '🏠',
  malaking_deal:      '🏗️',
  gastos:             '💸',
  bir_audit:          '🧾',
  bangko:             '🏦',
  koneksyon:          '🤝',
  pangyayari_merkado: '📊',
  pangyayari_buhay:   '👨‍👩‍👧',
  win_check:          '🏆',
};

export default function SpaceCell({ space, players = [], isAnimating = false, isLanded = false }) {
  const onSpace = players.filter(p => p.position === space.id);
  const bg = SPACE_BG[space.type] ?? '#081408';

  let overlayStyle = {};
  if (isAnimating) {
    overlayStyle = { boxShadow: 'inset 0 0 0 3px var(--color-gold), 0 0 14px rgba(201,162,39,0.45)' };
  } else if (isLanded) {
    overlayStyle = { animation: 'spaceBlink 900ms ease-in-out infinite', position: 'relative', zIndex: 1 };
  }

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full h-full"
      style={{ background: bg, gap: '3px', padding: '4px 2px', ...overlayStyle }}
    >
      <span style={{ fontSize: '18px', lineHeight: 1 }}>
        {SPACE_ICON[space.type] ?? '❓'}
      </span>
      <span
        className="text-center uppercase break-words w-full"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '10px',
          color: 'rgba(255,255,255,0.95)',
          lineHeight: 1.2,
          textAlign: 'center',
          padding: '0 2px',
        }}
      >
        {space.name}
      </span>

      {/* Player tokens */}
      {onSpace.length > 0 && (
        <div
          className="absolute flex flex-row"
          style={{ bottom: '4px', right: '4px', gap: '2px' }}
        >
          {onSpace.map(p => {
            const playerIdx = players.findIndex(pl => pl.id === p.id);
            const tokenSize = onSpace.length > 2 ? 14 : 18;
            return (
              <div
                key={p.id}
                className="rounded-full flex items-center justify-center"
                style={{
                  width: tokenSize,
                  height: tokenSize,
                  background: playerIdx >= 0 ? `var(--player-${playerIdx})` : '#888',
                  border: '1.5px solid white',
                  fontSize: '6px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-body)',
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                {p.name.slice(0, 2).toUpperCase()}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
