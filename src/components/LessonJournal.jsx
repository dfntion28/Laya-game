import { useGameStore } from '../store/gameStore.js';
import { LESSON_CONCEPTS, CONCEPT_IDS } from '../data/lessons.js';

const GROUP_ORDER = ['Kita', 'Gastos', 'Utang', 'Deals', 'Proteksyon', 'Merkado'];

const GROUP_HINT = {
  Kita:       'Abangan sa Life Event cards.',
  Gastos:     'Abangan sa Gastos cards — depende sa pipiliin mo.',
  Utang:      'Abangan sa Gastos cards at Sahod Day.',
  Deals:      'Abangan sa Maliit at Malaking Deal.',
  Proteksyon: 'Abangan sa sakuna, sugal, scam, at BIR.',
  Merkado:    'Abangan sa Market Event cards.',
};

// Kuwaderno ng Aral — lessons unlock only by experiencing them in play.
export default function LessonJournal({ onClose }) {
  const discovered = useGameStore(s => s.discoveredLessons);
  const found = new Set(discovered);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 sticky top-0 bg-slate-900">
          <div>
            <h2 className="text-white font-mono font-bold">📘 Kuwaderno ng Aral</h2>
            <p className="text-slate-500 text-[11px] font-mono">
              {found.size}/{CONCEPT_IDS.length} natuklasan · Bawat aral ay nabubuksan lang kapag naranasan mo sa laro.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none cursor-pointer">✕</button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {GROUP_ORDER.map(group => {
            const ids = CONCEPT_IDS.filter(id => LESSON_CONCEPTS[id].group === group);
            return (
              <section key={group}>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-2 font-mono">
                  {group} · {ids.filter(id => found.has(id)).length}/{ids.length}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ids.map(id => {
                    const c = LESSON_CONCEPTS[id];
                    return found.has(id) ? (
                      <div key={id} className="rounded-lg border border-blue-800/60 bg-blue-950/40 px-3 py-2">
                        <p className="text-blue-300 text-xs font-bold">{c.title}</p>
                        <p className="text-blue-100/80 text-[11px] leading-relaxed mt-0.5">{c.text}</p>
                      </div>
                    ) : (
                      <div key={id} className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
                        <p className="text-slate-600 text-xs font-bold">🔒 ???</p>
                        <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5">{GROUP_HINT[group]}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
