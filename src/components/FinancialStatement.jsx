import { useState, useEffect } from 'react';
import {
  useGameStore,
  computePassiveIncome,
  computeLoanPayments,
  computeNetWorth,
  getMarketMultiplier,
} from '../store/gameStore.js';
import { INSURANCE_MONTHLY_COST } from '../data/gameConstants.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const php = (n) =>
  (n ?? 0).toLocaleString('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  });

function creditTier(score) {
  if (score < 500) return { label: '5-6 Only',        color: '#f87171' };
  if (score < 700) return { label: 'Standard Bank',   color: '#fbbf24' };
  if (score < 800) return { label: 'Pag-IBIG Rate',   color: '#4ade80' };
  return              { label: 'Premium (80% LTV)', color: '#6ee7b7' };
}

const MARKET_LABEL = { bear: '🐻 Bear', normal: '➡️ Normal', bull: '📈 Bull' };

const AUTO_EFFECTS = new Set([
  'skip_bir_penalty', 'brrrr_ltv_80pct', 'first_look_big_deal',
  'skip_title_delay', 'next_deal_analysis', 'waive_one_loan_interest',
  'rehab_cost_minus_20pct',
]);

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p
      className="text-[9px] font-bold tracking-[2px] uppercase pb-1 border-b border-[#1a3a1a] mb-[6px] mt-[10px]"
      style={{ fontFamily: 'var(--font-display)', color: '#3a6a3a' }}
    >
      {children}
    </p>
  );
}

function Row({ label, value, valueColor = 'var(--color-green)', isTotal = false }) {
  return (
    <div className="flex justify-between items-center py-[5px] border-b border-[#0d2030]">
      <span className={isTotal ? 'text-[13px] font-semibold text-[#c8d8e8]' : 'text-[12px] text-[#8aabcb]'}>
        {label}
      </span>
      <span
        className={`font-bold ${isTotal ? 'text-[16px]' : 'text-[13px]'}`}
        style={{ fontFamily: 'var(--font-display)', color: valueColor }}
      >
        {value}
      </span>
    </div>
  );
}

function SubRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-[3px]">
      <span className="text-[11px] text-[#5a7a9a]">{label}</span>
      <span className="text-[12px] font-bold text-[var(--color-red)]" style={{ fontFamily: 'var(--font-display)' }}>
        {value}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FinancialStatement({ playerId }) {
  const [deductionsOpen, setDeductionsOpen] = useState(false);

  const player            = useGameStore(s => s.players.find(p => p.id === playerId));
  const marketCycle       = useGameStore(s => s.marketCycle);
  const paluwagan         = useGameStore(s => s.paluwagan);
  const eventLog          = useGameStore(s => s.eventLog);
  const players           = useGameStore(s => s.players);
  const useHrRecruiter    = useGameStore(s => s.useHrRecruiter);
  const toggleInsurance   = useGameStore(s => s.toggleInsurance);
  const useNetworkCard    = useGameStore(s => s.useNetworkCard);
  const activatePaluwagan = useGameStore(s => s.activatePaluwagan);

  // Animation freeze — lock display values while the current player's token is moving
  const isAnimating        = useGameStore(s => s.animatingToken.active);
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
  const viewedIdx          = players.findIndex(p => p.id === playerId);
  const [frozenPlayer, setFrozenPlayer] = useState(null);

  useEffect(() => {
    const shouldFreeze = isAnimating && viewedIdx === currentPlayerIndex;
    if (shouldFreeze && frozenPlayer === null) {
      setFrozenPlayer(player);
    }
    if (!isAnimating && frozenPlayer !== null) {
      setFrozenPlayer(null);
    }
  }, [isAnimating]); // eslint-disable-line react-hooks/exhaustive-deps

  // Use frozen snapshot during animation; fall back to live player otherwise.
  // Guard against stale frozen data if the user switches tabs mid-animation.
  const displayPlayer = (frozenPlayer?.id === playerId) ? frozenPlayer : player;

  const playerHistory = eventLog.filter(e => e.playerId === playerId).slice(0, 5);

  if (!player) {
    return (
      <div className="flex h-full items-center justify-center text-sm" style={{ color: '#3a6a3a' }}>
        Pumili ng player sa itaas.
      </div>
    );
  }

  if (!displayPlayer) return null;

  // ── Derived values (all from displayPlayer so they freeze during animation) ─
  const marketMult    = getMarketMultiplier(marketCycle);
  const passiveIncome = computePassiveIncome(displayPlayer.assets);
  const loanPayments  = computeLoanPayments(displayPlayer.liabilities);
  const netWorth      = computeNetWorth(displayPlayer);

  const insuranceCost   = displayPlayer.insuranceActive ? INSURANCE_MONTHLY_COST : 0;
  const totalDeductions = displayPlayer.tax + displayPlayer.mandatoryDeductions + insuranceCost;

  const activeIncome  = displayPlayer.variableIncome ? null : displayPlayer.salary;
  const totalIncome   = activeIncome !== null ? activeIncome + passiveIncome : null;

  const totalExpenses = displayPlayer.monthlyExpenses + displayPlayer.familyExpenses;
  const totalOutflow  = totalDeductions + totalExpenses + loanPayments;
  const cashFlow      = totalIncome !== null ? totalIncome - totalOutflow : null;

  const escapeTarget  = totalExpenses + loanPayments;
  const escapePct     = escapeTarget > 0 ? (passiveIncome / escapeTarget) * 100 : 0;
  const barPct        = Math.min(escapePct, 100);
  const hasEscaped    = escapePct >= 100;

  const tier = creditTier(displayPlayer.creditScore);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Scrollable main content ── */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-2">

        {/* ── INCOME STATEMENT ── */}
        <SectionLabel>Income Statement</SectionLabel>

        <Row
          label="Active Income"
          value={displayPlayer.variableIncome
            ? <span style={{ color: '#f59e0b' }}>🎲 D6 × ₱10,000</span>
            : php(displayPlayer.salary)
          }
          valueColor="var(--color-green)"
        />

        <Row label="Passive Income" value={php(passiveIncome)} valueColor="var(--color-green)" />

        <Row
          label="Total Income"
          value={totalIncome !== null ? php(totalIncome) : `${php(passiveIncome)} + 🎲`}
          valueColor="var(--color-green)"
          isTotal
        />

        {/* Deductions — collapsible */}
        <button
          onClick={() => setDeductionsOpen(o => !o)}
          className="flex w-full justify-between items-center py-[5px] border-b border-[#0d2030] text-[12px] text-[#8aabcb] hover:text-[#aac8e8] transition-colors"
        >
          <span>Deductions</span>
          <span
            className="text-[13px] font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-red)' }}
          >
            {deductionsOpen ? '▲' : '▼'} {php(totalDeductions)}
          </span>
        </button>

        {deductionsOpen && (
          <div className="rounded-lg px-3 py-2 my-1 space-y-0.5 border border-[#0d2030]" style={{ background: '#060f1a' }}>
            {displayPlayer.tax > 0 && <SubRow label="Income Tax" value={php(displayPlayer.tax)} />}
            {displayPlayer.variableIncome && <SubRow label="Income Tax" value="15% ng roll" />}
            <SubRow label="SSS / PhilHealth / Pag-IBIG" value={php(displayPlayer.mandatoryDeductions)} />
            {displayPlayer.insuranceActive && <SubRow label="Insurance Premium" value={php(insuranceCost)} />}
          </div>
        )}

        <Row label="Monthly Expenses" value={php(displayPlayer.monthlyExpenses)} valueColor="var(--color-red)" />

        {displayPlayer.familyExpenses > 0 && (
          <Row label="Family Remittance" value={php(displayPlayer.familyExpenses)} valueColor="var(--color-red)" />
        )}

        <Row label="Loan Payments" value={php(loanPayments)} valueColor="var(--color-red)" />

        <Row label="Total Outflow" value={php(totalOutflow)} valueColor="var(--color-red)" isTotal />

        {/* Cash Flow Hero */}
        <div
          className="rounded-[8px] text-center my-[10px]"
          style={{ background: '#0d2e10', border: '1px solid #2d5a2d', padding: '12px 16px' }}
        >
          <p
            className="text-[9px] tracking-[2px] uppercase font-bold mb-1"
            style={{ fontFamily: 'var(--font-display)', color: '#3a6a3a' }}
          >
            Monthly Cash Flow
          </p>
          <p
            className="font-black"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '40px',
              color: cashFlow === null || cashFlow >= 0 ? 'var(--color-green)' : 'var(--color-red)',
              lineHeight: 1,
            }}
          >
            {cashFlow !== null ? php(cashFlow) : `${php(passiveIncome - totalOutflow)} + 🎲`}
          </p>
        </div>

        {/* Rat Race Escape progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-[9px] mb-1">
            <span style={{ color: '#5a8a5a' }}>Rat Race Escape</span>
            <span style={{ color: hasEscaped ? '#4ade80' : '#5a8a5a', fontFamily: hasEscaped ? 'var(--font-display)' : undefined, fontWeight: hasEscaped ? 700 : undefined }}>
              {Math.round(escapePct)}%
            </span>
          </div>
          <div className="h-[6px] rounded-[3px] overflow-hidden" style={{ background: '#0d2e10' }}>
            <div
              className="h-full rounded-[3px] transition-all duration-500"
              style={{ background: 'linear-gradient(90deg, #22c55e, #86efac)', width: `${barPct}%` }}
            />
          </div>
          {hasEscaped && (
            <p
              className="text-[11px] text-center mt-1 animate-pulse"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#4ade80' }}
            >
              NAKATAKAS NA! 🎉
            </p>
          )}
        </div>

        {/* ── ASSETS ── */}
        <SectionLabel>Assets</SectionLabel>
        {displayPlayer.assets.length === 0 ? (
          <p className="text-[12px] italic py-2" style={{ color: '#3a6a3a' }}>No assets yet.</p>
        ) : (
          displayPlayer.assets.map(asset => {
            const mktValue = Math.round((asset.currentValue || 0) * marketMult);
            return (
              <div key={asset.instanceId} className="flex items-center py-[5px] border-b border-[#0d2030] gap-2">
                <span className="text-[12px] text-[#8aabcb] flex-1">{asset.name}</span>
                <span className="text-[10px] text-[#86efac]">{php(asset.monthlyIncome)}/mo</span>
                <span
                  className="text-[13px] font-semibold"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-green)' }}
                >
                  {php(mktValue)}
                </span>
              </div>
            );
          })
        )}

        {/* ── LIABILITIES ── */}
        <SectionLabel>Liabilities</SectionLabel>
        {displayPlayer.liabilities.length === 0 ? (
          <p className="text-[12px] italic py-2" style={{ color: '#4ade80' }}>No liabilities yet! 🎉</p>
        ) : (
          displayPlayer.liabilities.map(lib => (
            <div key={lib.id} className="flex items-center py-[5px] border-b border-[#0d2030] gap-2">
              <span className="text-[12px] text-[#8aabcb] flex-1">{lib.name}</span>
              <span className="text-[10px] text-[#f87171]">{php(lib.payment)}/mo</span>
              <span
                className="text-[13px] font-semibold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-red)' }}
              >
                {php(lib.balance)}
              </span>
            </div>
          ))
        )}

        {/* ── KONEKSYON CARDS ── */}
        {displayPlayer.heldNetworkCards.length > 0 && (
          <>
            <SectionLabel>Koneksyon Cards</SectionLabel>
            <div className="flex flex-col gap-1 mb-2">
              {displayPlayer.heldNetworkCards.map((card, i) => {
                const isAuto = AUTO_EFFECTS.has(card.effect);
                const handleUse = () => {
                  if (card.effect === 'salary_plus_5000') {
                    useHrRecruiter(playerId);
                  } else if (card.effect === 'free_first_month_insurance') {
                    if (!displayPlayer.insuranceActive) toggleInsurance(playerId);
                    useNetworkCard(playerId, card.effect);
                  } else if (card.effect === 'paluwagan_start') {
                    if (window.confirm('Simulan ang Paluwagan? Lahat ng players ay magbabayad ng ₱10,000/round sa pot.')) {
                      activatePaluwagan();
                      useNetworkCard(playerId, card.effect);
                    }
                  }
                };
                return (
                  <div
                    key={i}
                    className="rounded-lg px-2 py-1.5 flex items-center gap-2"
                    style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(59,130,246,0.35)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold leading-tight text-[#93c5fd]">{card.name}</p>
                      <p className="text-[9px] leading-tight text-[#6090c8]">{card.description}</p>
                    </div>
                    {isAuto ? (
                      <span
                        className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full font-mono text-[#5a7a9a]"
                        style={{ background: 'rgba(30,50,80,0.6)' }}
                        title="Gagamitin ito awtomatiko sa tamang sitwasyon"
                      >
                        🔄 Auto
                      </span>
                    ) : (
                      <button
                        onClick={handleUse}
                        className="shrink-0 text-[9px] px-2 py-0.5 rounded-full font-bold text-white transition-all hover:opacity-80"
                        style={{ background: '#1d4ed8' }}
                      >
                        Gamitin
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── PALUWAGAN (when active) ── */}
        {paluwagan.active && (
          <div
            className="rounded-lg px-3 py-2 flex items-center gap-2 text-[11px] flex-wrap mb-2"
            style={{ background: 'rgba(23,37,84,0.4)', border: '1px solid rgba(59,130,246,0.4)' }}
          >
            <span className="text-[#60a5fa] font-bold">🤝 Paluwagan: AKTIBO</span>
            <span style={{ color: '#3a5a9a' }}>|</span>
            <span style={{ color: '#8aabcb' }}>Pot: <span className="text-[#93c5fd] font-bold">{php(paluwagan.pot)}</span></span>
            <span style={{ color: '#3a5a9a' }}>|</span>
            <span style={{ color: '#8aabcb' }}>Susunod: <span className="text-[#93c5fd] font-bold">
              {players[paluwagan.nextRecipientIndex % Math.max(paluwagan.members.length, 1)]?.name ?? '—'}
            </span></span>
          </div>
        )}

        {/* ── NET WORTH ── */}
        <div
          className="flex justify-between items-center pt-3 mt-2"
          style={{ borderTop: '1px solid #1a3a1a' }}
        >
          <span className="text-[14px] font-semibold text-[#c8d8e8]">Net Worth</span>
          <span
            className="font-black text-[22px]"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-gold)' }}
          >
            {php(netWorth)}
          </span>
        </div>
        {netWorth >= 10_000_000 && (
          <p className="text-[10px] text-right mt-0.5 text-[#c9a227]">🏆 Freedom Track Winner!</p>
        )}

        <div className="h-3" />
      </div>

      {/* ── History (fixed 118px) ── */}
      <div
        className="shrink-0 overflow-y-auto px-3 py-2"
        style={{ height: '118px', background: '#08101e', borderTop: '1px solid #1a3a1a' }}
      >
        <p
          className="text-[9px] font-bold tracking-[2px] uppercase mb-2"
          style={{ fontFamily: 'var(--font-display)', color: '#3a6a3a' }}
        >
          History
        </p>
        {playerHistory.length === 0 ? (
          <p className="text-[11px]" style={{ color: '#3a6a3a' }}>No history yet.</p>
        ) : (
          playerHistory.map(e => (
            <div
              key={e.id}
              className="pl-2 mb-1 text-[11px] leading-[1.5]"
              style={{ borderLeft: '3px solid var(--color-gold)', color: '#8aabcb' }}
            >
              <span className="text-[9px] mr-1" style={{ color: '#5a7a9a' }}>R{e.round}</span>
              {e.message}
            </div>
          ))
        )}
      </div>

      {/* ── Footer strip (32px) ── */}
      <div
        className="shrink-0 flex items-center gap-2 px-3 text-[10px]"
        style={{ height: '32px', background: '#08101e', borderTop: '1px solid #1a3a1a' }}
      >
        <span
          className="rounded-[10px] px-2 py-[2px] text-[#93c5fd]"
          style={{ background: '#1e3a5f' }}
        >
          {displayPlayer.creditScore} · {tier.label}
        </span>

        {displayPlayer.insuranceActive && (
          <span
            className="rounded-[10px] px-2 py-[2px]"
            style={{ background: '#0d2e10', border: '1px solid #2d5a2d', color: '#4ade80' }}
          >
            🛡 Insured
          </span>
        )}

        <span
          className="rounded-[10px] px-2 py-[2px]"
          style={marketCycle === 'bear'
            ? { background: '#2e0d0d', border: '1px solid #5a2d2d', color: '#ff6b6b' }
            : marketCycle === 'bull'
              ? { background: '#0d2e10', border: '1px solid #2d5a2d', color: '#4ade80' }
              : { background: '#1a201a', border: '1px solid #2d3d2d', color: '#86efac' }
          }
        >
          {MARKET_LABEL[marketCycle]}
        </span>
      </div>
    </div>
  );
}
