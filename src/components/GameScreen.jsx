import { useEffect } from 'react';
import { useGame } from '../store/gameStore.js';
import { useUi } from '../store/uiStore.js';
import { botAction } from '../engine/bot.js';
import TopBar from './TopBar.jsx';
import PlayerStrip from './PlayerStrip.jsx';
import FreedomMeter from './FreedomMeter.jsx';
import Board from './Board.jsx';
import FinancePanel from './FinancePanel.jsx';
import AssetsPanel from './AssetsPanel.jsx';
import LogPanel from './LogPanel.jsx';
import ActionSheet from './ActionSheet.jsx';
import BottomNav, { Tabs } from './BottomNav.jsx';
import { SIDE_TABS } from '../lib/tabs.js';
import Toasts from './Toasts.jsx';
import HelpModal from './HelpModal.jsx';
import { EscapeOverlay, EndScreen } from './Celebration.jsx';

const BOT_DELAY = { roll: 650, move: 500, default: 1300 };

// Drives bot turns with a short delay so humans can follow along.
function useBotDriver(game, busy) {
  const dispatch = useGame(s => s.dispatch);
  useEffect(() => {
    if (!game || game.phase !== 'playing' || busy) return undefined;
    const p = game.players[game.current];
    const pend = game.pending;
    if (!p.isBot || !pend) return undefined;
    if (pend.kind === 'offer' && pend.anyHuman) return undefined; // humans decide, then tap Tapos
    const delay = BOT_DELAY[pend.kind] ?? BOT_DELAY.default;
    const id = setTimeout(() => {
      const action = botAction(game);
      if (action && dispatch(action)) return;
      const fallback = pend.kind === 'roll' ? { type: 'ROLL' } : pend.kind === 'deal' ? { type: 'PASS' } : pend.kind === 'move' ? { type: 'GO' } : { type: 'DONE' };
      dispatch(fallback);
    }, delay);
    return () => clearTimeout(id);
  }, [game, busy, dispatch]);
}

export default function GameScreen() {
  const game = useGame(s => s.game);
  const tab = useUi(s => s.tab);
  const viewPid = useUi(s => s.viewPid);
  const busy = useUi(s => s.busyCount > 0);
  useBotDriver(game, busy);

  const viewed = game.players.find(p => p.id === viewPid) ?? game.players.find(p => !p.isBot) ?? game.players[0];
  const sideTab = tab === 'board' ? 'pera' : tab;

  const panel = t => (
    <>
      {t === 'pera' && <FinancePanel p={viewed} prices={game.prices} />}
      {t === 'assets' && <AssetsPanel game={game} p={viewed} />}
      {t === 'log' && <LogPanel game={game} />}
    </>
  );

  return (
    <div className="min-h-dvh bg-fiesta pb-20 lg:pb-4">
      <TopBar />
      <PlayerStrip />
      <main className="mx-auto max-w-6xl px-3 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-5">
        <section className={`flex flex-col gap-3 ${tab === 'board' ? '' : 'hidden lg:flex'}`}>
          <FreedomMeter p={viewed} prices={game.prices} />
          <Board />
        </section>
        <section className={`${tab === 'board' ? 'hidden lg:block' : ''}`}>
          <div className="hidden rounded-2xl bg-panel card-3d ring-1 ring-line lg:mb-3 lg:block">
            <Tabs tabs={SIDE_TABS} active={sideTab} />
          </div>
          <div className="lg:hidden">{panel(tab)}</div>
          <div className="hidden lg:block">{panel(sideTab)}</div>
        </section>
      </main>
      <BottomNav />
      <ActionSheet />
      <EscapeOverlay />
      <EndScreen />
      <HelpModal />
      <Toasts />
    </div>
  );
}
