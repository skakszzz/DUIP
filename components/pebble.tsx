import type { ItemType } from '@/lib/types';
import { TYPE_COLOR, TYPE_TINT } from '@/lib/item-style';
import { TypeIcon } from '@/components/type-icon';

export interface PebbleItem {
  title: string;
  description: string | null;
  type: ItemType;
  is_recurring: boolean;
  event_date: string | null;
}

interface PebbleMember {
  display_name: string;
  color: string;
}

function daysUntil(dateStr: string, serverToday: string): number {
  const today = new Date(serverToday + 'T00:00:00');
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function Pebble({
  item, onToggle, onClick, ownerMember, showDateBadge, completed, serverToday,
}: {
  item: PebbleItem;
  onToggle: (e: React.MouseEvent) => void;
  onClick: () => void;
  ownerMember?: PebbleMember;
  showDateBadge?: boolean;
  completed: boolean;
  serverToday?: string;
}) {
  const color = TYPE_COLOR[item.type];
  const tint  = TYPE_TINT[item.type];

  return (
    <div
      onClick={onClick}
      style={{
        background: completed
          ? `linear-gradient(180deg, ${tint}55 0%, #FFFCF7 100%)`
          : '#FFFCF7',
        borderRadius: 22,
        padding: '13px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: completed
          ? '0 1px 2px rgba(74,46,22,0.05), 0 1px 0 rgba(74,46,22,0.02)'
          : '0 2px 8px rgba(74,46,22,0.06), 0 1px 2px rgba(74,46,22,0.04)',
        cursor: 'pointer',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          flexShrink: 0,
          width: 36, height: 36, borderRadius: 9999,
          background: completed ? color : tint,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
          boxShadow: completed ? 'none' : `inset 0 0 0 2px ${color}28`,
          transition: 'all 0.15s',
        }}
      >
        {completed ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5 10 17.5 19 7.5"/>
          </svg>
        ) : (
          <TypeIcon type={item.type} size={16} color={color}/>
        )}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 700,
            color: completed ? '#B09779' : '#2A1B0E',
            textDecorationLine: completed ? 'line-through' : 'none',
            textDecorationColor: '#B09779',
            letterSpacing: '-0.015em', lineHeight: 1.3,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {item.title}
          </div>
          {item.is_recurring && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="#B09779" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
              style={{ flexShrink: 0, opacity: 0.7 }}>
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          )}
        </div>
        {item.description && (
          <div style={{ fontSize: 12, color: '#8A7359', marginTop: 2, letterSpacing: '-0.01em' }}>
            {item.description}
          </div>
        )}
      </div>

      {showDateBadge && serverToday && item.event_date && (() => {
        const d = daysUntil(item.event_date, serverToday);
        const label = d === 0 ? 'D-Day' : d > 0 ? `D-${d}` : `D+${Math.abs(d)}`;
        const bg = d === 0 ? '#C77C6A' : d <= 3 ? '#E8A87C' : '#A0B88A';
        return (
          <div style={{
            flexShrink: 0, padding: '2px 8px', borderRadius: 9999,
            background: bg, color: '#fff',
            fontSize: 10, fontWeight: 800, letterSpacing: '0.02em',
          }}>
            {label}
          </div>
        );
      })()}

      {ownerMember && (
        <div style={{
          width: 24, height: 24, borderRadius: 9999,
          background: ownerMember.color, color: '#fff',
          fontSize: 10, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, boxShadow: '0 0 0 2px #FFFCF7',
        }}>
          {ownerMember.display_name.charAt(0)}
        </div>
      )}
    </div>
  );
}
