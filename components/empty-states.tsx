// components/empty-states.tsx
// 항목/일정/화분이 없을 때 보여줄 빈 상태 블록 3종.
// 각 화면(today/calendar/garden view)의 "데이터 0개" 분기에 끼워 넣으세요.
// 모두 presentational — 동작은 onAdd 콜백으로 부모가 처리.
'use client';

import React from 'react';
import { PlantArt } from './plant-art';

const T = {
  cream: '#FBF6EE', paper: '#FFFCF7', sand: '#F4EBD9', butter: '#F6E7B8',
  ink: '#2A1B0E', inkSoft: '#5C3A1F', inkMute: '#8A7359', inkFade: '#B09779',
  wood700: '#7B5530', wood800: '#5C3A1F', wood900: '#34200E',
  sh1: '0 1px 2px rgba(74,46,22,0.05)',
  sh3: '0 8px 24px rgba(74,46,22,0.08), 0 2px 6px rgba(74,46,22,0.04)',
};

// 새싹을 빛 웅덩이 위에 띄운 공통 일러스트
function Sprout({ id = 'lavender', stage = 2, size = 132 }: { id?: string; stage?: 1 | 2; size?: number }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center' }}>
      <div style={{ position: 'absolute', inset: '8%', borderRadius: '50%', background: `radial-gradient(circle, ${T.butter}88 0%, ${T.butter}00 68%)` }} />
      <div style={{ position: 'absolute', left: '50%', bottom: '14%', transform: 'translateX(-50%)', width: size * 0.5, height: size * 0.1, borderRadius: '50%', background: 'rgba(74,46,22,0.12)', filter: 'blur(4px)' }} />
      <PlantArt id={id} stage={stage} size={size} />
    </div>
  );
}

function PlusIcon({ size = 19, color = '#FBF6EE' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>;
}

// ── 홈 — 오늘 항목이 없을 때 ───────────────────────────────────
// today-view의 항목 리스트 자리(완료/오늘/예정 모두 0개)에 렌더.
export function EmptyHome({ onAdd }: { onAdd?: () => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 40px 60px',}}>
      <Sprout id="lavender" stage={2} size={140} />
      <div style={{ fontSize: 19, fontWeight: 800, color: T.ink, letterSpacing: '-0.02em', marginTop: 12 }}>오늘은 아직 비어 있어요</div>
      <div style={{ fontSize: 13.5, color: T.inkMute, lineHeight: 1.6, marginTop: 8, maxWidth: 250 }}>
        첫 잎을 심으면 이번 달 화분이<br />자라기 시작해요. 둘이 함께요.
      </div>
      <button onClick={onAdd} style={{ marginTop: 22, height: 50, padding: '0 26px', borderRadius: 999, border: 'none', background: T.wood800, color: T.cream, fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', display: 'inline-flex', alignItems: 'center', gap: 9, boxShadow: T.sh3, cursor: 'pointer' }}>
        <PlusIcon /> 첫 잎 심기
      </button>
    </div>
  );
}

// ── 캘린더 — 이 달에 일정이 없을 때 ──────────────────────────────
// calendar-view에서 달 그리드 아래(날짜 패널 자리)에 렌더.
export function EmptyCalendar() {
  return (
    <div style={{ margin: '18px 16px 0', padding: '26px 20px', background: T.paper, borderRadius: 24, boxShadow: T.sh1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',}}>
      <Sprout id="tulip" stage={1} size={96} />
      <div style={{ fontSize: 15.5, fontWeight: 800, color: T.ink, letterSpacing: '-0.02em', marginTop: 8 }}>이 달엔 아직 약속이 없어요</div>
      <div style={{ fontSize: 12.5, color: T.inkMute, lineHeight: 1.55, marginTop: 6 }}>
        날짜를 누르면 그날의 일정을<br />둘이 함께 적을 수 있어요.
      </div>
    </div>
  );
}

// ── 동산 — 1월(첫 화분만 있고 아직 휑할 때) ─────────────────────
// garden-view의 배경 위에 떠 있는 캡션 블록으로 렌더(absolute, 화면 하단).
// 보호수/화분 이미지는 garden이 그대로 그리므로, 여기선 카피만.
export function EmptyGarden({ month = 1 }: { month?: number }) {
  return (
    <div style={{
      position: 'absolute', bottom: 96, left: '50%', transform: 'translateX(-50%)', zIndex: 9,
      display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      padding: '10px 20px', borderRadius: 20, whiteSpace: 'nowrap',      background: 'rgba(255,253,247,0.82)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      boxShadow: '0 6px 20px rgba(74,46,22,0.14)',
    }}>
      <span style={{ fontSize: 13, fontWeight: 800, color: T.ink, letterSpacing: '-0.01em' }}>동산이 막 시작됐어요</span>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: T.wood700 }}>{month}월의 첫 씨앗이 흙 속에 잠들어 있어요</span>
    </div>
  );
}

export default { EmptyHome, EmptyCalendar, EmptyGarden };
