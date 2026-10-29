import { useState } from 'react';
import { useGame } from '../store/gameStore.js';
import { useUi } from '../store/uiStore.js';
import { marketLabel } from '../engine/engine.js';
import { startMusic } from '../lib/music.js';
import Icon from './Icon.jsx';
import { Btn } from './Ui.jsx';
import PlayerStrip from './PlayerStrip.jsx';
import FreedomMeter from './FreedomMeter.jsx';

function Toggle({ label, on, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left text-sm font-extrabold hover:bg-ink/5">
      {label}
      <span className={`relative h-6 w-11 rounded-full border-2 border-ink transition ${on ? 'bg-lettuce' : 'bg-white'}`}>
        <span className={`absolute top-0.5 size-4 rounded-full border-2 border-ink bg-paper transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
    </button>
  );
}

export function SettingsList() {
  const muted = useUi(s => s.muted);
  const music = useUi(s => s.music);
  const fastBots = useUi(s => s.fastBots);
  const toggleMute = useUi(s => s.toggleMute);
  const toggleMusic = useUi(s => s.toggleMusic);
  const toggleFastBots = useUi(s => s.toggleFastBots);
  return (
    <>
      <Toggle label="Music" on={music} onClick={() => { if (!music) startMusic(); toggleMusic(); }} />
      <Toggle label="Sound effects" on={!muted} onClick={toggleMute} />
      <Toggle label="Fast bots" on={fastBots} onClick={toggleFastBots} />
    </>
  );
}

const MARKET_DOT = { bull: 'bg-lettuce', bear: 'bg-tomato', normal: 'bg-mustard' };

// The whole top of the game screen is one surface: logo, players, and the Freedom meter.
export default function TopBar({ viewed }) {
  const game = useGame(s => s.game);
  const quit = useGame(s => s.quit);
  const setHelp = useUi(s => s.setHelp);
  const [menu, setMenu] = useState(false);
  const [sure, setSure] = useState(false);
  const round = 'press pop-shadow-sm grid size-10 place-items-center rounded-full border-[2.5px] border-ink bg-white';
  return (
    <header className="sticky top-0 z-30 rounded-b-3xl border-b-[3px] border-ink bg-paper px-4 pb-3 pt-[max(0.5rem,env(safe-area-inset-top))] pop-shadow lg:mx-auto lg:max-w-6xl lg:border-x-[3px]">
      <div className="flex items-center gap-2">
        <span className="font-display text-3xl leading-none tracking-wider text-mustard text-stroke-sm">LAYA</span>
        <span className="flex items-center gap-1 text-xs font-extrabold text-ink-soft">
          <span className={`size-2.5 rounded-full border-2 border-ink ${MARKET_DOT[game.market]}`} />
          {marketLabel(game.market)}
        </span>
        <span className="flex-1" />
        <button type="button" aria-label="How to play" onClick={() => setHelp(true)} className={round}><Icon name="help" className="size-6" /></button>
        <div className="relative">
          <button type="button" aria-label="Menu" onClick={() => { setMenu(!menu); setSure(false); }} className={round}><Icon name="menu" className="size-5" /></button>
          {menu && (
            <div className="absolute right-0 top-12 z-40 w-60 animate-pop rounded-2xl border-[3px] border-ink bg-paper p-2 pop-shadow">
              <SettingsList />
              <div className="my-1 border-t-2 border-ink/10" />
              {sure ? (
                <div className="flex flex-col gap-2 p-1">
                  <p className="text-sm font-bold">This ends the current game. Sure?</p>
                  <Btn size="sm" variant="bad" onClick={() => { setMenu(false); setSure(false); quit(); }}>Yes, new game</Btn>
                  <Btn size="sm" variant="ghost" onClick={() => setSure(false)}>Keep playing</Btn>
                </div>
              ) : (
                <button type="button" onClick={() => setSure(true)} className="w-full rounded-xl px-2 py-2 text-left text-sm font-extrabold text-red-600 hover:bg-ink/5">New game</button>
              )}
              <p className="px-2 pt-1 text-[11px] font-bold text-ink-soft">Your game saves automatically.</p>
            </div>
          )}
        </div>
      </div>
      {game.players.length > 1 && <div className="mt-2"><PlayerStrip /></div>}
      <div className="mt-2"><FreedomMeter p={viewed} /></div>
    </header>
  );
}
