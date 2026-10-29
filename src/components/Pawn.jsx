import { playerTone } from '../lib/theme.js';

// Little chef-hat pawn with eyes. Color comes from the player.
export default function Pawn({ color, className = 'size-8' }) {
  const tone = playerTone[color] ?? playerTone.red;
  return (
    <svg viewBox="0 0 32 36" className={className} aria-hidden="true">
      <ellipse cx="16" cy="33" rx="10" ry="2.5" className="fill-ink/25" />
      <path d="M7 31c0-6 3-9 4.5-11a7.5 7.5 0 1 1 9 0C22 22 25 25 25 31z" className={tone.fill} stroke="#1f1633" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M10.5 9.5a3 3 0 0 1 1.8-5.3 4 4 0 0 1 7.4 0 3 3 0 0 1 1.8 5.3z" fill="#fff" stroke="#1f1633" strokeWidth="2.2" strokeLinejoin="round" />
      <ellipse cx="13.6" cy="14.8" rx="1.3" ry="1.7" fill="#1f1633" />
      <ellipse cx="18.4" cy="14.8" rx="1.3" ry="1.7" fill="#1f1633" />
      <path d="M14 18.4q2 1.4 4 0" fill="none" stroke="#1f1633" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
