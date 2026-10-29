import { useUi } from '../store/uiStore.js';
import { spaceTypes } from '../data/board.js';

const RAT = ['sahod', 'oport', 'gastos', 'merkado', 'buhay', 'aral', 'tulong', 'tanggal', 'koneksyon'];
const FAST = ['cfday', 'ftdeal', 'gamble', 'pangarap', 'sakuna', 'foundation'];

function H({ children }) {
  return <h3 className="mt-4 font-display text-base font-semibold uppercase tracking-wide text-gold first:mt-0">{children}</h3>;
}

export default function HelpModal() {
  const show = useUi(s => s.showHelp);
  const setHelp = useUi(s => s.setHelp);
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex animate-fade items-end justify-center bg-black/60 sm:items-center" onClick={() => setHelp(false)}>
      <div className="max-h-[90dvh] w-full max-w-lg animate-sheet overflow-y-auto rounded-t-3xl bg-panel p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] ring-1 ring-line sm:rounded-3xl" onClick={e => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Paano Laruin</h2>
          <button type="button" onClick={() => setHelp(false)} className="size-10 rounded-full bg-white/10 text-lg">✕</button>
        </div>
        <div className="text-sm leading-relaxed text-violet-100">
          <H>🎯 Layunin</H>
          <p><b>1. Takasan ang Rat Race:</b> palakihin ang <b>passive income</b> (kita mula sa assets) hanggang mas malaki ito sa <b>buwanang gastos</b>. Bantayan ang Freedom Meter.</p>
          <p className="mt-1"><b>2. Fast Track:</b> bilhin ang iyong <b>Pangarap</b> o dagdagan ang cashflow mo ng ₱1.5M para manalo.</p>

          <H>🎲 Bawat Turno</H>
          <ol className="list-decimal pl-5">
            <li>I-roll ang dice (1 die sa Rat Race, 2 sa Fast Track).</li>
            <li>May <b>Diskarte</b>? Gumamit ng isa para mag-±1 o mag-reroll — makikita mo kung saan ka tatapak.</li>
            <li>Bawat corner na madaanan = <b>Sahod</b> (1 buwan). Eksaktong tapak sa Sahod = +1 Diskarte.</li>
            <li>Resolbahin ang space na tinapakan.</li>
          </ol>

          <H>🗺️ Mga Space (Rat Race)</H>
          <ul className="flex flex-col gap-1">
            {RAT.map(t => <li key={t}><b>{spaceTypes[t].emoji} {spaceTypes[t].label}:</b> {spaceTypes[t].help}</li>)}
          </ul>

          <H>💡 Mga Aral ng Rich Dad</H>
          <ul className="list-disc pl-5">
            <li><b>Asset</b> = naglalagay ng pera sa bulsa mo. <b>Liability</b> = kumukuha. Ang "investment" na negative cashflow ay liability.</li>
            <li><b>ROI</b> = taunang cashflow ÷ perang inilabas mo. 30%+ ay magandang deal.</li>
            <li><b>Leverage</b>: puwedeng umutang sa bangko para sa down payment — sulit lang kung mas malaki ang cashflow kaysa sa interest.</li>
            <li><b>Credit score</b>: 700+ = mas mababang interest. Bumaba sa 550 = 5-6 lang ang lalapitan mo (20%/buwan!).</li>
            <li><b>Buy low, sell high</b>: maghintay ng Merkado buyer para ibenta ang property sa mataas na presyo.</li>
            <li><b>Insurance</b> ay proteksyon, hindi gastos lang: sagot nito ang 80% ng ospital at bagyo.</li>
          </ul>

          <H>🇵🇭 Kalendaryo</H>
          <p>Disyembre: 13th month pay at gastos sa Pasko. Hunyo: pasukan (tuition kung may anak). Hulyo–Oktubre: tag-bagyo.</p>

          <H>🚀 Fast Track</H>
          <ul className="flex flex-col gap-1">
            {FAST.map(t => <li key={t}><b>{spaceTypes[t].emoji} {spaceTypes[t].label}:</b> {spaceTypes[t].help}</li>)}
          </ul>

          <H>📱 Tips</H>
          <p>I-tap ang kahit anong space sa board para makita ang detalye. Naka-autosave ang laro — puwede mong isara ang browser at bumalik. Sa phone: "Add to Home Screen" para full-screen.</p>
        </div>
      </div>
    </div>
  );
}
