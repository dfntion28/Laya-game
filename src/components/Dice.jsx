import { useEffect, useState } from 'react';

const PIPS = {
  1: [4], 2: [2, 6], 3: [2, 4, 6], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8],
};

function Face({ n }) {
  return (
    <div className="grid size-full grid-cols-3 grid-rows-3 gap-[3px] rounded-[26%] border-[3px] border-ink bg-white p-[17%] shadow-[inset_0_-6px_0_#e9dcc0]">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={`m-auto aspect-square w-full rounded-full ${PIPS[n].includes(i) ? (n === 1 ? 'bg-tomato' : 'bg-ink') : ''}`} />
      ))}
    </div>
  );
}

// Chunky cartoon die: tossed in from the side, faces flicker mid-air, squashes on landing.
export default function Dice({ value = 1, rollId = 0, rolling = false, size = 'md' }) {
  const [face, setFace] = useState(value);
  useEffect(() => {
    if (!rolling) return undefined;
    const id = setInterval(() => setFace(1 + Math.floor(Math.random() * 6)), 70);
    return () => clearInterval(id);
  }, [rolling]);
  const shown = rolling ? face : Math.min(6, Math.max(1, value));
  const box = size === 'sm' ? 'size-11' : 'size-16 sm:size-20';
  return (
    <div className={`relative ${box}`}>
      <span key={`s${rollId}`} className={`absolute -bottom-2 left-[10%] h-3 w-[80%] rounded-full bg-ink/30 ${rollId ? 'animate-shadow-toss' : ''}`} />
      <div key={rollId} className={`relative size-full rounded-[26%] shadow-[0_5px_0_#1f1633] ${rollId ? 'animate-toss' : ''}`}>
        <Face n={shown} />
      </div>
    </div>
  );
}
