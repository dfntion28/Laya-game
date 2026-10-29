import { logTone } from '../lib/theme.js';

export default function LogPanel({ game }) {
  const name = pid => game.players.find(p => p.id === pid);
  return (
    <section className="rounded-2xl bg-panel card-3d p-3 ring-1 ring-line">
      <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-gold">Talaan (Event Log)</h3>
      <ol className="flex flex-col gap-1.5 text-sm">
        {game.log.map(e => {
          const p = e.pid ? name(e.pid) : null;
          return (
            <li key={e.id} className="flex gap-2 border-b border-white/5 pb-1.5 last:border-0">
              <span className="w-8 shrink-0 text-[10px] text-muted">#{e.turn}</span>
              <span className={logTone[e.tone] ?? logTone.info}>
                {p && game.players.length > 1 && <b className="text-cream">{p.emoji} {p.name}: </b>}
                {e.text}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
