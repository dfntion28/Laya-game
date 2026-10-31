// Lesson Book progress on this device. Survives new games; it is what you have learned, not game state.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '../lib/storage.js';
import { lessonById } from '../data/lessons.js';

export const useLessons = create(
  persist(
    (set, get) => ({
      found: {}, // id -> { at: first time (ms), times }
      popup: [], // newly found lesson ids waiting to be shown
      open: false, // the Lesson Book modal
      focus: null, // lesson id to scroll to in the book

      unlock: id => {
        if (!lessonById[id]) return;
        const prev = get().found[id];
        const found = { ...get().found, [id]: { at: prev?.at ?? Date.now(), times: (prev?.times ?? 0) + 1 } };
        set(prev ? { found } : { found, popup: [...get().popup, id] });
      },
      dismiss: () => set({ popup: get().popup.slice(1) }),
      openBook: (focus = null) => set({ open: true, focus, popup: focus ? get().popup.filter(x => x !== focus) : get().popup }),
      closeBook: () => set({ open: false, focus: null }),
    }),
    {
      name: 'laya-lessons',
      storage: createJSONStorage(() => safeStorage),
      partialize: s => ({ found: s.found }),
    },
  ),
);
