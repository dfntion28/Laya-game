export const TABS = [
  { id: 'board', icon: '🎲', label: 'Board' },
  { id: 'pera', icon: '📊', label: 'Pera' },
  { id: 'assets', icon: '🏦', label: 'Assets' },
  { id: 'log', icon: '📜', label: 'Log' },
];

export const SIDE_TABS = TABS.filter(t => t.id !== 'board');
