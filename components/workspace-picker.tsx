// components/workspace-picker.tsx
// 내 동산 고르기 — 로그인 다음 화면. 동산 1~3개 + 새 동산 만들기.
// 혼자(멤버 1) / 둘이(멤버 2) 자동 처리. 동산이 하나여도 풍경 카드로 꽉 차 보이게.
//
//   <WorkspacePicker
//     userName="은석"
//     seasonLabel="2026년 5월, 늦봄"
//     gardens={[{
//       id, name:'은소동산', year:'둘째 해', treeType:'zelkova', treeLabel:'느티나무',
//       members:[{initial:'은',color:'#7C9466'},{initial:'소',color:'#C77C6A'}],
//       monthLabel:'5월 · 라벤더', monthPlantId:'lavender', leavesIn:14, leavesNeeded:20,
//       pots:['camellia','tulip','tulip','cosmos','lavender',null,null,null,null,null,null,null],
//       currentMonth:5,
//     }]}
//     onOpen={(id)=>router.push(`/workspaces/${id}/today`)}
//     onNew={()=>router.push('/workspaces/new')}
//   />
//
// ※ 인사말은 Gowun Dodum을 씁니다 — 앱에 폰트가 로드돼 있어야 해요(로그인과 동일).
'use client';

import React from 'react';
import { PlantArt } from './plant-art';

const T = {
  cream: '#FBF6EE', paper: '#FFFCF7', sand: '#F4EBD9', bisque: '#EADFC7', taupe: '#D9C8AC',
  ink: '#2A1B0E', inkMute: '#8A7359', inkFade: '#B09779',
  wood600: '#9A7553', wood700: '#7B5530', wood800: '#5C3A1F',
  sage: '#7C9466', blush: '#C77C6A', lavender: '#DCD1E8', butter: '#F6E7B8', sun: '#F2C66E',
  sh1: '0 1px 2px rgba(74,46,22,0.05)',
  sh3: '0 8px 24px rgba(74,46,22,0.08), 0 2px 6px rgba(74,46,22,0.04)',
  rFull: 999,
  body: '"Pretendard Variable","Pretendard",-apple-system,sans-serif',
  serif: '"Gowun Dodum",-apple-system,sans-serif',
};

export interface GardenMember { initial: string; color: string; name?: string; }
export interface Garden {
  id: string;
  name: string;
  year?: string;
  treeType?: string;
  treeLabel?: string;
  treeImageUrl?: string;
  members: GardenMember[];
  monthLabel?: string;
  monthPlantId?: string;
  leavesIn?: number;
  leavesNeeded?: number;
  pots?: (string | null)[];
  currentMonth?: number;
}

const TREE_COLORS: Record<string, { leaf: string; leaf2: string; trunk: string }> = {
  cherry:  { leaf: '#E8A9BE', leaf2: '#F2C9D6', trunk: '#7B5A38' },
  pine:    { leaf: '#5E8A5A', leaf2: '#7AA46E', trunk: '#6E4626' },
  zelkova: { leaf: '#8FB07A', leaf2: '#A6C48A', trunk: '#7B5A38' },
  maple:   { leaf: '#E0875A', leaf2: '#E8A86E', trunk: '#6E4626' },
  ginkgo:  { leaf: '#E0C24C', leaf2: '#EAD46E', trunk: '#7B5A38' },
};

function MiniTree({ size = 92, treeType = 'zelkova' }: { size?: number; treeType?: string }) {
  const c = TREE_COLORS[treeType] || TREE_COLORS.zelkova;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <ellipse cx="60" cy="112" rx="26" ry="4" fill="#4A2E16" opacity=".14" />
      <path d="M57 112 Q55 78 60 64" stroke={c.trunk} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M58 88 Q48 82 42 86 M60 80 Q72 74 80 80" stroke={c.trunk} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="60" cy="50" r="30" fill={c.leaf} />
      <circle cx="40" cy="60" r="18" fill={c.leaf2} />
      <circle cx="82" cy="58" r="20" fill={c.leaf2} />
      <circle cx="60" cy="36" r="16" fill="#fff" fillOpacity=".14" />
    </svg>
  );
}

function MemberDots({ members, size = 26 }: { members: GardenMember[]; size?: number }) {
  return (
    <div style={{ display: 'flex' }}>
      {members.slice(0, 3).map((m, k) => (
        <div key={k} style={{
          width: size, height: size, borderRadius: T.rFull, background: m.color, color: '#fff',
          fontSize: size * 0.42, fontWeight: 800, display: 'grid', placeItems: 'center',
          boxShadow: `0 0 0 2.5px ${T.paper}`, marginLeft: k ? -8 : 0,
        }}>{m.initial}</div>
      ))}
    </div>
  );
}

