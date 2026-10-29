export const TABS = [
  { id: 'board', icon: 'board', label: 'Board' },
  { id: 'pera', icon: 'coin', label: 'Money' },
  { id: 'assets', icon: 'bank', label: 'Assets' },
  { id: 'log', icon: 'list', label: 'Log' },
];

export const SIDE_TABS = TABS.filter(t => t.id !== 'board');
