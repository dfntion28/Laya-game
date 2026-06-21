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
  if (score < 500)  return { label: '5-6 Lender (20%/month!)',     color: 'text-red-400',     warn: true  };
  if (score < 700)  return { label: 'Standard Bank Rate',          color: 'text-yellow-400',  warn: false };
  if (score < 800)  return { label: 'Pag-IBIG Rate (lower rate)',  color: 'text-green-400',   warn: false };
  return                   { label: 'Premium — 80% LTV for BRRRR', color: 'text-emerald-400', warn: false };
}

function monthlyPayment(amount, creditScore) {
  if (creditScore < 500) return amount * FIVE_SIX_MONTHLY_RATE;
  const rate = creditScore >= 700 ? PAGIBIG_RATE_PER_MILLION : BANK_RATE_PER_MILLION;
  return Math.round((amount / 1_000_000) * rate);
}

// ── Tab: Humiram ───────────────────────────────────────────────────────────────

function BorrowTab({ player, onClose }) {
  const takeLoan            = useGameStore(s => s.takeLoan);
  const takeAssetBackedLoan = useGameStore(s => s.takeAssetBackedLoan);
  const [amount, setAmount]             = useState(50_000);
  const [done, setDone]                 = useState(false);
  const [assetLoanIdx, setAssetLoanIdx] = useState(null);
  const [assetLoanAmt, setAssetLoanAmt] = useState(0);
  const [assetDone, setAssetDone]       = useState(false);

  const tier    = creditLabel(player.creditScore);
  const payment = monthlyPayment(amount, player.creditScore);

  const selectedAsset = assetLoanIdx !== null ? player.assets[assetLoanIdx] : null;
  const assetValue    = selectedAsset ? (selectedAsset.originalCost || selectedAsset.currentValue || 0) : 0;
  const maxAssetLoan  = Math.round(assetValue * 0.5);

  const handleBorrow = () => {
    takeLoan(player.id, amount);
    setDone(true);
    setTimeout(onClose, 1200);
  };

  const handleAssetBorrow = () => {
    if (assetLoanIdx === null || assetLoanAmt <= 0) return;
    takeAssetBackedLoan(player.id, assetLoanIdx, assetLoanAmt);
    setAssetDone(true);
    setTimeout(onClose, 1200);
  };

  if (done || assetDone) return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-green-400 font-mono font-bold">
      ✓ Natanggap na ang pautang na {php(done ? amount : assetLoanAmt)}
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

      {/* ── Asset-Backed Loan ──────────────────────────────────── */}
      {player.assets.length > 0 && (
        <div className="border-t border-slate-700 pt-4">
          <p className="text-slate-400 font-mono text-xs uppercase tracking-wider mb-2">
            Asset-Backed Loan (50% LTV)
          </p>
          <div className="flex flex-col gap-2">
            {player.assets.map((asset, idx) => {
              const aVal = asset.originalCost || asset.currentValue || 0;
              const maxL = Math.round(aVal * 0.5);
              const isSelected = assetLoanIdx === idx;
              return (
                <div
                  key={asset.instanceId}
                  className={`rounded-xl p-3 border transition-all ${
                    isSelected ? 'border-cyan-600 bg-cyan-950/20' : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-mono text-sm font-semibold leading-tight">{asset.name}</p>
                      <p className="text-slate-500 font-mono text-xs">
                        {asset.collateralized ? '🔒 Collateralized na' : `Max loan: ${php(maxL)}`}
                      </p>
                    </div>
                    {!asset.collateralized && maxL > 0 && (
                      <button
                        onClick={() => { setAssetLoanIdx(idx); setAssetLoanAmt(maxL); }}
                        className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-mono text-xs font-bold transition-all"
                      >
                        {isSelected ? '✓ Selected' : 'Select'}
                      </button>
                    )}
                  </div>
                  {isSelected && (
                    <div className="mt-3 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setAssetLoanAmt(a => Math.max(10_000, a - 10_000))}
                          disabled={assetLoanAmt <= 10_000}
                          className="w-8 h-8 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg disabled:opacity-40"
                        >−</button>
                        <span className="flex-1 text-center text-white font-mono font-bold">{php(assetLoanAmt)}</span>
                        <button
                          onClick={() => setAssetLoanAmt(a => Math.min(maxAssetLoan, a + 10_000))}
                          disabled={assetLoanAmt >= maxAssetLoan}
                          className="w-8 h-8 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg disabled:opacity-40"
                        >+</button>
                      </div>
                      <button
                        onClick={handleAssetBorrow}
                        disabled={assetLoanAmt <= 0}
                        className="w-full py-2 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-mono font-bold text-sm transition-all disabled:opacity-40"
                      >
                        Borrow {php(assetLoanAmt)} (Asset-Backed)
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
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

  const realEstate   = player.assets.filter(a => a.assetType === 'real_estate');
  const marketMult   = getMarketMultiplier(marketCycle);
  const hasAppraiser = player.heldNetworkCards.some(c => c.effect === 'brrrr_ltv_80pct');
  const ltvPct       = player.creditScore >= 800 || hasAppraiser ? BRRRR_LTV_PREMIUM : BRRRR_LTV_STANDARD;

  if (realEstate.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 font-mono">
        Walang real estate property pa. Bumili muna ng Maliit o Malaking Deal.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-blue-950/50 border border-blue-800/50 rounded-xl p-3 text-blue-200 font-mono text-xs leading-relaxed">
        <p className="font-bold mb-1">📚 Paano ang BRRRR?</p>
        <p>I-refinance ang property batay sa kasalukuyang market value. Kapag tumaas ang halaga, maaari kang kumuha ng bagong pautang nang mas malaki kaysa sa dating mortgage — at ang kaibahan ay magiging cash sa iyo!</p>
        <p className="mt-1 text-blue-300">LTV = {(ltvPct * 100).toFixed(0)}% {hasAppraiser ? '(may Appraiser card)' : player.creditScore >= 800 ? '(800+ credit)' : ''}</p>
      </div>

      {realEstate.map(asset => {
        const mortgage         = player.liabilities.find(l => l.linkedAssetId === asset.instanceId);
        const remainingMortgage = mortgage?.balance ?? 0;
        const appraisedValue   = Math.round(asset.currentValue * marketMult);
        const maxNewLoan       = Math.round(appraisedValue * ltvPct);
        const cashOut          = maxNewLoan - remainingMortgage;
        const canRefinance     = cashOut > 0;
        const wasRefinanced    = result?.assetId === asset.instanceId;

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

// ── Tab: Time Deposit ─────────────────────────────────────────────────────────

function TimeDepositTab({ player, onClose }) {
  const openTimeDeposit = useGameStore(s => s.openTimeDeposit);
  const [amount, setAmount] = useState(10_000);
  const [term, setTerm]     = useState(3);
  const [done, setDone]     = useState(false);

  const MIN_DEP  = 10_000;
  const MAX_DEP  = 500_000;
  const DEP_STEP = 10_000;
  const TERMS    = [3, 6, 12];

  const monthlyInterest = Math.round(amount * 0.005);
  const totalInterest   = monthlyInterest * term;
  const canDeposit      = player.cash >= amount && amount >= MIN_DEP;

  const handleDeposit = () => {
    openTimeDeposit(player.id, amount, term);
    setDone(true);
    setTimeout(onClose, 1200);
  };

  if (done) return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-green-400 font-mono font-bold">
      ✓ Naideposito na ang {php(amount)} para sa {term} rounds
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-3 text-blue-200 font-mono text-xs leading-relaxed">
        <p className="font-bold mb-1">📚 Paano ang Time Deposit?</p>
        <p>I-lock ang pera sa bangko para sa ilang rounds. 0.5% monthly interest ang kikitain. Mababalik ang principal pagkatapos ng term.</p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-slate-400 font-mono text-xs uppercase tracking-wider">
          Halaga ng Deposit (min ₱10,000)
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAmount(a => Math.max(MIN_DEP, a - DEP_STEP))}
            disabled={amount <= MIN_DEP}
            className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xl disabled:opacity-40 transition-all"
          >−</button>
          <span className="flex-1 text-center text-white font-mono font-bold text-2xl">{php(amount)}</span>
          <button
            onClick={() => setAmount(a => Math.min(Math.min(MAX_DEP, player.cash), a + DEP_STEP))}
            disabled={amount >= Math.min(MAX_DEP, player.cash)}
            className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xl disabled:opacity-40 transition-all"
          >+</button>
        </div>
        <input
          type="range"
          min={MIN_DEP}
          max={Math.max(MIN_DEP, Math.min(MAX_DEP, player.cash))}
          step={DEP_STEP}
          value={Math.min(amount, Math.max(MIN_DEP, player.cash))}
          onChange={e => setAmount(Number(e.target.value))}
          className="w-full accent-blue-500 mt-1"
        />
      </div>

      <div className="flex gap-2">
        {TERMS.map(t => (
          <button
            key={t}
            onClick={() => setTerm(t)}
            className={`flex-1 py-2 rounded-lg font-mono font-bold text-sm transition-all ${
              term === t
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            {t} Rounds
          </button>
        ))}
      </div>

      <div className="bg-slate-900 rounded-lg p-3 flex flex-col gap-1.5 border border-slate-700">
        <div className="flex justify-between font-mono text-sm">
          <span className="text-slate-400">Monthly Interest (0.5%)</span>
          <span className="text-green-400 font-bold">+{php(monthlyInterest)}/round</span>
        </div>
        <div className="flex justify-between font-mono text-sm">
          <span className="text-slate-400">Total Interest ({term} rounds)</span>
          <span className="text-green-400 font-bold">+{php(totalInterest)}</span>
        </div>
        <div className="flex justify-between font-mono text-sm">
          <span className="text-slate-400">Unlocks after</span>
          <span className="text-slate-300 font-bold">current round + {term}</span>
        </div>
      </div>

      <button
        onClick={handleDeposit}
        disabled={!canDeposit}
        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {canDeposit
          ? `I-deposit ang ${php(amount)}`
          : `Hindi sapat ang cash (mayroon: ${php(player.cash)})`}
      </button>
    </div>
  );
}

// ── Tab: Restructure Loan ─────────────────────────────────────────────────────

function RestructureLoanTab({ player }) {
  const restructureLoan = useGameStore(s => s.restructureLoan);
  const [restructured, setRestructured] = useState(new Set());

  if (player.liabilities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 font-mono">
        Walang utang na maaaring i-restructure. 🎉
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-yellow-950/40 border border-yellow-800/40 rounded-xl p-3 text-yellow-200 font-mono text-xs leading-relaxed">
        <p className="font-bold mb-1">📚 Loan Restructuring</p>
        <p>Bawasan ang monthly payment ng 20% ngunit dagdagan ang balance ng 15%. Mas magaan ang bayad ngayon, ngunit mas malaki ang kabuuang utang.</p>
      </div>

      {player.liabilities.map((lib, idx) => {
        const newPayment = Math.round(lib.payment * 0.80);
        const newBalance = Math.round(lib.balance * 1.15);
        const wasDone    = restructured.has(lib.id);
        return (
          <div key={lib.id} className="bg-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <span className="text-white font-mono font-semibold text-sm">{lib.name}</span>
              <span className="text-slate-500 font-mono text-xs">
                {lib.source === 'five_six' ? '5-6 Lender' : lib.source === 'deal' ? 'Mortgage' : 'Bank Loan'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 font-mono text-xs">
              <span className="text-slate-500">Current Balance</span>
              <span className="text-red-400 text-right">{php(lib.balance)}</span>
              <span className="text-slate-500">New Balance (+15%)</span>
              <span className="text-orange-400 text-right">{php(newBalance)}</span>
              <span className="text-slate-500">Current Payment</span>
              <span className="text-red-400 text-right">{php(lib.payment)}/month</span>
              <span className="text-slate-500">New Payment (−20%)</span>
              <span className="text-green-400 text-right">{php(newPayment)}/month</span>
            </div>
            {wasDone ? (
              <div className="text-emerald-400 font-mono text-xs font-bold text-center">✓ Na-restructure na!</div>
            ) : (
              <button
                onClick={() => {
                  restructureLoan(player.id, idx);
                  setRestructured(s => new Set([...s, lib.id]));
                }}
                className="w-full py-2 rounded-lg bg-yellow-700 hover:bg-yellow-600 text-white font-mono font-bold text-sm transition-all"
              >
                Restructure — bayad {php(newPayment)}/month
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: Pag-IBIG Loan ────────────────────────────────────────────────────────

const PAGIBIG_ELIGIBLE = new Set(['engineer', 'business_owner', 'ofw']);

function PagIbigLoanTab({ player, onClose }) {
  const takePagibigLoan = useGameStore(s => s.takePagibigLoan);
  const maxLoan = PAGIBIG_ELIGIBLE.has(player.profession) ? 150_000 : 80_000;
  const [amount, setAmount] = useState(Math.min(50_000, maxLoan));
  const [done, setDone]     = useState(false);

  const PAG_STEP = 10_000;
  const payment  = Math.round(amount * 0.0046 * 1.15);

  const handleBorrow = () => {
    takePagibigLoan(player.id, amount);
    setDone(true);
    setTimeout(onClose, 1200);
  };

  if (done) return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-green-400 font-mono font-bold">
      ✓ Natanggap na ang Pag-IBIG loan na {php(amount)}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-3 text-blue-200 font-mono text-xs leading-relaxed">
        <p className="font-bold mb-1">🏠 Pag-IBIG Fund Loan</p>
        <p>Mas mababang interest rate kumpara sa bank loan. Available para sa lahat ng miyembro.</p>
        {PAGIBIG_ELIGIBLE.has(player.profession) && (
          <p className="mt-1 text-green-300">✓ Eligible para sa ₱150,000 max ({player.profession})</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-slate-400 font-mono text-xs uppercase tracking-wider">
          Halaga ng Pautang (max {php(maxLoan)})
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAmount(a => Math.max(10_000, a - PAG_STEP))}
            disabled={amount <= 10_000}
            className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xl disabled:opacity-40 transition-all"
          >−</button>
          <span className="flex-1 text-center text-white font-mono font-bold text-2xl">{php(amount)}</span>
          <button
            onClick={() => setAmount(a => Math.min(maxLoan, a + PAG_STEP))}
            disabled={amount >= maxLoan}
            className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xl disabled:opacity-40 transition-all"
          >+</button>
        </div>
        <input
          type="range"
          min={10_000} max={maxLoan} step={PAG_STEP}
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="w-full accent-blue-500 mt-1"
        />
      </div>

      <div className="bg-slate-900 rounded-lg p-3 flex flex-col gap-1.5 border border-slate-700">
        <div className="flex justify-between font-mono text-sm">
          <span className="text-slate-400">Lender</span>
          <span className="text-green-400 font-bold">Pag-IBIG Fund</span>
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
        className="w-full py-3 rounded-xl bg-green-700 hover:bg-green-600 text-white font-mono font-bold transition-all"
      >
        Kumuha ng Pag-IBIG Loan — {php(amount)}
      </button>
    </div>
  );
}

// ── Tab: Credit Line ──────────────────────────────────────────────────────────

function CreditLineTab({ player }) {
  const openCreditLine = useGameStore(s => s.openCreditLine);
  const drawCreditLine = useGameStore(s => s.drawCreditLine);
  const [drawAmount, setDrawAmount] = useState(5_000);
  const [drawnDone, setDrawnDone]   = useState(false);

  const cl          = player.creditLine;
  const limit       = cl?.limit ?? Math.round(player.creditScore * 120);
  const outstanding = cl?.outstanding ?? 0;
  const available   = cl ? limit - outstanding : 0;
  const CL_STEP     = 5_000;
  const monthlyInt  = outstanding > 0 ? Math.round(outstanding * 0.02) : 0;

  if (!cl) {
    const canOpen = player.creditScore >= 700;
    return (
      <div className="flex flex-col gap-4">
        <div className={`rounded-xl p-4 border ${canOpen ? 'bg-cyan-950/30 border-cyan-700/40' : 'bg-slate-900 border-slate-700'}`}>
          <p className="text-white font-mono font-bold text-sm mb-2">Credit Line</p>
          <div className="grid grid-cols-2 gap-1 font-mono text-xs">
            <span className="text-slate-400">Credit Score</span>
            <span className={`text-right font-bold ${player.creditScore >= 700 ? 'text-green-400' : 'text-red-400'}`}>
              {player.creditScore}
            </span>
            <span className="text-slate-400">Requirement</span>
            <span className="text-slate-300 text-right">700+</span>
            {canOpen && (
              <>
                <span className="text-slate-400">Potential Limit</span>
                <span className="text-cyan-300 text-right font-bold">{php(limit)}</span>
                <span className="text-slate-400">Monthly Rate</span>
                <span className="text-orange-400 text-right">2% on balance</span>
              </>
            )}
          </div>
        </div>

        {canOpen ? (
          <button
            onClick={() => openCreditLine(player.id)}
            className="w-full py-3 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-mono font-bold transition-all"
          >
            Buksan ang Credit Line — Limit: {php(limit)}
          </button>
        ) : (
          <div className="text-center text-slate-500 font-mono text-sm py-4">
            ⚠ Hindi eligible — kailangan ng 700+ credit score
          </div>
        )}
      </div>
    );
  }

  if (drawnDone) return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-green-400 font-mono font-bold">
      ✓ Nakuha ang {php(drawAmount)} mula sa credit line
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 grid grid-cols-2 gap-1 font-mono text-xs">
        <span className="text-slate-400">Credit Limit</span>
        <span className="text-cyan-300 text-right font-bold">{php(limit)}</span>
        <span className="text-slate-400">Outstanding</span>
        <span className="text-red-400 text-right font-bold">{php(outstanding)}</span>
        <span className="text-slate-400">Available</span>
        <span className="text-green-400 text-right font-bold">{php(available)}</span>
        {monthlyInt > 0 && (
          <>
            <span className="text-slate-400">Monthly Interest (2%)</span>
            <span className="text-orange-400 text-right">{php(monthlyInt)}/round</span>
          </>
        )}
      </div>

      {available > 0 ? (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 font-mono text-xs uppercase tracking-wider">I-withdraw</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawAmount(a => Math.max(CL_STEP, a - CL_STEP))}
                disabled={drawAmount <= CL_STEP}
                className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xl disabled:opacity-40 transition-all"
              >−</button>
              <span className="flex-1 text-center text-white font-mono font-bold text-2xl">{php(drawAmount)}</span>
              <button
                onClick={() => setDrawAmount(a => Math.min(available, a + CL_STEP))}
                disabled={drawAmount >= available}
                className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xl disabled:opacity-40 transition-all"
              >+</button>
            </div>
            <input
              type="range"
              min={CL_STEP} max={available} step={CL_STEP}
              value={Math.min(drawAmount, available)}
              onChange={e => setDrawAmount(Number(e.target.value))}
              className="w-full accent-cyan-500 mt-1"
            />
          </div>

          <button
            onClick={() => { drawCreditLine(player.id, drawAmount); setDrawnDone(true); }}
            disabled={drawAmount <= 0 || drawAmount > available}
            className="w-full py-3 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-mono font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            I-draw ang {php(drawAmount)}
          </button>
        </>
      ) : (
        <div className="text-center text-slate-500 font-mono text-sm py-4">
          Maxed out na ang credit line. Bayaran muna ang utang para ma-free up ang available credit.
        </div>
      )}
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'borrow',       label: '🏦 Borrow'      },
  { id: 'pay',          label: '💳 Pay Loan'    },
  { id: 'brrrr',        label: '🔄 BRRRR'       },
  { id: 'time_deposit', label: '💰 Time Dep'    },
  { id: 'restructure',  label: '🔧 Restructure' },
  { id: 'pagibig',      label: '🏠 Pag-IBIG'   },
  { id: 'credit_line',  label: '💳 Credit Line' },
];

export default function BangkoModal({ onClose }) {
  const players            = useGameStore(s => s.players);
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
  const marketCycle        = useGameStore(s => s.marketCycle);
  const repairCreditScore  = useGameStore(s => s.repairCreditScore);
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

        {/* Tabs — flex-wrap produces 4 + 3 rows */}
        <div className="flex flex-wrap border-b border-slate-700 shrink-0">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{ flexBasis: '25%', flexGrow: 1 }}
              className={`py-2 font-mono text-[10px] font-bold transition-all ${
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
          {tab === 'borrow'       && <BorrowTab player={player} onClose={onClose} />}
          {tab === 'pay'          && <PayLoanTab player={player} />}
          {tab === 'brrrr'        && <BrrrrTab player={player} marketCycle={marketCycle} />}
          {tab === 'time_deposit' && <TimeDepositTab player={player} onClose={onClose} />}
          {tab === 'restructure'  && <RestructureLoanTab player={player} />}
          {tab === 'pagibig'      && <PagIbigLoanTab player={player} onClose={onClose} />}
          {tab === 'credit_line'  && <CreditLineTab player={player} />}
        </div>

        {/* Credit Score Repair — always visible */}
        <div className="px-5 py-2.5 border-t border-slate-700/60 shrink-0 flex items-center justify-between bg-slate-800/50">
          <div>
            <span className="text-slate-400 font-mono text-xs">Credit Score: </span>
            <span className={`font-mono font-bold text-xs ${
              player.creditScore >= 700 ? 'text-green-400'
              : player.creditScore >= 500 ? 'text-yellow-400'
              : 'text-red-400'
            }`}>
              {player.creditScore}
            </span>
            <span className="text-slate-600 font-mono text-[10px] ml-2">Repair: ₱15,000 → +50 score</span>
          </div>
          <button
            onClick={() => repairCreditScore(player.id)}
            disabled={player.cash < 15_000}
            className="px-3 py-1.5 rounded-lg bg-yellow-800 hover:bg-yellow-700 text-yellow-200 font-mono font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Repair Score
          </button>
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
