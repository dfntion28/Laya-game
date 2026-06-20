import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const php = n =>
  (n ?? 0).toLocaleString('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });

const GLYPHS = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const CARD_DECK_MAP = {
  maliit_deal:        'smallDeals',
  malaking_deal:      'bigDeals',
  gastos:             'gastosCards',
  pangyayari_buhay:   'lifeEvents',
  pangyayari_merkado: 'marketEvents',
};

const DEAL_TYPES = new Set(['maliit_deal', 'malaking_deal']);

const BADGE_STYLE = {
  maliit_deal:        { bg: '#2e2510', border: '#5a4a1a', color: '#f59e0b', label: 'MALIIT NA DEAL'       },
  malaking_deal:      { bg: '#2e2510', border: '#5a4a1a', color: '#f59e0b', label: 'MALAKING DEAL'        },
  gastos:             { bg: '#2e0d0d', border: '#5a1a1a', color: '#f87171', label: 'GASTOS'               },
  pangyayari_buhay:   { bg: '#0d1b2e', border: '#1a3a5a', color: '#60a5fa', label: 'PANGYAYARI SA BUHAY' },
  pangyayari_merkado: { bg: '#1a0d2e', border: '#3a1a5a', color: '#c084fc', label: 'PANGYAYARI SA MERKADO'},
};

const ASSET_LESSONS = {
  real_estate: 'Ang real estate ay nagbibigay ng passive income na tumutulong sa iyo na makalaya sa Rat Race.',
  stock:       'Ang dividends ay kita na hindi nangangailangan ng iyong oras.',
  business:    'Ang negosyo ay maaaring maging asset kung hindi ka na personally nagtatrabaho doon.',
  lending:     'Ang pagpapautang sa tamang paraan ay isa ring paraan ng passive income.',
  land:        'Ang lupa ay nagpapahalaga sa paglipas ng panahon — ito ay limitado at hindi nagagawa.',
  agriculture: 'Ang pagpapaupa ng lupang sakahan ay nagbibigay ng passive income habang nagagamit ng iba ang lupa.',
};

function getEffectDisplay(card) {
  if (card.monthlyIncome)       return { value: `+${php(card.monthlyIncome)}/buwan`, positive: true };
  if (card.cashGain)            return { value: `+${php(card.cashGain)}`,             positive: true };
  if (card.amount && card.type === 'salary_increase')
                                return { value: `+${php(card.amount)}/buwan sahod`,   positive: true };
  if (card.cashLoss)            return { value: `-${php(card.cashLoss)}`,              positive: false };
  if (card.addedMonthlyPayment) return { value: `+${php(card.addedMonthlyPayment)}/buwan bayad`, positive: false };
  if (card.addedMonthlyExpense) return { value: `+${php(card.addedMonthlyExpense)}/buwan gastusin`, positive: false };
  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BoardInterior({ selectedPlayerId, onSelectPlayer }) {
  // ── Store state ─────────────────────────────────────────────────────────────
  const players            = useGameStore(s => s.players);
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
  const phase              = useGameStore(s => s.phase);
  const lastDiceRoll       = useGameStore(s => s.lastDiceRoll);
  const lastDiceRolls      = useGameStore(s => s.lastDiceRolls);
  const pendingSpaceAction = useGameStore(s => s.pendingSpaceAction);
  const animatingToken     = useGameStore(s => s.animatingToken);
  const animationComplete  = useGameStore(s => s.animationComplete);
  const marketCycle        = useGameStore(s => s.marketCycle);

  const rollDice           = useGameStore(s => s.rollDice);
  const movePlayer         = useGameStore(s => s.movePlayer);
  const collectPayday      = useGameStore(s => s.collectPayday);
  const drawCard           = useGameStore(s => s.drawCard);
  const discardCard        = useGameStore(s => s.discardCard);
  const applyCardEffect    = useGameStore(s => s.applyCardEffect);
  const buyDeal            = useGameStore(s => s.buyDeal);
  const resolveBirAudit    = useGameStore(s => s.resolveBirAudit);
  const clearPendingAction = useGameStore(s => s.clearPendingAction);
  const nextTurn           = useGameStore(s => s.nextTurn);
  const checkWinCondition  = useGameStore(s => s.checkWinCondition);

  // ── Local state ─────────────────────────────────────────────────────────────
  const [toast, setToast]           = useState(null);
  const [drawnCard, setDrawnCard]   = useState(null);
  const [buyError, setBuyError]     = useState(null);
  const [animDice, setAnimDice]     = useState({ a: null, b: null });
  const [cardVisible, setCardVisible] = useState(false);
  const drawnRef    = useRef(false);
  const animTimeout = useRef(null);
  const prevRolls   = useRef([null, null]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const currentPlayer = players[currentPlayerIndex] ?? null;
  const isMyTurn      = currentPlayer?.id === selectedPlayerId;
  const hasRolled     = lastDiceRoll !== null;
  const canRoll       = phase === 'playing' && !hasRolled && isMyTurn && !animatingToken.active;
  const canEnd        = hasRolled && !pendingSpaceAction && !animatingToken.active;
  const spaceType     = pendingSpaceAction?.type ?? null;
  const deckName      = CARD_DECK_MAP[spaceType] ?? null;
  const isDeal        = DEAL_TYPES.has(spaceType);
  const canAfford     = !isDeal || !drawnCard ||
    (currentPlayer?.cash ?? 0) >= (drawnCard.downPayment ?? drawnCard.cost ?? 0);

  const [d1, d2] = lastDiceRolls ?? [null, null];

  // ── Dice animation ──────────────────────────────────────────────────────────
  useEffect(() => {
    const [prev1, prev2] = prevRolls.current;
    if (d1 === null || (d1 === prev1 && d2 === prev2)) return;
    prevRolls.current = [d1, d2];

    if (animTimeout.current) clearTimeout(animTimeout.current);

    const animate = (elapsed) => {
      if (elapsed >= 1800) {
        setAnimDice({ a: GLYPHS[(d1 ?? 1) - 1], b: GLYPHS[(d2 ?? 1) - 1] });
        return;
      }
      setAnimDice({
        a: GLYPHS[Math.floor(Math.random() * 6)],
        b: GLYPHS[Math.floor(Math.random() * 6)],
      });
      const delay = elapsed < 1100 ? 55 : 140;
      animTimeout.current = setTimeout(() => animate(elapsed + delay), delay);
    };

    animate(0);
    return () => { if (animTimeout.current) clearTimeout(animTimeout.current); };
  }, [d1, d2]);

  // ── Card draw on pending action ─────────────────────────────────────────────
  useEffect(() => {
    if (!spaceType || !CARD_DECK_MAP[spaceType]) {
      drawnRef.current = false;
      setDrawnCard(null);
      setBuyError(null);
      return;
    }
    if (drawnRef.current) return;
    drawnRef.current = true;
    const card = drawCard(CARD_DECK_MAP[spaceType]);
    setDrawnCard(card);
  }, [spaceType]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Card reveal: wait for animation to complete, then show with 180ms delay ─
  useEffect(() => {
    if (animationComplete && pendingSpaceAction && deckName) {
      const timer = setTimeout(() => setCardVisible(true), 180);
      return () => clearTimeout(timer);
    }
    setCardVisible(false);
  }, [animationComplete, pendingSpaceAction, deckName]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ────────────────────────────────────────────────────────────────
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleRoll = () => {
    if (!canRoll || !currentPlayer) return;
    const total = rollDice();
    const space = movePlayer(currentPlayer.id, total);
    if (!space) return;

    if (space.type === 'sahod_day') {
      const before = useGameStore.getState().players.find(p => p.id === currentPlayer.id)?.cash ?? 0;
      collectPayday(currentPlayer.id);
      const after = useGameStore.getState().players.find(p => p.id === currentPlayer.id)?.cash ?? 0;
      clearPendingAction();
      showToast(`💰 Sahod Day! Net cash flow: ${php(after - before)}`);
    } else if (space.type === 'koneksyon') {
      const nc = drawCard('networkCards');
      if (nc) {
        applyCardEffect(currentPlayer.id, nc);
        showToast(`🤝 Nakakuha ng Koneksyon: ${nc.name}`);
      } else {
        showToast('🤝 Koneksyon space — walang card na natitira');
      }
      clearPendingAction();
    } else if (space.type === 'bir_audit') {
      const d6 = Math.floor(Math.random() * 6) + 1;
      const res = resolveBirAudit(currentPlayer.id, d6);
      if (res?.result === 'penalty')
        showToast(`🧾 BIR Audit! Bayad ₱20,000 multa 😬 (D6: ${d6})`);
      else if (res?.result === 'pass')
        showToast(`✅ BIR Audit — Malinaw ang books! (D6: ${d6})`);
      else if (res?.result === 'refund')
        showToast(`🎉 BIR Refund! +${php(res.amount)} (D6: ${d6})`);
      clearPendingAction();
    } else if (space.type === 'win_check') {
      checkWinCondition(currentPlayer.id);
      clearPendingAction();
      showToast('🏆 Freedom Check! Sinuri ang iyong financial status...');
    }
    // Card spaces and bangko leave pendingSpaceAction set for Zone B / BangkoModal
  };

  const handleAccept = () => {
    if (!drawnCard || !currentPlayer) return;
    if (isDeal) {
      const result = buyDeal(currentPlayer.id, drawnCard);
      if (!result.success) { setBuyError(result.reason); return; }
    } else {
      applyCardEffect(currentPlayer.id, drawnCard);
    }
    if (deckName && drawnCard) discardCard(deckName, drawnCard);
    clearPendingAction();
  };

  const handlePass = () => {
    if (deckName && drawnCard) discardCard(deckName, drawnCard);
    clearPendingAction();
  };

  const handleEndTurn = () => {
    if (!canEnd || !currentPlayer) return;
    checkWinCondition(currentPlayer.id);
    nextTurn();
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const badge = BADGE_STYLE[spaceType];

  const dieCardStyle = (hasRoll) => ({
    width: '56px',
    height: '56px',
    borderRadius: '10px',
    background: '#0d2e10',
    border: '2px solid var(--color-gold)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    color: 'var(--color-parchment)',
    boxShadow: '0 0 14px rgba(201,162,39,0.25)',
    opacity: hasRoll ? 1 : 0.3,
    flexShrink: 0,
  });

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ padding: '14px 16px', gap: '10px', background: '#081a0c' }}
    >
      {/* ─── Zone A: Dice ─────────────────────────────────────── */}
      <div className="shrink-0 flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          {/* Die A */}
          <div style={dieCardStyle(hasRolled)}>
            {hasRolled ? (animDice.a ?? GLYPHS[(d1 ?? 1) - 1]) : '⚀'}
          </div>

          {/* Sum + move label */}
          <div className="flex flex-col items-center" style={{ minWidth: '52px' }}>
            <span
              className="font-black"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '26px',
                color: 'var(--color-gold)',
                lineHeight: 1,
                visibility: hasRolled ? 'visible' : 'hidden',
              }}
            >
              {hasRolled ? (d1 + d2) : 0}
            </span>
            {hasRolled && (
              <span
                className="text-center uppercase tracking-[1px]"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '8px',
                  color: 'var(--color-green)',
                  lineHeight: 1.2,
                }}
              >
                LUMIPAT NG {d1 + d2} ESPASYO
              </span>
            )}
          </div>

          {/* Die B */}
          <div style={dieCardStyle(hasRolled)}>
            {hasRolled ? (animDice.b ?? GLYPHS[(d2 ?? 1) - 1]) : '⚀'}
          </div>
        </div>

        {!hasRolled && (
          <p className="text-[9px] text-center" style={{ color: '#3a6a3a' }}>I-roll ang dice</p>
        )}
      </div>

      {/* ─── Zone B: Card Preview / Info ───────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col justify-center" style={{ perspective: '600px' }}>

        {/* Card — only renders after animation completes + 180ms delay */}
        {cardVisible && deckName && drawnCard ? (
          <div className="flex flex-col gap-2" style={{ animation: 'cardFlipIn 0.32s ease-out forwards' }}>
            {/* Badge */}
            {badge && (
              <span
                className="self-start rounded-full px-2 py-0.5 font-bold uppercase"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '9px',
                  fontWeight: 700,
                  background: badge.bg,
                  border: `1px solid ${badge.border}`,
                  color: badge.color,
                }}
              >
                {badge.label}
              </span>
            )}

            {/* Title */}
            <h3
              className="font-black leading-tight"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '15px',
                color: '#f5e6c8',
                fontWeight: 800,
              }}
            >
              {drawnCard.name}
            </h3>

            {/* Description */}
            <p className="text-[10px] leading-[1.5] text-[#8aabcb]">{drawnCard.description}</p>

            {/* Effect amount */}
            {(() => {
              const eff = getEffectDisplay(drawnCard);
              return eff ? (
                <p
                  className="font-bold text-[13px]"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: eff.positive ? 'var(--color-green)' : 'var(--color-red)',
                  }}
                >
                  {eff.value}
                </p>
              ) : null;
            })()}

            {/* Insurance mitigation */}
            {drawnCard.mitigatedByInsurance && currentPlayer?.insuranceActive && (
              <p className="text-[10px] text-[#4ade80]">
                🛡 May insurance — babayaran lang {php(drawnCard.insuranceCost)}
              </p>
            )}

            {/* Affordability warning */}
            {isDeal && !canAfford && (
              <p className="text-[10px] text-[#f87171]">
                ⚠ Hindi sapat ang cash para sa down payment ({php(drawnCard.downPayment ?? drawnCard.cost)})
              </p>
            )}

            {/* Buy error */}
            {buyError && (
              <p className="text-[10px] text-[#f87171]">{buyError}</p>
            )}

            {/* Financial lesson */}
            {isDeal && drawnCard.assetType && ASSET_LESSONS[drawnCard.assetType] && (
              <p
                className="text-[9px] italic rounded"
                style={{ color: '#4a7a4a', background: '#0a1f0a', padding: '4px 8px' }}
              >
                {ASSET_LESSONS[drawnCard.assetType]}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 mt-1">
              <button
                onClick={handleAccept}
                disabled={!drawnCard || (isDeal && !canAfford)}
                className="flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  height: '38px',
                  background: 'var(--color-gold)',
                  color: '#0a1f0a',
                  border: 'none',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {isDeal ? 'Tanggapin (Bilhin)' : 'Tanggapin'}
              </button>
              {isDeal && (
                <button
                  onClick={handlePass}
                  className="flex-1"
                  style={{
                    height: '38px',
                    background: 'transparent',
                    border: '1px solid var(--color-gold)',
                    borderRadius: '8px',
                    color: '#8aabcb',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Pasa
                </button>
              )}
            </div>
          </div>

        ) : hasRolled && !pendingSpaceAction && !animatingToken.active ? (
          /* Waiting for end turn — auto-resolved space done, or card dismissed */
          <div className="flex items-center gap-2 justify-center">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#4ade80' }} />
            <span
              className="text-[11px]"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#4a7a4a' }}
            >
              Kumikilos...
            </span>
          </div>

        ) : hasRolled && !animationComplete ? (
          /* Token is moving — show pulsing dots */
          <div className="flex items-center gap-2 justify-center">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="rounded-full animate-pulse"
                style={{
                  width: '7px',
                  height: '7px',
                  background: '#3a6a3a',
                  opacity: 0.3,
                  animationDelay: `${i * 0.18}s`,
                }}
              />
            ))}
          </div>

        ) : animationComplete && pendingSpaceAction && deckName ? (
          /* Brief pause (≤180ms) between animation end and card flip-in */
          <div />

        ) : spaceType === 'bangko' ? (
          /* Bangko modal is open as overlay */
          <div className="flex flex-col items-center gap-2 text-center">
            <span style={{ fontSize: '28px' }}>🏦</span>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--color-gold)', fontWeight: 700 }}>
              Pumunta sa Bangko
            </p>
            <p className="text-[10px]" style={{ color: '#3a6a3a' }}>
              Humiwam, magbayad ng utang, o mag-BRRRR refinancing.
            </p>
          </div>

        ) : (
          /* Pre-roll: LAYA wordmark + market cycle */
          <div className="flex flex-col items-center gap-2 text-center">
            <span
              className="font-black tracking-[4px]"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '22px',
                color: 'var(--color-gold)',
              }}
            >
              LAYA
            </span>
            <p className="text-[10px]" style={{ color: '#3a6a3a' }}>
              {marketCycle === 'bull'
                ? '📈 Bull Market — mas mataas ang presyo ng assets'
                : marketCycle === 'bear'
                  ? '🐻 Bear Market — mas mababa ang presyo ng assets'
                  : '➡️ Normal Market'}
            </p>
          </div>
        )}
      </div>

      {/* ─── Zone C: Chips + Controls ─────────────────────────── */}
      <div className="shrink-0 flex flex-col items-center gap-2">

        {/* Player chips */}
        <div className="flex flex-wrap gap-[6px] justify-center" style={{ marginBottom: '8px' }}>
          {players.map((p, idx) => {
            const isActive = p.id === currentPlayer?.id;
            const isViewing = p.id === selectedPlayerId;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPlayer?.(p.id)}
                className="flex items-center gap-[6px] cursor-pointer"
                style={{
                  background: isActive ? '#0a1a0a' : '#0d1b2e',
                  border: isActive
                    ? '2px solid var(--color-gold)'
                    : isViewing
                      ? '1px solid #4ade80'
                      : '1px solid #2d4a6a',
                  borderRadius: '20px',
                  padding: '4px 12px',
                }}
              >
                <div
                  className="rounded-full shrink-0"
                  style={{ width: '10px', height: '10px', background: `var(--player-${idx})` }}
                />
                <span
                  className="font-bold whitespace-nowrap"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '12px',
                    color: isActive ? 'var(--color-gold)' : '#8aabcb',
                  }}
                >
                  {p.name}
                </span>
                <span className="text-[9px]" style={{ color: 'var(--color-green)' }}>
                  {php(p.cash)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Roll + End Turn buttons */}
        <div className="flex gap-[10px] justify-center">
          <button
            onClick={handleRoll}
            disabled={!canRoll}
            style={{
              height: '44px',
              padding: '0 32px',
              background: canRoll
                ? 'linear-gradient(135deg, #c9a227, #a07c15)'
                : 'rgba(201,162,39,0.15)',
              color: canRoll ? '#0a1f0a' : 'rgba(201,162,39,0.4)',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: '16px',
              boxShadow: canRoll ? '0 4px 14px rgba(201,162,39,0.35)' : 'none',
              cursor: canRoll ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s',
            }}
          >
            🎲 I-DICE
          </button>

          <button
            onClick={handleEndTurn}
            disabled={!canEnd}
            style={{
              height: '44px',
              padding: '0 20px',
              background: 'transparent',
              border: '1px solid #2d5a2d',
              borderRadius: '8px',
              color: canEnd ? '#8aabcb' : 'rgba(138,171,203,0.3)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: canEnd ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s',
            }}
          >
            ✓ Tapusin ang Turn
          </button>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-40 rounded-xl text-sm max-w-xs"
          style={{
            background: '#0d1b2e',
            border: '1px solid var(--color-gold)',
            padding: '12px 16px',
            color: 'var(--color-parchment)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
