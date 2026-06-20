import { create } from 'zustand';
import {
  smallDeals, bigDeals, gastosCards, lifeEvents, marketEvents, networkCards,
} from '../data/cards.js';
import { professions } from '../data/professions.js';
import { boardSpaces, freedomTrackSpaces } from '../data/boardSpaces.js';
import {
  DEFAULT_CREDIT_SCORE,
  INFLATION_TRIGGER_COUNT,
  INFLATION_AMOUNT,
  INSURANCE_MONTHLY_COST,
  BRRRR_LTV_STANDARD,
  BRRRR_LTV_PREMIUM,
  BANK_RATE_PER_MILLION,
  PAGIBIG_RATE_PER_MILLION,
  FIVE_SIX_MONTHLY_RATE,
  TENANT_DAMAGE_COST,
  TENANT_VACANCY_ROLL,
  TENANT_DAMAGE_ROLL,
  WIN_NET_WORTH_TARGET,
  WIN_PASSIVE_INCOME_TARGET,
  BIR_PENALTY,
  BIR_REFUND,
  CREDIT_NEW_LOAN,
  CREDIT_THREE_PAYMENTS,
  CREDIT_LOAN_PAID,
  CREDIT_MISSED_PAYMENT,
  CREDIT_CARD_PENALTY,
} from '../data/gameConstants.js';

// ─── Module-level UID counter ─────────────────────────────────────────────────

let _uid = 0;
const uid = (prefix = 'x') => `${prefix}-${++_uid}`;

// ─── Exported pure helpers (used by components for derived display values) ────

export function computePassiveIncome(assets) {
  return assets.reduce((sum, a) => sum + (a.monthlyIncome || 0), 0);
}

export function computeLoanPayments(liabilities) {
  return liabilities.reduce((sum, l) => sum + (l.payment || 0), 0);
}

export function computeNetWorth(player) {
  const assetValue = player.assets.reduce((sum, a) => sum + (a.currentValue || 0), 0);
  const totalDebt = player.liabilities.reduce((sum, l) => sum + (l.balance || 0), 0);
  return player.cash + assetValue - totalDebt;
}

export function getMarketMultiplier(marketCycle) {
  if (marketCycle === 'bull') return 1.2;
  if (marketCycle === 'bear') return 0.8;
  return 1.0;
}

// ─── Private helpers ──────────────────────────────────────────────────────────

