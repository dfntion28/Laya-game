// Online rooms. The host's phone runs the game: it checks every move with the rules engine and sends the
// new game state to everyone. Guests send their moves to the host and play the animations they get back.
import { openRoom } from './transport.js';
import { useNet } from '../store/netStore.js';
import { useGame } from '../store/gameStore.js';
import { useUi } from '../store/uiStore.js';
import { actorOf } from '../engine/engine.js';
import { safeStorage } from '../lib/storage.js';
import { MAX_PLAYERS } from '../data/constants.js';

const SAVE_KEY = 'laya-net';
const LOCAL_BACKUP = 'laya-save-local';
const HEARTBEAT_MS = 4000;
const OFFLINE_MS = 13000;
const ANYTIME = new Set(['BORROW', 'REPAY', 'INSURANCE', 'SELL_ASSET', 'USE_CARD']);
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

let link = null;
let beat = null;
let seq = 0;
let lastSeq = -1;

let tabId = null;

export function deviceId() {
  // Local test mode: tabs share storage, so each tab gets its own id.
  if (new URLSearchParams(window.location.search).get('net') === 'local') {
    tabId ??= Math.random().toString(36).slice(2, 10);
    return tabId;
  }
  let id = safeStorage.getItem('laya-cid');
  if (!id) {
    id = Math.random().toString(36).slice(2, 10);
    safeStorage.setItem('laya-cid', id);
  }
  return id;
}

