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
- `src/components/` — one component per file, PascalCase.jsx.
- `src/lib/` — formatting, theme class maps, sound, safe storage.
- `scripts/simulate.mjs` — headless bot games for balance and crash checks.

## Build rules
- JavaScript only. No TypeScript.
- Tailwind only for styling. Custom utilities/keyframes live in `src/index.css` (`@theme`, `@utility`). No inline `style`, no CSS modules.
  For dynamic sizes (progress bars) use SVG attributes. Keep Tailwind class strings literal (see `src/lib/theme.js`).
- Game rules change only in `src/engine/` — never in components.
- After any rules or data change: `node scripts/simulate.mjs 100 1` (must finish with no errors) and check pacing.
- Before committing: `npm run lint` and `npm run build` must pass.
- All card and space names keep their Filipino/Tagalog names.
- No console.log in final code. Comments only where logic is non-obvious.
