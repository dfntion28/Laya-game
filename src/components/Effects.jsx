import { useUi } from '../store/uiStore.js';
import Icon from './Icon.jsx';

const COINS = [
  'coin-x-l2 [animation-delay:0ms]', 'coin-x-r1 [animation-delay:60ms]', 'coin-x-0 [animation-delay:30ms]',
  'coin-x-l1 [animation-delay:120ms]', 'coin-x-r2 [animation-delay:90ms]', 'coin-x-0 [animation-delay:180ms]',
  'coin-x-r1 [animation-delay:210ms]', 'coin-x-l1 [animation-delay:240ms]',
];

export function CoinBursts() {
  const bursts = useUi(s => s.bursts);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-1/2 z-40 flex justify-center" aria-hidden="true">
      {bursts.map(id => (
        <div key={id} className="relative">
          {COINS.map((c, i) => (
            <span key={i} className={`absolute -left-4 animate-coin opacity-0 ${c}`}>
              <Icon name="coin" className="size-8" />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export function TurnBanner() {
  const banner = useUi(s => s.banner);
  if (!banner) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center px-6">
      <div key={banner.id} className="animate-slam rounded-3xl border-[4px] border-ink bg-mustard px-6 py-3 text-center pop-shadow">
        <div className="font-display text-3xl leading-none text-white text-stroke-sm sm:text-5xl">{banner.text}</div>
      </div>
    </div>
  );
}

const TONE = {
  good: 'bg-lettuce text-ink',
  bad: 'bg-tomato text-white',
  info: 'bg-paper text-ink',
};

export function Toasts() {
  const toasts = useUi(s => s.toasts);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[max(0.5rem,env(safe-area-inset-top))] z-50 flex flex-col items-center gap-1.5 px-4">
      {toasts.map(t => (
        <div key={t.id} className={`max-w-sm animate-toast rounded-2xl border-[3px] border-ink px-4 py-1.5 text-center pop-shadow-sm ${TONE[t.tone] ?? TONE.info}`}>
          <div className={`font-display leading-tight tracking-wide ${t.big ? 'text-xl' : 'text-base'}`}>{t.text}</div>
          {t.sub && <div className="text-xs font-bold opacity-90">{t.sub}</div>}
        </div>
      ))}
    </div>
  );
}

export function Sky() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-sky" aria-hidden="true">
      <div className="sunburst absolute left-1/2 top-[30%] size-[260vmax] -translate-x-1/2 -translate-y-1/2 animate-spin-slow" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-sky-deep/50 to-transparent" />
    </div>
  );
}
