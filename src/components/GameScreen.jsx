import { useEffect } from 'react';
import { useGame } from '../store/gameStore.js';
import { useUi } from '../store/uiStore.js';
import { botAction } from '../engine/bot.js';
import TopBar from './TopBar.jsx';
import Board from './Board.jsx';
import FinancePanel from './FinancePanel.jsx';
import AssetsPanel from './AssetsPanel.jsx';
import LogPanel from './LogPanel.jsx';
import TurnCard, { CardWaiting } from './TurnCard.jsx';
import FreedomMeter from './FreedomMeter.jsx';
import PlayerStrip from './PlayerStrip.jsx';
import BottomNav, { Tabs } from './BottomNav.jsx';
import HelpModal from './HelpModal.jsx';
import { EscapeOverlay, EndScreen } from './Celebration.jsx';
import { Toasts, TurnBanner, CoinBursts } from './Effects.jsx';
import { SIDE_TABS } from '../lib/tabs.js';
import { useWide } from '../lib/useWide.js';

const BOT_DELAY = { roll: 700, move: 500, default: 1400 };
const FAST_DELAY = 120;

// Drives bot turns with a short pause so humans can follow along.
function useBotDriver(game, busy) {
  const dispatch = useGame(s => s.dispatch);
  const fastBots = useUi(s => s.fastBots);
  useEffect(() => {
    if (!game || game.phase !== 'playing' || busy) return undefined;
    const p = game.players[game.current];
    const pend = game.pending;
    if (!p.isBot || !pend) return undefined;
    if (pend.kind === 'offer' && pend.anyHuman) return undefined; // humans decide, then tap Done
    const delay = fastBots ? FAST_DELAY : BOT_DELAY[pend.kind] ?? BOT_DELAY.default;
    const id = setTimeout(() => {
      const action = botAction(game);
      if (action && dispatch(action)) return;
      const fallback = pend.kind === 'roll' ? { type: 'ROLL' } : pend.kind === 'deal' ? { type: 'PASS' } : pend.kind === 'move' ? { type: 'GO' } : { type: 'DONE' };
      dispatch(fallback);
    }, delay);
    return () => clearTimeout(id);
  }, [game, busy, dispatch, fastBots]);
}

// Freedom meter as a plain card in the page. It scrolls with everything else.
function MeterCard({ p }) {
  const setTab = useUi(s => s.setTab);
  return (
    <button type="button" onClick={() => setTab('pera')} className="block w-full rounded-3xl border-[3px] border-ink bg-paper px-4 py-3 text-left lg:pointer-events-none">
      <FreedomMeter p={p} />
    </button>
  );
}

export default function GameScreen() {
  const game = useGame(s => s.game);
  const shown = useGame(s => s.shown ?? s.game);
  const tab = useUi(s => s.tab);
  const viewPid = useUi(s => s.viewPid);
  const busy = useUi(s => s.busyCount > 0);
  const wide = useWide();
  useBotDriver(game, busy);

  const viewed = shown.players.find(p => p.id === viewPid) ?? shown.players.find(p => !p.isBot) ?? shown.players[0];
  const sideTab = tab === 'board' ? 'pera' : tab;
  const multi = shown.players.length > 1;

  const panel = t => (
    <>
      {t === 'pera' && <FinancePanel p={viewed} prices={shown.prices} />}
      {t === 'assets' && <AssetsPanel game={shown} p={viewed} />}
      {t === 'log' && <LogPanel game={shown} />}
    </>
  );

  return (
    <div className="min-h-dvh pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-8">
      <TopBar />
      <main className="mx-auto mt-2 max-w-6xl px-2 sm:px-3 lg:mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start lg:gap-6">
        <section className={`flex-col gap-3 ${tab === 'board' ? 'flex' : 'hidden lg:flex'}`}>
          {multi && <div className="rounded-2xl border-[3px] border-ink bg-paper px-1.5 py-1"><PlayerStrip /></div>}
          <Board />
          {!wide && <TurnCard />}
          {!wide && <MeterCard p={viewed} />}
        </section>
        <section key={tab} className={`flex-col gap-3 ${tab === 'board' ? 'hidden lg:flex' : 'flex animate-drop-in'}`}>
          {wide && <TurnCard />}
          {wide && <MeterCard p={viewed} />}
          {wide && (
            <div className="rounded-2xl border-[3px] border-ink bg-paper pop-shadow">
              <Tabs tabs={SIDE_TABS} active={sideTab} />
            </div>
          )}
          {!wide && <CardWaiting />}
          {panel(wide ? sideTab : tab)}
        </section>
      </main>
      <BottomNav />
      <CoinBursts />
      <EscapeOverlay />
      <EndScreen />
      <HelpModal />
      <TurnBanner />
      <Toasts />
    </div>
  );
}
