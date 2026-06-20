import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore.js';

const DECK_FOR_SPACE = {
  maliit_deal:        'smallDeals',
  malaking_deal:      'bigDeals',
  gastos:             'gastosCards',
  pangyayari_buhay:   'lifeEvents',
  pangyayari_merkado: 'marketEvents',
  koneksyon:          'networkCards',
};

const DEAL_TYPES = new Set(['maliit_deal', 'malaking_deal']);

const ASSET_LESSONS = {
  real_estate: 'Ang real estate ay nagbibigay ng passive income na tumutulong sa iyo na makalaya sa Rat Race.',
  stock:       'Ang dividends ay kita na hindi nangangailangan ng iyong oras.',
  business:    'Ang negosyo ay maaaring maging asset kung hindi ka na personally nagtatrabaho doon.',
  lending:     'Ang pagpapautang sa tamang paraan ay isa ring paraan ng passive income.',
  land:        'Ang lupa ay nagpapahalaga sa paglipas ng panahon — ito ay limitado at hindi nagagawa.',
  agriculture: 'Ang pagpapaupa ng lupang sakahan ay nagbibigay ng passive income habang nagagamit ng iba ang lupa.',
};

const php = n =>
  (n ?? 0).toLocaleString('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });

function EffectLine({ label, value, positive }) {
  return (
    <div className="flex justify-between gap-6 text-sm font-mono">
      <span className="text-slate-400">{label}</span>
      <span className={`font-bold ${positive ? 'text-green-400' : 'text-red-400'}`}>{value}</span>
    </div>
  );
}

function CardEffects({ card }) {
  const lines = [];
  if (card.cost)              lines.push({ label: 'Halaga',           value: php(card.cost),              positive: false });
  if (card.downPayment)       lines.push({ label: 'Down Payment',     value: php(card.downPayment),       positive: false });
  if (card.mortgage)          lines.push({ label: 'Mortgage',         value: php(card.mortgage),          positive: false });
  if (card.mortgagePayment)   lines.push({ label: 'Mortgage/buwan',   value: `−${php(card.mortgagePayment)}`, positive: false });
  if (card.monthlyIncome)     lines.push({ label: 'Income/buwan',     value: `+${php(card.monthlyIncome)}`,   positive: true  });
  if (card.cashLoss)          lines.push({ label: 'Cash Loss',        value: `−${php(card.cashLoss)}`,        positive: false });
  if (card.addedLiability)    lines.push({ label: 'Bagong Utang',     value: php(card.addedLiability),    positive: false });
  if (card.addedMonthlyPayment) lines.push({ label: 'Payment/buwan',  value: `+${php(card.addedMonthlyPayment)}`, positive: false });
  if (card.addedMonthlyExpense) lines.push({ label: 'Gastos/buwan',   value: `+${php(card.addedMonthlyExpense)}`, positive: false });
  if (card.cashGain)          lines.push({ label: 'Cash Gain',        value: `+${php(card.cashGain)}`,        positive: true  });
  if (card.amount && card.type === 'salary_increase')
    lines.push({ label: 'Sahod Dagdag/buwan', value: `+${php(card.amount)}`, positive: true });

  if (!lines.length) return null;
  return (
    <div className="bg-slate-900 rounded-lg p-3 mt-3 flex flex-col gap-1.5 border border-slate-700">
      {lines.map(l => <EffectLine key={l.label} {...l} />)}
    </div>
  );
}

export default function CardModal({ onClose }) {
  const pendingSpaceAction = useGameStore(s => s.pendingSpaceAction);
  const players            = useGameStore(s => s.players);
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
  const drawCard           = useGameStore(s => s.drawCard);
  const discardCard        = useGameStore(s => s.discardCard);
  const applyCardEffect    = useGameStore(s => s.applyCardEffect);
  const buyDeal            = useGameStore(s => s.buyDeal);

  const [card, setCard] = useState(null);
  const [buyError, setBuyError] = useState(null);
  const drawnRef = useRef(false);

  const spaceType = pendingSpaceAction?.type;
  const deckName  = DECK_FOR_SPACE[spaceType];
  const currentPlayer = players[currentPlayerIndex];
  const isDeal = DEAL_TYPES.has(spaceType);

  useEffect(() => {
    if (drawnRef.current || !deckName) return;
    drawnRef.current = true;
    const drawn = drawCard(deckName);
    setCard(drawn);
  }, []);

  const handleAccept = () => {
    if (!card || !currentPlayer) return;
    if (isDeal) {
      const result = buyDeal(currentPlayer.id, card);
      if (!result.success) {
        setBuyError(result.reason);
        return;
      }
    } else {
      applyCardEffect(currentPlayer.id, card);
    }
    if (deckName && card) discardCard(deckName, card);
    onClose();
  };

  const handlePass = () => {
    if (deckName && card) discardCard(deckName, card);
    onClose();
  };

  const canAfford = !isDeal || !card ||
    (currentPlayer?.cash ?? 0) >= (card.downPayment ?? card.cost ?? 0);

  const SPACE_LABELS = {
    maliit_deal: 'Maliit na Deal',
    malaking_deal: 'Malaking Deal',
    gastos: 'Gastos Card',
    pangyayari_buhay: 'Pangyayari sa Buhay',
    pangyayari_merkado: 'Pangyayari sa Merkado',
    koneksyon: 'Koneksyon Card',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="bg-slate-800 border-2 border-slate-600 rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-slate-700 px-5 py-3 flex items-center justify-between">
          <span className="text-slate-300 font-mono text-xs uppercase tracking-widest">
            {SPACE_LABELS[spaceType] ?? spaceType}
          </span>
          {currentPlayer && (
            <span className="text-slate-400 font-mono text-xs">
              {currentPlayer.name} · {php(currentPlayer.cash)}
            </span>
          )}
        </div>

        {/* Card content */}
        <div className="p-5 flex-1">
          {!card ? (
            <div className="text-slate-500 font-mono text-sm text-center py-8">
              Kumukuha ng card...
            </div>
          ) : (
            <>
              <h2 className="text-white font-bold text-lg leading-tight mb-2">{card.name}</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{card.description}</p>
              <CardEffects card={card} />

              {/* Financial lesson for deal cards */}
              {isDeal && card.assetType && ASSET_LESSONS[card.assetType] && (
                <div className="mt-3 bg-blue-950/60 border border-blue-700/40 rounded-lg px-3 py-2.5">
                  <p className="text-blue-400 font-mono text-[10px] uppercase tracking-wider mb-1">Ano ang matututunan mo dito?</p>
                  <p className="text-blue-200 text-xs leading-relaxed">{ASSET_LESSONS[card.assetType]}</p>
                </div>
              )}

              {/* Affordability warning for deals */}
              {isDeal && !canAfford && (
                <div className="mt-3 bg-red-950 border border-red-700 rounded-lg px-3 py-2 text-red-300 font-mono text-xs">
                  ⚠ Hindi sapat ang cash para sa down payment na {php(card.downPayment ?? card.cost)}.
                </div>
              )}

              {/* Insurance mitigation note */}
              {card.mitigatedByInsurance && currentPlayer?.insuranceActive && (
                <div className="mt-3 bg-green-950 border border-green-700 rounded-lg px-3 py-2 text-green-300 font-mono text-xs">
                  ✓ May insurance — babayaran lang {php(card.insuranceCost)} sa halip na {php(card.cashLoss)}.
                </div>
              )}

              {/* Buy error */}
              {buyError && (
                <div className="mt-3 bg-red-950 border border-red-700 rounded-lg px-3 py-2 text-red-300 font-mono text-xs">
                  {buyError}
                </div>
              )}
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={handleAccept}
            disabled={!card || (isDeal && !canAfford)}
            className={`flex-1 py-3 rounded-lg font-mono font-bold text-sm transition-all ${
              !card || (isDeal && !canAfford)
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isDeal ? '🤝 Tanggapin (Bilhin)' : '✓ Tanggapin'}
          </button>

          {isDeal && (
            <button
              onClick={handlePass}
              disabled={!card}
              className="flex-1 py-3 rounded-lg font-mono font-bold text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all"
            >
              Pasa
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
