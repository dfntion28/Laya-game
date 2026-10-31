// Hand-drawn style icon set: white fills with thick ink outlines, 32x32 grid.
const S = { stroke: '#1f1633', strokeWidth: 2.6, strokeLinejoin: 'round', strokeLinecap: 'round' };

const ICONS = {
  coin: (
    <>
      <ellipse cx="16" cy="18" rx="11" ry="10" fill="#e59a00" {...S} />
      <ellipse cx="16" cy="15" rx="11" ry="10" fill="#ffd95a" {...S} />
      <path d="M16 9.5v11M19.5 11.5h-4.8a2.2 2.2 0 0 0 0 4.4h2.6a2.2 2.2 0 0 1 0 4.4h-5" fill="none" {...S} />
    </>
  ),
  deal: (
    <>
      <rect x="4" y="10" width="24" height="16" rx="3" fill="#fff" {...S} />
      <path d="M12 10V7.5A1.5 1.5 0 0 1 13.5 6h5A1.5 1.5 0 0 1 20 7.5V10M4 17h24" fill="none" {...S} />
      <rect x="14" y="15" width="4" height="4" rx="1" fill="#ffd95a" {...S} />
    </>
  ),
  bag: (
    <>
      <path d="M6 11h20l-1.5 15.5a2 2 0 0 1-2 1.5h-13a2 2 0 0 1-2-1.5z" fill="#fff" {...S} />
      <path d="M11.5 13V9a4.5 4.5 0 0 1 9 0v4" fill="none" {...S} />
    </>
  ),
  chart: (
    <>
      <rect x="4" y="5" width="24" height="22" rx="3" fill="#fff" {...S} />
      <path d="M8 21l5-6 4 3 7-8" fill="none" {...S} />
      <path d="M19 10h5v5" fill="none" {...S} />
    </>
  ),
  life: (
    <>
      <circle cx="12" cy="12" r="5.5" fill="#ffd95a" {...S} />
      <path d="M10 25h14a5 5 0 0 0 0-10 6.5 6.5 0 0 0-12.4 2A4 4 0 0 0 10 25z" fill="#fff" {...S} />
    </>
  ),
  cap: (
    <>
      <path d="M3 13l13-6 13 6-13 6z" fill="#fff" {...S} />
      <path d="M9 16v6c0 2 3.2 3.5 7 3.5s7-1.5 7-3.5v-6" fill="#fff" {...S} />
      <path d="M27 14v7" fill="none" {...S} />
    </>
  ),
  heart: (
    <path d="M16 27S4 20 4 12a6 6 0 0 1 12-1 6 6 0 0 1 12 1c0 8-12 15-12 15z" fill="#fff" {...S} />
  ),
  box: (
    <>
      <path d="M4 11l12-5 12 5v13l-12 5-12-5z" fill="#fff" {...S} />
      <path d="M4 11l12 5 12-5M16 16v13" fill="none" {...S} />
    </>
  ),
  people: (
    <>
      <circle cx="11" cy="11" r="4.5" fill="#fff" {...S} />
      <circle cx="22" cy="12.5" r="3.8" fill="#fff" {...S} />
      <path d="M3 26a8 8 0 0 1 16 0zM17.5 26a6.5 6.5 0 0 1 11.5-4v4z" fill="#fff" {...S} />
    </>
  ),
  gem: (
    <>
      <path d="M9 6h14l5 7-12 14L4 13z" fill="#fff" {...S} />
      <path d="M4 13h24M12 6l-2 7 6 14 6-14-2-7" fill="none" {...S} />
    </>
  ),
  tower: (
    <>
      <rect x="7" y="5" width="18" height="23" rx="2" fill="#fff" {...S} />
      <path d="M11 10h3M18 10h3M11 15h3M18 15h3M11 20h3M18 20h3M14 28v-4h4v4" fill="none" {...S} />
    </>
  ),
  dice: (
    <>
      <rect x="5" y="5" width="22" height="22" rx="5" fill="#fff" {...S} />
      <circle cx="11" cy="11" r="1.8" fill="#1f1633" />
      <circle cx="16" cy="16" r="1.8" fill="#1f1633" />
      <circle cx="21" cy="21" r="1.8" fill="#1f1633" />
    </>
  ),
  star: (
    <path d="M16 4l3.6 7.4 8.1 1.2-5.9 5.7 1.4 8.1L16 22.6l-7.2 3.8 1.4-8.1-5.9-5.7 8.1-1.2z" fill="#ffd95a" {...S} />
  ),
  bolt: (
    <path d="M18 3L7 18h8l-2 11 12-16h-8z" fill="#ffd95a" {...S} />
  ),
  music: (
    <>
      <path d="M12 23V8l14-3v15" fill="none" {...S} />
      <ellipse cx="9" cy="23.5" rx="3.5" ry="3" fill="#fff" {...S} />
      <ellipse cx="23" cy="20.5" rx="3.5" ry="3" fill="#fff" {...S} />
    </>
  ),
  sound: (
    <>
      <path d="M5 12h5l7-6v20l-7-6H5z" fill="#fff" {...S} />
      <path d="M21 11.5a6 6 0 0 1 0 9M24.5 8a11 11 0 0 1 0 16" fill="none" {...S} />
    </>
  ),
  menu: <path d="M6 9h20M6 16h20M6 23h20" fill="none" {...S} />,
  close: <path d="M8 8l16 16M24 8L8 24" fill="none" {...S} />,
  help: (
    <>
      <circle cx="16" cy="16" r="12" fill="#fff" {...S} />
      <path d="M12.5 12.5a3.5 3.5 0 1 1 5 3.2c-1 .5-1.5 1.3-1.5 2.3v.5" fill="none" {...S} />
      <circle cx="16" cy="22.5" r="1.6" fill="#1f1633" />
    </>
  ),
  bank: (
    <>
      <path d="M4 12L16 5l12 7z" fill="#fff" {...S} />
      <path d="M7 13v10M12.5 13v10M19.5 13v10M25 13v10M4 27h24" fill="none" {...S} />
    </>
  ),
  list: (
    <>
      <rect x="6" y="4" width="20" height="24" rx="3" fill="#fff" {...S} />
      <path d="M11 11h10M11 16h10M11 21h6" fill="none" {...S} />
    </>
  ),
  book: (
    <>
      <path d="M16 8.5C13 6.5 8.5 6 4.5 6.5v18c4-.5 8.5 0 11.5 2 3-2 7.5-2.5 11.5-2v-18c-4-.5-8.5 0-11.5 2z" fill="#fff" {...S} />
      <path d="M16 8.5v18" fill="none" {...S} />
      <path d="M20 11.5l2 1.5 3-4" fill="none" stroke="#e59a00" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  board: (
    <>
      <rect x="5" y="5" width="22" height="22" rx="3" fill="#fff" {...S} />
      <path d="M5 12h22M5 20h22M12 5v22M20 5v22" fill="none" {...S} />
    </>
  ),
};

export default function Icon({ name, className = 'size-6' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      {ICONS[name] ?? ICONS.star}
    </svg>
  );
}
