// Who this device is in an online game. Local games (solo, bots, pass and play) leave mode = 'local'.
import { create } from 'zustand';

export const useNet = create(set => ({
  mode: 'local', // 'local' | 'host' | 'guest'
  room: null,
  me: null, // player id this device controls in an online game
  status: 'idle', // 'idle' | 'connecting' | 'lobby' | 'playing' | 'lost'
  roster: [], // lobby seats: { cid, name, professionId, dreamId, ready, host, isBot, botLevel, seen }
  error: null,
  set: patch => set(patch),
  reset: () => set({ mode: 'local', room: null, me: null, status: 'idle', roster: [], error: null }),
}));

// Can this device make decisions for player `pid`?
export function controls(net, game, pid) {
  const pl = game.players.find(p => p.id === pid);
  if (!pl || pl.isBot) return false;
  return net.mode === 'local' || net.me === pid;
}

export function useControls(game) {
  const mode = useNet(s => s.mode);
  const me = useNet(s => s.me);
  return pid => controls({ mode, me }, game, pid);
}
