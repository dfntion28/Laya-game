import { useEffect, useState } from 'react';
import { useNet } from '../store/netStore.js';
import { professions } from '../data/professions.js';
import { dreams } from '../data/cards.js';
import { PLAYER_COLORS, MAX_PLAYERS } from '../data/constants.js';
import { onlineAvailable } from '../net/transport.js';
import {
  hostRoom, joinRoom, updateProfile, addBotSeat, removeSeat, startOnline, leaveRoom, roomLink, deviceId,
} from '../net/online.js';
import { Btn, Surface, LIST } from './Ui.jsx';
import Pawn from './Pawn.jsx';
import { Draft } from './SetupScreen.jsx';
import { pickN, newBot } from '../lib/setup.js';

const OFFLINE_MS = 13000;
const NAME_KEY = 'laya-name';

function savedName() {
  try {
    return localStorage.getItem(NAME_KEY) || '';
  } catch {
    return '';
  }
}

function Shell({ children, onBack }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 py-6">
      {onBack && <button type="button" onClick={onBack} className="self-start font-display text-lg">← Back</button>}
      {children}
    </div>
  );
}

function NotSetUp({ onBack }) {
  return (
    <Shell onBack={onBack}>
      <h2 className="font-display text-4xl text-white text-stroke-sm">Play online</h2>
      <Surface className="p-4 text-[15px] font-bold">
        <p>Online play isn't switched on for this site yet.</p>
        <p className="mt-2 text-ink-soft">The owner needs to connect a free Supabase project. Steps are in the README under "Online play".</p>
      </Surface>
    </Shell>
  );
}

// Step 1: your name, then create a room or join one.
function Entry({ code: initialCode, onBack }) {
  const error = useNet(s => s.error);
  const [name, setName] = useState(savedName);
  const [code, setCode] = useState(initialCode || '');
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState(null);
  const clean = name.trim().slice(0, 14);
  const run = async fn => {
    if (!clean) return;
    try {
      localStorage.setItem(NAME_KEY, clean);
    } catch {
      // name memory is optional
    }
    setBusy(true);
    setFail(null);
    try {
      await fn();
    } catch {
      setFail('Could not reach the game server. Check your connection and try again.');
    }
    setBusy(false);
  };
  return (
    <Shell onBack={onBack}>
      <h2 className="font-display text-4xl text-white text-stroke-sm">Play online</h2>
      <p className="-mt-2 text-sm font-extrabold">Each player uses their own phone. Up to {MAX_PLAYERS} players.</p>
      <Surface className="flex flex-col gap-3 p-4">
        <label htmlFor="online-name" className="font-display text-lg">Your name</label>
        <input id="online-name" value={name} maxLength={14} onChange={e => setName(e.target.value)} className="rounded-xl border-[2.5px] border-ink bg-white px-3 py-2 text-base font-extrabold focus:outline-none" />
      </Surface>
      {(fail || error) && <p className="rounded-xl bg-tomato px-3 py-2 text-sm font-extrabold text-white">{fail || error}</p>}
      <Surface className="flex flex-col gap-3 p-4">
        <div className="font-display text-xl">Join a friend</div>
        <input
          aria-label="Room code"
          value={code}
          maxLength={5}
          placeholder="Room code"
          onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          className="rounded-xl border-[2.5px] border-ink bg-white px-3 py-2 text-center font-display text-2xl tracking-[0.3em] focus:outline-none"
        />
        <Btn variant="blue" disabled={busy || !clean || code.length !== 5} onClick={() => run(() => joinRoom(code, { name: clean, ready: false }))}>Join room</Btn>
      </Surface>
      <div className="text-center font-display text-lg">or</div>
      <Btn size="lg" disabled={busy || !clean} onClick={() => run(async () => {
        const room = await hostRoom({ name: clean, ready: false });
        window.history.replaceState(null, '', roomLink(room));
      })}>
        Create a room
      </Btn>
    </Shell>
  );
}

