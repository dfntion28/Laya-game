import { useUi } from '../store/uiStore.js';
import { spaceTypes } from '../data/board.js';
import { spaceTone } from '../lib/theme.js';
import Icon from './Icon.jsx';

const RAT = ['sahod', 'oport', 'gastos', 'merkado', 'buhay', 'aral', 'tulong', 'tanggal', 'koneksyon'];
const FAST = ['cfday', 'ftdeal', 'gamble', 'pangarap', 'sakuna', 'foundation'];

function H({ children }) {
  return <h3 className="mt-5 font-display text-xl first:mt-0">{children}</h3>;
}

function Spaces({ list }) {
  return (
    <ul className="mt-1 flex flex-col gap-1.5">
      {list.map(t => (
        <li key={t} className="flex items-start gap-2">
          <span className={`grid size-7 shrink-0 place-items-center rounded-md border-2 border-ink ${spaceTone[spaceTypes[t].tone]}`}><Icon name={spaceTypes[t].icon} className="size-5" /></span>
          <span><b>{spaceTypes[t].label}.</b> {spaceTypes[t].help}</span>
        </li>
      ))}
    </ul>
  );
}

export default function HelpModal() {
  const show = useUi(s => s.showHelp);
  const setHelp = useUi(s => s.setHelp);
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex animate-fade items-end justify-center bg-ink/50 sm:items-center" onClick={() => setHelp(false)}>
      <div className="max-h-[90dvh] w-full max-w-lg animate-sheet overflow-y-auto rounded-t-[28px] border-[4px] border-b-0 border-ink bg-paper p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-[28px] sm:border-b-[4px]" onClick={e => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-3xl">How to play</h2>
          <button type="button" aria-label="Close" onClick={() => setHelp(false)} className="press pop-shadow-sm grid size-11 place-items-center rounded-full border-[2.5px] border-ink bg-white"><Icon name="close" className="size-5" /></button>
        </div>
        <div className="text-[15px] font-bold leading-relaxed">
          <H>The goal</H>
          <p>Get your <b>passive income</b> (money your assets make) higher than your <b>monthly expenses</b>. That gets you out of the Rat Race. The Freedom meter tracks it.</p>
          <p className="mt-1">Then on the Fast Track, buy your dream or add ₱1.5M to your monthly cashflow to win.</p>

          <H>Your turn</H>
          <ol className="list-decimal pl-5">
            <li>Roll the die (two on the Fast Track).</li>
            <li>Got Diskarte? Spend one to move 1 more, 1 less, or reroll.</li>
            <li>Every corner you pass is payday. That is one month.</li>
            <li>Do what the space says.</li>
          </ol>

          <H>Rat Race spaces</H>
          <Spaces list={RAT} />

          <H>Money basics</H>
          <ul className="list-disc pl-5">
            <li><b>Asset</b>: puts money in your pocket. <b>Liability</b>: takes it out. A condo with negative cashflow is a liability.</li>
            <li><b>Return</b>: yearly cashflow divided by the cash you put in. Over 30% is a good deal.</li>
            <li><b>Leverage</b>: borrow for a down payment only when the deal earns more than the interest.</li>
            <li><b>Credit score</b>: 700+ gets cheaper loans. Below 550 the banks say no and you end up with the 5-6 lender at 20% a month.</li>
            <li><b>Insurance</b> covers 80% of hospital and typhoon bills.</li>
          </ul>

          <H>The calendar</H>
          <p>December brings 13th month pay and Pasko spending. June is school fees if you have kids. July to October is typhoon season.</p>

          <H>Fast Track spaces</H>
          <Spaces list={FAST} />

          <H>Tips</H>
          <p>Tap any space on the board to see what it does. The game saves on its own. On your phone, use Add to Home Screen to play full screen.</p>
        </div>
      </div>
    </div>
  );
}
