import { useEffect } from 'react';
import { useGame } from '../store/gameStore.js';
import { useUi } from '../store/uiStore.js';
import { botAction } from '../engine/bot.js';
import TopBar from './TopBar.jsx';
import Board from './Board.jsx';
import FinancePanel from './FinancePanel.jsx';
import AssetsPanel from './AssetsPanel.jsx';
import LogPanel from './LogPanel.jsx';
import ActionSheet from './ActionSheet.jsx';
import BottomNav, { Tabs } from './BottomNav.jsx';
import HelpModal from './HelpModal.jsx';
import { EscapeOverlay, EndScreen } from './Celebration.jsx';
import { Toasts, TurnBanner, CoinBursts } from './Effects.jsx';
import { SIDE_TABS } from '../lib/tabs.js';

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
    <div className="min-h-dvh pb-24 lg:pb-6">
      <TopBar viewed={viewed} />
      <main className="mx-auto mt-4 max-w-6xl px-3 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-6">
        <section className={tab === 'board' ? '' : 'hidden lg:block'}>
          <Board />
        </section>
        <section key={tab} className={`animate-drop-in ${tab === 'board' ? 'hidden lg:block' : ''}`}>
          <div className="mb-3 hidden rounded-2xl border-[3px] border-ink bg-paper pop-shadow lg:block">
            <Tabs tabs={SIDE_TABS} active={sideTab} />
          </div>
          <div className="lg:hidden">{panel(tab)}</div>
          <div className="hidden lg:block">{panel(sideTab)}</div>
        </section>
      </main>
      <BottomNav />
      <CoinBursts />
      <ActionSheet />
      <EscapeOverlay />
      <EndScreen />
      <HelpModal />
      <TurnBanner />
      <Toasts />
    </div>
  );
}
