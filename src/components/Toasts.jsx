import { useUi } from '../store/uiStore.js';

const TONE = {
  good: 'bg-emerald-500/95 text-emerald-950',
  bad: 'bg-rose-500/95 text-white',
  info: 'bg-violet-500/95 text-white',
};

export default function Toasts() {
  const toasts = useUi(s => s.toasts);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[max(0.5rem,env(safe-area-inset-top))] z-50 flex flex-col items-center gap-1.5 px-4">
      {toasts.map(t => (
        <div key={t.id} className={`max-w-sm animate-toast rounded-2xl px-4 py-2 text-center shadow-xl ${TONE[t.tone] ?? TONE.info} ${t.big ? 'ring-2 ring-white/60' : ''}`}>
          <div className={`font-display font-bold leading-tight ${t.big ? 'text-lg' : 'text-sm'}`}>{t.text}</div>
          {t.sub && <div className="text-[11px] opacity-90">{t.sub}</div>}
        </div>
      ))}
    </div>
  );
}
