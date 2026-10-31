import { useUi } from '../store/uiStore.js';
import { TABS } from '../lib/tabs.js';
import Icon from './Icon.jsx';

export function Tabs({ tabs = TABS, active, className = '' }) {
  const current = useUi(s => s.tab);
  const setTab = useUi(s => s.setTab);
  const tab = active ?? current;
  return (
    <nav className={`grid ${tabs.length === 3 ? 'grid-cols-3' : 'grid-cols-4'} ${className}`}>
      {tabs.map(t => (
        <button key={t.id} type="button" onClick={() => setTab(t.id)} className="flex min-h-14 flex-col items-center justify-center gap-0.5">
          <span className={`grid place-items-center rounded-xl border-2 px-2 py-0.5 transition ${tab === t.id ? '-translate-y-0.5 border-ink bg-mustard pop-shadow-sm' : 'border-transparent'}`}>
            <Icon name={t.icon} className="size-6" />
          </span>
          <span className={`font-display text-xs tracking-wide ${tab === t.id ? 'text-ink' : 'text-ink-soft'}`}>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default function BottomNav() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t-[3px] border-ink bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden">
      <Tabs />
    </div>
  );
}
