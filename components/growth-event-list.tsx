// components/growth-event-list.tsx
// growth_events 테이블 기반 — "이 화분이 무엇으로 자랐는지" 제목 목록.
// today-view.tsx(이번 달 화분 카드)와 garden-view.tsx(월 상세 시트)에서 공용으로 사용.
export interface GrowthEvent {
  id: string;
  title: string;
  kind: 'leaf' | 'flower';
}

export function GrowthEventList({ events }: { events: GrowthEvent[] }) {
  if (events.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {events.map((e) => (
        <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: '#5C3A1F' }}>
          <span style={{ flexShrink: 0, fontSize: 11, lineHeight: 1 }}>{e.kind === 'flower' ? '🌸' : '🌿'}</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</span>
        </div>
      ))}
    </div>
  );
}