function fmtPhp(n) {
  return '₱' + Math.abs(n ?? 0).toLocaleString('en-PH', { maximumFractionDigits: 0 });
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeDeck(cards) {
  return { draw: shuffle([...cards]), discard: [] };
}

function clampCredit(score) {
  return Math.max(300, Math.min(900, score));
}

function mortgagePaymentFor(amount, creditScore) {
  if (creditScore < 500) return amount * FIVE_SIX_MONTHLY_RATE;
  const rate = creditScore >= 700 ? PAGIBIG_RATE_PER_MILLION : BANK_RATE_PER_MILLION;
  return Math.round((amount / 1_000_000) * rate);
}

function createPlayerState(name, professionId, color = 'amber') {
  const prof = professions.find(p => p.id === professionId);
  const liabilities = (prof.liabilities || []).map(l => ({
    ...l,
    id: uid('lib'),
    source: 'starting',
    linkedAssetId: null,
  }));
  const startingCash = prof.startingCash || 0;
  const startingNetWorth = startingCash - liabilities.reduce((sum, l) => sum + (l.balance || 0), 0);
  return {
    id: uid('player'),
    name,
    professionId,
    color,
    salary: prof.salary || 0,
    tax: prof.tax || 0,
    mandatoryDeductions: prof.mandatoryDeductions || 0,
    variableIncome: prof.variableIncome || false,
    familyExpenses: prof.familyExpenses || 0,
    monthlyExpenses: prof.monthlyExpenses || 0,
    cash: startingCash,
    assets: [],
    liabilities,
    creditScore: DEFAULT_CREDIT_SCORE,
    consecutivePayments: 0,
    position: 0,
    hasEscapedRatRace: false,
    freedomPosition: 0,
    insuranceActive: false,
    jobLossRoundsRemaining: 0,
    sickLeaveRoundsRemaining: 0,
    sickLeaveMultiplier: 1,
    birPenaltyPending: false,
    heldNetworkCards: [],
    specialAbility: prof.specialAbility || null,
    specialMechanic: prof.specialMechanic || null,
    bonus: prof.bonus || null,
    startingNetWorth,
    totalLoanPaymentsTracker: 0,
  };
}

function patchPlayer(players, playerId, patcher) {
  return players.map(p => (p.id === playerId ? { ...p, ...patcher(p) } : p));
}

// ─── Initial store shape ──────────────────────────────────────────────────────

const INITIAL_STATE = {
  phase: 'setup',
  players: [],
  currentPlayerIndex: 0,
  round: 1,
  marketCycle: 'normal',
  inflationCounter: 0,
  roundsSinceLastMarketChange: 0,
  deckStates: {},
  winner: null,
  lastDiceRoll: null,
  lastDiceRolls: [null, null],
  pendingSpaceAction: null,
  animatingToken: { active: false, playerId: null, currentPos: null, targetPos: null },
  animationComplete: false,
  playerJustLanded: false,
  eventLog: [],
  paluwagan: {
    active: false,
    pot: 0,
    contributionPerRound: 10_000,
    nextRecipientIndex: 0,
    members: [],
  },
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create((set, get) => ({
  ...INITIAL_STATE,

  // ── Setup ──────────────────────────────────────────────────────────────────

  initGame: (playerSetups) => {
    const players = playerSetups.map(s => createPlayerState(s.name, s.professionId, s.color));
    set({
      ...INITIAL_STATE,
      phase: 'playing',
      players,
      deckStates: {
        smallDeals:    makeDeck(smallDeals),
        bigDeals:      makeDeck(bigDeals),
        gastosCards:   makeDeck(gastosCards),
        lifeEvents:    makeDeck(lifeEvents),
        marketEvents:  makeDeck(marketEvents),
        networkCards:  makeDeck(networkCards),
      },
    });
  },

  // ── Event log ─────────────────────────────────────────────────────────────

  addLog: (message, playerId = null) => {
    const { players, round } = get();
    const player = playerId ? players.find(p => p.id === playerId) : null;
    const entry = {
      id: uid('log'),
      round,
      playerId: playerId ?? null,
      playerName: player?.name ?? null,
      playerColor: player?.color ?? null,
      message,
    };
    set(state => ({
      eventLog: [entry, ...state.eventLog].slice(0, 50),
    }));
  },

  // ── Movement ───────────────────────────────────────────────────────────────

  rollDice: () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    set({ lastDiceRoll: d1 + d2, lastDiceRolls: [d1, d2] });
    return d1 + d2;
  },

  movePlayer: (playerId, spaces) => {
    const { players } = get();
    const player = players.find(p => p.id === playerId);
    if (!player) return null;

    if (player.hasEscapedRatRace) {
      // Move on Freedom Track instead
      const newPos = (player.freedomPosition + spaces) % freedomTrackSpaces.length;
      const space = freedomTrackSpaces[newPos];
      set(state => ({
        players: patchPlayer(state.players, playerId, () => ({ freedomPosition: newPos })),
        pendingSpaceAction: { type: space.type, spaceId: newPos, isFreedomTrack: true },
      }));
      if (space.type === 'sahod_day') get().advanceInflation();
      return space;
    }

    // Rat Race track
    const oldPos = player.position;
    const newPos = (oldPos + spaces) % boardSpaces.length;
    const space = boardSpaces[newPos];
    set(state => ({
      players: patchPlayer(state.players, playerId, () => ({ position: newPos })),
      pendingSpaceAction: { type: space.type, spaceId: newPos },
      animatingToken: { active: true, playerId, currentPos: oldPos, targetPos: newPos },
    }));
    if (space.type === 'sahod_day') get().advanceInflation();
    return space;
  },

  // ── Deck management ────────────────────────────────────────────────────────

  drawCard: (deckName) => {
    const { deckStates } = get();
    const deck = deckStates[deckName];
    if (!deck) return null;

    let draw = [...deck.draw];
    let discard = [...deck.discard];

    if (draw.length === 0) {
      if (discard.length === 0) return null;
      draw = shuffle(discard);
      discard = [];
    }

    const [card, ...remaining] = draw;
    set(state => ({
      deckStates: { ...state.deckStates, [deckName]: { draw: remaining, discard } },
    }));
    return card;
  },

  discardCard: (deckName, card) => {
    set(state => {
      const deck = state.deckStates[deckName];
      if (!deck) return state;
      return {
        deckStates: {
          ...state.deckStates,
          [deckName]: { ...deck, discard: [...deck.discard, card] },
        },
      };
    });
  },

  // ── Payday ─────────────────────────────────────────────────────────────────

  collectPayday: (playerId, options = {}) => {
    const { tenantRolls = [], businessRoll = null } = options;
    const state = get();
    const player = state.players.find(p => p.id === playerId);
    if (!player) return;

    // Active income
    let activeIncome = 0;
    let businessRollUsed = null;
    if (player.jobLossRoundsRemaining > 0) {
      activeIncome = 0;
    } else if (player.variableIncome) {
      const roll = businessRoll ?? (Math.floor(Math.random() * 6) + 1);
      businessRollUsed = roll;
      const gross = roll * 10_000;
      activeIncome = gross - gross * 0.15 - player.mandatoryDeductions;
    } else {
      const salaryMult = player.sickLeaveRoundsRemaining > 0 ? player.sickLeaveMultiplier : 1;
      activeIncome = player.salary * salaryMult - player.tax - player.mandatoryDeductions;
    }

    // OFW asset risk roll
    let ofwMissedAssetId = null;
    let ofwRoll = null;
    if (player.specialMechanic === 'asset_risk_roll') {
      ofwRoll = Math.floor(Math.random() * 6) + 1;
      if (ofwRoll === 1) {
        const firstRental = player.assets.find(a => a.assetType === 'real_estate');
        if (firstRental) ofwMissedAssetId = firstRental.instanceId;
      }
    }

    // Passive income with tenant and OFW risk modifiers
    let passiveIncome = 0;
    for (const asset of player.assets) {
      const base = asset.monthlyIncome || 0;
      if (asset.instanceId === ofwMissedAssetId) {
        // OFW family mismanaged — skip this month
      } else if (asset.assetType === 'real_estate') {
        const tenantResult = tenantRolls.find(r => r.assetId === asset.instanceId);
        if (!tenantResult) {
          passiveIncome += base;
        } else if (tenantResult.roll === TENANT_VACANCY_ROLL) {
          // Vacancy — no rent
        } else if (tenantResult.roll === TENANT_DAMAGE_ROLL) {
          passiveIncome += base - TENANT_DAMAGE_COST;
        } else {
          passiveIncome += base;
        }
      } else {
        passiveIncome += base;
      }
    }

    const loanPayments = computeLoanPayments(player.liabilities);
    const totalOutflow = player.monthlyExpenses + loanPayments + player.familyExpenses;
    const inflow = activeIncome + passiveIncome;

    // Paluwagan contribution
    const pal = state.paluwagan;
    const palContrib = pal.active && pal.members.includes(player.id)
      ? pal.contributionPerRound
      : 0;

    const newCash = player.cash + inflow - totalOutflow - palContrib;

    // Credit score tracking
    let { creditScore, consecutivePayments } = player;
    const canCoverExpenses = player.cash + inflow >= totalOutflow;
    if (!canCoverExpenses) {
      creditScore = clampCredit(creditScore + CREDIT_MISSED_PAYMENT);
      consecutivePayments = 0;
    } else {
      consecutivePayments += 1;
      if (consecutivePayments >= 3) {
        creditScore = clampCredit(creditScore + CREDIT_THREE_PAYMENTS);
        consecutivePayments = 0;
      }
    }

    const jobLossRoundsRemaining  = Math.max(0, player.jobLossRoundsRemaining - 1);
    const sickLeaveRoundsRemaining = Math.max(0, player.sickLeaveRoundsRemaining - 1);
    const newTotalLoanPayments = player.totalLoanPaymentsTracker + loanPayments;

    set({
      players: patchPlayer(state.players, playerId, () => ({
        cash: newCash,
        creditScore,
        consecutivePayments,
        jobLossRoundsRemaining,
        sickLeaveRoundsRemaining,
        sickLeaveMultiplier: sickLeaveRoundsRemaining > 0 ? player.sickLeaveMultiplier : 1,
        totalLoanPaymentsTracker: newTotalLoanPayments,
      })),
      paluwagan: palContrib > 0
        ? { ...pal, pot: pal.pot + palContrib }
        : pal,
    });

    // Logging
    const net = inflow - totalOutflow - palContrib;
    get().addLog(
      `💰 Sahod Day — kita: ${fmtPhp(inflow)}, gastos: ${fmtPhp(totalOutflow)}, net: ${net >= 0 ? '+' : '-'}${fmtPhp(net)}`,
      playerId,
    );
    if (businessRollUsed !== null) {
      get().addLog(`🎲 Negosyo roll: ${businessRollUsed} → ${fmtPhp(businessRollUsed * 10_000)} bago tax`, playerId);
    }
    if (palContrib > 0) {
      get().addLog(`🤝 Paluwagan: -${fmtPhp(palContrib)} kontribusyon sa pot`, playerId);
    }
    if (ofwRoll === 1 && ofwMissedAssetId) {
      const missed = player.assets.find(a => a.instanceId === ofwMissedAssetId);
      get().addLog(`⚠️ OFW risk: pamilya mismanaged "${missed?.name ?? 'property'}" — rent missed this round 😬`, playerId);
    } else if (ofwRoll !== null && ofwRoll > 1) {
      get().addLog(`✅ OFW assets: ligtas ngayong round (D6: ${ofwRoll})`, playerId);
    }
  },

  // ── Loans ──────────────────────────────────────────────────────────────────

  takeLoan: (playerId, amount, loanName = 'Bank Loan') => {
    const { players } = get();
    const player = players.find(p => p.id === playerId);
    if (!player) return null;

    const payment = mortgagePaymentFor(amount, player.creditScore);
    const newLiability = {
      id: uid('lib'),
      name: loanName,
      balance: amount,
      payment,
      source: player.creditScore < 500 ? 'five_six' : 'bank',
      linkedAssetId: null,
    };

    set(state => ({
      players: patchPlayer(state.players, playerId, p => ({
        cash: p.cash + amount,
        creditScore: clampCredit(p.creditScore + CREDIT_NEW_LOAN),
        liabilities: [...p.liabilities, newLiability],
      })),
    }));

    get().addLog(`🏦 Hiniram: ${fmtPhp(amount)} (${newLiability.source}) — ${fmtPhp(payment)}/buwan`, playerId);
    return newLiability;
  },

  payLoan: (playerId, liabilityId, amount) => {
    const { players } = get();
    const player = players.find(p => p.id === playerId);
    if (!player || player.cash < amount) return;
    const liability = player.liabilities.find(l => l.id === liabilityId);
    if (!liability) return;

    const newBalance = Math.max(0, liability.balance - amount);
    const paidOff = newBalance === 0;

    const updatedLiabilities = paidOff
      ? player.liabilities.filter(l => l.id !== liabilityId)
      : player.liabilities.map(l =>
          l.id === liabilityId ? { ...l, balance: newBalance } : l
        );

    set(state => ({
      players: patchPlayer(state.players, playerId, p => ({
        cash: p.cash - amount,
        creditScore: paidOff
          ? clampCredit(p.creditScore + CREDIT_LOAN_PAID)
          : p.creditScore,
        liabilities: updatedLiabilities,
      })),
    }));

    if (paidOff) {
      get().addLog(`✅ Nabayaran na: "${liability.name}" — +50 credit score!`, playerId);
    } else {
      get().addLog(`💳 Binayaran: "${liability.name}" ng ${fmtPhp(amount)} (bal: ${fmtPhp(newBalance)})`, playerId);
    }
  },

  // ── Bangko space mechanics ─────────────────────────────────────────────────

  toggleInsurance: (playerId) => {
    set(state => ({
      players: patchPlayer(state.players, playerId, p => {
        const turningOn = !p.insuranceActive;
        return {
          insuranceActive: turningOn,
          monthlyExpenses: turningOn
            ? p.monthlyExpenses + INSURANCE_MONTHLY_COST
            : p.monthlyExpenses - INSURANCE_MONTHLY_COST,
        };
      }),
    }));
  },

  executeBRRRR: (playerId, assetInstanceId) => {
    const { players, marketCycle } = get();
    const player = players.find(p => p.id === playerId);
    if (!player) return { success: false, reason: 'Player not found' };

    const asset = player.assets.find(a => a.instanceId === assetInstanceId);
    if (!asset || asset.assetType !== 'real_estate') {
      return { success: false, reason: 'Asset not found or not real estate' };
    }

    const hasAppraiserCard = player.heldNetworkCards.some(c => c.effect === 'brrrr_ltv_80pct');
    const ltvPct = player.creditScore >= 800 || hasAppraiserCard
      ? BRRRR_LTV_PREMIUM
      : BRRRR_LTV_STANDARD;

    const appraisedValue = Math.round(asset.currentValue * getMarketMultiplier(marketCycle));
    const maxNewLoan = Math.round(appraisedValue * ltvPct);

    const existingMortgage = player.liabilities.find(l => l.linkedAssetId === assetInstanceId);
    const currentBalance = existingMortgage ? existingMortgage.balance : 0;
    const cashOut = maxNewLoan - currentBalance;

    if (cashOut <= 0) {
      return { success: false, reason: 'Walang cashout — property value ay hindi sapat.' };
    }

    const newPayment = mortgagePaymentFor(maxNewLoan, player.creditScore);

    set(state => {
      const p = state.players.find(pl => pl.id === playerId);
      let updatedLiabilities;
      if (existingMortgage) {
        updatedLiabilities = p.liabilities.map(l =>
          l.id === existingMortgage.id
            ? { ...l, balance: maxNewLoan, payment: newPayment }
            : l
        );
      } else {
        const newLib = {
          id: uid('lib'),
          name: `${asset.name} (BRRRR Loan)`,
          balance: maxNewLoan,
          payment: newPayment,
          source: 'brrrr',
          linkedAssetId: assetInstanceId,
        };
        updatedLiabilities = [...p.liabilities, newLib];
      }
      return {
        players: patchPlayer(state.players, playerId, () => ({
          cash: p.cash + cashOut,
          liabilities: updatedLiabilities,
          creditScore: clampCredit(p.creditScore + CREDIT_NEW_LOAN),
        })),
      };
    });

    if (hasAppraiserCard) get().useNetworkCard(playerId, 'brrrr_ltv_80pct');

    get().addLog(`🏠 BRRRR: "${asset.name}" — cashout ${fmtPhp(cashOut)} (LTV ${Math.round(ltvPct * 100)}%)`, playerId);
    return { success: true, cashOut, maxNewLoan, appraisedValue };
  },

  // ── BIR Audit ──────────────────────────────────────────────────────────────

  resolveBirAudit: (playerId, roll) => {
    const { players } = get();
    const player = players.find(p => p.id === playerId);
    if (!player) return null;

    const hasAccountant    = player.heldNetworkCards.some(c => c.effect === 'skip_bir_penalty');
    const hasTaxConsultant = player.heldNetworkCards.some(c => c.effect === 'bir_refund_plus_5000');

    let result, amount;

    if (roll <= 2) {
      if (hasAccountant) {
        result = 'pass'; amount = 0;
        get().useNetworkCard(playerId, 'skip_bir_penalty');
      } else if (hasTaxConsultant) {
        result = 'pass'; amount = 0;
        get().useNetworkCard(playerId, 'bir_refund_plus_5000');
      } else {
        result = 'penalty'; amount = BIR_PENALTY;
        set(state => ({
          players: patchPlayer(state.players, playerId, p => ({
            cash: p.cash - BIR_PENALTY,
            birPenaltyPending: false,
          })),
        }));
      }
    } else if (roll <= 4) {
      result = 'pass'; amount = 0;
    } else {
      const bonus = hasTaxConsultant ? 5000 : 0;
      amount = BIR_REFUND + bonus;
      result = 'refund';
      set(state => ({
        players: patchPlayer(state.players, playerId, p => ({
          cash: p.cash + amount,
        })),
      }));
      if (hasTaxConsultant) get().useNetworkCard(playerId, 'bir_refund_plus_5000');
    }

    const logMsg = result === 'penalty'
      ? `🧾 BIR Audit: Bayad ${fmtPhp(amount)} penalty (roll: ${roll})`
      : result === 'refund'
        ? `🎉 BIR Refund: +${fmtPhp(amount)} (roll: ${roll})`
        : `✅ BIR Audit: Malinaw ang books! (roll: ${roll})`;
    get().addLog(logMsg, playerId);

    return { result, amount };
  },

  // ── Card effects ───────────────────────────────────────────────────────────

  applyCardEffect: (playerId, card) => {
    if (!card) return;

    // ── Gastos cards ──────────────────────────────────────────────────────
    if (card.type === 'liability') {
      set(state => ({
        players: patchPlayer(state.players, playerId, p => {
          const newLib = {
            id: uid('lib'),
            name: card.name,
            balance: card.addedLiability,
            payment: card.addedMonthlyPayment,
            source: 'gastos',
            linkedAssetId: null,
          };
          return {
            liabilities: [...p.liabilities, newLib],
            creditScore: card.creditScorePenalty
              ? clampCredit(p.creditScore + card.creditScorePenalty)
              : p.creditScore,
          };
        }),
      }));
      get().addLog(`💸 Gastos: "${card.name}" — +${fmtPhp(card.addedMonthlyPayment)}/buwan utang`, playerId);
      return;
    }

    if (card.type === 'expense') {
      set(state => ({
        players: patchPlayer(state.players, playerId, p => ({
          monthlyExpenses: p.monthlyExpenses + (card.addedMonthlyExpense || 0),
        })),
      }));
      get().addLog(`💸 Gastos: "${card.name}" — +${fmtPhp(card.addedMonthlyExpense)}/buwan gastusin`, playerId);
      return;
    }

    if (card.type === 'cash') {
      const { players } = get();
      const player = players.find(p => p.id === playerId);
      if (!player) return;
      const loss = player.insuranceActive && card.mitigatedByInsurance
        ? card.insuranceCost
        : card.cashLoss;
      set(state => ({
        players: patchPlayer(state.players, playerId, p => ({ cash: p.cash - loss })),
      }));
      get().addLog(`💸 Gastos: "${card.name}" — -${fmtPhp(loss)}${card.mitigatedByInsurance && player.insuranceActive ? ' (insured!)' : ''}`, playerId);
      return;
    }

    // ── Life event cards ──────────────────────────────────────────────────

    if (card.type === 'salary_increase') {
      set(state => ({
        players: patchPlayer(state.players, playerId, p => ({
          salary: p.salary + (card.amount || 0),
        })),
      }));
      get().addLog(`📈 Life Event: "${card.name}" — +${fmtPhp(card.amount)}/buwan sahod`, playerId);
      return;
    }

    if (card.type === 'salary_multiplier') {
      set(state => ({
        players: patchPlayer(state.players, playerId, p => ({
          salary: Math.round(p.salary * (card.multiplier || 1)),
        })),
      }));
      get().addLog(`📈 Life Event: "${card.name}" — sahod x${card.multiplier}`, playerId);
      return;
    }

    if (card.type === 'cash_gain') {
      set(state => ({
        players: patchPlayer(state.players, playerId, p => ({
          cash: p.cash + (card.cashGain || 0),
        })),
      }));
      get().addLog(`🎉 Life Event: "${card.name}" — +${fmtPhp(card.cashGain)} cash`, playerId);
      return;
    }

    if (card.type === 'job_loss') {
      set(state => ({
        players: patchPlayer(state.players, playerId, () => ({
          jobLossRoundsRemaining: card.rounds || 2,
        })),
      }));
      get().addLog(`😢 Life Event: "${card.name}" — walang sahod sa ${card.rounds} rounds`, playerId);
      return;
    }

    if (card.type === 'sick_leave') {
      set(state => ({
        players: patchPlayer(state.players, playerId, () => ({
          sickLeaveRoundsRemaining: card.rounds || 3,
          sickLeaveMultiplier: card.salaryMultiplier || 0.5,
        })),
      }));
      get().addLog(`🏥 Life Event: "${card.name}" — kalahating sahod sa ${card.rounds} rounds`, playerId);
      return;
    }

    if (card.type === 'passive_income') {
      const syntheticAsset = {
        instanceId: uid('asset'),
        cardId: card.id,
        name: card.name,
        currentValue: 0,
        originalCost: 0,
        monthlyIncome: card.monthlyIncome || 0,
        assetType: 'business',
        mortgageLiabilityId: null,
        isUrban: false,
        isCondo: false,
      };
      set(state => ({
        players: patchPlayer(state.players, playerId, p => ({
          assets: [...p.assets, syntheticAsset],
        })),
      }));
      get().addLog(`💡 Life Event: "${card.name}" — +${fmtPhp(card.monthlyIncome)}/buwan passive`, playerId);
      return;
    }

    if (card.type === 'ofw_upgrade') {
      const { players } = get();
      const player = players.find(p => p.id === playerId);
      if (!player || player.professionId !== 'nurse') return;
      set(state => ({
        players: patchPlayer(state.players, playerId, () => ({
          professionId: 'ofw',
          salary: 120_000,
          tax: 0,
          monthlyExpenses: 70_000,
          familyExpenses: 20_000,
          specialMechanic: 'asset_risk_roll',
          specialAbility: null,
        })),
      }));
      get().addLog(`✈️ Life Event: "${card.name}" — naging OFW! Sahod 3x!`, playerId);
      return;
    }

    if (card.type === 'expense_reduction') {
      set(state => ({
        players: patchPlayer(state.players, playerId, p => ({
          monthlyExpenses: Math.max(0, p.monthlyExpenses - (card.reducedMonthlyExpense || 0)),
        })),
      }));
      get().addLog(`📉 Life Event: "${card.name}" — -${fmtPhp(card.reducedMonthlyExpense)}/buwan gastusin`, playerId);
      return;
    }

    if (card.type === 'income_loss') {
      set(state => {
        const player = state.players.find(p => p.id === playerId);
        if (!player) return state;
        const target = player.assets.find(
          a => a.monthlyIncome === (card.removedMonthlyIncome || 0) && a.assetType !== 'real_estate'
        );
        if (!target) return state;
        return {
          players: patchPlayer(state.players, playerId, p => ({
            assets: p.assets.filter(a => a.instanceId !== target.instanceId),
          })),
        };
      });
      get().addLog(`📉 Life Event: "${card.name}" — nawala ang income source`, playerId);
      return;
    }

    if (card.type === 'combo') {
      set(state => {
        const player = state.players.find(p => p.id === playerId);
        if (!player) return state;
        let patch = {};
        if (card.cashLoss)  patch.cash = player.cash - card.cashLoss;
        if (card.cashGain)  patch.cash = (patch.cash ?? player.cash) + card.cashGain;
        if (card.addedMonthlyExpense)   patch.monthlyExpenses = player.monthlyExpenses + card.addedMonthlyExpense;
        if (card.reducedMonthlyExpense) patch.monthlyExpenses = (patch.monthlyExpenses ?? player.monthlyExpenses) - card.reducedMonthlyExpense;
        if (card.removedLiabilityPayment) {
          const toRemove = player.liabilities.find(l => l.payment === card.removedLiabilityPayment);
          if (toRemove) patch.liabilities = player.liabilities.filter(l => l.id !== toRemove.id);
        }
        return { players: patchPlayer(state.players, playerId, () => patch) };
      });
      get().addLog(`🔀 Life Event: "${card.name}"`, playerId);
      return;
    }

    // ── Network cards (kept in hand) ──────────────────────────────────────

    if (card.effect !== undefined && card.id && card.id.startsWith('nc')) {
      set(state => ({
        players: patchPlayer(state.players, playerId, p => ({
          heldNetworkCards: [...p.heldNetworkCards, card],
        })),
      }));
      get().addLog(`🤝 Nakakuha ng Koneksyon: "${card.name}"`, playerId);
      return;
    }

    // ── Market event cards (affect all players) ────────────────────────────

    if (card.effect !== undefined) {
      get().addLog(`📊 Market Event: "${card.name}" — ${card.description}`, null);
      get()._applyMarketEvent(card);
    }
  },

  _applyMarketEvent: (card) => {
    const { players } = get();

    switch (card.effect) {
      case 'all_stocks_value_up':
      case 'all_stocks_value_down': {
        const factor = card.effect === 'all_stocks_value_up' ? 1 + card.magnitude : 1 - card.magnitude;
        set(state => ({
          players: state.players.map(p => ({
            ...p,
            assets: p.assets.map(a =>
              a.assetType === 'stock'
                ? { ...a, currentValue: Math.round(a.currentValue * factor) }
                : a
            ),
          })),
        }));
        break;
      }

      case 'all_realestate_value_up': {
        const factor = 1 + card.magnitude;
        set(state => ({
          players: state.players.map(p => ({
            ...p,
            assets: p.assets.map(a =>
              a.assetType === 'real_estate'
                ? { ...a, currentValue: Math.round(a.currentValue * factor) }
                : a
            ),
          })),
        }));
        break;
      }

      case 'urban_realestate_value_up': {
        const factor = 1 + card.magnitude;
        set(state => ({
          players: state.players.map(p => ({
            ...p,
            assets: p.assets.map(a =>
              a.assetType === 'real_estate' && a.isUrban
                ? { ...a, currentValue: Math.round(a.currentValue * factor) }
                : a
            ),
          })),
        }));
        break;
      }

      case 'provincial_realestate_up': {
        const factor = 1 + card.magnitude;
        set(state => ({
          players: state.players.map(p => ({
            ...p,
            assets: p.assets.map(a =>
              a.assetType === 'real_estate' && !a.isUrban
                ? { ...a, currentValue: Math.round(a.currentValue * factor) }
                : a
            ),
          })),
        }));
        break;
      }

      case 'condo_value_down': {
        const factor = 1 - card.magnitude;
        set(state => ({
          players: state.players.map(p => ({
            ...p,
            assets: p.assets.map(a =>
              a.isCondo
                ? { ...a, currentValue: Math.round(a.currentValue * factor) }
                : a
            ),
          })),
        }));
        break;
      }

      case 'ofw_income_bonus':
      case 'ofw_cash_gain': {
        const amount = card.amount || 0;
        set(state => ({
          players: state.players.map(p =>
            p.professionId === 'ofw' ? { ...p, cash: p.cash + amount } : p
          ),
        }));
        break;
      }

      case 'disaster_cash_loss': {
        set(state => ({
          players: state.players.map(p => {
            const loss = p.insuranceActive && card.mitigatedByInsurance
              ? card.insuranceCost
              : card.cashLoss;
            return { ...p, cash: p.cash - loss };
          }),
        }));
        break;
      }

      case 'all_loan_payments_up': {
        set(state => ({
          players: state.players.map(p => {
            const extra = Math.round(computeLoanPayments(p.liabilities) * card.magnitude);
            return { ...p, cash: p.cash - extra };
          }),
        }));
        break;
      }

      case 'variable_income_at_risk': {
        const affectedIds = players.filter(p => p.variableIncome).map(p => p.id);
        if (affectedIds.length > 0) {
          set({ pendingSpaceAction: { type: 'variable_income_at_risk', affectedIds } });
        }
        break;
      }

      case 'player_choice_stock_gain': {
        set({ pendingSpaceAction: { type: 'player_choice_stock_gain', magnitude: card.magnitude } });
        break;
      }

      case 'immediate_expense_increase': {
        const amount = card.amount || 0;
        set(state => ({
          players: state.players.map(p => ({ ...p, cash: p.cash - amount })),
        }));
        break;
      }

      case 'waive_bir_penalty': {
        set(state => ({
          players: state.players.map(p => ({ ...p, birPenaltyPending: false })),
        }));
        break;
      }

      default:
        break;
    }
  },

  applyStockGain: (playerId, assetInstanceId, magnitude) => {
    set(state => ({
      players: patchPlayer(state.players, playerId, p => ({
        assets: p.assets.map(a =>
          a.instanceId === assetInstanceId
            ? { ...a, currentValue: Math.round(a.currentValue * (1 + magnitude)) }
            : a
        ),
      })),
    }));
  },

  // ── Deal purchasing ────────────────────────────────────────────────────────

  buyDeal: (playerId, card) => {
    const { players, marketCycle } = get();
    const player = players.find(p => p.id === playerId);
    if (!player) return { success: false, reason: 'Player not found' };

    const hasContractorCard = player.heldNetworkCards.some(c => c.effect === 'rehab_cost_minus_20pct');
    const costMultiplier = getMarketMultiplier(marketCycle);
    const rawCost = card.downPayment ?? card.cost;
    const discountedCost = hasContractorCard ? Math.round(rawCost * 0.8) : rawCost;
    const adjustedCost = Math.round(discountedCost * costMultiplier);

    if (player.cash < adjustedCost) {
      return { success: false, reason: `Hindi sapat ang cash. Kailangan: ₱${adjustedCost.toLocaleString()}` };
    }

    const mortgageAmount = card.mortgage || 0;
    const mortgageLiabilityId = mortgageAmount > 0 ? uid('lib') : null;

    const newAsset = {
      instanceId: uid('asset'),
      cardId: card.id,
      name: card.name,
      currentValue: card.cost,
      originalCost: card.cost,
      monthlyIncome: card.monthlyIncome || 0,
      assetType: card.assetType,
      mortgageLiabilityId,
      isUrban: /QC|Quezon|Manila|Caloocan|Makati|BGC|Taguig|Marikina|Mandaluyong|Valenzuela|Binondo|Malate/i.test(card.name),
      isCondo: /condo/i.test(card.name),
    };

    const newMortgage = mortgageAmount > 0 ? {
      id: mortgageLiabilityId,
      name: `${card.name} (Mortgage)`,
      balance: mortgageAmount,
      payment: card.mortgagePayment ?? mortgagePaymentFor(mortgageAmount, player.creditScore),
      source: 'deal',
      linkedAssetId: newAsset.instanceId,
    } : null;

    set(state => ({
      players: patchPlayer(state.players, playerId, p => ({
        cash: p.cash - adjustedCost,
        assets: [...p.assets, newAsset],
        liabilities: newMortgage ? [...p.liabilities, newMortgage] : p.liabilities,
        creditScore: newMortgage ? clampCredit(p.creditScore + CREDIT_NEW_LOAN) : p.creditScore,
      })),
    }));

    if (hasContractorCard) get().useNetworkCard(playerId, 'rehab_cost_minus_20pct');

    get().addLog(`🏠 Binili ang deal: "${card.name}" — ${fmtPhp(adjustedCost)} pababa`, playerId);
    return { success: true };
  },

  // ── Network card use ───────────────────────────────────────────────────────

  useNetworkCard: (playerId, effectKey) => {
    set(state => ({
      players: patchPlayer(state.players, playerId, p => {
        const idx = p.heldNetworkCards.findIndex(c => c.effect === effectKey);
        if (idx === -1) return {};
        const updated = [...p.heldNetworkCards];
        updated.splice(idx, 1);
        return { heldNetworkCards: updated };
      }),
    }));
  },

  useHrRecruiter: (playerId) => {
    set(state => ({
      players: patchPlayer(state.players, playerId, p => ({
        salary: p.salary + 5000,
        heldNetworkCards: p.heldNetworkCards.filter(c => c.effect !== 'salary_plus_5000'),
      })),
    }));
    get().addLog('📈 HR Recruiter: +₱5,000/buwan sa sahod!', playerId);
  },

  // ── Paluwagan ──────────────────────────────────────────────────────────────

  activatePaluwagan: () => {
    set(state => ({
      paluwagan: {
        ...state.paluwagan,
        active: true,
        members: state.players.map(p => p.id),
      },
    }));
    get().addLog('🤝 Paluwagan ay sinimulan! Lahat ng players — ₱10,000/round contribution sa pot', null);
  },

  // ── Inflation engine ───────────────────────────────────────────────────────

  advanceInflation: () => {
    let triggered = false;
    set(state => {
      const newCounter = state.inflationCounter + 1;
      if (newCounter < INFLATION_TRIGGER_COUNT) return { inflationCounter: newCounter };
      triggered = true;
      return {
        inflationCounter: 0,
        players: state.players.map(p => ({
          ...p,
          monthlyExpenses: p.monthlyExpenses + INFLATION_AMOUNT,
        })),
      };
    });
    if (triggered) {
      get().addLog(`📈 Inflation! Lahat ng players: +${fmtPhp(INFLATION_AMOUNT)}/buwan expenses`, null);
    }
  },

  // ── Market cycle ───────────────────────────────────────────────────────────

  changeMarketCycle: (newCycle) => {
    set({ marketCycle: newCycle, roundsSinceLastMarketChange: 0 });
    get().addLog(`📊 Market cycle nagbago: ${newCycle.toUpperCase()} Market`, null);
  },

  // ── Win condition ──────────────────────────────────────────────────────────

  checkWinCondition: (playerId) => {
    const { players } = get();
    const player = players.find(p => p.id === playerId);
    if (!player) return { escapedRatRace: false, wonGame: false };

    const totalPassiveIncome = computePassiveIncome(player.assets);
    const loanPayments       = computeLoanPayments(player.liabilities);
    const totalExpenses      = player.monthlyExpenses + loanPayments + player.familyExpenses;
    const escapedRatRace     = totalPassiveIncome >= totalExpenses;
    const netWorth           = computeNetWorth(player);
    const wonGame            = netWorth >= WIN_NET_WORTH_TARGET || totalPassiveIncome >= WIN_PASSIVE_INCOME_TARGET;

    if (escapedRatRace && !player.hasEscapedRatRace) {
      set(state => ({
        players: patchPlayer(state.players, playerId, () => ({
          hasEscapedRatRace: true,
          freedomPosition: 0,
        })),
      }));
      get().addLog(`🎉 ${player.name} NAKATAKAS sa Rat Race! Passive income >= expenses!`, playerId);
    }

    if (wonGame && !get().winner) {
      set({ winner: playerId, phase: 'ended' });
      get().addLog(`🏆 ${player.name} ay NANALO! ${netWorth >= WIN_NET_WORTH_TARGET ? 'Net Worth ≥ ₱10M' : 'Passive Income ≥ ₱100K'}!`, playerId);
    }

    return { escapedRatRace, wonGame };
  },

  // ── Turn management ────────────────────────────────────────────────────────

  nextTurn: () => {
    let paluwanPayoutInfo    = null;
    let newMarketCycleValue  = null;

    set(state => {
      const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
      const isNewRound = nextIndex === 0;
      const newRound = isNewRound ? state.round + 1 : state.round;
      const newRoundsSince = isNewRound
        ? state.roundsSinceLastMarketChange + 1
        : state.roundsSinceLastMarketChange;

      let newMarketCycle = state.marketCycle;
      let resetRoundsSince = newRoundsSince;
      if (isNewRound && newRoundsSince >= 6 && Math.random() < 0.20) {
        const cycles = ['bear', 'normal', 'bull'].filter(c => c !== state.marketCycle);
        newMarketCycle = cycles[Math.floor(Math.random() * cycles.length)];
        resetRoundsSince = 0;
        newMarketCycleValue = newMarketCycle;
      }

      // Paluwagan payout at end of each round
      let newPlayers   = state.players;
      let newPaluwagan = state.paluwagan;
      if (isNewRound && state.paluwagan.active && state.paluwagan.pot > 0 && state.paluwagan.members.length > 0) {
        const recipientIdx = state.paluwagan.nextRecipientIndex % state.paluwagan.members.length;
        const recipientId  = state.paluwagan.members[recipientIdx];
        const pot          = state.paluwagan.pot;
        newPlayers = state.players.map(p =>
          p.id === recipientId ? { ...p, cash: p.cash + pot } : p
        );
        const recipientName = state.players.find(p => p.id === recipientId)?.name ?? 'Unknown';
        newPaluwagan = {
          ...state.paluwagan,
          pot: 0,
          nextRecipientIndex: (recipientIdx + 1) % state.paluwagan.members.length,
        };
        paluwanPayoutInfo = { recipientName, amount: pot };
      }

      return {
        currentPlayerIndex: nextIndex,
        round: newRound,
        marketCycle: newMarketCycle,
        roundsSinceLastMarketChange: resetRoundsSince,
        lastDiceRoll: null,
        lastDiceRolls: [null, null],
        pendingSpaceAction: null,
        players: newPlayers,
        paluwagan: newPaluwagan,
        animationComplete: false,
        playerJustLanded: false,
      };
    });

    if (newMarketCycleValue) {
      get().addLog(`📊 Market cycle nagbago: ${newMarketCycleValue.toUpperCase()} Market`, null);
    }
    if (paluwanPayoutInfo) {
      get().addLog(`🤝 Paluwagan Payout: ${fmtPhp(paluwanPayoutInfo.amount)} binayad kay ${paluwanPayoutInfo.recipientName}!`, null);
    }
  },

  advanceAnimPos: () => {
    set(state => {
      const anim = state.animatingToken;
      if (!anim.active) return state;
      const nextPos = (anim.currentPos + 1) % 24;
      return { animatingToken: { ...anim, currentPos: nextPos } };
    });
  },

  endTokenAnimation: () => {
    set({ animatingToken: { active: false, playerId: null, currentPos: null, targetPos: null }, animationComplete: true, playerJustLanded: true });
  },

  clearPendingAction: () => set({ pendingSpaceAction: null, animationComplete: false, playerJustLanded: false }),

  resetGame: () => set({ ...INITIAL_STATE }),

  // ── Convenience selectors ──────────────────────────────────────────────────

  getCurrentPlayer: () => {
    const { players, currentPlayerIndex } = get();
    return players[currentPlayerIndex] ?? null;
  },

  getPlayer: (playerId) => {
    return get().players.find(p => p.id === playerId) ?? null;
  },
}));
