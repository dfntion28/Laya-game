import { useGameStore, computePassiveIncome, computeNetWorth } from '../store/gameStore.js';

const PROFESSION_EMOJI = {
  engineer: '🔧', bpo: '🎧', nurse: '🏥', government: '🏛️',
  business_owner: '🏪', ofw: '✈️', teacher: '📚',
};

const php = n =>
  (n ?? 0).toLocaleString('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });

export default function WinScreen() {
  const winner    = useGameStore(s => s.winner);
  const players   = useGameStore(s => s.players);
  const round     = useGameStore(s => s.round);
  const resetGame = useGameStore(s => s.resetGame);

  const player = players.find(p => p.id === winner);
  if (!player) return null;

  const passiveIncome = computePassiveIncome(player.assets);
  const netWorth      = computeNetWorth(player);
  const wonByNetWorth = netWorth >= 10_000_000;

  const topAsset = [...player.assets].sort((a, b) => (b.monthlyIncome || 0) - (a.monthlyIncome || 0))[0];
  const netWorthGain = netWorth - (player.startingNetWorth ?? 0);

  return (
    <div className="fixed inset-0 z-60 flex flex-col items-center justify-center bg-[#0a0a14] overflow-hidden">

      {/* Starfield effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-yellow-400 animate-ping"
            style={{
              left: `${(i * 11.7 + 5) % 95}%`,
              top:  `${(i * 13.3 + 3) % 90}%`,
              animationDelay: `${(i * 0.2) % 3}s`,
              animationDuration: `${1.5 + (i % 4) * 0.5}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      {/* Trophy card */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-md w-full mx-4">

        <div className="text-8xl">🏆</div>

        <div>
          <p className="text-yellow-400 font-mono text-sm uppercase tracking-widest mb-2">
            LAYA na ang {player.name}!
          </p>
          <h1 className="text-white font-black text-4xl leading-tight">
            {PROFESSION_EMOJI[player.professionId] ?? '🧑'} {player.name}
          </h1>
          <p className="text-yellow-300 font-mono text-lg font-bold mt-1">
            {wonByNetWorth ? 'Net Worth Champion!' : 'Passive Income Master!'}
          </p>
        </div>

        {/* Final stats */}
        <div className="w-full bg-slate-900/80 border border-yellow-700/40 rounded-2xl p-5 flex flex-col gap-3 font-mono">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Final Net Worth</span>
            <span className="text-yellow-400 font-black text-base">{php(netWorth)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Monthly Passive Income</span>
            <span className="text-emerald-400 font-bold">{php(passiveIncome)}/buwan</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Cash on Hand</span>
            <span className="text-slate-200 font-bold">{php(player.cash)}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-slate-700 pt-2">
            <span className="text-slate-500">Total Rounds Played</span>
            <span className="text-slate-400 font-bold">{round}</span>
          </div>
        </div>

        {/* Leaderboard */}
        {players.length > 1 && (
          <div className="w-full">
            <p className="text-slate-500 font-mono text-xs uppercase tracking-wider mb-2">Final Standings</p>
            <div className="flex flex-col gap-1.5">
              {[...players]
                .sort((a, b) => computeNetWorth(b) - computeNetWorth(a))
                .map((p, i) => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg font-mono text-sm ${
                      p.id === winner
                        ? 'bg-yellow-900/40 border border-yellow-700/50 text-yellow-200'
                        : 'bg-slate-800/50 text-slate-400'
                    }`}
                  >
                    <span className="w-5 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`}</span>
                    <span>{PROFESSION_EMOJI[p.professionId] ?? '🧑'}</span>
                    <span className="flex-1">{p.name}</span>
                    <span>{php(computeNetWorth(p))}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Financial Journey summary */}
        <div className="w-full bg-slate-900/80 border border-slate-700/60 rounded-2xl p-4 font-mono">
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">Ang Iyong Financial Journey</p>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Bilang ng Rounds</span>
              <span className="text-white font-bold">{round} rounds</span>
            </div>
            {topAsset && (
              <div className="flex justify-between">
                <span className="text-slate-400">Top Income Asset</span>
                <span className="text-emerald-400 font-bold text-right max-w-[60%] truncate">{topAsset.name.split(' (')[0]}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Total Loan Payments</span>
              <span className="text-red-400 font-bold">{php(player.totalLoanPaymentsTracker ?? 0)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-700 pt-2">
              <span className="text-slate-400">Net Worth Growth</span>
              <span className={`font-bold ${netWorthGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {netWorthGain >= 0 ? '+' : ''}{php(netWorthGain)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={resetGame}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-black text-lg transition-all shadow-xl shadow-blue-900/40"
        >
          🔄 Maglaro Ulit
        </button>

      </div>
    </div>
  );
}
