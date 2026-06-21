import { useState } from 'react';
import { useGameStore } from '../store/gameStore.js';
import { professions } from '../data/professions.js';

const PLAYER_COLORS = [
  { label: 'Amber' },
  { label: 'Sky' },
  { label: 'Rose' },
  { label: 'Violet' },
];

const INITIAL_SETUPS = [
  { name: '', professionId: null },
  { name: '', professionId: null },
  { name: '', professionId: null },
  { name: '', professionId: null },
];

const php = n =>
  (n ?? 0).toLocaleString('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });

export default function SetupScreen() {
  const initGame = useGameStore(s => s.initGame);

  const [playerCount, setPlayerCount] = useState(null);
  const [setups, setSetups] = useState(INITIAL_SETUPS.map(s => ({ ...s })));
  const [dealtCards, setDealtCards] = useState({});
  const [flippedIndex, setFlippedIndex] = useState({});
  const [redealsUsed, setRedealsUsed] = useState({});
  const [lockedProfession, setLockedProfession] = useState({});

  function dealCardsForPlayer(playerIndex) {
    const shuffled = [...professions].sort(() => Math.random() - 0.5);
    const hand = shuffled.slice(0, 4);
    setDealtCards(prev => ({ ...prev, [playerIndex]: hand }));
    setFlippedIndex(prev => ({ ...prev, [playerIndex]: null }));
  }

  function updatePlayerProfession(i, professionId) {
    setSetups(prev => prev.map((s, idx) => idx === i ? { ...s, professionId } : s));
  }

  function handleCardClick(playerIndex, cardIndex) {
    if (lockedProfession[playerIndex]) return;
    if (flippedIndex[playerIndex] !== null) return;
    setFlippedIndex(prev => ({ ...prev, [playerIndex]: cardIndex }));
  }

  function handleKeep(playerIndex) {
    const cardIdx = flippedIndex[playerIndex];
    const prof = dealtCards[playerIndex][cardIdx];
    setLockedProfession(prev => ({ ...prev, [playerIndex]: prof }));
    updatePlayerProfession(playerIndex, prof.id);
  }

  function handleRedeal(playerIndex) {
    if (redealsUsed[playerIndex]) return;
    setRedealsUsed(prev => ({ ...prev, [playerIndex]: true }));
    dealCardsForPlayer(playerIndex);
  }

  function handleSelectCount(n) {
    setPlayerCount(n);
    for (let i = 0; i < n; i++) dealCardsForPlayer(i);
  }

  function handleBack() {
    setPlayerCount(null);
    setSetups(INITIAL_SETUPS.map(s => ({ ...s })));
    setDealtCards({});
    setFlippedIndex({});
    setRedealsUsed({});
    setLockedProfession({});
  }

  const allValid = playerCount !== null &&
    Array.from({ length: playerCount }, (_, i) => i)
      .every(i => setups[i]?.name?.trim() && lockedProfession[i]);

  const handleStart = () => {
    if (!allValid) return;
    initGame(Array.from({ length: playerCount }, (_, i) => ({
      name: setups[i].name.trim(),
      professionId: lockedProfession[i].id,
      color: PLAYER_COLORS[i].label.toLowerCase(),
    })));
  };

  // Card sizing by player count
  const cardW = playerCount === 3 ? 76 : playerCount === 4 ? 88 : 96;
  const cardH = playerCount === 3 ? 106 : playerCount === 4 ? 120 : 130;
  const cardGap = playerCount === 3 ? 5 : 8;

  // ── Phase 1: Player count picker ──────────────────────────────────────────────

  if (playerCount === null) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-felt)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 52, color: 'var(--color-gold)', letterSpacing: 5, textShadow: '0 0 32px rgba(201,162,39,0.28)' }}>
            LAYA
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#3a6a3a', letterSpacing: 2, marginTop: 4 }}>
            Filipino Financial Freedom Board Game
          </div>
        </div>

        <div style={{ marginTop: 52 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--color-parchment)', letterSpacing: 3, textAlign: 'center', marginBottom: 24 }}>
            HOW MANY PLAYERS?
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            {[2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => handleSelectCount(n)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--color-gold)';
                  e.currentTarget.style.boxShadow = '0 0 18px rgba(201,162,39,0.25)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#1a3a4a';
                  e.currentTarget.style.boxShadow = '';
                }}
                style={{
                  width: 110, height: 96,
                  background: '#0d1b2e',
                  border: '2px solid #1a3a4a',
                  borderRadius: 10,
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 48, color: '#8aabcb' }}>
                  {n}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 9, letterSpacing: 1, color: '#5a7a9a' }}>
                  PLAYERS
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#2d4a2d' }}>
                  {n === 2 ? 'Two' : n === 3 ? 'Three' : 'Four'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Phase 2: Player setup with card deal ──────────────────────────────────────

  const gridStyle = playerCount === 3
    ? { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }
    : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-felt)', padding: '20px 24px 48px' }}>

      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-felt)', paddingBottom: 14, borderBottom: '1px solid #1a3a1a', marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18, color: 'var(--color-gold)', letterSpacing: 3 }}>LAYA</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#3a6a3a', marginLeft: 12 }}>Choose your professions</span>
        <button
          onClick={handleBack}
          style={{ marginLeft: 'auto', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: '#5a7a9a', background: 'transparent', border: 'none', cursor: 'pointer', letterSpacing: 1 }}
        >
          ← Back
        </button>
      </div>

      {/* Player grid */}
      <div style={gridStyle}>
        {Array.from({ length: playerCount }, (_, i) => {
          const cards = dealtCards[i] ?? [];
          const flipped = flippedIndex[i] ?? null;
          const locked = lockedProfession[i] ?? null;

          return (
            <div key={i} style={{ background: '#0d1b2e', border: '1px solid #1a3a4a', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Player header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `var(--player-${i})`, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--color-gold)', letterSpacing: 2 }}>
                  PLAYER {i + 1}
                </span>
              </div>

              {/* Name input */}
              <input
                type="text"
                maxLength={20}
                placeholder="Enter name..."
                value={setups[i].name}
                onChange={e => setSetups(prev => prev.map((s, idx) => idx === i ? { ...s, name: e.target.value } : s))}
                onFocus={e => { e.target.style.borderColor = 'var(--color-gold)'; }}
                onBlur={e => { e.target.style.borderColor = '#1a3a4a'; }}
                className="placeholder-[#3a6a3a]"
                style={{
                  width: '100%',
                  background: '#081420',
                  border: '1px solid #1a3a4a',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: 'var(--color-parchment)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
              />

              {/* Card deal section */}
              {locked ? (
                /* Confirmed profession */
                <div style={{
                  background: '#0a2810',
                  border: '1.5px solid var(--color-gold)',
                  borderRadius: 8,
                  padding: '12px 14px',
                  animation: 'lockPulse 0.6s ease-out',
                  display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 24 }}>{locked.emoji}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--color-gold)' }}>{locked.name}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#8aabcb', display: 'flex', gap: 12 }}>
                    <span>Salary: {php(locked.salary || 0)}</span>
                    <span>Start: {php(locked.startingCash)}</span>
                  </div>
                  {(locked.specialNote ?? (locked.specialAbility && 'Special ability active') ?? null) && (
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontStyle: 'italic', color: '#3a6a3a' }}>
                      {locked.specialNote}
                    </div>
                  )}
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 9, color: '#22c55e', letterSpacing: 1, marginTop: 4 }}>
                    ✓ Confirmed
                  </div>
                </div>
              ) : (
                /* Card draw UI */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                  {/* Label row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 9, letterSpacing: 2, color: '#3a6a3a' }}>
                      DRAW YOUR PROFESSION
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: flipped === null ? '#2d4a2d' : redealsUsed[i] ? '#5a2d2d' : '#3a6a3a' }}>
                      {flipped === null ? 'Pick a card' : redealsUsed[i] ? 'No redeals left' : '1 redeal available'}
                    </span>
                  </div>

                  {/* Card row */}
                  <div style={{ display: 'flex', flexDirection: 'row', gap: cardGap, justifyContent: 'center' }}>
                    {cards.map((prof, cardIdx) => (
                      <div
                        key={`${cardIdx}-${redealsUsed[i] ? 'r' : '0'}`}
                        className="profession-card-scene"
                        style={{ width: cardW, height: cardH, flexShrink: 0, cursor: flipped === null ? 'pointer' : 'default' }}
                        onClick={() => handleCardClick(i, cardIdx)}
                      >
                        <div
                          className={`profession-card-inner${flipped === cardIdx ? ' is-flipped' : ''}`}
                          style={{ animation: `dealIn 0.3s ease-out ${cardIdx * 0.08}s both` }}
                        >
                          {/* Back face */}
                          <div
                            className="profession-card-face profession-card-back-face"
                            style={{
                              background: '#0d1b2e',
                              border: '1.5px solid #1a3a4a',
                              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                            }}
                          >
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: cardW < 90 ? 24 : 30, color: 'var(--color-gold)', opacity: 0.25 }}>?</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: cardW < 90 ? 8 : 9, color: 'var(--color-gold)', letterSpacing: 2, opacity: 0.5 }}>LAYA</div>
                          </div>
                          {/* Front face */}
                          <div
                            className="profession-card-face profession-card-front-face"
                            style={{
                              background: '#0a1f10',
                              border: '1.5px solid var(--color-gold)',
                              padding: 8,
                              display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'space-between',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: cardW < 90 ? 18 : 22 }}>{prof.emoji}</div>
                              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: cardW < 90 ? 9 : 11, color: 'var(--color-gold)', lineHeight: 1.2, marginTop: 3 }}>
                                {prof.name}
                              </div>
                            </div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: '#8aabcb' }}>
                              <div>{php(prof.salary || 0)}/mo</div>
                              <div style={{ color: '#6aaa8a', marginTop: 1 }}>Start: {php(prof.startingCash)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Keep / Redeal buttons */}
                  {flipped !== null && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button
                        onClick={() => handleKeep(i)}
                        style={{
                          flex: 1, padding: '7px 0', borderRadius: 6,
                          background: 'var(--color-gold)', border: 'none', cursor: 'pointer',
                          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: '#0a0a14', letterSpacing: 1,
                        }}
                      >
                        ✓ KEEP
                      </button>
                      <button
                        onClick={() => handleRedeal(i)}
                        disabled={redealsUsed[i]}
                        style={{
                          flex: 1, padding: '7px 0', borderRadius: 6,
                          background: redealsUsed[i] ? '#1a2a3a' : '#1a3a4a',
                          border: 'none',
                          cursor: redealsUsed[i] ? 'not-allowed' : 'pointer',
                          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
                          color: redealsUsed[i] ? '#3a5a6a' : '#8aabcb',
                          letterSpacing: 1,
                          opacity: redealsUsed[i] ? 0.5 : 1,
                        }}
                      >
                        ↺ REDEAL
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Start button + rule summary */}
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <button
          onClick={handleStart}
          disabled={!allValid}
          style={{
            width: '100%', padding: '16px 0', borderRadius: 16,
            background: allValid ? '#2563eb' : '#334155',
            border: 'none', cursor: allValid ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18, letterSpacing: 2,
            color: allValid ? '#fff' : '#64748b',
            transition: 'background 0.2s',
          }}
        >
          {allValid ? '🎲 START GAME →' : 'Complete setup for all players'}
        </button>

        <div style={{ background: '#0d1b2e', border: '1px solid #1a3a4a', borderRadius: 10, padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 12, color: '#8aabcb', lineHeight: 1.6 }}>
          <div style={{ color: 'var(--color-parchment)', fontWeight: 700, marginBottom: 6, fontSize: 13 }}>📖 How to Win</div>
          <p style={{ margin: 0 }}>
            Make your <span style={{ color: '#4ade80', fontWeight: 700 }}>passive income</span> bigger than your monthly expenses to escape the Rat Race. On the Freedom Track, reach a <span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>net worth of ₱10,000,000</span> or <span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>₱100,000/month passive income</span> to win.
          </p>
        </div>
      </div>

    </div>
  );
}
