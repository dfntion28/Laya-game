import { useGame } from './store/gameStore.js';
import SetupScreen from './components/SetupScreen.jsx';
import GameScreen from './components/GameScreen.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

export default function App() {
  const game = useGame(s => s.game);
  const quit = useGame(s => s.quit);
  return (
    <div className="min-h-dvh bg-fiesta">
      <ErrorBoundary onReset={quit}>
        {game ? <GameScreen /> : <SetupScreen />}
      </ErrorBoundary>
    </div>
  );
}
