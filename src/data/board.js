// Both tracks use the same 24-cell square loop (7x7 grid perimeter). Corners are paydays.

export const spaceTypes = {
  sahod:     { label: 'Sahod',      emoji: '💰', tone: 'gold',   help: 'Payday. Dadaan o tatapak: kolektahin ang cashflow mo. Isang buwan ang lumipas.' },
  oport:     { label: 'Oportunidad', emoji: '💼', tone: 'green', help: 'Pumili ng Maliit o Malaking Deal. Bumili ng assets na nagbibigay ng passive income.' },
  gastos:    { label: 'Gastos',     emoji: '🛍️', tone: 'red',    help: 'Doodads. Mga gastusing hindi maiiwasan — pero minsan may pagpipilian.' },
  merkado:   { label: 'Merkado',    emoji: '📈', tone: 'violet', help: 'Market event. May buyer para sa assets mo, o nagbago ang ekonomiya.' },
  buhay:     { label: 'Buhay',      emoji: '🌦️', tone: 'sky',    help: 'Life event. Anak, kasal, promotion, sakit — ganyan ang buhay.' },
  aral:      { label: 'Aral',       emoji: '🎓', tone: 'amber',  help: 'Financial education. Bumili ng skill na permanenteng tutulong sa iyo.' },
  tulong:    { label: 'Tulong',     emoji: '🤝', tone: 'rose',   help: 'Charity. Mag-donate ng 10% ng kita: 2 dice sa 3 turns at +1 Diskarte.' },
  tanggal:   { label: 'Tanggal',    emoji: '📦', tone: 'slate',  help: 'Downsized. Walang sahod sa susunod na 2 Sahod. Passive income lang ang aasahan mo.' },
  koneksyon: { label: 'Koneksyon',  emoji: '🧑‍🤝‍🧑', tone: 'teal', help: 'Network card. Itago at gamitin sa tamang panahon.' },
  // Fast Track
  cfday:     { label: 'Cashflow Day', emoji: '💎', tone: 'gold', help: 'Kolektahin ang buong Fast Track cashflow mo.' },
  ftdeal:    { label: 'Negosyo',    emoji: '🏢', tone: 'green',  help: 'Malaking negosyo. Bilhin para dagdagan ang cashflow mo.' },
  gamble:    { label: 'Sugal-Negosyo', emoji: '🎲', tone: 'violet', help: 'High-risk venture. Magbayad, mag-roll, at umasa.' },
  pangarap:  { label: 'Pangarap',   emoji: '🌟', tone: 'pink',   help: 'Dream space. Kung ito ang pangarap mo at kaya mo — bilhin at manalo!' },
  sakuna:    { label: 'Sakuna',     emoji: '⚖️', tone: 'red',    help: 'Disaster. Kaso, audit, o away-pamilya — mawawalan ka ng cash.' },
  foundation:{ label: 'Foundation', emoji: '🕊️', tone: 'rose',   help: `Mag-donate ng ₱1M: 3 dice sa susunod na 3 turns.` },
};

export const ratRace = [
  'sahod', 'oport', 'gastos', 'oport', 'merkado', 'buhay',
  'sahod', 'oport', 'tulong', 'oport', 'gastos', 'merkado',
  'sahod', 'oport', 'aral', 'oport', 'tanggal', 'merkado',
  'sahod', 'oport', 'gastos', 'buhay', 'oport', 'koneksyon',
];

// Fast Track: fixed deals live on specific spaces (index -> deal id in cards.js ftDeals).
export const fastTrack = [
  'cfday', 'gamble', 'ftdeal', 'pangarap', 'sakuna', 'ftdeal',
  'cfday', 'gamble', 'ftdeal', 'pangarap', 'foundation', 'ftdeal',
  'cfday', 'sakuna', 'ftdeal', 'pangarap', 'ftdeal', 'gamble',
  'cfday', 'ftdeal', 'sakuna', 'pangarap', 'ftdeal', 'pangarap',
];

// Grid placement for index 0..23 on a 7x7 board. 0 = bottom-right, travels clockwise
// along the bottom toward the left, up the left side, across the top, down the right.
export const cellGrid = [
  'col-start-7 row-start-7', 'col-start-6 row-start-7', 'col-start-5 row-start-7',
  'col-start-4 row-start-7', 'col-start-3 row-start-7', 'col-start-2 row-start-7',
  'col-start-1 row-start-7', 'col-start-1 row-start-6', 'col-start-1 row-start-5',
  'col-start-1 row-start-4', 'col-start-1 row-start-3', 'col-start-1 row-start-2',
  'col-start-1 row-start-1', 'col-start-2 row-start-1', 'col-start-3 row-start-1',
  'col-start-4 row-start-1', 'col-start-5 row-start-1', 'col-start-6 row-start-1',
  'col-start-7 row-start-1', 'col-start-7 row-start-2', 'col-start-7 row-start-3',
  'col-start-7 row-start-4', 'col-start-7 row-start-5', 'col-start-7 row-start-6',
];

export const BOARD_SIZE = 24;
