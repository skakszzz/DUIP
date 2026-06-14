import type { ItemType } from '@/lib/types';
import { TYPE_COLOR, TYPE_TINT } from '@/lib/item-style';

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
          background: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
          transition: 'transform 0.15s',
        }}
        onPointerDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.9)'; }}
        onPointerUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
        onPointerLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      >
        {completed ? (
          // 완료 = 채운 초록 원 + 흰 체크 (모든 타입 공통)
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="#7BAE7E"/>
            <path d="M7.5 12.5l2.7 2.9L16.5 9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : item.type === 'TODO' ? (
          // 할 일 미완료 = 새싹 (탭하면 자란다는 메타포)
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="#EEF3E4" stroke="#C3D2AC" strokeWidth="1.4"/>
            <path d="M12 17v-4" stroke="#8AA86B" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M12 13c-2.2 0-3.6-1.4-3.9-3.4 2.2-.1 3.6 1.1 3.9 3.4Z" fill="#9CBE7A"/>
            <path d="M12 13c2.2 0 3.6-1.4 3.9-3.4-2.2-.1-3.6 1.1-3.9 3.4Z" fill="#BBD79A"/>
          </svg>
        ) : item.type === 'WISH' ? (
          // 소망 미완료 = 별 반짝
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="#F7E4DD" stroke="#E2B6A8" strokeWidth="1.4"/>
            <path d="M12 7.5l1.3 2.9 3.2.3-2.4 2.1.7 3.1L12 14.4 9.2 16l.7-3.1-2.4-2.1 3.2-.3z" fill="#D89684"/>
          </svg>
        ) : (
          // 기타 미완료 = 다이아
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="#EDE6F0" stroke="#C9BAD0" strokeWidth="1.4"/>
            <path d="M12 8.5l3.5 3.5-3.5 3.5-3.5-3.5z" fill="#A892B0"/>
          </svg>
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
