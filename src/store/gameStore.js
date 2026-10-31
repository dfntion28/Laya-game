import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createGame, step } from '../engine/engine.js';
import { SAVE_VERSION } from '../data/constants.js';
import { safeStorage } from '../lib/storage.js';
import { runFx } from './fxRunner.js';
import { useUi } from './uiStore.js';
import { play } from '../lib/sfx.js';
import { useNet } from './netStore.js';
import { sendAction, hostBroadcast } from '../net/online.js';

export const useGame = create(
  persist(
    (set, get) => ({
      game: null,
      // What the screen shows. Lags behind `game` until animations finish, so nothing is spoiled early.
      shown: null,

      newGame: config => {
        useUi.getState().reset();
        const game = createGame({ ...config, seed: Math.floor(Math.random() * 2 ** 31) });
        const first = game.players.find(p => !p.isBot);
        useUi.getState().setView(first?.id ?? game.players[0].id);
        set({ game, shown: game });
      },

      // Returns true if the engine accepted the action.
      dispatch: action => {
        const { game } = get();
        if (!game) return false;
        const mode = useNet.getState().mode;
        if (mode === 'guest') {
          // Online guests ask the host; the new state comes back as a broadcast.
          if (step(game, action).rejected) return false;
          sendAction(action);
          play('click', useUi.getState().muted);
          return true;
        }
        const r = step(game, action);
        if (r.rejected) return false;
        set({ game: r.state });
        play('click', useUi.getState().muted);
        runFx(r.fx, r.state, () => set({ shown: get().game }));
        if (mode === 'host') hostBroadcast(r.state, r.fx);
        return true;
      },

      // Online guests: a state from the host, with the effects to animate.
      applyRemote: (game, fx) => {
        set({ game });
        if (fx.length) runFx(fx, game, () => set({ shown: get().game }));
        else set({ shown: game });
      },

      quit: () => {
        useUi.getState().reset();
        set({ game: null, shown: null });
      },
    }),
    {
      name: 'laya-save',
      version: SAVE_VERSION,
      storage: createJSONStorage(() => safeStorage),
      partialize: s => ({ game: s.game }),
      migrate: () => ({ game: null }),
      merge: (saved, current) => ({ ...current, ...saved, shown: saved?.game ?? null }),
    },
  ),
);

// Lets browser tests read the game state.
if (import.meta.env.DEV && typeof window !== 'undefined') window.__layaGame = useGame;
