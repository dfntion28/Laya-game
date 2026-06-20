import { useGameStore } from '../store/gameStore.js';

const php = (n) =>
  (n ?? 0).toLocaleString('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });

export default function PlayerSelector({ selectedId, onSelect }) {
  const players = useGameStore(s => s.players);

  if (players.length === 0) return null;

  const nameSize = players.length >= 4 ? 'text-[11px]' : 'text-[13px]';

  return (
    <div className="flex shrink-0 border-b border-[var(--color-gold)]">
      {players.map((p, idx) => {
        const isActive = p.id === selectedId;
        const profLabel = p.professionId.replace(/_/g, ' ');

        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`flex-1 px-[10px] py-2 cursor-pointer text-left transition-[border-color,background] duration-150 ${
              isActive
                ? 'bg-[var(--color-panel)]'
                : 'bg-[#081420] hover:bg-[#0d1f38]'
            }`}
            style={{
              borderBottom: isActive
                ? '3px solid var(--color-gold)'
                : '3px solid transparent',
            }}
          >
            {/* Line 1: dot + name */}
            <div className="flex items-center gap-[5px]">
              <span
                className="inline-block w-[9px] h-[9px] rounded-full shrink-0"
                style={{ background: `var(--player-${idx})` }}
              />
              <span
                className={`${nameSize} font-bold overflow-hidden text-ellipsis whitespace-nowrap ${
                  isActive ? 'text-[var(--color-gold)]' : 'text-[#8aabcb]'
                }`}
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {p.name}
                {p.hasEscapedRatRace && ' 🏃'}
              </span>
            </div>

            {/* Line 2: profession + cash */}
            <div className="flex items-center gap-[5px] mt-0.5">
              <span
                className="text-[9px] uppercase"
                style={{ color: isActive ? '#3a6a3a' : '#5a7a9a' }}
              >
                {profLabel}
              </span>
              <span className="text-[9px] ml-auto text-[var(--color-green)]">
                {php(p.cash)}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
