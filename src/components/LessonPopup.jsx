import { useLessons } from '../store/lessonStore.js';
import { lessonById, lessonList } from '../data/lessons.js';
import Icon from './Icon.jsx';
import { Btn } from './Ui.jsx';

// A newly found lesson. It sits in the page above your card, so it never covers the board.
export default function LessonPopup() {
  const id = useLessons(s => s.popup[0]);
  const count = useLessons(s => Object.keys(s.found).length);
  const dismiss = useLessons(s => s.dismiss);
  const openBook = useLessons(s => s.openBook);
  const l = id ? lessonById[id] : null;
  if (!l) return null;
  return (
    <div key={id} className="animate-deal-in rounded-[26px] border-[3px] border-ink bg-mustard p-4 pop-shadow">
      <div className="flex items-center gap-2">
        <Icon name="book" className="size-7 shrink-0" />
        <span className="text-xs font-extrabold uppercase tracking-widest">New lesson · {count} of {lessonList.length} found</span>
      </div>
      <h3 className="mt-1 font-display text-2xl leading-tight">{l.title}</h3>
      <p className="mt-1 text-[15px] font-bold leading-snug">{l.body}</p>
      <p className="mt-2 rounded-xl bg-paper/70 px-3 py-2 text-sm font-bold leading-snug"><b>In real life:</b> {l.real}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Btn size="sm" variant="ghost" onClick={() => openBook(id)}>Lesson Book</Btn>
        <Btn size="sm" onClick={dismiss}>Got it</Btn>
      </div>
    </div>
  );
}
