import { useEffect, useState } from 'react';

const QUERY = '(min-width: 1024px)';

// True on wide screens (Tailwind `lg`), where the card sits beside the board instead of under it.
export function useWide() {
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia?.(QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(QUERY);
    if (!mq) return undefined;
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return !!wide;
}
