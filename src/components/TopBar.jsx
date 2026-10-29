import { useState } from 'react';
import { useGame } from '../store/gameStore.js';
import { useUi } from '../store/uiStore.js';
import { marketLabel } from '../engine/engine.js';

export default function TopBar() {
  const game = useGame(s => s.game);
  const quit = useGame(s => s.quit);
  const muted = useUi(s => s.muted);
  const toggleMute = useUi(s => s.toggleMute);
  const setHelp = useUi(s => s.setHelp);
  const [menu, setMenu] = useState(false);
  const [sure, setSure] = useState(false);
  const marketTone = game.market === 'bull' ? 'bg-emerald-400/15 text-emerald-200 ring-emerald-400/40' : game.market === 'bear' ? 'bg-rose-400/15 text-rose-200 ring-rose-400/40' : 'bg-white/8 text-violet-100 ring-white/15';
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 bg-night/85 shadow-[0_3px_0_rgb(0_0_0/0.2)] px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur">
      <span className="shine-text text-outline animate-shine font-display text-3xl font-bold tracking-wider">LAYA</span>
      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${marketTone}`}>{marketLabel(game.market)}</span>
      <span className="flex-1" />
      <button type="button" aria-label="Sound" onClick={toggleMute} className="grid size-10 place-items-center rounded-full bg-white/8 text-lg ring-1 ring-white/15">{muted ? '🔇' : '🔊'}</button>
      <button type="button" aria-label="Help" onClick={() => setHelp(true)} className="grid size-10 place-items-center rounded-full bg-white/8 font-display text-lg font-bold ring-1 ring-white/15">?</button>
      <div className="relative">
        <button type="button" aria-label="Menu" onClick={() => setMenu(!menu)} className="grid size-10 place-items-center rounded-full bg-white/8 text-lg ring-1 ring-white/15">☰</button>
        {menu && (
          <div className="absolute right-0 top-12 z-40 w-56 animate-pop rounded-2xl bg-panel card-3d p-2 shadow-2xl ring-1 ring-line">
            <p className="px-3 py-2 text-xs text-muted">Naka-autosave ang laro mo.</p>
            {sure ? (
              <div className="flex flex-col gap-1.5 px-1 pb-1">
                <p className="px-2 text-xs text-cream">Mawawala ang kasalukuyang laro. Sigurado ka?</p>
                <button type="button" onClick={() => { setMenu(false); setSure(false); quit(); }} className="w-full rounded-xl bg-rose-500 px-3 py-2.5 text-left text-sm font-semibold text-white">
                  Oo, bagong laro
                </button>
                <button type="button" onClick={() => setSure(false)} className="w-full rounded-xl px-3 py-2 text-left text-sm text-muted">Huwag na</button>
              </div>
            ) : (
              <button type="button" onClick={() => setSure(true)} className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-rose-200 hover:bg-white/5">
                🔄 Bagong Laro
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
