import { playerTone } from '../lib/theme.js';

const INK = '#1f1633';
const SKIN = '#f3c597';
const HAIR = '#2b1d14';
const line = { stroke: INK, strokeWidth: 2, strokeLinejoin: 'round', strokeLinecap: 'round' };

const defaultHair = <path d="M10.6 19a9.4 9.4 0 0 1 18.8 0c-2.6-2.4-5.6-3.6-9.4-3.6S13.2 16.6 10.6 19z" fill={HAIR} />;

// Hats and props drawn on top of the body. Each job gets its own silhouette so pawns read at a glance.
const GEAR = {
  inhinyero: {
    hair: null,
    top: (
      <>
        <path d="M10 17.5a10 9.5 0 0 1 20 0z" fill="#ffc72c" {...line} />
        <rect x="6.5" y="16.5" width="27" height="3.2" rx="1.6" fill="#ffc72c" {...line} />
        <path d="M20 8.2v8.3" {...line} fill="none" />
      </>
    ),
    front: <path d="M14.5 31.5h11" stroke="#ffc72c" strokeWidth="2.6" strokeLinecap="round" />,
  },
  nars: {
    top: (
      <>
        <path d="M12.2 13.5l1.8-6h12l1.8 6z" fill="#fff" {...line} />
        <path d="M20 8.4v3.6M18.2 10.2h3.6" stroke="#ff5b3a" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
    front: <path d="M15 30.5l5 4 5-4" fill="#fff" {...line} />,
  },
  guro: {
    top: <circle cx="20" cy="8.6" r="3.6" fill={HAIR} {...line} />,
    face: (
      <g fill="none" {...line} strokeWidth="1.5">
        <circle cx="16.4" cy="20.6" r="2.9" />
        <circle cx="23.6" cy="20.6" r="2.9" />
        <path d="M19.3 20.4h1.4" />
      </g>
    ),
    front: (
      <>
        <rect x="13.5" y="33.5" width="13" height="8.5" rx="1" fill="#ff5b3a" {...line} />
        <path d="M20 33.8v8" {...line} fill="none" strokeWidth="1.4" />
      </>
    ),
  },
  bpo: {
    top: (
      <>
        <path d="M9.6 20a10.4 10.4 0 0 1 20.8 0" fill="none" {...line} strokeWidth="2.6" />
        <rect x="7.4" y="17.6" width="4.4" height="6.6" rx="2.2" fill={INK} />
        <rect x="28.2" y="17.6" width="4.4" height="6.6" rx="2.2" fill={INK} />
        <path d="M10 23.5q0.5 4.8 6 5" fill="none" {...line} strokeWidth="1.6" />
        <circle cx="16.6" cy="28.5" r="1.5" fill={INK} />
      </>
    ),
  },
  kawani: {
    hair: <path d="M10.6 19a9.4 9.4 0 0 1 18.8 0c-1.5-3-4.2-4.6-8-4.6l-1.6 2.4-1-2.3c-3.6 0-6.4 1.6-8.2 4.5z" fill={HAIR} />,
    front: (
      <>
        <path d="M15.4 30.5l4.6 6 4.6-6" fill="none" stroke="#2e8ae6" strokeWidth="1.8" strokeLinecap="round" />
        <rect x="16.8" y="35.6" width="6.4" height="5.4" rx="1" fill="#fff" {...line} strokeWidth="1.6" />
      </>
    ),
  },
  seaman: {
    top: (
      <>
        <path d="M10.2 14.5c0-4.2 4.4-6.8 9.8-6.8s9.8 2.6 9.8 6.8z" fill="#fff" {...line} />
        <rect x="9" y="13.6" width="22" height="3" rx="1.5" fill={INK} />
        <circle cx="20" cy="11" r="1.6" fill="#ffc72c" stroke={INK} strokeWidth="1" />
      </>
    ),
    front: <path d="M14.6 30.6l5.4 5.4 5.4-5.4" fill="#fff" {...line} />,
  },
  negosyante: {
    top: (
      <>
        <rect x="10.2" y="14.2" width="19.6" height="3.6" rx="1.4" fill="#ff5b3a" {...line} />
        <path d="M29.4 16l3.4-2.4M29.4 16.4l3 2.6" {...line} stroke="#ff5b3a" strokeWidth="2.2" />
      </>
    ),
    front: (
      <>
        <path d="M13.6 32.5h12.8v11.3H13.6z" fill="#fff" {...line} />
        <circle cx="20" cy="38" r="2.6" fill="#ffc72c" {...line} strokeWidth="1.4" />
      </>
    ),
  },
  doktor: {
    top: (
      <>
        <path d="M10.8 14.6q9.2-4.4 18.4 0" fill="none" {...line} />
        <circle cx="20" cy="11.4" r="3.1" fill="#cfe8ff" {...line} strokeWidth="1.6" />
      </>
    ),
    front: (
      <>
        <path d="M13.6 31.4l6.4 7 6.4-7" fill="#fff" {...line} strokeWidth="1.6" />
        <path d="M15.5 31q-0.5 8 4.5 8.4" fill="none" {...line} strokeWidth="1.6" />
        <circle cx="20.4" cy="39.4" r="1.7" fill="#cbd5e1" {...line} strokeWidth="1.2" />
      </>
    ),
  },
  freelancer: {
    hair: null,
    top: (
      <>
        <path d="M10.3 17.8a9.7 9.4 0 0 1 19.4 0z" fill="#8b5cf6" {...line} />
        <rect x="9.6" y="15.8" width="20.8" height="3.4" rx="1.6" fill="#8b5cf6" {...line} />
        <circle cx="20" cy="7.6" r="2.4" fill="#fff" {...line} strokeWidth="1.5" />
      </>
    ),
    front: (
      <>
        <rect x="12.2" y="34" width="15.6" height="9.4" rx="1.2" fill="#cbd5e1" {...line} />
        <circle cx="20" cy="38.6" r="1.1" fill="#fff" />
      </>
    ),
  },
};

// Chibi character for a player. Body color = player color, outfit = profession.
export default function Pawn({ color, job, className = 'size-8', shadow = true }) {
  const tone = playerTone[color] ?? playerTone.red;
  const gear = GEAR[job] ?? {};
  const hair = gear.hair === undefined ? defaultHair : gear.hair;
  return (
    <svg viewBox="0 0 40 48" className={className} aria-hidden="true">
      {shadow && <ellipse cx="20" cy="45" rx="11" ry="2.6" className="fill-ink/25" />}
      <path d="M8.6 44.5c0-8.4 4.4-14.6 11.4-14.6s11.4 6.2 11.4 14.6z" className={tone.fill} {...line} strokeWidth="2.4" />
      {gear.front}
      <circle cx="20" cy="20" r="9.6" fill={SKIN} {...line} strokeWidth="2.4" />
      {hair}
      <ellipse cx="16.4" cy="20.8" rx="1.3" ry="1.7" fill={INK} />
      <ellipse cx="23.6" cy="20.8" rx="1.3" ry="1.7" fill={INK} />
      <circle cx="13.8" cy="24" r="1.6" fill="#ff7b9c" opacity="0.55" />
      <circle cx="26.2" cy="24" r="1.6" fill="#ff7b9c" opacity="0.55" />
      <path d="M17.6 24.6q2.4 2 4.8 0" fill="none" {...line} strokeWidth="1.6" />
      {gear.face}
      {gear.top}
    </svg>
  );
}
