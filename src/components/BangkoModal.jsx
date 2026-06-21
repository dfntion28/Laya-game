import { useState } from 'react';
import { useGameStore, getMarketMultiplier } from '../store/gameStore.js';
import {
  BANK_RATE_PER_MILLION,
  PAGIBIG_RATE_PER_MILLION,
  FIVE_SIX_MONTHLY_RATE,
  BRRRR_LTV_STANDARD,
  BRRRR_LTV_PREMIUM,
  CREDIT_LOAN_PAID,
} from '../data/gameConstants.js';

const php = n =>
  (n ?? 0).toLocaleString('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });

const MIN_LOAN = 50_000;
const MAX_LOAN = 500_000;
const STEP     = 50_000;

function creditLabel(score) {
  if (score < 500)  return { label: '5-6 Lender (20%/month!)',          color: 'text-red-400',    warn: true  };
  if (score < 700)  return { label: 'Standard Bank Rate',               color: 'text-yellow-400', warn: false };
  if (score < 800)  return { label: 'Pag-IBIG Rate (lower rate)',        color: 'text-green-400',  warn: false };
  return                   { label: 'Premium — 80% LTV for BRRRR',       color: 'text-emerald-400',warn: false };
}

function monthlyPayment(amount, creditScore) {
  if (creditScore < 500) return amount * FIVE_SIX_MONTHLY_RATE;
  const rate = creditScore >= 700 ? PAGIBIG_RATE_PER_MILLION : BANK_RATE_PER_MILLION;
  return Math.round((amount / 1_000_000) * rate);
}

// ── Tab: Humiram ───────────────────────────────────────────────────────────────

function BorrowTab({ player, onClose }) {
  const takeLoan = useGameStore(s => s.takeLoan);
  const [amount, setAmount] = useState(50_000);
  const [done, setDone] = useState(false);

  const tier    = creditLabel(player.creditScore);
  const payment = monthlyPayment(amount, player.creditScore);

  const handleBorrow = () => {
    takeLoan(player.id, amount);
    setDone(true);
    setTimeout(onClose, 1200);
  };

  if (done) return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-green-400 font-mono font-bold">
      ✓ Natanggap na ang pautang na {php(amount)}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {tier.warn && (
        <div className="bg-red-950 border border-red-700 rounded-lg px-4 py-3 text-red-300 font-mono text-sm">
          ⚠ Credit score &lt; 500 — Tanggap lang ng 5-6 Lender. 20% monthly interest!
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-slate-400 font-mono text-xs uppercase tracking-wider">Halaga ng Pautang</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAmount(a => Math.max(MIN_LOAN, a - STEP))}
            disabled={amount <= MIN_LOAN}
            className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xl disabled:opacity-40 transition-all"
          >−</button>
          <span className="flex-1 text-center text-white font-mono font-bold text-2xl">{php(amount)}</span>
          <button
            onClick={() => setAmount(a => Math.min(MAX_LOAN, a + STEP))}
            disabled={amount >= MAX_LOAN}
            className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xl disabled:opacity-40 transition-all"
          >+</button>
        </div>
        <input
          type="range"
          min={MIN_LOAN} max={MAX_LOAN} step={STEP}
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="w-full accent-blue-500 mt-1"
        />
      </div>

      <div className="bg-slate-900 rounded-lg p-3 flex flex-col gap-1.5 border border-slate-700">
        <div className="flex justify-between font-mono text-sm">
          <span className="text-slate-400">Lender</span>
          <span className={`font-bold ${tier.color}`}>{tier.label}</span>
        </div>
        <div className="flex justify-between font-mono text-sm">
          <span className="text-slate-400">Monthly Payment</span>
          <span className="text-orange-400 font-bold">{php(payment)}/month</span>
        </div>
        <div className="flex justify-between font-mono text-sm">
        <span className="text-slate-400">Cash Received</span>
          <span className="text-green-400 font-bold">+{php(amount)}</span>
        </div>
      </div>

      <button
        onClick={handleBorrow}
        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold transition-all"
      >
        Borrow {php(amount)}
      </button>
    </div>
  );
}

// ── Tab: Magbayad ng Utang ─────────────────────────────────────────────────────

function PayLoanTab({ player }) {
  const payLoan = useGameStore(s => s.payLoan);
  const [paid, setPaid] = useState(null);

  if (player.liabilities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 font-mono">
        No liabilities! 🎉 Clean financial statement.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {player.liabilities.map(lib => {
        const canPay = player.cash >= lib.balance;
        const wasPaid = paid === lib.id;
        return (
          <div key={lib.id} className="bg-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-white font-mono font-semibold text-sm">{lib.name}</span>
                <span className="text-slate-500 font-mono text-xs">
                  {lib.source === 'five_six' ? '5-6 Lender' : lib.source === 'deal' ? 'Mortgage' : 'Bank Loan'}
                </span>
              </div>
              <div className="text-right">
                <p className="text-red-400 font-mono font-bold text-sm">{php(lib.balance)}</p>
                <p className="text-slate-500 font-mono text-xs">{php(lib.payment)}/month</p>
              </div>
            </div>
            {wasPaid ? (
              <div className="text-emerald-400 font-mono text-xs font-bold text-center">✓ Bayad na!</div>
            ) : (
              <button
                onClick={() => {
                  payLoan(player.id, lib.id, lib.balance);
                  setPaid(lib.id);
                }}
                disabled={!canPay}
                className={`w-full py-2 rounded-lg font-mono font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  canPay
                    ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                Pay {php(lib.balance)}
                {canPay && (
                  <span className="bg-emerald-900 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                    +{CREDIT_LOAN_PAID} credit
                  </span>
                )}
              </button>
            )}
            {!canPay && (
              <p className="text-red-400 font-mono text-xs text-center">
                Not enough cash. Need: {php(lib.balance)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: BRRRR ────────────────────────────────────────────────────────────────

function BrrrrTab({ player, marketCycle }) {
  const executeBRRRR = useGameStore(s => s.executeBRRRR);
  const [result, setResult] = useState(null);

  const realEstate = player.assets.filter(a => a.assetType === 'real_estate');
  const marketMult = getMarketMultiplier(marketCycle);
  const hasAppraiser = player.heldNetworkCards.some(c => c.effect === 'brrrr_ltv_80pct');
  const ltvPct = player.creditScore >= 800 || hasAppraiser ? BRRRR_LTV_PREMIUM : BRRRR_LTV_STANDARD;

  if (realEstate.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 font-mono">
        Walang real estate property pa. Bumili muna ng Maliit o Malaking Deal.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Explanation */}
      <div className="bg-blue-950/50 border border-blue-800/50 rounded-xl p-3 text-blue-200 font-mono text-xs leading-relaxed">
        <p className="font-bold mb-1">📚 Paano ang BRRRR?</p>
        <p>I-refinance ang property batay sa kasalukuyang market value. Kapag tumaas ang halaga, maaari kang kumuha ng bagong pautang nang mas malaki kaysa sa dating mortgage — at ang kaibahan ay magiging cash sa iyo!</p>
        <p className="mt-1 text-blue-300">LTV = {(ltvPct * 100).toFixed(0)}% {hasAppraiser ? '(may Appraiser card)' : player.creditScore >= 800 ? '(800+ credit)' : ''}</p>
      </div>

      {realEstate.map(asset => {
        const mortgage = player.liabilities.find(l => l.linkedAssetId === asset.instanceId);
        const remainingMortgage = mortgage?.balance ?? 0;
        const appraisedValue = Math.round(asset.currentValue * marketMult);
        const maxNewLoan = Math.round(appraisedValue * ltvPct);
        const cashOut = maxNewLoan - remainingMortgage;
        const canRefinance = cashOut > 0;
        const wasRefinanced = result?.assetId === asset.instanceId;

        return (
          <div key={asset.instanceId} className="bg-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col gap-2">
            <p className="text-white font-mono font-semibold text-sm leading-tight">{asset.name}</p>
            <div className="grid grid-cols-2 gap-1 font-mono text-xs">
              <span className="text-slate-500">Market Value</span>
              <span className="text-white text-right">{php(appraisedValue)}</span>
              <span className="text-slate-500">Remaining Mortgage</span>
              <span className="text-red-400 text-right">{php(remainingMortgage)}</span>
              <span className="text-slate-500">Max New Loan ({(ltvPct*100).toFixed(0)}% LTV)</span>
              <span className="text-slate-300 text-right">{php(maxNewLoan)}</span>
              <span className="text-slate-500 font-bold">Cash Out</span>
              <span className={`text-right font-bold ${canRefinance ? 'text-green-400' : 'text-red-400'}`}>
                {canRefinance ? `+${php(cashOut)}` : '₱0'}
              </span>
            </div>

            {wasRefinanced ? (
              <div className="text-emerald-400 font-mono text-xs font-bold text-center">✓ Refinanced! +{php(result.cashOut)}</div>
            ) : canRefinance ? (
              <button
                onClick={() => {
                  const res = executeBRRRR(player.id, asset.instanceId);
                  if (res.success) setResult({ assetId: asset.instanceId, cashOut: res.cashOut });
                }}
                className="w-full py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-mono font-bold text-sm transition-all"
              >
                I-Refinance → +{php(cashOut)} cash out
              </button>
            ) : (
              <p className="text-red-400 font-mono text-xs text-center">
                Hindi pwede — walang equity na mawi-withdraw pa.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'borrow', label: '🏦 Borrow'           },
  { id: 'pay',    label: '💳 Pay Loan'          },
  { id: 'brrrr',  label: '🔄 BRRRR Refinancing' },
];

export default function BangkoModal({ onClose }) {
  const players            = useGameStore(s => s.players);
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
  const marketCycle        = useGameStore(s => s.marketCycle);
  const [tab, setTab]      = useState('borrow');

  const player = players[currentPlayerIndex];
  if (!player) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="bg-slate-800 border-2 border-cyan-700/60 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]">

        {/* Header */}
        <div className="bg-cyan-950 px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏦</span>
            <div>
              <p className="text-cyan-200 font-mono font-bold text-sm">Bangko</p>
              <p className="text-cyan-400/70 font-mono text-xs">
                {player.name} · Cash: {php(player.cash)} · Credit: {player.creditScore}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-mono text-xl leading-none transition-colors"
          >×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 shrink-0">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 font-mono text-xs font-bold transition-all ${
                tab === t.id
                  ? 'text-cyan-300 border-b-2 border-cyan-400 bg-cyan-950/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'borrow' && <BorrowTab player={player} onClose={onClose} />}
          {tab === 'pay'    && <PayLoanTab player={player} />}
          {tab === 'brrrr'  && <BrrrrTab player={player} marketCycle={marketCycle} />}
        </div>

        {/* Footer close */}
        {tab !== 'borrow' && (
          <div className="px-5 pb-4 shrink-0">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-mono text-sm font-bold transition-all"
            >
              Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
