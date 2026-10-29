import { useEffect, useState } from 'react';
import { useGame } from './store/gameStore.js';
import { useUi } from './store/uiStore.js';
import { startMusic, stopMusic, setTempo } from './lib/music.js';
import SetupScreen from './components/SetupScreen.jsx';
import GameScreen from './components/GameScreen.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import OnlineScreen from './components/OnlineScreen.jsx';
import { useNet } from './store/netStore.js';
import { leaveRoom } from './net/online.js';
import { Sky } from './components/Effects.jsx';

// Browsers only allow audio after a tap, so music starts on the first one.
// `click`/`touchend` count as a tap on iPhone; `pointerdown` from a finger does not.
function useMusic() {
  const music = useUi(s => s.music);
  const fast = useGame(s => !!s.game?.players.some(p => !p.isBot && p.track === 'fast'));
  useEffect(() => setTempo(fast ? 128 : 112), [fast]);
  useEffect(() => {
    if (!music) {
      stopMusic();
      return undefined;
    }
    const start = () => {
      startMusic();
      window.removeEventListener('click', start);
      window.removeEventListener('touchend', start);
    };
    window.addEventListener('click', start);
    window.addEventListener('touchend', start);
    return () => {
      window.removeEventListener('click', start);
      window.removeEventListener('touchend', start);
    };
  }, [music]);
}

function urlRoom() {
  try {
    return new URLSearchParams(window.location.search).get('room');
  } catch {
    return null;
  }
}

function clearRoomFromUrl() {
  const u = new URL(window.location.href);
  u.searchParams.delete('room');
  window.history.replaceState(null, '', u.toString());
}

export default function App() {
  const game = useGame(s => s.game);
  const quit = useGame(s => s.quit);
  const mode = useNet(s => s.mode);
  const status = useNet(s => s.status);
  const [invite, setInvite] = useState(urlRoom);
  useMusic();

  let screen;
  if (mode !== 'local' && status !== 'playing') screen = <OnlineScreen />;
  else if (game) screen = <GameScreen />;
  else if (invite) screen = <OnlineScreen code={invite} onBack={() => { clearRoomFromUrl(); setInvite(null); }} />;
  else screen = <SetupScreen />;

  return (
    <>
      <Sky />
      <ErrorBoundary onReset={mode !== 'local' ? leaveRoom : quit}>
        {screen}
      </ErrorBoundary>
    </>
  );
}
