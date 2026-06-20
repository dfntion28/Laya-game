# LAYA Game — Claude Code Project Instructions

## Project
Filipino financial literacy board game. React + Vite + Zustand + Tailwind CSS.
Single HTML/JS app. No backend. No external APIs. Target: desktop browser 1280px+.

## Before every task
Read GAMEPLAN.md in full before writing any code.

## Build rules
- JavaScript only. No TypeScript.
- Tailwind CSS only for styling. No inline styles. No CSS modules.
- Zustand for all game state. No useState for game logic (only for local UI state).
- Build one module at a time. Never jump ahead in the module list.
- After each module completes, run `npm run dev` to confirm no errors before moving on.
- All peso values are in Philippine Peso (PHP). No currency conversion needed.

## Folder structure

/src

/data          → professions.js, cards.js, boardSpaces.js, gameConstants.js

/store         → gameStore.js

/components    → one file per component

App.jsx

main.jsx

## Module build order (update checkboxes as you finish each)
- [x] Module 1: Data Layer (/src/data/)
- [x] Module 2: Game State Engine (/src/store/gameStore.js)
- [x] Module 3: Financial Statement Component
- [x] Module 4: Board + Player Position Display
- [x] Module 5: Card Draw and Resolution System
- [x] Module 6: Final — Event Log, Freedom Track, Paluwagan, OFW Risk, Polish, Help Modal

## Code style
- Component files: PascalCase.jsx
- Data files: camelCase.js
- All card and space names keep their Filipino/Tagalog names as defined in GAMEPLAN.md
- No console.log left in final code
- Comments only where logic is non-obvious
