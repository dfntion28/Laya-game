import { useState } from 'react';
import { useGameStore } from '../store/gameStore.js';
import { professions } from '../data/professions.js';

const PLAYER_COLORS = [
  { ring: 'ring-amber-400', bg: 'bg-amber-400', text: 'text-amber-400', badge: 'bg-amber-900/60 border-amber-600 text-amber-300', label: 'Amber'  },
  { ring: 'ring-sky-400',   bg: 'bg-sky-400',   text: 'text-sky-400',   badge: 'bg-sky-900/60 border-sky-600 text-sky-300',       label: 'Sky'    },
  { ring: 'ring-rose-400',  bg: 'bg-rose-400',  text: 'text-rose-400',  badge: 'bg-rose-900/60 border-rose-600 text-rose-300',     label: 'Rose'   },
  { ring: 'ring-violet-400',bg: 'bg-violet-400',text: 'text-violet-400',badge: 'bg-violet-900/60 border-violet-600 text-violet-300',label: 'Violet' },
];

const SPECIAL_DESC = {
  ofw_upgrade:                'Maaaring maging OFW — 3× sahod sa mid-game!',
  pension_bonus_round24:      'Nakaka-bonus na pension sa round 24.',
  asset_risk_roll:            'Asset risk roll sa bawat Sahod Day (OFW mechanic).',
  education_card_discount_20pct: '-20% discount sa education-related deals.',
};

function getSpecial(prof) {
  return SPECIAL_DESC[prof.specialAbility]
    ?? SPECIAL_DESC[prof.specialMechanic]
    ?? SPECIAL_DESC[prof.bonus]
    ?? null;
}

const php = n =>
  (n ?? 0).toLocaleString('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });

function ProfCard({ prof, selected, onClick }) {
  const special = getSpecial(prof);
  return (
    <button
      onClick={onClick}
      className={`
        text-left p-3 rounded-xl border-2 transition-all duration-150 flex flex-col gap-1
        ${selected
          ? 'border-blue-500 bg-blue-900/40 shadow-lg shadow-blue-900/30'
          : 'border-slate-700 bg-slate-800/60 hover:border-slate-500 hover:bg-slate-800'
        }
      `}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl leading-none">{prof.emoji}</span>
        <span className="font-bold text-white text-sm leading-tight">{prof.name}</span>
        {selected && <span className="ml-auto text-blue-400 text-lg leading-none">✓</span>}
      </div>
      <div className="flex gap-3 font-mono text-xs text-slate-400 mt-0.5">
        <span>Sahod: <span className="text-green-400">{php(prof.salary || 0)}</span></span>
        <span>Cash: <span className="text-emerald-400">{php(prof.startingCash)}</span></span>
      </div>
      {special && (
        <p className="text-[10px] text-blue-300/80 leading-tight mt-0.5 italic">{special}</p>
      )}
    </button>
  );
}

export default function SetupScreen() {
  const initGame = useGameStore(s => s.initGame);

  const [step, setStep] = useState(1);
  const [playerCount, setPlayerCount] = useState(2);
  const [setups, setSetups] = useState([
    { name: '', professionId: null },
    { name: '', professionId: null },
    { name: '', professionId: null },
    { name: '', professionId: null },
  ]);

  const activeSetups = setups.slice(0, playerCount);
  const allValid = activeSetups.every(s => s.name.trim() && s.professionId);

  const updateName = (i, name) =>
    setSetups(prev => prev.map((s, idx) => idx === i ? { ...s, name } : s));

  const updateProf = (i, professionId) =>
    setSetups(prev => prev.map((s, idx) => idx === i ? { ...s, professionId } : s));

  const handleStart = () => {
    if (!allValid) return;
    initGame(activeSetups.map((s, i) => ({
      name: s.name.trim(),
      professionId: s.professionId,
      color: PLAYER_COLORS[i].label.toLowerCase(),
    })));
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] flex flex-col items-center justify-start py-10 px-4 overflow-y-auto">

      {/* Title */}
      <div className="mb-8 text-center">
        <h1 className="text-white text-4xl font-black font-mono tracking-tight">LAYA</h1>
        <p className="text-slate-400 font-mono text-sm mt-1">Filipino Financial Freedom Board Game</p>
      </div>

      {/* Step 1: Player count */}
      {step === 1 && (
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
          <h2 className="text-slate-300 font-mono text-lg font-bold">Ilang Players?</h2>
          <div className="flex gap-4">
            {[2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => { setPlayerCount(n); setStep(2); }}
                className="w-20 h-20 rounded-2xl border-2 border-slate-600 bg-slate-800 hover:border-blue-500 hover:bg-slate-700 text-white font-black text-3xl font-mono transition-all"
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-slate-600 font-mono text-xs">Pumili ng bilang ng manlalaro</p>
        </div>
      )}

      {/* Step 2: Player setup */}
      {step === 2 && (
        <div className="w-full max-w-4xl flex flex-col gap-6">

          {/* Back */}
          <button
            onClick={() => setStep(1)}
            className="self-start text-slate-500 hover:text-slate-300 font-mono text-xs flex items-center gap-1 transition-colors"
          >
            ← Bumalik
          </button>

          {/* One section per player */}
          {activeSetups.map((setup, i) => {
            const color = PLAYER_COLORS[i];
            return (
              <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 flex flex-col gap-4">

                {/* Player header */}
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full ${color.bg} shrink-0`} />
                  <span className={`font-black font-mono text-sm uppercase tracking-widest ${color.text}`}>
                    Player {i + 1}
                  </span>
                </div>

                {/* Name input */}
                <input
                  type="text"
                  maxLength={20}
                  placeholder={`Pangalan ng Player ${i + 1}`}
                  value={setup.name}
                  onChange={e => updateName(i, e.target.value)}
                  className={`
                    bg-slate-900 border-2 rounded-xl px-4 py-2.5 text-white font-mono text-sm
                    placeholder-slate-600 outline-none transition-all
                    ${setup.name.trim() ? 'border-slate-600' : 'border-slate-700'}
                    focus:border-blue-500
                  `}
                />

                {/* Profession picker */}
                <div>
                  <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mb-2">
                    Piliin ang Propesyon
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {professions.map(prof => (
                      <ProfCard
                        key={prof.id}
                        prof={prof}
                        selected={setup.professionId === prof.id}
                        onClick={() => updateProf(i, prof.id)}
                      />
                    ))}
                  </div>
                </div>

              </div>
            );
          })}

          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={!allValid}
            className={`w-full py-4 rounded-2xl font-black font-mono text-lg tracking-wide transition-all ${
              allValid
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/40'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {allValid ? '🎲 Simulan ang Laro!' : 'Kumpletuhin ang setup ng lahat ng players'}
          </button>

          {/* Rule summary */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 font-mono text-xs text-slate-400 leading-relaxed">
            <p className="text-slate-300 font-bold mb-1 text-sm">📖 Paano Manalo</p>
            <p>Ang layunin: gawing mas malaki ang iyong <span className="text-emerald-400 font-bold">passive income</span> kaysa sa iyong monthly expenses. Kapag nangyari ito, nakatakas ka sa Rat Race at makakalipat sa Freedom Track.</p>
            <p className="mt-1">Sa Freedom Track, manalo ka kung ang iyong <span className="text-yellow-400 font-bold">net worth ay umabot sa ₱10,000,000</span> o ang iyong <span className="text-yellow-400 font-bold">passive income ay umabot sa ₱100,000/buwan</span>.</p>
          </div>

        </div>
      )}

    </div>
  );
}
