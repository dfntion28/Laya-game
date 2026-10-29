import { useState } from 'react';
import { useGame } from '../store/gameStore.js';
import { professions, difficulty } from '../data/professions.js';
import { dreams } from '../data/cards.js';
import { fmt } from '../engine/engine.js';
import { BOT_LEVELS, BOT_STYLES } from '../engine/bot.js';
import { PLAYER_COLORS } from '../data/constants.js';
import { Btn, Panel } from './Ui.jsx';
import Pawn from './Pawn.jsx';
import { SettingsList } from './TopBar.jsx';

const BOT_NAMES = ['Aling Nena', 'Mang Tomas', 'Kuya Jun', 'Ate Joy', 'Tito Boy', 'Lola Remy'];
const STYLE_KEYS = Object.keys(BOT_STYLES);
const LEVEL_LABEL = { easy: 'Easy', normal: 'Normal', hard: 'Hard' };
const LEVEL_TONE = { easy: 'bg-lettuce', normal: 'bg-mustard', hard: 'bg-tomato text-white' };

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
  return { salary, exp: prof.tax + prof.living + (prof.family || 0) + loans };
}

function newBot(i, level = 'normal') {
  return { name: BOT_NAMES[i % BOT_NAMES.length], isBot: true, botLevel: level, botStyle: STYLE_KEYS[(i * 2 + 1) % STYLE_KEYS.length] };
}

function Title({ onStart }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-7 px-6 py-10 text-center">
      <div className="flex items-end gap-2">
        <span className="animate-bob"><Pawn color="red" className="size-14" /></span>
        <span className="animate-bob [animation-delay:0.3s]"><Pawn color="blue" className="size-12" /></span>
        <span className="animate-bob [animation-delay:0.6s]"><Pawn color="green" className="size-14" /></span>
      </div>
      <div className="animate-drop-in">
        <h1 className="font-display text-8xl leading-none tracking-wider text-mustard text-stroke drop-shadow-[0_7px_0_#1f1633]">LAYA</h1>
        <p className="mt-3 inline-block -rotate-2 rounded-xl border-[3px] border-ink bg-tomato px-3 py-1 font-display text-xl text-white pop-shadow-sm">Get out of the Rat Race</p>
      </div>
      <p className="max-w-sm rounded-2xl border-[3px] border-ink bg-paper p-3 text-[15px] font-bold pop-shadow">
        A Pinoy money board game based on <i>Rich Dad Poor Dad</i>. Buy assets, dodge bad debt, and grow your passive income until work becomes optional.
      </p>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Btn size="lg" className="animate-breathe" onClick={() => onStart('solo')}>Play solo</Btn>
        <Btn size="lg" variant="blue" onClick={() => onStart('bots')}>Play vs bots</Btn>
        <Btn size="lg" variant="ghost" onClick={() => onStart('pass')}>Pass and play</Btn>
      </div>
    </div>
  );
}

