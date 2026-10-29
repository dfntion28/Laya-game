// One shared WebAudio context for music and sound effects.
// iPhones only unlock audio inside a real tap (click/touchend), so callers resume it from those.
let ctx = null;

export function audioContext() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
