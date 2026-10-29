import { logTone } from '../lib/theme.js';
import { Surface, SectionTitle, LIST } from './Ui.jsx';

export default function LogPanel({ game }) {
  const byId = pid => game.players.find(p => p.id === pid);
  return (
    <Surface className="p-4">
      <SectionTitle>What happened</SectionTitle>
      <ol className={`${LIST} text-sm font-bold`}>
        {game.log.map(e => {
          const p = e.pid ? byId(e.pid) : null;
          return (
            <li key={e.id} className="flex gap-2 py-2">
              <span className="w-8 shrink-0 text-xs text-ink-soft">#{e.turn}</span>
              <span className={logTone[e.tone] ?? logTone.info}>
                {p && game.players.length > 1 && <b className="text-ink">{p.name}: </b>}
                {e.text}
              </span>
            </li>
          );
        })}
      </ol>
    </Surface>
  );
}