export function newRoomCode() {
  return Array.from({ length: 5 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
}

export function roomLink(room) {
  const u = new URL(window.location.href);
  u.search = '';
  u.searchParams.set('room', room);
  const local = new URLSearchParams(window.location.search).get('net');
  if (local) u.searchParams.set('net', local);
  return u.toString();
}

function save() {
  const n = useNet.getState();
  safeStorage.setItem(SAVE_KEY, JSON.stringify({ mode: n.mode, room: n.room, me: n.me, profile: n.profile, seq }));
}

function send(msg) {
  link?.send({ ...msg, from: deviceId() });
}

// ─── Host ──────────────────────────────────────────────────────────────────

function hostRoster() {
  return useNet.getState().roster;
}

function publishLobby() {
  send({ t: 'lobby', roster: hostRoster() });
}

function upsertSeat(cid, profile) {
  const roster = hostRoster();
  const i = roster.findIndex(r => r.cid === cid);
  const seat = { ...(roster[i] || {}), cid, ...profile, seen: Date.now() };
  const next = i >= 0 ? roster.map((r, j) => (j === i ? seat : r)) : [...roster, seat];
  useNet.getState().set({ roster: next });
}

function allowed(game, action, pid) {
  if (!pid) return false;
  if (ANYTIME.has(action.type)) return action.pid === pid;
  if (action.type === 'SELL_OFFER') return action.pid2 === pid;
  return actorOf(game)?.id === pid;
}

function onHostMessage(m) {
  const net = useNet.getState();
  if (m.t === 'hello') {
    const known = net.roster.some(r => r.cid === m.from);
    const game = useGame.getState().game;
    // Once the game has started, only seated players can come back. After a host reload the seats
    // have no device ids yet, so a returning guest reclaims the seat it says it had.
    if (net.status === 'playing' && !known) {
      const seat = net.roster.find(r => r.pid === m.me && !r.isBot && !r.cid);
      if (!seat || !game) return;
      net.set({ roster: net.roster.map(r => (r === seat ? { ...r, cid: m.from, seen: Date.now() } : r)) });
      sendState(game, [], m.from);
      return;
    }
    if (net.status !== 'playing' && !known && net.roster.length >= MAX_PLAYERS) {
      send({ t: 'full', to: m.from });
      return;
    }
    upsertSeat(m.from, net.status === 'playing' ? {} : m.profile);
    if (net.status === 'playing' && game) sendState(game, [], m.from);
    else publishLobby();
    return;
  }
  if (m.t === 'act') {
    const game = useGame.getState().game;
    const seat = net.roster.find(r => r.cid === m.from);
    if (!game || !seat || !allowed(game, m.action, seat.pid)) return;
    useGame.getState().dispatch(m.action);
    return;
  }
  if (m.t === 'sync') {
    const game = useGame.getState().game;
    if (game) sendState(game, [], m.from);
    return;
  }
  if (m.t === 'bye') {
    if (net.status !== 'playing') {
      net.set({ roster: net.roster.filter(r => r.cid !== m.from) });
      publishLobby();
    }
  }
}

function sendState(game, fx, to = null) {
  send({ t: 'state', seq, game, fx, seats: seatMap(), to });
}

function seatMap() {
  return Object.fromEntries(hostRoster().filter(r => !r.isBot && r.cid).map(r => [r.cid, r.pid]));
}

// Called by the game store after the host applies any move.
export function hostBroadcast(game, fx) {
  seq++;
  sendState(game, fx);
  save();
}

// ─── Guest ─────────────────────────────────────────────────────────────────

function onGuestMessage(m) {
  const net = useNet.getState();
  if (m.to && m.to !== deviceId()) return;
  if (m.t === 'full') {
    net.set({ status: 'idle', error: 'That room is full.' });
    return;
  }
  if (m.t === 'lobby') {
    net.set({ roster: m.roster, status: net.status === 'playing' ? 'playing' : 'lobby', hostSeen: Date.now(), hostQuiet: false });
    return;
  }
  if (m.t === 'state') {
    net.set({ hostSeen: Date.now(), hostQuiet: false });
    const me = m.seats?.[deviceId()];
    if (!me) {
      net.set({ status: 'idle', error: 'This game started without you.' });
      return;
    }
    if (m.seq <= lastSeq && m.fx.length) return;
    const first = net.status !== 'playing';
    lastSeq = Math.max(lastSeq, m.seq);
    net.set({ me, status: 'playing' });
    if (first) {
      useUi.getState().setView(me);
      inbox.length = 0;
      useGame.getState().applyRemote(m.game, []);
    } else {
      inbox.push(m);
      drain();
    }
    save();
  }
}

// States arrive at the host's pace. Play them one at a time; if this phone falls far behind, jump ahead.
const inbox = [];
let waiting = null;

function drain() {
  if (!inbox.length) return;
  if (useUi.getState().busyCount > 0) {
    if (!waiting) {
      waiting = useUi.subscribe(st => {
        if (st.busyCount === 0) {
          waiting();
          waiting = null;
          drain();
        }
      });
    }
    return;
  }
  if (inbox.length > 3) {
    const latest = inbox[inbox.length - 1];
    inbox.length = 0;
    useGame.getState().applyRemote(latest.game, []);
    return;
  }
  const m = inbox.shift();
  useGame.getState().applyRemote(m.game, m.fx);
  if (useUi.getState().busyCount === 0) drain();
}

// ─── Shared ────────────────────────────────────────────────────────────────

async function connect(room) {
  link?.close();
  const playing = useNet.getState().status === 'playing';
  useNet.getState().set({ room, status: playing ? 'playing' : 'connecting', error: null });
  link = await openRoom(
    room,
    m => {
      if (m.from === deviceId()) return;
      if (useNet.getState().mode === 'host') onHostMessage(m);
      else onGuestMessage(m);
    },
    s => useNet.getState().set({ linkDown: s === 'down' }),
  );
  clearInterval(beat);
  beat = setInterval(heartbeat, HEARTBEAT_MS);
}

function heartbeat() {
  const net = useNet.getState();
  if (net.mode === 'host') {
    const now = Date.now();
    net.set({ roster: net.roster.map(r => (r.cid === deviceId() || r.isBot ? { ...r, seen: now } : r)) });
    if (net.status !== 'playing') publishLobby();
    else send({ t: 'lobby', roster: hostRoster() });
  } else if (net.mode === 'guest') {
    send({ t: 'hello', profile: net.profile, me: net.me });
    // Ask for the latest state if the host has gone quiet (missed messages, phone slept).
    const quiet = Date.now() - (net.hostSeen || Date.now()) > OFFLINE_MS;
    if (quiet !== !!net.hostQuiet) net.set({ hostQuiet: quiet });
    if (net.status === 'playing' && quiet) send({ t: 'sync' });
  }
}

function backupLocalSave() {
  const current = safeStorage.getItem('laya-save');
  if (current && !safeStorage.getItem(LOCAL_BACKUP)) safeStorage.setItem(LOCAL_BACKUP, current);
}

export async function hostRoom(profile) {
  backupLocalSave();
  useGame.getState().quit();
  const room = newRoomCode();
  seq = 0;
  useNet.getState().set({ mode: 'host', profile, me: null, roster: [{ cid: deviceId(), ...profile, host: true, seen: Date.now() }] });
  await connect(room);
  useNet.getState().set({ status: 'lobby' });
  save();
  return room;
}

export async function joinRoom(room, profile) {
  backupLocalSave();
  useGame.getState().quit();
  lastSeq = -1;
  useNet.getState().set({ mode: 'guest', profile, me: null, roster: [], joinedAt: Date.now() });
  await connect(room);
  useNet.getState().set({ status: 'lobby' });
  save();
  send({ t: 'hello', profile });
}

export function updateProfile(profile) {
  const net = useNet.getState();
  net.set({ profile });
  if (net.mode === 'host') {
    upsertSeat(deviceId(), profile);
    publishLobby();
  } else {
    send({ t: 'hello', profile });
  }
  save();
}

export function addBotSeat(bot) {
  const net = useNet.getState();
  if (net.roster.length >= MAX_PLAYERS) return;
  net.set({ roster: [...net.roster, { cid: `bot-${Math.random().toString(36).slice(2, 7)}`, ...bot, isBot: true, ready: true, seen: Date.now() }] });
  publishLobby();
}

export function removeSeat(cid) {
  const net = useNet.getState();
  net.set({ roster: net.roster.filter(r => r.cid !== cid) });
  publishLobby();
}

export function startOnline() {
  const net = useNet.getState();
  const roster = net.roster.map((r, i) => ({ ...r, pid: `p${i}` }));
  net.set({ roster, status: 'playing', me: roster.find(r => r.cid === deviceId()).pid });
  useGame.getState().newGame({
    players: roster.map(r => ({
      name: r.name, isBot: !!r.isBot, botLevel: r.botLevel, botStyle: r.botStyle, professionId: r.professionId, dreamId: r.dreamId,
    })),
  });
  useUi.getState().setView(useNet.getState().me);
  hostBroadcast(useGame.getState().game, []);
}

// Guests route moves here instead of applying them.
export function sendAction(action) {
  send({ t: 'act', action });
}

export function leaveRoom() {
  send({ t: 'bye' });
  clearInterval(beat);
  beat = null;
  link?.close();
  link = null;
  useNet.getState().reset();
  safeStorage.removeItem(SAVE_KEY);
  useGame.getState().quit();
  const backup = safeStorage.getItem(LOCAL_BACKUP);
  if (backup) {
    safeStorage.setItem('laya-save', backup);
    safeStorage.removeItem(LOCAL_BACKUP);
    useGame.persist.rehydrate();
  }
  const u = new URL(window.location.href);
  u.searchParams.delete('room');
  window.history.replaceState(null, '', u.toString());
}

// After a reload: reconnect to the room this device was in.
export async function resumeRoom() {
  let saved = null;
  try {
    saved = JSON.parse(safeStorage.getItem(SAVE_KEY) || 'null');
  } catch {
    saved = null;
  }
  if (!saved?.room) return false;
  seq = saved.seq || 0;
  const game = useGame.getState().game;
  if (!game) {
    // The game never started (or was cleared): nothing to rejoin.
    safeStorage.removeItem(SAVE_KEY);
    return false;
  }
  if (saved.mode === 'host') {
    useNet.getState().set({ mode: 'host', profile: saved.profile, me: saved.me, roster: [] });
    // Rebuild seats from the saved game; guests re-announce themselves with their heartbeat.
    useNet.getState().set({
      roster: game.players.map(p => ({ cid: p.id === saved.me ? deviceId() : null, pid: p.id, name: p.name, isBot: p.isBot, seen: p.isBot || p.id === saved.me ? Date.now() : 0 })),
    });
    useNet.getState().set({ status: 'playing', room: saved.room });
    await connect(saved.room);
    useNet.getState().set({ status: 'playing' });
    return true;
  }
  useNet.getState().set({ mode: 'guest', profile: saved.profile, me: saved.me, roster: [], status: 'playing', room: saved.room });
  lastSeq = -1;
  await connect(saved.room);
  useNet.getState().set({ status: 'playing' });
  send({ t: 'hello', profile: saved.profile, me: saved.me });
  send({ t: 'sync' });
  return true;
}
