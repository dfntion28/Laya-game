import { useState } from 'react';
import { useGame } from '../store/gameStore.js';
import { professions, difficulty } from '../data/professions.js';
import { dreams } from '../data/cards.js';
import { fmt } from '../engine/engine.js';
import { playerTone } from '../lib/theme.js';
import { PLAYER_COLORS } from '../data/constants.js';

const BOT_NAMES = ['Aling Nena', 'Mang Tomas', 'Kuya Jun', 'Ate Joy', 'Tito Boy', 'Lola Remy'];

function pickN(arr, n) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

function monthly(prof) {
  const salary = prof.variable ? prof.variable[1] * 3.5 : prof.salary;
  const loans = prof.liabilities.reduce((s, l) => s + l.payment, 0);
  const exp = prof.tax + prof.living + (prof.family || 0) + loans;
  return { salary, exp, cf: salary - exp };
}

function Stars({ n }) {
  return <span className="text-[11px] text-amber-300">{'★'.repeat(n)}<span className="text-white/20">{'★'.repeat(3 - n)}</span></span>;
}

function Title({ onStart }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden bg-fiesta px-6 text-center">
      <div className="absolute inset-x-0 top-10 flex justify-center gap-6 text-4xl opacity-30">
        <span className="animate-float">💰</span><span className="animate-float [animation-delay:0.5s]">🏢</span><span className="animate-float [animation-delay:1s]">📈</span>
      </div>
      <div>
        <div className="text-7xl animate-float">🐀</div>
        <h1 className="shine-text text-outline mt-2 animate-shine font-display text-8xl drop-shadow-[0_6px_0_#2b1740] font-bold tracking-wider">LAYA</h1>
        <p className="mt-1 font-display text-lg font-semibold text-night">Takasan ang Rat Race. Abutin ang Pangarap.</p>
      </div>
      <p className="max-w-sm rounded-2xl bg-night/70 p-3 text-sm text-cream">Isang Pinoy financial freedom board game na hango sa aral ng <i>Rich Dad Poor Dad</i>. Bumili ng assets, iwasan ang utang na walang kwenta, at palakihin ang passive income mo.</p>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <button type="button" onClick={() => onStart('solo')} className="animate-glow rounded-2xl bg-gradient-to-b from-amber-300 to-gold-deep btn-3d py-4 font-display text-xl font-bold text-night active:scale-95">▶ Solo</button>
        <button type="button" onClick={() => onStart('bots')} className="rounded-2xl bg-night py-3.5 font-display text-lg font-semibold text-cream shadow-[0_5px_0_#140a22] active:translate-y-[3px] active:shadow-[0_2px_0_#140a22]">🤖 Laban sa Bots</button>
        <button type="button" onClick={() => onStart('pass')} className="rounded-2xl bg-night py-3.5 font-display text-lg font-semibold text-cream shadow-[0_5px_0_#140a22] active:translate-y-[3px] active:shadow-[0_2px_0_#140a22]">📱 Pass & Play (2–4)</button>
      </div>
    </div>
  );
}

function Roster({ slots, setSlots, onNext, onBack }) {
  const update = (i, patch) => setSlots(slots.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 py-6">
      <button type="button" onClick={onBack} className="self-start text-sm font-semibold text-night">← Bumalik</button>
      <h2 className="font-display text-3xl font-bold text-night">Mga Manlalaro</h2>
      {slots.map((s, i) => (
        <div key={i} className={`flex items-center gap-2 rounded-2xl bg-panel card-3d p-3 ring-1 ${playerTone[PLAYER_COLORS[i]].ring}`}>
          <span className={`size-4 shrink-0 rounded-full ${playerTone[PLAYER_COLORS[i]].bg}`} />
          <input value={s.name} maxLength={14} onChange={e => update(i, { name: e.target.value })} className="min-w-0 flex-1 rounded-lg bg-white/5 px-3 py-2.5 text-base ring-1 ring-white/10 focus:outline-none focus:ring-gold" />
          <button type="button" onClick={() => update(i, { isBot: !s.isBot, name: !s.isBot ? BOT_NAMES[i] : `Player ${i + 1}` })} className="rounded-lg bg-white/10 px-3 py-2.5 text-sm">{s.isBot ? '🤖 Bot' : '🙂 Tao'}</button>
          {slots.length > 1 && <button type="button" onClick={() => setSlots(slots.filter((_, j) => j !== i))} className="px-2 text-muted">✕</button>}
        </div>
      ))}
      {slots.length < 4 && (
        <button type="button" onClick={() => setSlots([...slots, { name: BOT_NAMES[slots.length], isBot: true }])} className="rounded-2xl border-2 border-dashed border-night/50 py-3 text-sm font-semibold text-night">+ Magdagdag</button>
      )}
      <span className="flex-1" />
      <button type="button" disabled={!slots.some(s => !s.isBot)} onClick={onNext} className="rounded-2xl bg-gradient-to-b from-amber-300 to-gold-deep btn-3d py-4 font-display text-xl font-bold text-night active:scale-95 disabled:opacity-40">Susunod →</button>
    </div>
  );
}

