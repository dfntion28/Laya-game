import { LESSON_CONCEPTS, peso } from '../data/lessons.js';

function Delta({ label, before, after, money = true, suffix = '', invert = false }) {
  const diff = after - before;
  if (Math.round(diff) === 0) return null;
  const good = invert ? diff < 0 : diff > 0;
  const fmt = v => (money ? `${v < 0 ? '−' : ''}${peso(v)}` : `${Math.round(v)}`) + suffix;
  return (
    <div className="flex justify-between gap-2 text-[10px]">
      <span className="text-[#5a8a6a]">{label}</span>
      <span className="font-bold font-[family-name:var(--font-display)]">
        <span className="text-[#5a7a9a]">{fmt(before)} → </span>
        <span className={good ? 'text-[#4ade80]' : 'text-[#f87171]'}>{fmt(after)}</span>
      </span>
    </div>
  );
}

// "Ano ang Nangyari?" — shown after every decision so the player sees exactly
// what moved on their financial statement and why.
export default function DebriefPanel({ debrief, onClose }) {
  const { title, before, after, points, concept, isNewConcept, cardLesson, talinoGained, tip } = debrief;
  const conceptData = concept ? LESSON_CONCEPTS[concept] : null;
  const changed = before && after && ['cash', 'cashFlow', 'passive', 'gap', 'escapePct']
    .some(k => Math.round(after[k]) !== Math.round(before[k]));

  return (
    <div className="flex flex-col gap-1.5 animate-[cardFlipIn_0.32s_ease-out_forwards]">
      <span className="self-start rounded-full border border-[#2d5a2d] bg-[#0d2e10] px-2 py-0.5 text-[9px] font-bold uppercase text-[#4ade80] font-[family-name:var(--font-display)]">
        Ano ang Nangyari?
      </span>
      <h3 className="text-[14px] font-extrabold leading-tight text-[#f5e6c8] font-[family-name:var(--font-display)]">
        {title}
      </h3>

      {changed && (
        <div className="rounded-md border border-[#1a3a1a] bg-[#050d08] px-2 py-1 flex flex-col gap-0.5">
          <Delta label="Cash" before={before.cash} after={after.cash} />
          <Delta label={`Buwanang cash flow${after.estimated ? ' (≈)' : ''}`} before={before.cashFlow} after={after.cashFlow} />
          <Delta label="Passive income" before={before.passive} after={after.passive} />
          <Delta label="Layo sa kalayaan/buwan" before={before.gap} after={after.gap} invert />
          <Delta label="Rat Race progress" before={before.escapePct} after={after.escapePct} money={false} suffix="%" />
        </div>
      )}

      {points.map(p => (
        <p key={p} className="text-[10px] leading-[1.45] text-[#aac8d8]">• {p}</p>
      ))}

      {conceptData && (isNewConcept || cardLesson) && (
        <div className="rounded-md border border-[#1e3a5f] bg-[#0b1626] px-2 py-1">
          <p className="text-[9px] font-bold uppercase tracking-[1px] text-[#60a5fa]">
            📘 {isNewConcept ? 'Bagong Aral sa Kuwaderno' : 'Aral'}: {conceptData.title}
          </p>
          <p className="text-[10px] leading-[1.45] text-[#93c5fd]">{isNewConcept ? conceptData.text : cardLesson}</p>
        </div>
      )}

      {tip && (
        <div className="rounded-md border border-[#5a4a1a] bg-[#1c1608] px-2 py-1">
          <p className="text-[9px] font-bold uppercase tracking-[1px] text-[#c9a227]">💬 Payo</p>
          <p className="text-[10px] leading-[1.45] text-[#e8d8a8]">{tip.text}</p>
        </div>
      )}

      <div className="flex items-center gap-2 mt-0.5">
        {talinoGained > 0 && (
          <span className="text-[10px] font-bold text-[#c9a227]">🧠 +{talinoGained} Talino</span>
        )}
        <button
          onClick={onClose}
          className="ml-auto h-[32px] px-5 rounded-lg bg-[var(--color-gold)] text-[#0a1f0a] text-[13px] font-bold font-[family-name:var(--font-display)] cursor-pointer"
        >
          Sige
        </button>
      </div>
    </div>
  );
}
