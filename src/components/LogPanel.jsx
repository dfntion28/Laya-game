import { logTone } from '../lib/theme.js';
import { Panel } from './Ui.jsx';

export default function LogPanel({ game }) {
  const byId = pid => game.players.find(p => p.id === pid);
  return (
    <Panel>
      <h3 className="mb-2 font-display text-xl">What happened</h3>
      <ol className="flex flex-col gap-1.5 text-sm font-bold">
        {game.log.map(e => {
          const p = e.pid ? byId(e.pid) : null;
          return (
            <li key={e.id} className="flex gap-2 border-b-2 border-dashed border-ink/10 pb-1.5 last:border-0">
              <span className="w-8 shrink-0 text-xs text-ink-soft">#{e.turn}</span>
              <span className={logTone[e.tone] ?? logTone.info}>
                {p && game.players.length > 1 && <b className="text-ink">{p.name}: </b>}
                {e.text}
              </span>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}
