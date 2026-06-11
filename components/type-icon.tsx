import type { ItemType } from '@/lib/types';

export function TypeIcon({ type, size = 16, color }: { type: ItemType; size?: number; color: string }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const, stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (type === 'WISH') return (
    <svg {...p}><path d="M12 4v6M12 14v6M4 12h6M14 12h6"/><path d="M7 7l3 3M14 14l3 3M17 7l-3 3M10 14l-3 3" opacity=".8"/></svg>
  );
  if (type === 'ETC') return (
    <svg {...p}><path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Z" fill={color} fillOpacity=".18"/><circle cx="8" cy="8" r="1.6" fill={color} stroke="none"/></svg>
  );
  return <svg {...p}><path d="M5 12.5 10 17.5 19 7.5"/></svg>;
}
