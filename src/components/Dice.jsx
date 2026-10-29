const PIPS = {
  1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8],
};
const SHOW = ['', 'die-show-1', 'die-show-2', 'die-show-3', 'die-show-4', 'die-show-5', 'die-show-6'];
const FACE = ['', 'die-f1', 'die-f2', 'die-f3', 'die-f4', 'die-f5', 'die-f6'];

function Face({ n }) {
  return (
    <div className={`die-face ${FACE[n]} grid grid-cols-3 grid-rows-3 gap-[2px] rounded-[22%] border border-amber-200 bg-gradient-to-br from-white to-amber-100 p-[16%] shadow-inner`}>
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={`m-auto aspect-square w-full rounded-full ${PIPS[n].includes(i) ? (n === 1 ? 'bg-rose-600' : 'bg-night') : ''}`} />
      ))}
    </div>
  );
}

export default function Dice({ value = 1, rollId = 0, size = 'md' }) {
  const v = Math.min(6, Math.max(1, value));
  return (
    <div className={`die-scene ${size === 'sm' ? 'die-size-sm' : 'die-size-md'}`}>
      <div key={rollId} className={`die-cube ${rollId ? 'die-spin' : ''}`}>
        <div className={`die-cube ${SHOW[v]}`}>
          {[1, 2, 3, 4, 5, 6].map(n => <Face key={n} n={n} />)}
        </div>
      </div>
    </div>
  );
}
