import { useEffect, useRef, useState } from 'react';
import { useGameStore } from './store/gameStore.js';
import SetupScreen        from './components/SetupScreen.jsx';
import PlayerSelector     from './components/PlayerSelector.jsx';
import FinancialStatement from './components/FinancialStatement.jsx';
import Board              from './components/Board.jsx';
import BangkoModal        from './components/BangkoModal.jsx';
import EscapeScreen       from './components/EscapeScreen.jsx';
import WinScreen          from './components/WinScreen.jsx';
import EventLog           from './components/EventLog.jsx';

const MARKET_PILL = {
  bear:   { text: '🐻 BEAR MARKET',   bg: '#2e0d0d', border: '#5a2d2d', color: '#ff6b6b' },
  bull:   { text: '📈 BULL MARKET',   bg: '#0d2e10', border: '#2d5a2d', color: '#4ade80' },
  normal: { text: '➡️ NORMAL MARKET', bg: '#1a201a', border: '#2d3d2d', color: '#86efac' },
};

export default function App() {
  const phase              = useGameStore(s => s.phase);
  const players            = useGameStore(s => s.players);
  const winner             = useGameStore(s => s.winner);
  const pendingSpaceAction = useGameStore(s => s.pendingSpaceAction);
  const clearPendingAction = useGameStore(s => s.clearPendingAction);
  const round              = useGameStore(s => s.round);
  const marketCycle        = useGameStore(s => s.marketCycle);
  const inflationCounter   = useGameStore(s => s.inflationCounter);
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);

  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [escapeAlert, setEscapeAlert]           = useState(null);
  const [showHelp, setShowHelp]                 = useState(false);

  const prevEscapedRef = useRef({});

  useEffect(() => {
    if (phase === 'playing' && players.length > 0) {
      setSelectedPlayerId(prev =>
        players.find(p => p.id === prev)?.id ?? players[0].id
      );
    }
    if (phase === 'setup') {
      setSelectedPlayerId(null);
      prevEscapedRef.current = {};
      setEscapeAlert(null);
      setShowHelp(false);
    }
  }, [phase, players]);

  useEffect(() => {
    if (phase !== 'playing') return;
    for (const player of players) {
      if (player.hasEscapedRatRace && !prevEscapedRef.current[player.id]) {
        setEscapeAlert(player);
      }
      prevEscapedRef.current[player.id] = player.hasEscapedRatRace;
    }
  }, [players, phase]);

  const showBangkoModal = pendingSpaceAction?.type === 'bangko';
  const currentPlayer   = players[currentPlayerIndex] ?? null;
  const marketPill      = MARKET_PILL[marketCycle] ?? MARKET_PILL.normal;

  if (phase === 'setup') {
    return <SetupScreen />;
  }

  if (phase === 'ended' && winner) {
    return <WinScreen />;
  }

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[var(--color-felt)]">

      {/* ── Header bar ── */}
      <div
        className="shrink-0 flex items-center gap-[14px] px-4"
        style={{ height: '42px', background: '#081408', borderBottom: '2px solid var(--color-gold)' }}
      >
        {/* Logo */}
        <span
          className="font-black text-[20px] tracking-[3px] text-[var(--color-gold)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          LAYA
        </span>

        {/* Round pill */}
        <span
          className="px-[10px] py-[3px] rounded-xl border text-[10px] font-bold text-[var(--color-gold)]"
          style={{ background: '#2e2510', borderColor: 'var(--color-gold)', fontFamily: 'var(--font-display)' }}
        >
          ROUND {round}
        </span>

        {/* Market cycle pill */}
        <span
          className="px-[10px] py-[3px] rounded-xl border text-[10px] font-bold"
          style={{
            background: marketPill.bg,
            borderColor: marketPill.border,
            color: marketPill.color,
            fontFamily: 'var(--font-display)',
          }}
        >
          {marketPill.text}
        </span>

        {/* Inflation tracker */}
        <div className="flex items-center gap-[6px]">
          <span
            className="text-[8px] tracking-[1px] uppercase"
            style={{ color: '#3a6a3a' }}
          >
            INFLATION
          </span>
          <div className="flex gap-[3px]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: i < inflationCounter ? '#ff8c42' : '#2d3a2d' }}
              />
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Insurance badge (current player) */}
        {currentPlayer?.insuranceActive && (
          <span
            className="px-[10px] py-[3px] rounded-xl border text-[10px] font-bold"
            style={{ background: '#0d2e10', borderColor: '#2d5a2d', color: '#4ade80', fontFamily: 'var(--font-display)' }}
          >
            🛡 Insured
          </span>
        )}

        {/* Help button */}
        <button
          onClick={() => setShowHelp(true)}
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer text-[var(--color-gold)]"
          style={{ background: '#1a2e1a', border: '1px solid var(--color-gold)' }}
        >
          ?
        </button>
      </div>

      {/* ── Main area ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left panel */}
        <div
          className="shrink-0 flex flex-col overflow-hidden"
          style={{ width: '540px', background: 'var(--color-panel)', borderRight: '2px solid var(--color-gold)' }}
        >
          <PlayerSelector selectedId={selectedPlayerId} onSelect={setSelectedPlayerId} />
          <div className="flex-1 overflow-hidden">
            <FinancialStatement playerId={selectedPlayerId} />
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col p-[10px] gap-2 overflow-hidden">
          <div className="flex-1 min-h-0">
            <Board selectedPlayerId={selectedPlayerId} onSelectPlayer={setSelectedPlayerId} />
          </div>
          <EventLog />
        </div>
      </div>

      {/* ── Overlays ── */}
      {showBangkoModal && <BangkoModal onClose={clearPendingAction} />}
      {escapeAlert && !winner && (
        <EscapeScreen player={escapeAlert} onContinue={() => setEscapeAlert(null)} />
      )}

      {/* Help modal */}
      {showHelp && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 sticky top-0 bg-slate-900">
              <h2 className="text-white font-mono font-bold">❓ Quick Reference</h2>
              <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-white text-xl leading-none">✕</button>
            </div>
            <div className="p-5 flex flex-col gap-5 font-mono text-sm">

              <section>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-2">Board Spaces</p>
                <div className="flex flex-col gap-1.5 text-xs">
                  {[
                    ['💛 Sahod Day',            'Kumita ng sahod + passive income. Nagbabayad ng lahat ng gastusin at utang.'],
                    ['🟢 Maliit na Deal',       'Pumili ng maliit na investment card. Maaaring tanggapin o ipasa.'],
                    ['💚 Malaking Deal',        'Mas malaking investment. Mas malaking puhunan, mas malaking kita.'],
                    ['🔴 Gastos!',              'Mandatory na gastusin. Hindi maaaring ipasa — dapat tanggapin.'],
                    ['🔵 Pangyayari sa Buhay',  'Life event cards — maganda o masama, patas lang ang buhay.'],
                    ['🟣 Pangyayari sa Merkado','Market event — nakakaapekto sa lahat ng players.'],
                    ['🩵 Bangko',               'Humiram, magbayad ng utang, o mag-BRRRR refinancing.'],
                    ['🟠 BIR Audit',            'Roll D6: 1-2 = ₱20K penalty, 3-4 = pass, 5-6 = ₱10K refund.'],
                    ['🩷 Koneksyon',            'Libre na network card na awtomatikong pupunta sa iyong kamay.'],
                  ].map(([label, desc]) => (
                    <div key={label} className="flex gap-2">
                      <span className="shrink-0 font-bold text-slate-200 w-44">{label}</span>
                      <span className="text-slate-400">{desc}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-2">Credit Score at Loans</p>
                <div className="flex flex-col gap-1 text-xs text-slate-400">
                  <p><span className="text-red-400 font-bold">&lt; 500:</span> Bangko locked — 5-6 lender lang (20%/buwan!)</p>
                  <p><span className="text-yellow-400 font-bold">500–699:</span> Standard bank rates (₱8,000/₱1M/buwan)</p>
                  <p><span className="text-green-400 font-bold">700–799:</span> Pag-IBIG rates (₱5,500/₱1M/buwan)</p>
                  <p><span className="text-emerald-300 font-bold">800+:</span> Premium — BRRRR LTV 80% available</p>
                </div>
              </section>

              <section>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-2">Paano Gumagana ang BRRRR</p>
                <div className="text-xs text-slate-400 leading-relaxed">
                  <p>Sa Bangko space, piliin ang isang rental property para i-refinance.</p>
                  <p className="mt-1"><span className="text-white">1.</span> Appraised Value = Current Value × Market Multiplier</p>
                  <p><span className="text-white">2.</span> Max New Loan = Appraised Value × LTV % (70% o 80%)</p>
                  <p><span className="text-white">3.</span> Cash Out = Max New Loan − Remaining Mortgage</p>
                  <p className="mt-1 text-emerald-400">Positive cash out = libre na pera para sa bagong investment!</p>
                </div>
              </section>

              <section>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-2">Win Conditions</p>
                <div className="text-xs text-slate-400 leading-relaxed">
                  <p><span className="text-emerald-400 font-bold">Escape Rat Race:</span> Passive income ≥ total monthly expenses + loan payments</p>
                  <p className="mt-1"><span className="text-yellow-400 font-bold">Win (Freedom Track):</span> Net Worth ≥ ₱10,000,000 <span className="text-slate-600">o</span> Passive Income ≥ ₱100,000/buwan</p>
                </div>
              </section>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
