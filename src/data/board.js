// Both tracks use the same 24-cell square loop (7x7 grid perimeter). Corners are paydays.

export const spaceTypes = {
  sahod:     { label: 'Payday',    icon: 'coin',   tone: 'gold',   help: 'Pass or land here to collect your monthly cashflow. One month goes by.' },
  oport:     { label: 'Deal',      icon: 'deal',   tone: 'green',  help: 'Pick a small or big deal. Buy assets that pay you every month.' },
  gastos:    { label: 'Expense',   icon: 'bag',    tone: 'red',    help: 'Stuff you pay for whether you like it or not. Sometimes you get a choice.' },
  merkado:   { label: 'Market',    icon: 'chart',  tone: 'violet', help: 'A buyer wants your property, or the economy shifts.' },
  buhay:     { label: 'Life',      icon: 'life',   tone: 'sky',    help: 'Babies, weddings, promotions, hospital bills.' },
  aral:      { label: 'Seminar',   icon: 'cap',    tone: 'amber',  help: 'Pay for a skill that helps you for the rest of the game.' },
  tulong:    { label: 'Charity',   icon: 'heart',  tone: 'rose',   help: 'Give 10% of your income. Roll 2 dice for 3 turns and get +1 Diskarte.' },
  tanggal:   { label: 'Laid Off',  icon: 'box',    tone: 'slate',  help: 'No salary for 2 paydays. Only passive income comes in.' },
  koneksyon: { label: 'Contacts',  icon: 'people', tone: 'teal',   help: 'Draw a contact card. Keep it and use it when it counts.' },
  // Fast Track
  cfday:     { label: 'Cashflow',  icon: 'gem',    tone: 'gold',   help: 'Collect your full Fast Track cashflow.' },
  ftdeal:    { label: 'Business',  icon: 'tower',  tone: 'green',  help: 'A big business. Buy it to raise your cashflow.' },
  gamble:    { label: 'Long Shot', icon: 'dice',   tone: 'violet', help: 'Pay in, roll one die, hope for the best.' },
  pangarap:  { label: 'Dream',     icon: 'star',   tone: 'pink',   help: 'If this is your dream and you can afford it, buy it and win.' },
  sakuna:    { label: 'Disaster',  icon: 'bolt',   tone: 'red',    help: 'A lawsuit, an audit, or a family fight. You lose part of your cash.' },
  foundation:{ label: 'Donate',    icon: 'heart',  tone: 'rose',   help: 'Donate ₱1M to roll 3 dice for 3 turns.' },
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