function YearStrip({ pots = [], currentMonth = 0 }: { pots?: (string | null)[]; currentMonth?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5 }}>
      {Array.from({ length: 12 }).map((_, i) => {
        const filled = !!pots[i];
        const isCurrent = i + 1 === currentMonth;
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{
              width: 11, height: 11, borderRadius: 4,
              background: filled ? (isCurrent ? T.wood800 : T.sage) : 'transparent',
              boxShadow: filled ? 'none' : `inset 0 0 0 1.5px ${T.taupe}`,
            }} />
            <span style={{ fontSize: 7.5, color: filled ? T.wood700 : T.inkFade, fontWeight: 700 }}>{i + 1}</span>
          </div>
        );
      })}
    </div>
  );
}

function GardenCard({ g, onOpen }: { g: Garden; onOpen?: (id: string) => void }) {
  const pct = g.leavesNeeded ? Math.min(1, (g.leavesIn ?? 0) / g.leavesNeeded) : 0;
  const recent = (g.pots ?? []).map((p, i) => (p ? { id: p, m: i + 1 } : null)).filter(Boolean).slice(-3) as { id: string; m: number }[];
  return (
    <div onClick={() => onOpen?.(g.id)} style={{
      borderRadius: 28, padding: 18, position: 'relative', overflow: 'hidden', cursor: 'pointer',
      background: `linear-gradient(160deg, ${T.lavender}aa 0%, ${T.butter}66 52%, ${T.paper} 100%)`,
      boxShadow: T.sh3, fontFamily: T.body,
    }}>
      <div style={{ position: 'absolute', top: -54, right: -44, width: 170, height: 170, borderRadius: '50%', background: `radial-gradient(circle, ${T.sun}55, transparent 70%)` }} />

      <div style={{ position: 'relative', height: 116, marginBottom: 6 }}>
        <svg viewBox="0 0 320 116" width="100%" height="116" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
          <path d="M-10 92 Q90 64 170 80 Q250 94 330 66 L330 130 L-10 130 Z" fill="#B8D0A8" opacity=".7" />
          <path d="M-10 104 Q110 82 190 96 Q260 108 330 86 L330 130 L-10 130 Z" fill="#9BBE88" />
        </svg>
        {g.treeImageUrl
          ? <img src={g.treeImageUrl} alt="" style={{ position: 'absolute', left: 14, bottom: 2, height: 96, width: 'auto' }} />
          : <div style={{ position: 'absolute', left: 18, bottom: 2 }}><MiniTree size={92} treeType={g.treeType} /></div>}
        {g.monthPlantId && <div style={{ position: 'absolute', right: 30, bottom: -2 }}><PlantArt id={g.monthPlantId} stage={3} size={70} /></div>}
        {recent.slice(0, 2).map((p, i) => (
          <div key={p.m} style={{ position: 'absolute', right: i === 0 ? 96 : 6, bottom: i === 0 ? -2 : 0 }}>
            <PlantArt id={p.id} stage={5} size={i === 0 ? 44 : 40} />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          {(g.year || g.treeLabel) && (
            <div style={{ fontSize: 9.5, fontWeight: 800, color: T.wood700, letterSpacing: '0.16em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              {[g.year, g.treeLabel].filter(Boolean).join(' · ')}
            </div>
          )}
          <div style={{ fontSize: 21, fontWeight: 800, color: T.ink, letterSpacing: '-0.03em', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</div>
        </div>
        <div style={{ flexShrink: 0 }}><MemberDots members={g.members} /></div>
      </div>

      {g.monthLabel && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: T.wood800, whiteSpace: 'nowrap' }}>{g.monthLabel} 자라는 중</span>
            {g.leavesNeeded ? <span style={{ fontSize: 11, fontWeight: 700, color: T.inkMute, whiteSpace: 'nowrap' }}>{g.leavesIn ?? 0} / {g.leavesNeeded}잎</span> : null}
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.6)', overflow: 'hidden' }}>
            <div style={{ width: `${pct * 100}%`, height: '100%', borderRadius: 3, background: T.wood700 }} />
          </div>
        </div>
      )}

      {g.pots && (
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.bisque}` }}>
          <YearStrip pots={g.pots} currentMonth={g.currentMonth} />
        </div>
      )}
    </div>
  );
}

function NewGardenCard({ onNew }: { onNew?: () => void }) {
  return (
    <div onClick={onNew} style={{
      borderRadius: 24, padding: '20px 18px', cursor: 'pointer',
      background: T.paper, boxShadow: T.sh1, border: `1.5px dashed ${T.taupe}`,
      display: 'flex', alignItems: 'center', gap: 14, fontFamily: T.body,
    }}>
      <div style={{ width: 46, height: 46, borderRadius: T.rFull, background: T.sand, display: 'grid', placeItems: 'center', flex: '0 0 auto' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.wood700} strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15.5, fontWeight: 800, color: T.ink, letterSpacing: '-0.02em' }}>새 동산 만들기</div>
        <div style={{ fontSize: 12, color: T.inkMute, marginTop: 2 }}>혼자서도, 다른 사람과도 시작할 수 있어요</div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.inkFade} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
    </div>
  );
}

export interface WorkspacePickerProps {
  userName?: string;
  seasonLabel?: string;
  greetingSub?: string;
  gardens: Garden[];
  maxGardens?: number;
  onOpen?: (id: string) => void;
  onNew?: () => void;
  onSettings?: () => void;
  onJoinCode?: () => void;
}

export function WorkspacePicker({
  userName = '', seasonLabel, greetingSub,
  gardens, maxGardens = 3, onOpen, onNew, onSettings, onJoinCode,
}: WorkspacePickerProps) {
  const canAdd = gardens.length < maxGardens;
  const sub = greetingSub ?? (gardens.length
    ? '오늘도 둘이 함께 키워볼까요?'
    : '첫 동산을 만들어 함께 키워볼까요?');
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 440, minHeight: '100dvh', margin: '0 auto', background: T.cream, overflow: 'hidden', fontFamily: T.body }}>
      <svg viewBox="0 0 390 300" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 300, pointerEvents: 'none' }}>
        <defs>
          <linearGradient id="wsp-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FBF7EE" /><stop offset="55%" stopColor="#FCF3E2" /><stop offset="100%" stopColor="#FBF6EE" />
          </linearGradient>
          <radialGradient id="wsp-sun" cx="20%" cy="22%" r="44%">
            <stop offset="0%" stopColor="#FFF6DC" stopOpacity="0.9" /><stop offset="60%" stopColor="#FBE9BC" stopOpacity="0.28" /><stop offset="100%" stopColor="#FBE9BC" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="390" height="300" fill="url(#wsp-sky)" />
        <circle cx="78" cy="84" r="140" fill="url(#wsp-sun)" />
        <g opacity="0.5"><ellipse cx="300" cy="74" rx="30" ry="11" fill="#fff" /><ellipse cx="320" cy="78" rx="20" ry="8" fill="#fff" /></g>
        <g opacity="0.4"><ellipse cx="150" cy="120" rx="24" ry="9" fill="#fff" /><ellipse cx="166" cy="123" rx="16" ry="7" fill="#fff" /></g>
      </svg>

      <div style={{ position: 'relative', zIndex: 1, paddingTop: 'env(safe-area-inset-top)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 21c0-5 3-8 8-8-.3 5-3 8-8 8Z" fill="#7B5530" />
              <path d="M12 21c-5 0-8-3-8-8 5 .3 8 3 8 8Z" fill="#7C9466" />
              <path d="M12 21V11" stroke="#34200E" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 15, fontWeight: 800, color: T.wood800, fontFamily: T.serif, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>두잎</span>
          </div>
          <button onClick={onSettings} style={{ width: 34, height: 34, borderRadius: T.rFull, background: 'rgba(255,253,247,0.7)', display: 'grid', placeItems: 'center', boxShadow: T.sh1, border: 'none', cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.wood700} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 5l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1A2 2 0 1 1 19 7l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></svg>
          </button>
        </div>

        <div style={{ padding: '26px 24px 22px' }}>
          {seasonLabel && <div style={{ fontSize: 13, color: T.wood600, fontWeight: 700, fontFamily: T.serif, letterSpacing: '0.02em' }}>{seasonLabel}</div>}
          <h1 style={{ fontSize: 27, fontWeight: 400, color: T.ink, letterSpacing: '-0.02em', lineHeight: 1.38, margin: '8px 0 0', fontFamily: T.serif }}>
            {userName ? `${userName}님,` : '반가워요,'}<br />다시 만나 반가워요
          </h1>
          <p style={{ fontSize: 13.5, color: T.inkMute, lineHeight: 1.6, margin: '10px 0 0', fontFamily: T.serif }}>{sub}</p>
        </div>

        <div style={{ padding: '0 20px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px 12px' }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: T.wood600, letterSpacing: '0.14em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 }}>내 동산</span>
            <div style={{ flex: 1, height: 1, background: T.bisque }} />
            {gardens.length > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: T.inkFade, flexShrink: 0 }}>{gardens.length}{maxGardens ? ` / ${maxGardens}` : ''}</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {gardens.map((g) => <GardenCard key={g.id} g={g} onOpen={onOpen} />)}
            {canAdd && <NewGardenCard onNew={onNew} />}
            {onJoinCode && (
              <button onClick={onJoinCode} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13.5, fontWeight: 700, color: T.inkMute,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 6, padding: '6px 0', width: '100%',
                textDecoration: 'underline', textUnderlineOffset: 3,
                textDecorationColor: T.taupe,
              }}>
                코드로 참가하기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkspacePicker;
