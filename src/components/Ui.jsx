// Shared building blocks. Rule of thumb: thick outlines and drop shadows mean "you can tap this".
// Information sits as plain text on a single paper surface, separated by spacing and thin dividers.
const BTN = {
  primary: 'bg-mustard text-ink',
  good: 'bg-lettuce text-ink',
  bad: 'bg-tomato text-white',
  blue: 'bg-ocean text-white',
  ghost: 'bg-white text-ink',
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

// The one container a screen region gets.
export function Surface({ children, className = '' }) {
  return <div className={`rounded-3xl border-[3px] border-ink bg-paper text-ink pop-shadow ${className}`}>{children}</div>;
}

export function SectionTitle({ children, right }) {
  return (
    <div className="flex items-baseline justify-between gap-2 pb-1 pt-4 first:pt-0">
      <h3 className="font-display text-xl">{children}</h3>
      {right && <span className="font-display text-xl">{right}</span>}
    </div>
  );
}

// Label on the left, value on the right. Stack these inside a `divide-y` list.
export function Row({ label, sub, value, tone = '', children }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="min-w-0">
        <span className="block text-[15px] font-bold leading-tight">{label}</span>
        {sub && <span className="block text-xs font-bold text-ink-soft">{sub}</span>}
      </span>
      {value !== undefined && <span className={`shrink-0 font-display text-lg ${tone}`}>{value}</span>}
      {children}
    </div>
  );
}

export const LIST = 'flex flex-col divide-y-2 divide-ink/10';

// A headline number with a small label above it. No box.
export function Figure({ label, value, tone = '', big = false }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-extrabold uppercase tracking-wider text-ink-soft">{label}</div>
      <div className={`truncate font-display leading-tight ${big ? 'text-3xl' : 'text-xl'} ${tone}`}>{value}</div>
    </div>
  );
}
