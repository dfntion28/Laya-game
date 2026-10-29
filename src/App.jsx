import { useEffect } from 'react';
import { useGame } from './store/gameStore.js';
import { useUi } from './store/uiStore.js';
import { startMusic, stopMusic, setTempo } from './lib/music.js';
import SetupScreen from './components/SetupScreen.jsx';
import GameScreen from './components/GameScreen.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
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

export default function App() {
  const game = useGame(s => s.game);
  const quit = useGame(s => s.quit);
  useMusic();
  return (
    <>
      <Sky />
      <ErrorBoundary onReset={quit}>
        {game ? <GameScreen /> : <SetupScreen />}
      </ErrorBoundary>
    </>
  );
}
