// Shared building blocks for the chunky cartoon look.
const BTN = {
  primary: 'bg-mustard text-ink',
  good: 'bg-lettuce text-ink',
  bad: 'bg-tomato text-white',
  blue: 'bg-ocean text-white',
  ghost: 'bg-paper text-ink',
};

export function Btn({ children, onClick, disabled, variant = 'primary', size = 'md', className = '' }) {
  const sz = size === 'sm' ? 'min-h-9 px-3 text-sm rounded-xl' : size === 'lg' ? 'min-h-14 px-6 text-2xl rounded-2xl' : 'min-h-12 px-4 text-lg rounded-2xl';
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`press pop-shadow border-[3px] border-ink font-display tracking-wide disabled:opacity-40 ${sz} ${BTN[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Panel({ children, className = '' }) {
  return <section className={`rounded-2xl border-[3px] border-ink bg-paper p-3 text-ink pop-shadow ${className}`}>{children}</section>;
}

export function Tag({ children, tone = 'bg-tomato text-white', className = '' }) {
  return (
    <span className={`inline-block -rotate-2 rounded-lg border-[2.5px] border-ink px-2 py-0.5 font-display text-sm tracking-wide pop-shadow-sm ${tone} ${className}`}>
      {children}
    </span>
  );
}

export function Stat({ label, value, tone = '' }) {
  return (
    <div className="rounded-xl border-[2.5px] border-ink bg-white px-3 py-2 pop-shadow-sm">
      <div className="text-[11px] font-extrabold uppercase tracking-wide text-ink-soft">{label}</div>
      <div className={`font-display text-xl leading-tight ${tone}`}>{value}</div>
    </div>
  );
}
