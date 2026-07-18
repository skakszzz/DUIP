import { plants } from '@/lib/data/plants';

// 홈 화분 아래 식물 이름 라벨 — 비인터랙티브 플로팅 텍스트.
// 미선택(plantId null)이면 렌더링하지 않음 (빈 상태는 유도 카드 담당).
// Claude Design에서 다듬기 쉽도록 독립 컴포넌트로 분리.
export function PlantNameLabel({ plantId }: { plantId: string | null }) {
  const name = plantId ? plants.find((p) => p.id === plantId)?.name.ko : undefined;
  if (!name) return null;
  return (
    <div style={{
      marginTop: 6,
      fontSize: 10.5, fontWeight: 700, color: '#9A7553',
      textAlign: 'center', letterSpacing: '0.05em', lineHeight: 1,
      pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap',
    }}>
      {name}
    </div>
  );
}
