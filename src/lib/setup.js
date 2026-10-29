// Helpers shared by the local and online setup screens.
import { BOT_STYLES } from '../engine/bot.js';

export const BOT_NAMES = ['Aling Nena', 'Mang Tomas', 'Kuya Jun', 'Ate Joy', 'Tito Boy', 'Lola Remy'];
export const STYLE_KEYS = Object.keys(BOT_STYLES);

export function pickN(arr, n) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

export function newBot(i, level = 'normal') {
  return { name: BOT_NAMES[i % BOT_NAMES.length], isBot: true, botLevel: level, botStyle: STYLE_KEYS[(i * 2 + 1) % STYLE_KEYS.length] };
}

