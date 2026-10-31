import { VERDICT_LABEL, dealQuestions, formatQuizOption, peso } from '../data/lessons.js';

const TONE = {
  good: 'text-[#4ade80] border-[#2d5a2d] bg-[#0d2e10]',
  info: 'text-[#93c5fd] border-[#1e3a5f] bg-[#0d1b2e]',
  warn: 'text-[#f59e0b] border-[#5a4a1a] bg-[#2e2510]',
  bad:  'text-[#f87171] border-[#5a1a1a] bg-[#2e0d0d]',
};

// Pre-decision thinking aid for deal cards. The full analysis is hidden until
// the player answers the quick-math question (or holds a Financial Advisor card),
// so the habit of computing the numbers comes first.
export default function DealInsight({ card, analysis, quiz, quizPick, onPick, hasAdvisor }) {
  const answered = quizPick !== null && quizPick !== undefined;
  const revealed = answered || hasAdvisor || !quiz;
  const verdict  = VERDICT_LABEL[analysis.verdict];

  return (
    <div className="flex flex-col gap-1.5">
      {!revealed && (
        <div className="rounded-md border border-[#1a3a1a] bg-[#0a1f0a] px-2 py-1.5">
          <p className="text-[9px] font-bold uppercase tracking-[1px] text-[#4a7a4a] mb-0.5">Itanong sa sarili</p>
          {dealQuestions(card, analysis).map(q => (
            <p key={q} className="text-[10px] leading-[1.4] text-[#8aabcb]">• {q}</p>
          ))}
        </div>
      )}

      {quiz && !hasAdvisor && (
        <div className="rounded-md border border-[#5a4a1a] bg-[#1c1608] px-2 py-1.5">
          <p className="text-[9px] font-bold uppercase tracking-[1px] text-[#c9a227] mb-0.5">
            🧮 Mabilisang Kuwenta {answered ? '' : '· +1 Talino kung tama'}
          </p>
          <p className="text-[10px] leading-[1.4] text-[#f5e6c8] mb-1">{quiz.prompt}</p>
          <div className="flex gap-1">
            {quiz.options.map(opt => {
              const isAnswer = opt === quiz.answer;
              const isPick   = opt === quizPick;
              const state = !answered
                ? 'border-[#5a4a1a] text-[#f5e6c8] hover:bg-[#2e2510] cursor-pointer'
                : isAnswer
                  ? 'border-[#2d5a2d] bg-[#0d2e10] text-[#4ade80]'
                  : isPick
                    ? 'border-[#5a1a1a] bg-[#2e0d0d] text-[#f87171]'
                    : 'border-[#2a2a1a] text-[#5a5a4a]';
              return (
                <button
                  key={opt}
                  disabled={answered}
                  onClick={() => onPick(opt)}
                  className={`flex-1 rounded border px-1 py-1 text-[10px] font-bold font-[family-name:var(--font-display)] ${state}`}
                >
                  {formatQuizOption(opt, quiz.unit)}
                </button>
              );
            })}
          </div>
          {answered && (
            <p className="text-[9px] leading-[1.4] text-[#b8a878] mt-1">
              {quizPick === quiz.answer ? '✓ Tama! ' : '✗ '}{quiz.explain}
            </p>
          )}
        </div>
      )}

      {revealed && (
        <div className="flex flex-col gap-1">
          {hasAdvisor && (
            <p className="text-[9px] text-[#93c5fd]">🤝 Financial Advisor: buong analysis bago ka magpasya</p>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-[#8aabcb]">
            <span>Cash: <b className="text-[#f5e6c8]">{peso(analysis.cashNeeded)}</b></span>
            <span>Net: <b className={analysis.net > 0 ? 'text-[#4ade80]' : 'text-[#f87171]'}>
              {analysis.net < 0 ? '−' : ''}{peso(analysis.net)}/buwan</b></span>
            {analysis.annualPct !== null && analysis.net > 0 && (
              <span>Balik: <b className="text-[#f5e6c8]">{analysis.annualPct.toFixed(0)}%/taon</b></span>
            )}
            {analysis.payback !== null && (
              <span>Payback: <b className="text-[#f5e6c8]">{analysis.payback} buwan</b></span>
            )}
            {analysis.gapClosedPct > 0 && (
              <span>Isinasara ang <b className="text-[#4ade80]">{analysis.gapClosedPct.toFixed(0)}%</b> ng layo mo sa kalayaan</span>
            )}
          </div>
          {analysis.flags.slice(0, 3).map(f => (
            <p key={f.text} className={`rounded border px-1.5 py-0.5 text-[9px] leading-[1.4] ${TONE[f.level === 'info' ? 'info' : f.level === 'bad' ? 'bad' : 'warn']}`}>
              {f.text}
            </p>
          ))}
          <p className={`self-start rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${TONE[verdict.tone]}`}>
            {verdict.text}
          </p>
        </div>
      )}
    </div>
  );
}
