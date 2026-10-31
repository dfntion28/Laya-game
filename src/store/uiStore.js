// Local UI state only (animation, tabs, toasts, settings). Game rules live in gameStore.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '../lib/storage.js';

let toastId = 0;
let burstId = 0;

export const useUi = create(
  persist(
    (set, get) => ({
      tab: 'board',
      viewPid: null,
      muted: false,
      music: true,
      fastBots: false,
      showHelp: false,
      busyCount: 0,
      anim: null, // { pid, path, step, track, quick }
      ghost: null, // { pid, path, track }: pawn parked on the rolled space while the player decides
      dice: { values: [1], rollId: 0, rolling: false },
      toasts: [],
      banner: null, // { id, text, sub }
      bursts: [],

      setTab: tab => set({ tab }),
      setView: viewPid => set({ viewPid }),
      toggleMute: () => set({ muted: !get().muted }),
      toggleMusic: () => set({ music: !get().music }),
      toggleFastBots: () => set({ fastBots: !get().fastBots }),
      setHelp: showHelp => set({ showHelp }),
      busy: () => set({ busyCount: get().busyCount + 1 }),
      idle: () => set({ busyCount: Math.max(0, get().busyCount - 1) }),
      rollDice: values => set({ dice: { values, rollId: get().dice.rollId + 1, rolling: true } }),
      landDice: () => set({ dice: { ...get().dice, rolling: false } }),
      startMove: (pid, path, track, ms = 430) => set({ anim: { pid, path, step: 0, track, quick: ms < 400 }, ghost: null }),
      park: (pid, path, track) => set({ ghost: { pid, path, track } }),
      tickMove: () => {
        const a = get().anim;
        if (a && a.step < a.path.length - 1) set({ anim: { ...a, step: a.step + 1 } });
      },
      endMove: () => set({ anim: null }),
      pushToast: t => {
        const id = ++toastId;
        set({ toasts: [...get().toasts.slice(-2), { ...t, id }] });
        setTimeout(() => set({ toasts: get().toasts.filter(x => x.id !== id) }), t.ms || 2600);
      },
      showBanner: (text, sub) => {
        const id = ++toastId;
        set({ banner: { id, text, sub } });
        setTimeout(() => {
          if (get().banner?.id === id) set({ banner: null });
        }, 1300);
      },
      burst: () => {
        const id = ++burstId;
        set({ bursts: [...get().bursts, id] });
        setTimeout(() => set({ bursts: get().bursts.filter(x => x !== id) }), 1000);
      },
      reset: () => set({ anim: null, ghost: null, toasts: [], banner: null, bursts: [], busyCount: 0, tab: 'board', viewPid: null }),
    }),
    {
      name: 'laya-ui',
      storage: createJSONStorage(() => safeStorage),
      partialize: s => ({ muted: s.muted, music: s.music, fastBots: s.fastBots }),
    },
  ),
);
