// Tiny synthesized sound effects (no audio files). Muted state lives in the UI store.
import { audioContext as audio } from './audio.js';

function tone(freq, start, dur, type = 'sine', gain = 0.08) {
  const a = audio();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, a.currentTime + start);
  g.gain.setValueAtTime(0.0001, a.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, a.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + dur);
  o.connect(g).connect(a.destination);
  o.start(a.currentTime + start);
  o.stop(a.currentTime + start + dur + 0.02);
}

const SOUNDS = {
  click: () => tone(660, 0, 0.06, 'triangle', 0.05),
  step: () => { tone(520, 0, 0.06, 'triangle', 0.06); tone(780, 0.03, 0.05, 'sine', 0.03); },
  dice: () => [0, 0.07, 0.15, 0.26, 0.4].forEach((t, i) => tone(180 + (i % 2) * 90, t, 0.04, 'square', 0.03)),
  land: () => { tone(140, 0, 0.09, 'triangle', 0.12); tone(520, 0.02, 0.06, 'square', 0.03); },
  whoosh: () => [0, 0.04, 0.08].forEach((t, i) => tone(300 + i * 180, t, 0.08, 'triangle', 0.04)),
  coin: () => { tone(988, 0, 0.08, 'square', 0.04); tone(1319, 0.08, 0.22, 'square', 0.04); },
  buy: () => [523, 659, 784].forEach((f, i) => tone(f, i * 0.07, 0.15, 'triangle', 0.06)),
  bad: () => { tone(300, 0, 0.18, 'sawtooth', 0.04); tone(220, 0.15, 0.3, 'sawtooth', 0.04); },
  win: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.25, 'triangle', 0.07)),
};

export function play(name, muted) {
  if (muted) return;
  try {
    SOUNDS[name]?.();
  } catch {
    // audio is optional
  }
}

export function buzz(ms = 12) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // vibration is optional
  }
}
