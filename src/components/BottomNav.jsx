import { useUi } from '../store/uiStore.js';
import { TABS } from '../lib/tabs.js';


export function Tabs({ tabs = TABS, active, className = '' }) {
  const current = useUi(s => s.tab);
  const tab = active ?? current;
  const setTab = useUi(s => s.setTab);
  return (
    <nav className={`grid ${tabs.length === 3 ? 'grid-cols-3' : 'grid-cols-4'} ${className}`}>
      {tabs.map(t => (
        <button
          key={t.id}
          type="button"
          onClick={() => setTab(t.id)}
          className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition ${tab === t.id ? 'text-gold' : 'text-muted'}`}
        >
          <span className={`text-xl transition ${tab === t.id ? 'scale-110' : 'opacity-70'}`}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </nav>
  );
}

export default function BottomNav() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-night/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <Tabs />
    </div>
  );
}
