# LAYA Game — Claude Code Project Instructions

## Project
Filipino financial literacy board game (Rich Dad Poor Dad / CASHFLOW style). React 19 + Vite + Zustand + Tailwind CSS v4.
Static site. No backend. No external APIs. **Mobile-first** (portrait phone), scales up to desktop.

## Before every task
Read GAMEPLAN.md before writing code.

## Architecture
- `src/data/` — all game content and constants (professions, cards, board, constants). Peso values in PHP.
- `src/engine/` — pure rules. `step(state, action) -> { state, fx }`. No React, no DOM, no Math.random (seeded RNG in state).
  `bot.js` = AI player; `finance.js` = derived numbers shared with UI.
- `src/store/` — `gameStore.js` (Zustand, persisted to localStorage), `uiStore.js` (animation/tab/toast UI state), `fxRunner.js` (turns engine fx into timed animations/sounds).
  `gameStore.shown` is what the screen renders: it lags behind `game` until the fx animations finish, so results never show before the pawn lands. Display components read `s.shown ?? s.game`; only the bot driver reads `game`.
- `src/components/` — one component per file, PascalCase.jsx.
- `src/lib/` — formatting, theme class maps, sound effects and music (one shared WebAudio context in `audio.js`; start it from click/touchend, not pointerdown, or iPhones stay silent), safe storage.
- `scripts/simulate.mjs` — headless bot games for balance and crash checks. `node scripts/simulate.mjs versus 270` checks that Hard bots beat Normal beat Easy.

## Build rules
- JavaScript only. No TypeScript.
- Tailwind only for styling. Custom utilities/keyframes live in `src/index.css` (`@theme`, `@utility`). No inline `style`, no CSS modules.
  For dynamic sizes (progress bars) use SVG attributes. Keep Tailwind class strings literal (see `src/lib/theme.js`).
- Game rules change only in `src/engine/` — never in components.
- After any rules or data change: `node scripts/simulate.mjs 100 1` (must finish with no errors) and check pacing.
- Before committing: `npm run lint` and `npm run build` must pass.
- Player-facing text is English by default. Use Filipino only for words Filipinos naturally say in English conversation (sari-sari, 5-6, paluwagan, ninong, barkada, padala, Pasko, Diskarte). Keep copy short and plain: no emoji in buttons or headings, no em dashes.
- No console.log in final code. Comments only where logic is non-obvious.
