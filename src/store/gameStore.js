import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createGame, step } from '../engine/engine.js';
import { SAVE_VERSION } from '../data/constants.js';
import { safeStorage } from '../lib/storage.js';
import { runFx } from './fxRunner.js';
import { useUi } from './uiStore.js';
import { play } from '../lib/sfx.js';

export const useGame = create(
  persist(
    (set, get) => ({
      game: null,

      newGame: config => {
        useUi.getState().reset();
        const game = createGame({ ...config, seed: Math.floor(Math.random() * 2 ** 31) });
        const first = game.players.find(p => !p.isBot);
        useUi.getState().setView(first?.id ?? game.players[0].id);
        set({ game });
      },

      // Returns true if the engine accepted the action.
      dispatch: action => {
        const { game } = get();
        if (!game) return false;
        const r = step(game, action);
        if (r.rejected) return false;
        set({ game: r.state });
        useUi.getState().setSheetMin(false);
        play('click', useUi.getState().muted);
        runFx(r.fx, r.state);
        return true;
      },

      quit: () => {
        useUi.getState().reset();
        set({ game: null });
      },
    }),
    {
      name: 'laya-save',
      version: SAVE_VERSION,
      storage: createJSONStorage(() => safeStorage),
      partialize: s => ({ game: s.game }),
      migrate: () => ({ game: null }),
    },
  ),
);