function Draft({ slot, offer, dreamOffer, onReroll, rerolled, onDone }) {
  const [prof, setProf] = useState(null);
  const [dream, setDream] = useState(null);
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 px-4 py-6">
      <div>
        <p className="text-sm font-medium text-night/80">{slot.name}</p>
        <h2 className="font-display text-3xl font-bold text-night">Pumili ng Propesyon</h2>
        <p className="text-sm font-medium text-night/80">Iba-iba ang simula. Ang mataas na sahod ay hindi laging madaling makalaya.</p>
      </div>
      <div className="flex flex-col gap-2">
        {offer.map(id => {
          const p = professions.find(x => x.id === id);
          const m = monthly(p);
          const on = prof === id;
          return (
            <button key={id} type="button" onClick={() => setProf(id)} className={`rounded-2xl p-3 text-left ring-2 transition active:scale-[0.98] ${on ? 'bg-gold/15 ring-gold' : 'bg-panel ring-line'}`}>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{p.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2"><span className="font-display text-lg font-bold">{p.name}</span><Stars n={difficulty[p.id]} /></div>
                  <div className="text-xs text-muted">{p.en}</div>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[11px]">
                <div className="rounded-lg bg-white/5 py-1"><div className="text-muted">Kita</div><div className="font-semibold">{fmt(m.salary)}{p.variable ? '~' : ''}</div></div>
                <div className="rounded-lg bg-white/5 py-1"><div className="text-muted">Gastos</div><div className="font-semibold text-bad">{fmt(m.exp)}</div></div>
                <div className="rounded-lg bg-white/5 py-1"><div className="text-muted">Cash</div><div className="font-semibold">{fmt(p.cash)}</div></div>
              </div>
              <div className="mt-2 text-xs text-violet-200">✨ {p.trait}</div>
            </button>
          );
        })}
        {!rerolled && <button type="button" onClick={onReroll} className="self-center text-sm font-semibold text-night underline">🔀 Ibang pagpipilian (isang beses)</button>}
      </div>
      <div>
        <h2 className="font-display text-2xl font-bold text-night">Ang Pangarap Mo</h2>
        <p className="text-sm font-medium text-night/80">Ito ang bibilhin mo sa Fast Track para manalo.</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {dreamOffer.map(id => {
          const d = dreams.find(x => x.id === id);
          const on = dream === id;
          return (
            <button key={id} type="button" onClick={() => setDream(id)} className={`flex flex-col items-center gap-1 rounded-2xl p-2.5 text-center ring-2 transition active:scale-95 ${on ? 'bg-fuchsia-400/15 ring-fuchsia-400' : 'bg-panel ring-line'}`}>
              <span className="text-3xl">{d.emoji}</span>
              <span className="font-display text-xs font-semibold leading-tight">{d.name}</span>
              <span className="text-[10px] text-muted">{fmt(d.cost)}</span>
            </button>
          );
        })}
      </div>
      <button type="button" disabled={!prof || !dream} onClick={() => onDone(prof, dream)} className="sticky bottom-4 rounded-2xl bg-gradient-to-b from-amber-300 to-gold-deep btn-3d py-4 font-display text-xl font-bold text-night shadow-xl active:scale-95 disabled:opacity-40">
        Simulan →
      </button>
    </div>
  );
}

export default function SetupScreen() {
  const newGame = useGame(s => s.newGame);
  const [stage, setStage] = useState('title');
  const [slots, setSlots] = useState([{ name: 'Ikaw', isBot: false }]);
  const [draftIdx, setDraftIdx] = useState(0);
  const [picks, setPicks] = useState([]);
  const [offer, setOffer] = useState({ prof: [], dream: [], rerolled: false });

  const humans = slots.map((s, i) => ({ ...s, i })).filter(s => !s.isBot);

  const dealOffer = () => setOffer({ prof: pickN(professions, 3).map(p => p.id), dream: pickN(dreams, 3).map(d => d.id), rerolled: false });

  const start = mode => {
    if (mode === 'solo') {
      setSlots([{ name: 'Ikaw', isBot: false }]);
      setPicks([]);
      setDraftIdx(0);
      dealOffer();
      setStage('draft');
      return;
    }
    setSlots(mode === 'bots'
      ? [{ name: 'Ikaw', isBot: false }, { name: BOT_NAMES[1], isBot: true }, { name: BOT_NAMES[2], isBot: true }]
      : [{ name: 'Player 1', isBot: false }, { name: 'Player 2', isBot: false }]);
    setStage('roster');
  };

  const finish = allPicks => {
    const players = slots.map((s, i) => {
      const pick = allPicks.find(x => x.i === i);
      if (pick) return { name: s.name.trim() || `Player ${i + 1}`, isBot: false, professionId: pick.prof, dreamId: pick.dream };
      return { name: s.name.trim() || BOT_NAMES[i], isBot: true, professionId: pickN(professions, 1)[0].id, dreamId: pickN(dreams, 1)[0].id };
    });
    newGame({ players });
  };

  if (stage === 'title') return <Title onStart={start} />;
  if (stage === 'roster') {
    return (
      <Roster
        slots={slots}
        setSlots={setSlots}
        onBack={() => setStage('title')}
        onNext={() => { setPicks([]); setDraftIdx(0); dealOffer(); setStage('draft'); }}
      />
    );
  }
  const slot = humans[draftIdx];
  return (
    <Draft
      key={draftIdx}
      slot={slot}
      offer={offer.prof}
      dreamOffer={offer.dream}
      rerolled={offer.rerolled}
      onReroll={() => setOffer({ prof: pickN(professions, 3).map(p => p.id), dream: pickN(dreams, 3).map(d => d.id), rerolled: true })}
      onDone={(prof, dream) => {
        const next = [...picks, { i: slot.i, prof, dream }];
        if (draftIdx + 1 < humans.length) {
          setPicks(next);
          setDraftIdx(draftIdx + 1);
          dealOffer();
        } else {
          finish(next);
        }
      }}
    />
  );
}
