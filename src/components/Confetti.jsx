// Fixed set of pieces so every class string is literal for Tailwind.
const PIECES = [
  'left-[4%] bg-amber-300 [animation-delay:0s]', 'left-[11%] bg-pink-400 [animation-delay:0.6s]',
  'left-[18%] bg-sky-400 [animation-delay:1.2s]', 'left-[25%] bg-lime-300 [animation-delay:0.3s]',
  'left-[32%] bg-amber-300 [animation-delay:1.8s]', 'left-[39%] bg-fuchsia-400 [animation-delay:0.9s]',
  'left-[46%] bg-emerald-300 [animation-delay:1.5s]', 'left-[53%] bg-rose-400 [animation-delay:0.2s]',
  'left-[60%] bg-amber-200 [animation-delay:2.1s]', 'left-[67%] bg-sky-300 [animation-delay:0.7s]',
  'left-[74%] bg-pink-300 [animation-delay:1.1s]', 'left-[81%] bg-lime-400 [animation-delay:0.4s]',
  'left-[88%] bg-amber-400 [animation-delay:1.6s]', 'left-[95%] bg-violet-400 [animation-delay:1s]',
  'left-[8%] bg-rose-300 [animation-delay:2.4s]', 'left-[29%] bg-teal-300 [animation-delay:2s]',
  'left-[50%] bg-amber-300 [animation-delay:2.6s]', 'left-[71%] bg-fuchsia-300 [animation-delay:1.4s]',
  'left-[92%] bg-emerald-400 [animation-delay:0.5s]', 'left-[15%] bg-sky-200 [animation-delay:1.9s]',
];

export default function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {PIECES.map((c, i) => (
        <span key={i} className={`absolute -top-4 h-3 w-2 animate-confetti rounded-sm ${c}`} />
      ))}
    </div>
  );
}
