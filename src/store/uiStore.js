// Local UI state only (animation, tabs, toasts). Game rules live in gameStore.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '../lib/storage.js';

let toastId = 0;

export const useUi = create(
  persist(
    (set, get) => ({
      tab: 'board',
      viewPid: null,
      muted: false,
      showHelp: false,
      busyCount: 0,
      anim: null, // { pid, path, step, track }
      dice: { values: [1], rollId: 0 },
      toasts: [],
      celebrate: null, // { kind: 'escape' | 'win' | 'bankrupt', pid }
      sheetMin: false,

      setTab: tab => set({ tab }),
      setView: viewPid => set({ viewPid }),
      toggleMute: () => set({ muted: !get().muted }),
      setHelp: showHelp => set({ showHelp }),
      setCelebrate: celebrate => set({ celebrate }),
      setSheetMin: sheetMin => set({ sheetMin }),
      busy: () => set({ busyCount: get().busyCount + 1 }),
      idle: () => set({ busyCount: Math.max(0, get().busyCount - 1) }),
      rollDice: values => set({ dice: { values, rollId: get().dice.rollId + 1 } }),
      startMove: (pid, path, track) => set({ anim: { pid, path, step: 0, track } }),
      tickMove: () => {
        const a = get().anim;
        if (!a) return;
        if (a.step >= a.path.length - 1) set({ anim: null });
        else set({ anim: { ...a, step: a.step + 1 } });
      },
      endMove: () => set({ anim: null }),
      pushToast: t => {
        const id = ++toastId;
        set({ toasts: [...get().toasts.slice(-3), { ...t, id }] });
        setTimeout(() => set({ toasts: get().toasts.filter(x => x.id !== id) }), t.ms || 2600);
      },
      reset: () => set({ anim: null, toasts: [], celebrate: null, busyCount: 0, tab: 'board', viewPid: null }),
    }),
    {
      name: 'laya-ui',
      storage: createJSONStorage(() => safeStorage),
      partialize: s => ({ muted: s.muted }),
    },
  ),
);
