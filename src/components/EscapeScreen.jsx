import { useMemo } from 'react';
import { useGameStore, computePassiveIncome, computeLoanPayments, computeNetWorth } from '../store/gameStore.js';

const CONFETTI_COLORS = [
  'bg-yellow-400', 'bg-blue-400', 'bg-red-400',
  'bg-green-400',  'bg-pink-400', 'bg-purple-400', 'bg-orange-400',
];

const PROFESSION_EMOJI = {
  engineer: '🔧', bpo: '🎧', nurse: '🏥', government: '🏛️',
  business_owner: '🏪', ofw: '✈️', teacher: '📚',
};

const php = n =>
  (n ?? 0).toLocaleString('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });

// Deterministic confetti — no Math.random() in render
const PIECES = Array.from({ length: 60 }).map((_, i) => ({
  id: i,
  left: `${(i * 7.3 + 1.5) % 99}%`,
  delay: `${(i * 0.11) % 2.8}s`,
  duration: `${2.2 + (i % 9) * 0.25}s`,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: i % 3 === 0 ? 'w-3 h-3' : i % 3 === 1 ? 'w-2 h-4' : 'w-1.5 h-2',
  rotate: `${(i * 37) % 360}deg`,
}));

export default function EscapeScreen({ player, onContinue }) {
  const marketCycle = useGameStore(s => s.marketCycle);
  const round       = useGameStore(s => s.round);

  const passiveIncome = useMemo(() => computePassiveIncome(player.assets), [player]);
  const loanPayments  = useMemo(() => computeLoanPayments(player.liabilities), [player]);
  const netWorth      = useMemo(() => computeNetWorth(player), [player]);
  const totalExpenses = player.monthlyExpenses + player.familyExpenses + loanPayments;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 overflow-hidden">

      {/* Confetti */}
      {PIECES.map(p => (
        <div
          key={p.id}
          className={`confetti-piece ${p.color} ${p.size} rounded-sm`}
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `rotate(${p.rotate})`,
          }}
        />
      ))}

      {/* Card */}
      <div className="relative z-10 bg-slate-900 border-2 border-emerald-500 rounded-3xl shadow-2xl shadow-emerald-900/50 p-8 flex flex-col items-center gap-6 max-w-md w-full mx-4">

        {/* Emoji burst */}
        <div className="text-6xl animate-bounce">🎉</div>

        {/* Headline */}
        <div className="text-center">
          <p className="text-emerald-400 font-mono text-xs uppercase tracking-widest mb-1">
            Rat Race Escape — Round {round}
          </p>
          <h1 className="text-white font-black text-2xl leading-tight">
            NAKATAKAS NA SI
          </h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-4xl">{PROFESSION_EMOJI[player.professionId] ?? '🧑'}</span>
            <h2 className="text-emerald-400 font-black text-3xl">{player.name}!</h2>
          </div>
        </div>

        {/* Stat snapshot */}
        <div className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex flex-col gap-2 font-mono text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Passive Income</span>
            <span className="text-emerald-400 font-bold">{php(passiveIncome)}/month</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total Expenses</span>
            <span className="text-red-400 font-bold">{php(totalExpenses)}/month</span>
          </div>
          <div className="flex justify-between border-t border-slate-700 pt-2 mt-1">
            <span className="text-slate-300 font-bold">Net Worth</span>
            <span className="text-white font-bold">{php(netWorth)}</span>
          </div>
        </div>

        <p className="text-slate-400 font-mono text-xs text-center leading-relaxed">
          Ang passive income mo ay mas malaki na kaysa sa lahat ng gastusin at bayad-utang.<br/>
          Ngayon, tuloy sa <span className="text-yellow-400 font-bold">Freedom Track!</span>
        </p>

        <button
          onClick={onContinue}
          className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-base transition-all"
        >
          Continue to Freedom Track 🚀
        </button>

      </div>
    </div>
  );
}
