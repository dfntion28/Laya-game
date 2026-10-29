// Bouncy kitchen-party background loop, synthesized live with WebAudio (no audio files).
// I-vi-IV-V in C with a marimba-ish lead, plucked bass, shaker and a soft kick.
let ctx = null;
let master = null;
let timer = null;
let step = 0;
let nextTime = 0;
let tempo = 112;
let noise = null;

const n = m => 440 * 2 ** ((m - 69) / 12);

// 16 steps per bar, 8 bars. null = rest. MIDI note numbers.
const LEAD = [
  [76, null, 79, null, 84, null, 79, null, 81, null, 79, null, 76, null, 74, null],
  [72, null, 76, null, 81, null, 76, null, 79, null, 76, null, 72, null, null, null],
  [77, null, 81, null, 84, null, 81, null, 79, null, 77, null, 76, null, 74, null],
  [74, null, 79, null, 83, null, 86, null, 84, null, 83, null, 79, null, null, null],
  [76, 79, null, 84, null, 83, 84, null, 81, null, 79, 76, null, 74, 76, null],
  [72, null, 76, 79, null, 81, null, 79, 76, null, 72, null, 74, null, 76, null],
  [77, null, 76, 77, 81, null, 79, null, 77, 76, null, 74, null, 72, null, 74],
  [79, null, null, 74, 79, null, 83, null, 84, null, null, null, 72, null, null, null],
];
const CHORDS = [
  [48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50],
  [48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50],
];

function voice(type, freq, t, dur, gain, filter) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node = o;
  if (filter) {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = filter;
    o.connect(f);
    node = f;
  }
  node.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function hit(t, dur, gain, freq, type = 'highpass') {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t);
  src.stop(t + dur + 0.02);
}

function kick(t) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.setValueAtTime(140, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  g.gain.setValueAtTime(0.5, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + 0.2);
}

function schedule(s, t) {
  const bar = Math.floor(s / 16) % LEAD.length;
  const i = s % 16;
  const sixteenth = 60 / tempo / 4;
  const note = LEAD[bar][i];
  if (note) {
    voice('sine', n(note), t, 0.35, 0.16);
    voice('sine', n(note + 12), t, 0.12, 0.04);
  }
  const chord = CHORDS[bar];
  if (i % 8 === 0) voice('triangle', n(chord[0] - 12), t, sixteenth * 3, 0.22, 900);
  if (i % 8 === 6) voice('triangle', n(chord[0]), t, sixteenth * 1.5, 0.14, 900);
  if (i % 4 === 2) chord.forEach(m => voice('triangle', n(m + 12), t, 0.09, 0.025, 2400));
  if (i % 8 === 0) kick(t);
  if (i % 8 === 4) hit(t, 0.12, 0.12, 1800, 'bandpass');
  if (i % 2 === 1) hit(t, 0.04, 0.05, 7000);
}

function tick() {
  const sixteenth = 60 / tempo / 4;
  while (nextTime < ctx.currentTime + 0.12) {
    // A little swing makes it bounce.
    const swing = step % 2 === 1 ? sixteenth * 0.12 : 0;
    schedule(step, nextTime + swing);
    nextTime += sixteenth;
    step++;
  }
}

export function startMusic() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.22;
      master.connect(ctx.destination);
      noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    if (timer) return;
    nextTime = ctx.currentTime + 0.05;
    timer = setInterval(tick, 25);
  } catch {
    // music is optional
  }
}

export function stopMusic() {
  if (timer) clearInterval(timer);
  timer = null;
}

// Fast Track gets a faster, more urgent groove.
export function setTempo(bpm) {
  tempo = bpm;
}