function Roster({ slots, setSlots, onNext, onBack }) {
  const update = (i, patch) => setSlots(slots.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const cycle = (arr, v) => arr[(arr.indexOf(v) + 1) % arr.length];
  const chip = 'press pop-shadow-sm rounded-lg border-2 border-ink px-2 py-1 text-xs font-extrabold';
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 py-6">
      <button type="button" onClick={onBack} className="self-start font-display text-lg">← Back</button>
      <h2 className="font-display text-4xl text-white text-stroke-sm">Who's playing?</h2>
      {slots.map((s, i) => (
        <Panel key={i} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Pawn color={PLAYER_COLORS[i]} className="size-9 shrink-0" />
            <input id={`player-${i}`} value={s.name} maxLength={14} onChange={e => update(i, { name: e.target.value })} className="min-w-0 flex-1 rounded-xl border-[2.5px] border-ink bg-white px-3 py-2 text-base font-extrabold focus:outline-none" />
            {slots.length > 1 && <button type="button" aria-label="Remove" onClick={() => setSlots(slots.filter((_, j) => j !== i))} className="px-1 font-display text-xl">×</button>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" className={`${chip} ${s.isBot ? 'bg-ocean text-white' : 'bg-white'}`} onClick={() => update(i, s.isBot ? { isBot: false, name: `Player ${i + 1}` } : newBot(i))}>
              {s.isBot ? 'Bot' : 'Human'}
            </button>
            {s.isBot && (
              <>
                <button type="button" className={`${chip} ${LEVEL_TONE[s.botLevel]}`} onClick={() => update(i, { botLevel: cycle(BOT_LEVELS, s.botLevel) })}>{LEVEL_LABEL[s.botLevel]}</button>
                <button type="button" className={`${chip} bg-paper`} onClick={() => update(i, { botStyle: cycle(STYLE_KEYS, s.botStyle) })}>{BOT_STYLES[s.botStyle]}</button>
              </>
            )}
          </div>
        </Panel>
      ))}
      {slots.length < 4 && <Btn variant="ghost" onClick={() => setSlots([...slots, newBot(slots.length)])}>+ Add player</Btn>}
      <Panel className="py-2"><SettingsList /></Panel>
      <p className="text-xs font-extrabold text-ink">Tap a bot's level or style to change it. Hard bots borrow smarter and time the stock market.</p>
      <span className="flex-1" />
      <Btn size="lg" disabled={!slots.some(s => !s.isBot)} onClick={onNext}>Next</Btn>
    </div>
  );
}

function Draft({ slot, offer, dreamOffer, onReroll, rerolled, onDone }) {
  const [prof, setProf] = useState(null);
  const [dream, setDream] = useState(null);
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 px-4 py-6">
      <div>
        <p className="font-display text-lg">{slot.name}</p>
        <h2 className="font-display text-4xl text-white text-stroke-sm">Pick your job</h2>
        <p className="text-sm font-extrabold">Everyone starts differently. A big salary doesn't make it easier to get out.</p>
      </div>
      <div className="flex flex-col gap-3">
        {offer.map(id => {
          const p = professions.find(x => x.id === id);
          const m = monthly(p);
          const on = prof === id;
          return (
            <button key={id} type="button" onClick={() => setProf(id)} className={`press rounded-2xl border-[3px] border-ink p-3 text-left pop-shadow transition ${on ? 'bg-mustard' : 'bg-paper'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-2xl leading-none">{p.emoji} {p.name}</span>
                <span className="font-display text-sm">{'★'.repeat(difficulty[p.id])}<span className="opacity-25">{'★'.repeat(3 - difficulty[p.id])}</span></span>
              </div>
              <div className="text-xs font-extrabold text-ink-soft">{p.en}</div>
              <div className="mt-2 grid grid-cols-3 gap-1.5 text-center text-xs font-extrabold">
                <div className="rounded-lg border-2 border-ink/15 bg-white/70 py-1"><div className="text-ink-soft">Income</div><div className="font-display text-sm">{fmt(m.salary)}{p.variable ? '~' : ''}</div></div>
                <div className="rounded-lg border-2 border-ink/15 bg-white/70 py-1"><div className="text-ink-soft">Expenses</div><div className="font-display text-sm text-red-600">{fmt(m.exp)}</div></div>
                <div className="rounded-lg border-2 border-ink/15 bg-white/70 py-1"><div className="text-ink-soft">Cash</div><div className="font-display text-sm">{fmt(p.cash)}</div></div>
              </div>
              <div className="mt-2 text-sm font-bold">{p.trait}</div>
            </button>
          );
        })}
        {!rerolled && <button type="button" onClick={onReroll} className="self-center font-display text-base underline">Show me 3 others (once)</button>}
      </div>
      <div>
        <h2 className="font-display text-3xl text-white text-stroke-sm">Pick your dream</h2>
        <p className="text-sm font-extrabold">Buy it on the Fast Track to win.</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {dreamOffer.map(id => {
          const d = dreams.find(x => x.id === id);
          const on = dream === id;
          return (
            <button key={id} type="button" onClick={() => setDream(id)} className={`press flex flex-col items-center gap-1 rounded-2xl border-[3px] border-ink p-2.5 text-center pop-shadow ${on ? 'bg-berry text-white' : 'bg-paper'}`}>
              <span className="text-3xl">{d.emoji}</span>
              <span className="font-display text-sm leading-tight">{d.name}</span>
              <span className="text-[11px] font-extrabold opacity-80">{fmt(d.cost)}</span>
            </button>
          );
        })}
      </div>
      <div className="sticky bottom-0 -mx-4 bg-gradient-to-t from-sky-deep/80 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6">
        <Btn size="lg" disabled={!prof || !dream} onClick={() => onDone(prof, dream)} className="w-full disabled:bg-paper disabled:opacity-100">
          {!prof ? 'Pick a job' : !dream ? 'Pick a dream' : 'Let\'s go'}
        </Btn>
      </div>
    </div>
  );
}

export default function SetupScreen() {
  const newGame = useGame(s => s.newGame);
  const [stage, setStage] = useState('title');
  const [slots, setSlots] = useState([{ name: 'You', isBot: false }]);
  const [draftIdx, setDraftIdx] = useState(0);
  const [picks, setPicks] = useState([]);
  const [offer, setOffer] = useState({ prof: [], dream: [], rerolled: false });

  const humans = slots.map((s, i) => ({ ...s, i })).filter(s => !s.isBot);
  const dealOffer = (rerolled = false) => setOffer({ prof: pickN(professions, 3).map(p => p.id), dream: pickN(dreams, 3).map(d => d.id), rerolled });

  const start = mode => {
    if (mode === 'solo') {
      setSlots([{ name: 'You', isBot: false }]);
      setPicks([]);
      setDraftIdx(0);
      dealOffer();
      setStage('draft');
      return;
    }
    setSlots(mode === 'bots'
      ? [{ name: 'You', isBot: false }, newBot(1, 'easy'), newBot(2, 'normal')]
      : [{ name: 'Player 1', isBot: false }, { name: 'Player 2', isBot: false }]);
    setStage('roster');
  };

  const finish = allPicks => {
    const players = slots.map((s, i) => {
      const pick = allPicks.find(x => x.i === i);
      if (pick) return { name: s.name.trim() || `Player ${i + 1}`, isBot: false, professionId: pick.prof, dreamId: pick.dream };
      return { ...s, name: s.name.trim() || BOT_NAMES[i], professionId: pickN(professions, 1)[0].id, dreamId: pickN(dreams, 1)[0].id };
    });
    newGame({ players });
  };

  if (stage === 'title') return <Title onStart={start} />;
  if (stage === 'roster') {
    return <Roster slots={slots} setSlots={setSlots} onBack={() => setStage('title')} onNext={() => { setPicks([]); setDraftIdx(0); dealOffer(); setStage('draft'); }} />;
  }
  const slot = humans[draftIdx];
  return (
    <Draft
      key={draftIdx}
      slot={slot}
      offer={offer.prof}
      dreamOffer={offer.dream}
      rerolled={offer.rerolled}
      onReroll={() => dealOffer(true)}
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
