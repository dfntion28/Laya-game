import { choiceSummary, isChoiceAffordable } from '../data/lessons.js';

// Option list for Gastos cards that offer a real-life decision.
export default function GastosChoices({ card, player, onChoose }) {
  const affordable = card.choices.map(c => isChoiceAffordable(c, player));
  // If nothing is affordable, let any option through (cash goes negative, as before)
  const anyAffordable = affordable.some(Boolean);

  return (
    <div className="flex flex-col gap-1">
      <p className="text-[9px] font-bold uppercase tracking-[1px] text-[#4a7a4a]">
        Ano ang gagawin mo?
      </p>
      {card.choices.map((choice, i) => {
        const enabled = affordable[i] || !anyAffordable;
        return (
          <button
            key={choice.id}
            disabled={!enabled}
            onClick={() => onChoose(choice)}
            className="text-left rounded-md border border-[#3a2a1a] bg-[#140c08] px-2 py-1.5 hover:border-[#c9a227] hover:bg-[#1f160a] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <p className="text-[11px] font-bold leading-tight text-[#f5e6c8] font-[family-name:var(--font-display)]">
              {choice.label}
            </p>
            <p className="text-[9px] leading-[1.4] text-[#b89a7a]">
              {choiceSummary(choice)}{!enabled ? ' · kulang ang cash' : ''}
            </p>
          </button>
        );
      })}
    </div>
  );
}
