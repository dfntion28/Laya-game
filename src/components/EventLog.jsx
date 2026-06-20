import { useGameStore } from '../store/gameStore.js';

// Map player color string (from store) to CSS variable index
const COLOR_TO_IDX = { amber: 0, sky: 1, rose: 2, violet: 3 };

function playerColorVar(colorStr) {
  const idx = COLOR_TO_IDX[colorStr];
  return idx !== undefined ? `var(--player-${idx})` : '#5a7a9a';
}

export default function EventLog() {
  const eventLog = useGameStore(s => s.eventLog);
  const entries  = eventLog.slice(0, 15); // newest first (store prepends)

  return (
    <div
      className="shrink-0 flex flex-col rounded-[6px] overflow-hidden"
      style={{
        height: '100px',
        background: '#050d08',
        border: '1px solid #1a3a1a',
        padding: '8px 12px',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <p
        className="shrink-0 font-bold tracking-[2px] uppercase"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '8px',
          color: '#3a6a3a',
          marginBottom: '5px',
        }}
      >
        Event Log
      </p>

      {/* Entries */}
      <div className="flex flex-col">
        {entries.length === 0 ? (
          <span className="text-[10px]" style={{ color: '#2a4a2a' }}>
            Walang events pa.
          </span>
        ) : (
          entries.map(entry => {
            const colorVar = entry.playerColor
              ? playerColorVar(entry.playerColor)
              : '#3a6a3a';
            return (
              <div
                key={entry.id}
                className="flex items-start"
                style={{ gap: '7px', padding: '3px 0', borderBottom: '1px solid #0a1f0a' }}
              >
                {/* Color strip */}
                <div
                  className="shrink-0"
                  style={{
                    width: '2px',
                    alignSelf: 'stretch',
                    background: colorVar,
                    borderRadius: '1px',
                  }}
                />
                {/* Round badge */}
                <span
                  className="shrink-0 font-bold"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '9px',
                    color: '#3a6a3a',
                    minWidth: '26px',
                  }}
                >
                  R{entry.round}
                </span>
                {/* Player name */}
                {entry.playerName && (
                  <span
                    className="shrink-0 whitespace-nowrap font-bold"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '9px',
                      color: colorVar,
                    }}
                  >
                    {entry.playerName}
                  </span>
                )}
                {/* Message */}
                <span
                  className="flex-1 min-w-0"
                  style={{
                    fontSize: '10px',
                    color: '#aac8d8',
                    lineHeight: 1.4,
                  }}
                >
                  {entry.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