function Seat({ r, i, host, canKick, now }) {
  const offline = !r.isBot && now - (r.seen || 0) > OFFLINE_MS;
  const prof = professions.find(p => p.id === r.professionId);
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Pawn color={PLAYER_COLORS[i % PLAYER_COLORS.length]} job={r.professionId} className="size-11 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="truncate font-extrabold">{r.name}{r.cid === deviceId() ? ' (you)' : ''}{r.host ? ' · host' : ''}</div>
        <div className="text-xs font-bold text-ink-soft">
          {r.isBot ? `Bot · ${r.botLevel}` : offline ? 'Offline' : r.ready ? prof?.name : 'Picking a job...'}
        </div>
      </div>
      {r.ready && !offline && <span className="rounded-full border-2 border-ink bg-lettuce px-2 py-0.5 text-xs font-extrabold">Ready</span>}
      {host && canKick && <button type="button" aria-label={`Remove ${r.name}`} onClick={() => removeSeat(r.cid)} className="px-1 font-display text-xl">×</button>}
    </div>
  );
}

function Lobby() {
  const net = useNet();
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 2000);
    return () => clearInterval(id);
  }, []);
  const host = net.mode === 'host';
  const link = roomLink(net.room);
  const humans = net.roster.filter(r => !r.isBot);
  const canStart = net.roster.length >= 2 && humans.every(r => r.ready);
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'LAYA', text: `Join my LAYA game. Room ${net.room}`, url: link });
      else {
        await navigator.clipboard.writeText(link);
        setCopied(true);
      }
    } catch {
      // share sheet dismissed
    }
  };
  return (
    <Shell>
      <div className="text-center">
        <div className="text-sm font-extrabold uppercase tracking-widest">Room code</div>
        <div className="font-display text-6xl tracking-[0.2em] text-white text-stroke">{net.room}</div>
      </div>
      <Btn variant="blue" onClick={share}>{copied ? 'Link copied' : 'Share invite link'}</Btn>
      <p className="-mt-2 break-all text-center text-xs font-bold">{link}</p>
      <Surface className="px-4 py-1">
        <div className={LIST}>
          {net.roster.map((r, i) => <Seat key={r.cid} r={r} i={i} host={host} canKick={r.cid !== deviceId()} now={now} />)}
          {net.roster.length === 0 && (
            <p className="py-3 text-sm font-bold text-ink-soft">
              {now - (net.joinedAt || now) > 8000 ? 'No answer from this room. Check the code, or ask the host to open the game.' : 'Connecting to the room...'}
            </p>
          )}
        </div>
      </Surface>
      {host && net.roster.length < MAX_PLAYERS && (
        <Btn variant="ghost" onClick={() => addBotSeat({ ...newBot(net.roster.length), professionId: pickN(professions, 1)[0].id, dreamId: pickN(dreams, 1)[0].id })}>+ Add a bot</Btn>
      )}
      <span className="flex-1" />
      {host ? (
        <Btn size="lg" disabled={!canStart} onClick={startOnline}>{canStart ? 'Start the game' : net.roster.length < 2 ? 'Waiting for players' : 'Waiting for everyone to pick'}</Btn>
      ) : (
        <p className="animate-pulse text-center font-display text-xl">Waiting for the host to start...</p>
      )}
      <Btn variant="ghost" onClick={leaveRoom}>Leave room</Btn>
    </Shell>
  );
}

function Pick() {
  const profile = useNet(s => s.profile);
  const roster = useNet(s => s.roster);
  const [offer, setOffer] = useState(() => ({ prof: pickN(professions, 3).map(p => p.id), dream: pickN(dreams, 3).map(d => d.id), rerolled: false }));
  const i = Math.max(0, roster.findIndex(r => r.cid === deviceId()));
  return (
    <Draft
      slot={{ name: profile.name }}
      color={PLAYER_COLORS[i % PLAYER_COLORS.length]}
      offer={offer.prof}
      dreamOffer={offer.dream}
      rerolled={offer.rerolled}
      onReroll={() => setOffer({ prof: pickN(professions, 3).map(p => p.id), dream: pickN(dreams, 3).map(d => d.id), rerolled: true })}
      onDone={(professionId, dreamId) => updateProfile({ ...profile, professionId, dreamId, ready: true })}
    />
  );
}

export default function OnlineScreen({ code, onBack }) {
  const mode = useNet(s => s.mode);
  const status = useNet(s => s.status);
  const ready = useNet(s => s.profile?.ready);
  if (!onlineAvailable()) return <NotSetUp onBack={onBack} />;
  if (mode === 'local' || status === 'idle' || status === 'connecting') return <Entry code={code} onBack={onBack} />;
  if (!ready) return <Pick />;
  return <Lobby />;
}
