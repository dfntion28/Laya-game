import { useEffect, useRef, useState } from 'react';
import { useLessons } from '../store/lessonStore.js';
import { lessonGroups, lessonList } from '../data/lessons.js';
import Icon from './Icon.jsx';

function Entry({ l, found, open, toggle, refFor }) {
  if (!found) {
    return (
      <li className="flex items-start gap-3 py-2.5 opacity-70">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg border-2 border-dashed border-ink font-display text-lg">?</span>
        <span className="min-w-0">
          <span className="block font-extrabold">Not found yet</span>
          <span className="block text-xs font-bold text-ink-soft">Hint: {l.hint}</span>
        </span>
      </li>
    );
  }
  return (
    <li ref={refFor} className="py-2.5">
      <button type="button" onClick={toggle} className="flex w-full items-start gap-3 text-left">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg border-2 border-ink bg-mustard"><Icon name="book" className="size-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block font-extrabold">{l.title}</span>
          {!open && <span className="block truncate text-xs font-bold text-ink-soft">{l.body}</span>}
        </span>
        <span className="font-display text-lg text-ink-soft">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="mt-2 pl-11 text-sm font-bold leading-snug">
          <p>{l.body}</p>
          <p className="mt-2 rounded-xl bg-mustard/30 px-3 py-2"><b>In real life:</b> {l.real}</p>
          <p className="mt-1 text-xs text-ink-soft">How you found it: {l.hint.replace(/\.$/, '').toLowerCase()}.</p>
        </div>
      )}
    </li>
  );
}

export default function LessonBook() {
  const open = useLessons(s => s.open);
  const focus = useLessons(s => s.focus);
  const found = useLessons(s => s.found);
  const close = useLessons(s => s.closeBook);
  const [expanded, setExpanded] = useState(null);
  const focusRef = useRef(null);
  const shown = expanded ?? focus;

  useEffect(() => {
    if (open && focus) focusRef.current?.scrollIntoView({ block: 'center' });
  }, [open, focus]);

  if (!open) return null;
  const total = Object.keys(found).length;
  return (
    <div className="fixed inset-0 z-50 flex animate-fade items-center justify-center bg-ink/50 p-3" onClick={close}>
      <div className="max-h-[88dvh] w-full max-w-lg animate-pop overflow-y-auto rounded-[28px] border-[4px] border-ink bg-paper p-5 pop-shadow" onClick={e => e.stopPropagation()}>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-3xl">Lesson Book</h2>
          <button type="button" aria-label="Close" onClick={close} className="press pop-shadow-sm grid size-11 place-items-center rounded-full border-[2.5px] border-ink bg-white"><Icon name="close" className="size-5" /></button>
        </div>
        <p className="text-sm font-bold text-ink-soft">{total} of {lessonList.length} found. Lessons unlock when they happen to you, so play different ways to find them all.</p>
        <svg viewBox="0 0 100 6" className="mt-2 h-2.5 w-full" preserveAspectRatio="none" aria-hidden="true">
          <rect x="0.5" y="0.5" width="99" height="5" rx="2.5" className="fill-white stroke-ink" strokeWidth="1" />
          <rect x="0.5" y="0.5" width={Math.max(3, (total / lessonList.length) * 99)} height="5" rx="2.5" className="fill-mustard" />
        </svg>
        {lessonGroups.map(g => {
          const list = lessonList.filter(l => l.group === g.id);
          const n = list.filter(l => found[l.id]).length;
          return (
            <section key={g.id} className="mt-4">
              <h3 className="flex items-baseline justify-between font-display text-xl">{g.label}<span className="text-sm text-ink-soft">{n}/{list.length}</span></h3>
              <ul className="flex flex-col divide-y-2 divide-ink/10">
                {list.map(l => (
                  <Entry
                    key={l.id} l={l} found={!!found[l.id]} open={shown === l.id}
                    toggle={() => setExpanded(shown === l.id ? '' : l.id)}
                    refFor={focus === l.id ? focusRef : undefined}
                  />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
