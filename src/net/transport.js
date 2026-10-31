// Message relay for online rooms. Every message goes to everyone else in the room.
// Production uses Supabase Realtime broadcast (needs VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).
// `?net=local` uses a BroadcastChannel instead: tabs of one browser act as separate phones, for testing.

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function localMode() {
  try {
    return new URLSearchParams(window.location.search).get('net') === 'local';
  } catch {
    return false;
  }
}

export const onlineAvailable = () => localMode() || (!!URL && !!KEY);

function openLocal(room, onMessage) {
  const bc = new BroadcastChannel(`laya-${room}`);
  bc.onmessage = e => onMessage(e.data);
  return Promise.resolve({
    send: msg => bc.postMessage(msg),
    close: () => bc.close(),
  });
}

let client = null;

async function openSupabase(room, onMessage, onStatus) {
  if (!client) {
    const { createClient } = await import('@supabase/supabase-js');
    client = createClient(URL, KEY, { auth: { persistSession: false } });
  }
  const ch = client.channel(`laya-${room}`, { config: { broadcast: { self: false } } });
  ch.on('broadcast', { event: 'm' }, ({ payload }) => onMessage(payload));
  await new Promise((resolve, reject) => {
    let first = true;
    ch.subscribe(status => {
      if (status === 'SUBSCRIBED') {
        onStatus?.('up');
        if (first) resolve();
        first = false;
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        onStatus?.('down');
        if (first) reject(new Error(status));
        first = false;
      }
    });
  });
  return {
    send: msg => ch.send({ type: 'broadcast', event: 'm', payload: msg }),
    close: () => client.removeChannel(ch),
  };
}

export function openRoom(room, onMessage, onStatus) {
  return localMode() ? openLocal(room, onMessage) : openSupabase(room, onMessage, onStatus);
}
