'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useDragSheet } from '@/lib/use-drag-sheet';
import { EmptyGarden } from '@/components/empty-states';
import { useRouter } from 'next/navigation';
import { plants } from '@/lib/data/plants';
import { PotView } from '@/components/pot-view';
import { stageFromPoints } from '@/lib/growth';
import type { SoilType } from '@/lib/types';

const PlantPickerSheet = dynamic(() => import('@/components/plant-picker-sheet'), { ssr: false });

interface MonthlyPot {
  id: string;
  month: number;
  plant_id: string | null;
  soil_type: SoilType;
  growth_points: number;
  pos_x: number | null;
  pos_y: number | null;
}

interface MonthStat {
  month: number;
  completedCount: number;
  items: MonthItem[];
}

interface MonthItem {
  id: string;
  title: string;
  type: string;
  is_completed: boolean;
}

interface Props {
  workspaceId: string;
  year: number;
  currentMonth: number;
  pots: MonthlyPot[];
  monthStats: MonthStat[];
  treeType: string;
}

const TREE_EMOJI: Record<string, string> = {
  cherry: '🌸', olive: '🫒', ginkgo: '🍂', pine: '🌲', maple: '🍁',
};
const TREE_NAME: Record<string, string> = {
  cherry: '벚나무', olive: '올리브나무', ginkgo: '은행나무', pine: '소나무', maple: '단풍나무',
};

const MONTH_KO = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

const GROWTH_LABELS = ['', '흙', '새싹', '잎', '성숙기', '꽃핌'];

const SHARE_BACKGROUNDS = [
  { id: 'sunset', label: '노을', bg: 'linear-gradient(180deg,#1E0F3C 0%,#52204E 18%,#9E3D58 32%,#C85038 50%,#E88845 65%,#F5C070 80%,#FBE5B8 100%)', dark: false },
  { id: 'dawn',   label: '새벽', bg: 'linear-gradient(180deg,#1A1A3E 0%,#3D3A7A 20%,#7A6BAE 40%,#BBAAD0 60%,#E8C8D8 78%,#FCEAE0 100%)', dark: false },
  { id: 'spring', label: '봄',   bg: 'linear-gradient(180deg,#C4E0F5 0%,#E8D5EC 28%,#F5C2C2 52%,#F9DCDC 72%,#FBF0E0 100%)', dark: false },
  { id: 'forest', label: '숲',   bg: 'linear-gradient(180deg,#0D2B1A 0%,#1B4A2A 25%,#2D6A40 50%,#4D8A58 72%,#7AB87A 100%)', dark: false },
  { id: 'night',  label: '밤',   bg: 'linear-gradient(180deg,#020814 0%,#050E28 30%,#0A1A40 60%,#0D2254 100%)', dark: true },
  { id: 'golden', label: '황금', bg: 'linear-gradient(180deg,#3D2000 0%,#7A3D00 20%,#C46A00 45%,#E8A000 65%,#F5C840 82%,#FDE990 100%)', dark: false },
];

// 화분 렌더링 (실제 이미지 + 이모지 폴백)
function PotCell({ stage, plantId, soilType, size = 52, preferArtwork }: { stage: number; plantId: string | null; soilType: SoilType; size?: number; preferArtwork?: boolean }) {
  return (
    <div style={{ filter: stage === 5 ? 'drop-shadow(0 0 8px rgba(242,198,110,0.6))' : 'none' }}>
      <PotView
        soilId={soilType}
        plantId={plantId}
        stage={stage as 1 | 2 | 3 | 4 | 5}
        size={size}
        preferArtwork={preferArtwork}
      />
    </div>
  );
}

const VALID_TREE_TYPES = ['cherry', 'olive', 'ginkgo', 'pine', 'maple'];


// 보호수 이미지 원본 비율 상수
// trees/ 이미지는 1024×1536 (너비:높이 = 2:3) — 의도된 세로형 비율
// 컨테이너 자체를 2:3으로 설정해 레터박스 없이 렌더링
const TREE_ASPECT_H = 1.5; // 높이 = 너비 × 1.5

// 보호수 이미지 (폴백: 이모지)
function TreeImage({ treeType, treeEmoji, size }: { treeType: string; treeEmoji: string; size: number }) {
  const [imgError, setImgError] = useState(false);
  const treeH = Math.round(size * TREE_ASPECT_H);

  if (!imgError && VALID_TREE_TYPES.includes(treeType)) {
    return (
      <Image
        src={`/trees/${treeType}.webp`}
        alt=""
        width={size}
        height={treeH}
        priority
        style={{ display: 'block', maxWidth: 'none' }}
        onError={() => setImgError(true)}
      />
    );
  }
  return <div style={{ fontSize: size * 0.85, lineHeight: 1 }}>{treeEmoji}</div>;
}

// 화분 위치 — left(%), bottomPct(부모 height의 %), zIndex
// 바닥 앵커: bottom% + translateX(-50%) → 기기 높이 무관하게 언덕 위에 고정
const POT_POSITIONS: { left: number; bottomPct: number; zIndex: number }[] = [
  { left: 16, bottomPct: 17.0, zIndex: 5 }, // 1월
  { left: 84, bottomPct: 16.5, zIndex: 5 }, // 2월
  { left: 33, bottomPct: 22.5, zIndex: 4 }, // 3월
  { left: 67, bottomPct: 23.0, zIndex: 4 }, // 4월
  { left: 50, bottomPct: 28.0, zIndex: 3 }, // 5월
  { left:  8, bottomPct: 22.0, zIndex: 4 }, // 6월
  { left: 92, bottomPct: 22.0, zIndex: 4 }, // 7월
  { left: 25, bottomPct: 28.5, zIndex: 3 }, // 8월
  { left: 75, bottomPct: 28.5, zIndex: 3 }, // 9월
  { left: 42, bottomPct: 33.0, zIndex: 2 }, // 10월
  { left: 58, bottomPct: 33.0, zIndex: 2 }, // 11월
  { left: 50, bottomPct: 37.0, zIndex: 1 }, // 12월
];

export default function GardenView({ workspaceId, year, currentMonth, pots: initialPots, monthStats, treeType }: Props) {
  const router = useRouter();
  const [pots, setPots] = useState<MonthlyPot[]>(initialPots);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [showTreeSheet, setShowTreeSheet] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState<number | null>(null);
  const [screenshotMode, setScreenshotMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showTreeName, setShowTreeName] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('duip:showTreeName') !== 'false';
  });

  // 드래그 — ref로 관리해 stale closure 완전 방지
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingMonth, setDraggingMonth] = useState<number | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const isDragActiveRef = useRef(false);
  const draggingMonthRef = useRef<number | null>(null);
  const potsRef = useRef<MonthlyPot[]>(initialPots);
  useEffect(() => { potsRef.current = pots; }, [pots]);

  function startDrag(month: number) {
    isDragActiveRef.current = true;
    draggingMonthRef.current = month;
    setDraggingMonth(month);
    setIsDragActive(true);
    if (navigator.vibrate) navigator.vibrate(30);
  }

  function endDrag() {
    const month = draggingMonthRef.current;
    if (month !== null) saveDragPosition(month);
    isDragActiveRef.current = false;
    draggingMonthRef.current = null;
    setDraggingMonth(null);
    setIsDragActive(false);
  }

  function handlePotPointerDown(month: number, e: React.PointerEvent) {
    if (!editMode) return; // 평상시엔 탭만 — 드래그는 위치 조정 모드에서만
    e.currentTarget.setPointerCapture(e.pointerId);
    startDrag(month);
  }

  // 컨테이너 레벨 이동 — 빠른 움직임에도 손실 없음
  function handleContainerPointerMove(e: React.PointerEvent) {
    if (!isDragActiveRef.current || draggingMonthRef.current === null || !containerRef.current) return;
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(96, Math.max(4, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(58, Math.max(16, ((rect.bottom - e.clientY) / rect.height) * 100));
    const m = draggingMonthRef.current;
    setPots(prev => prev.map(p => p.month === m ? { ...p, pos_x: x, pos_y: y } : p));
  }

  function handleContainerPointerUp() {
    if (isDragActiveRef.current) endDrag();
  }

  async function saveDragPosition(month: number) {
    const pot = potsRef.current.find(p => p.month === month);
    if (!pot || pot.pos_x == null) return;
    const supabase = (await import('@/lib/supabase/client')).createClient();
    await supabase.from('monthly_pots')
      .update({ pos_x: pot.pos_x, pos_y: pot.pos_y })
      .eq('id', pot.id);
  }

  function exitEditMode() {
    if (isDragActiveRef.current) endDrag();
    setEditMode(false);
  }

  const treeEmoji = TREE_EMOJI[treeType] ?? '🌳';
  const treeName = TREE_NAME[treeType] ?? '보호수';

  const selectedPot = pots.find((p) => p.month === pickerMonth);
  const totalCompleted = pots.reduce((sum, p) => sum + p.growth_points, 0);
  const bloomedPots = pots.filter((p) => stageFromPoints(p.growth_points) === 5).length;

  return (
    <div
      ref={containerRef}
      className="duip-page-enter"
      onPointerMove={handleContainerPointerMove}
      onPointerUp={handleContainerPointerUp}
      onPointerCancel={handleContainerPointerUp}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        overflow: 'hidden', background: '#EAF1F0',
        touchAction: isDragActive ? 'none' : 'auto',
      }}
    >
      <style>{`
        @keyframes pot-wobble {
          0%,100% { transform: translateX(-50%) rotate(0deg); }
          25% { transform: translateX(-50%) rotate(-2.5deg); }
          75% { transform: translateX(-50%) rotate(2.5deg); }
        }
        @keyframes pot-wobble-cur {
          0%,100% { transform: translateX(-50%) scale(1.15) rotate(0deg); }
          25% { transform: translateX(-50%) scale(1.15) rotate(-2.5deg); }
          75% { transform: translateX(-50%) scale(1.15) rotate(2.5deg); }
        }
      `}</style>

      {/* 낮 수채화 배경 SVG */}
      <svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice"
           style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}>
        <defs>
          <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#EAF1F0"/>
            <stop offset="22%"  stopColor="#F3EEDF"/>
            <stop offset="48%"  stopColor="#FBEFD2"/>
            <stop offset="72%"  stopColor="#F7E3B8"/>
            <stop offset="100%" stopColor="#EAD49C"/>
          </linearGradient>
          <radialGradient id="g-sun" cx="50%" cy="30%" r="55%">
            <stop offset="0%"   stopColor="#FFF6DC" stopOpacity="0.95"/>
            <stop offset="45%"  stopColor="#FBE9BC" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#FBE9BC" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="g-h0" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#CFE0CB"/><stop offset="100%" stopColor="#BBD3B4"/>
          </linearGradient>
          <linearGradient id="g-h1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#AFCBA1"/><stop offset="100%" stopColor="#97BC8B"/>
          </linearGradient>
          <linearGradient id="g-h2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#94B788"/><stop offset="100%" stopColor="#79A06E"/>
          </linearGradient>
          <linearGradient id="g-gr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#83A973"/><stop offset="100%" stopColor="#688E58"/>
          </linearGradient>
        </defs>
        <rect width="390" height="844" fill="url(#g-sky)"/>
        <circle cx="195" cy="300" r="280" fill="url(#g-sun)"/>
        <circle cx="195" cy="250" r="46" fill="#FFFBEC" opacity="0.55"/>
        {/* 구름 */}
        {([{x:70,y:150,s:1.0,o:0.55},{x:300,y:110,s:0.8,o:0.45},{x:250,y:210,s:0.6,o:0.4}] as {x:number;y:number;s:number;o:number}[]).map((c,i)=>(
          <g key={i} transform={`translate(${c.x} ${c.y}) scale(${c.s})`} opacity={c.o}>
            <ellipse cx="0"  cy="0" rx="34" ry="13" fill="#fff"/>
            <ellipse cx="26" cy="4" rx="24" ry="10" fill="#fff"/>
            <ellipse cx="-24" cy="5" rx="20" ry="9"  fill="#fff"/>
          </g>
        ))}
        {/* 언덕들 */}
        <path d="M-10 500 Q 90 452 200 478 Q 310 500 400 460 L400 560 L-10 560 Z" fill="#E2DAB8" opacity="0.5"/>
        <path d="M-10 545 Q 110 498 210 522 Q 320 548 400 512 L400 620 L-10 620 Z" fill="url(#g-h0)"/>
        <path d="M-10 600 Q  80 548 200 572 Q 320 594 400 552 L400 720 L-10 720 Z" fill="url(#g-h1)"/>
        <path d="M-10 660 Q 110 602 200 628 Q 300 652 400 612 L400 844 L-10 844 Z" fill="url(#g-h2)"/>
        <path d="M-10 660 Q 110 602 200 628 Q 300 652 400 612" stroke="#C7DCB8" strokeWidth="2.5" fill="none" opacity="0.5"/>
        <path d="M-10 726 Q 110 694 200 712 Q 290 728 400 690 L400 844 L-10 844 Z" fill="url(#g-gr)"/>
        <path d="M-10 726 Q 110 694 200 712 Q 290 728 400 690" stroke="#9DBE8A" strokeWidth="2" fill="none" opacity="0.45"/>
        {/* 풀 */}
        {([[34,748],[96,766],[150,776],[232,766],[312,752],[360,770],[64,800],[200,812],[300,812]] as number[][]).map((p,i)=>(
          <g key={i} transform={`translate(${p[0]} ${p[1]})`} opacity="0.6">
            <path d="M0 0 L-2.5 -7 M0 0 L0 -9 M0 0 L2.5 -7" stroke="#52793F" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
          </g>
        ))}
        {/* 들꽃 */}
        {([[58,792,'#F2C66E'],[224,800,'#E89BB8'],[330,786,'#C9A0E0']] as [number,number,string][]).map((p,i)=>(
          <circle key={i} cx={p[0]} cy={p[1]} r="2.6" fill={p[2]} opacity="0.85"/>
        ))}
      </svg>

      {/* 보호수 */}
      <button
        onClick={() => { if (!isDragActive) setShowTreeSheet(true); }}
        style={{
          position: 'absolute',
          left: '50%', top: -48,
          transform: 'translateX(-50%)',
          background: 'none', border: 'none', cursor: 'pointer',
          filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.35))',
          zIndex: 2,
        }}
      >
        {/* 접지 그림자 */}
        <div style={{
          position:'absolute', left:'50%', bottom:-8, transform:'translateX(-50%)',
          width:150, height:26, borderRadius:'50%',
          background:'rgba(58,42,18,0.20)', filter:'blur(7px)', zIndex:-1,
        }}/>
        <div style={{ position: 'relative' }}>
          <TreeImage treeType={treeType} treeEmoji={treeEmoji} size={310} />
          {showTreeName && (
            <div style={{
              position: 'absolute', left: 0, right: 0,
              bottom: Math.round(310 * 0.28),
              display: 'flex', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color: '#FBF6EE',
              background: 'rgba(20,8,2,0.45)', backdropFilter: 'blur(4px)',
              padding: '3px 12px', borderRadius: 9999,
              letterSpacing: '0.04em', pointerEvents: 'none',
              width: 'fit-content', margin: '0 auto',
            }}>
              {treeName}
            </div>
          )}
        </div>
      </button>

      {/* 월별 화분들 */}
      {Array.from({ length: 12 }).map((_, i) => {
        const month = i + 1;
        if (month > currentMonth) return null;
        const pot = pots.find((p) => p.month === month);
        const completed = pot?.growth_points ?? 0;
        const stage = pot ? stageFromPoints(completed) : 1;
        const pos = POT_POSITIONS[i];
        const isCurrent = month === currentMonth;

        const isDragging = draggingMonth === month && isDragActive;
        const left   = pot?.pos_x != null ? pot.pos_x : pos.left;
        const bottom = pot?.pos_y != null ? pot.pos_y : pos.bottomPct;
        const potSize = isCurrent ? 60 : 48;

        const wobble = editMode && !isDragging
          ? { animation: isCurrent ? 'pot-wobble-cur 0.5s ease-in-out infinite' : 'pot-wobble 0.5s ease-in-out infinite' }
          : {};

        return (
          <button
            key={month}
            onClick={() => { if (!isDragActive && !editMode) setSelectedMonth(month); }}
            onPointerDown={(e) => handlePotPointerDown(month, e)}
            style={{
              position: 'absolute',
              left: `${left}%`,
              bottom: `${bottom}%`,
              background: 'none', border: 'none',
              cursor: isDragging ? 'grabbing' : editMode ? 'grab' : 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              transform: isCurrent && !isDragging ? 'translateX(-50%) scale(1.15)' : 'translateX(-50%)',
              transformOrigin: 'bottom center',
              transition: isDragging ? 'none' : 'transform 0.2s',
              filter: isDragging
                ? 'drop-shadow(0 0 24px rgba(92,58,31,0.55))'
                : isCurrent ? 'drop-shadow(0 0 14px rgba(242,198,110,0.85))' : 'none',
              zIndex: isDragging ? 20 : editMode ? pos.zIndex + 10 : isCurrent ? pos.zIndex + 1 : pos.zIndex,
              touchAction: 'none',
              ...wobble,
            }}
          >
            <PotCell
              stage={stage}
              plantId={pot?.plant_id ?? null}
              soilType={pot?.soil_type ?? 'rich'}
              size={potSize}
              preferArtwork
            />
            <div style={{
              marginTop: 2, fontSize: 9.5, fontWeight: 800,
              color: isCurrent ? '#5C3A1F' : 'rgba(251,229,184,0.9)',
              background: isCurrent ? 'rgba(242,198,110,0.92)' : 'rgba(30,10,5,0.38)',
              padding: '2px 6px', borderRadius: 9999,
              letterSpacing: '-0.01em',
              backdropFilter: 'blur(3px)',
            }}>
              {MONTH_KO[i]}
            </div>
          </button>
        );
      })}

      {/* 편집 모드 상단 바 */}
      {editMode && (
        <div style={{
          position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 14px)', left: '50%', transform: 'translateX(-50%)',
          zIndex: 30, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
        }}>
          <div style={{
            background: 'rgba(251,246,238,0.95)', backdropFilter: 'blur(8px)',
            borderRadius: 9999, padding: '8px 16px',
            fontSize: 12, fontWeight: 700, color: '#5C3A1F',
            boxShadow: '0 2px 12px rgba(74,46,22,0.18)',
          }}>
            {isDragActive ? '원하는 위치에 놓아주세요' : '화분을 끌어서 위치를 바꿔보세요'}
          </div>
          {!isDragActive && (
            <button
              onClick={exitEditMode}
              style={{
                height: 36, padding: '0 16px', borderRadius: 9999, border: 'none',
                background: '#5C3A1F', color: '#FBF6EE',
                fontSize: 12, fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(74,46,22,0.3)',
              }}
            >완료</button>
          )}
        </div>
      )}

      {/* 화분이 1개 이하일 때 동산 안내 */}
      {pots.filter(p => p.plant_id).length <= 1 && !editMode && (
        <EmptyGarden month={currentMonth} />
      )}

      {/* 하단 크림 페이드 — 탭바와 시각적으로 연결 */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: 'calc(var(--tabbar-h) + 30px)',
        background: 'linear-gradient(to bottom, transparent, #FBF6EE)',
        pointerEvents: 'none', zIndex: 3,
      }} />

      {/* 하단 정보 칩 */}
      <div style={{
        position: 'absolute', bottom: 'calc(var(--tabbar-h) + 12px)', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(251,246,238,0.88)', backdropFilter: 'blur(8px)',
        borderRadius: 9999, padding: '8px 18px',
        boxShadow: '0 2px 12px rgba(74,46,22,0.12)',
        display: 'flex', alignItems: 'center', gap: 12,
        whiteSpace: 'nowrap', zIndex: 4,
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#5C3A1F' }}>
          {year}년 동산
        </span>
        <div style={{ width: 1, height: 12, background: '#D9C8AC' }}/>
        <span style={{ fontSize: 11.5, color: '#7B5530', fontWeight: 600 }}>
          화분 {Math.min(currentMonth, 12)}개
        </span>
        <div style={{ width: 1, height: 12, background: '#D9C8AC' }}/>
        <span style={{ fontSize: 11.5, color: '#7B5530', fontWeight: 600 }}>
          완료 {totalCompleted}잎
        </span>
        <div style={{ width: 1, height: 12, background: '#D9C8AC' }}/>
        <button
          onClick={() => setEditMode(v => !v)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11.5, fontWeight: 700, color: editMode ? '#C77C6A' : '#7B5530',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
          </svg>
          위치 조정
        </button>
        <div style={{ width: 1, height: 12, background: '#D9C8AC' }}/>
        <button
          onClick={() => setScreenshotMode(true)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11.5, fontWeight: 700, color: '#7B5530',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          공유
        </button>
      </div>

      {/* 월 상세 시트 (G) */}
      {selectedMonth !== null && (
        <MonthDetailSheet
          month={selectedMonth}
          pot={pots.find((p) => p.month === selectedMonth) ?? null}
          completed={pots.find((p) => p.month === selectedMonth)?.growth_points ?? 0}
          stat={monthStats.find((s) => s.month === selectedMonth)}
          onClose={() => setSelectedMonth(null)}
          onPickPlant={() => {
            setPickerMonth(selectedMonth);
            setSelectedMonth(null);
            setShowPicker(true);
          }}
        />
      )}

      {/* 연간 보호수 시트 (H) */}
      {showTreeSheet && (
        <TreeDetailSheet
          year={year}
          treeType={treeType}
          treeEmoji={treeEmoji}
          treeName={treeName}
          totalCompleted={totalCompleted}
          bloomedPots={bloomedPots}
          currentMonth={currentMonth}
          pots={pots}
          showTreeName={showTreeName}
          onTreeNameToggle={(v) => {
            setShowTreeName(v);
            localStorage.setItem('duip:showTreeName', String(v));
          }}
          onClose={() => setShowTreeSheet(false)}
        />
      )}

      {/* 공유 캡처 오버레이 */}
      {screenshotMode && (
        <ScreenshotOverlay
          pots={pots}
          treeType={treeType}
          year={year}
          currentMonth={currentMonth}
          onClose={() => setScreenshotMode(false)}
        />
      )}

      {/* 식물 선택 시트 — 홈과 동일한 공용 시트 (바꾸기: 현재 식물·흙 선택 상태로 열림) */}
      {showPicker && pickerMonth !== null && (
        <PlantPickerSheet
          workspaceId={workspaceId}
          year={year}
          month={pickerMonth}
          initialSoil={selectedPot?.soil_type ?? null}
          initialPlantId={selectedPot?.plant_id ?? null}
          onDone={(row) => {
            setPots(prev => prev.some(p => p.id === row.id)
              ? prev.map(p => p.id === row.id ? { ...p, ...row } : p)
              : [...prev, row]);
            setShowPicker(false);
            setPickerMonth(null);
            router.refresh();
          }}
          onSkip={() => { setShowPicker(false); setPickerMonth(null); }}
        />
      )}

    </div>
  );
}

// ── G: 월 상세 시트 ───────────────────────────────────────────────
function MonthDetailSheet({ month, pot, completed, stat, onClose, onPickPlant }: {
  month: number;
  pot: MonthlyPot | null;
  completed: number;
  stat?: MonthStat;
  onClose: () => void;
  onPickPlant: () => void;
}) {
  const { dragProps, sheetStyle } = useDragSheet(onClose);
  const stage = pot ? stageFromPoints(completed) : 1;
  const plant = plants.find((p) => p.id === pot?.plant_id);

  return (
    <div className="fixed inset-0 z-[60] flex items-end" style={{ background: 'rgba(42,27,14,0.35)' }} onClick={onClose}>
      <div
        className="w-full max-w-md mx-auto"
        style={{ ...sheetStyle, background: '#FBF6EE', borderRadius: '28px 28px 0 0', padding: '0 16px 40px', maxHeight: '80vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div {...dragProps} style={{ ...dragProps.style, display: 'flex', justifyContent: 'center', padding: '12px 0 16px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D9C8AC' }}/>
        </div>

        {/* 히어로 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ position: 'relative' }}>
            <PotCell stage={stage} plantId={pot?.plant_id ?? null} soilType={pot?.soil_type ?? 'rich'} size={64} preferArtwork/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#9A7553', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
              {MONTH_KO[month - 1]}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#2A1B0E', letterSpacing: '-0.02em' }}>
              {plant?.name?.ko ?? '식물 미선택'}
            </div>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              {[1,2,3,4,5].map((s) => (
                <div key={s} style={{
                  width: 28, height: 6, borderRadius: 3,
                  background: s <= stage ? '#9A7CC9' : '#EDE3D4',
                  transition: 'background 0.2s',
                }}/>
              ))}
              <span style={{ fontSize: 11, fontWeight: 700, color: '#7B5530', marginLeft: 4 }}>
                {GROWTH_LABELS[stage]}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onPickPlant(); }}
            style={{
              height: 34, padding: '0 14px', borderRadius: 9999, border: 'none',
              background: 'rgba(92,58,31,0.08)', color: '#5C3A1F',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            바꾸기
          </button>
        </div>

        {/* 통계 타일 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
          {[
            { label: '완료', value: completed, unit: '잎' },
            { label: '단계', value: stage, unit: '단계' },
            { label: '항목', value: stat?.items.length ?? 0, unit: '개' },
          ].map(({ label, value, unit }) => (
            <div key={label} style={{ background: '#FFFCF7', borderRadius: 16, padding: '12px 0', textAlign: 'center', boxShadow: '0 1px 2px rgba(74,46,22,0.05)' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#2A1B0E', letterSpacing: '-0.02em' }}>{value}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9A7553', letterSpacing: '0.04em', marginTop: 2 }}>{label} ({unit})</div>
            </div>
          ))}
        </div>

        {/* 항목 목록 */}
        {stat && stat.items.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#9A7553', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
              이 달의 기록
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {stat.items.map((item) => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#FFFCF7', borderRadius: 14, padding: '10px 12px',
                  opacity: item.is_completed ? 0.75 : 1,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: 9999, flexShrink: 0,
                    background: item.is_completed ? '#9A7CC9' : '#C8B89A',
                  }}/>
                  <div style={{
                    flex: 1, fontSize: 13, fontWeight: 600, color: '#2A1B0E',
                    textDecorationLine: item.is_completed ? 'line-through' : 'none',
                    textDecorationColor: '#B09779',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {item.title}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── H: 보호수 연간 상세 시트 ──────────────────────────────────────
function TreeDetailSheet({ year, treeType, treeEmoji, treeName, totalCompleted, bloomedPots, currentMonth, pots, showTreeName, onTreeNameToggle, onClose }: {
  year: number;
  treeType: string;
  treeEmoji: string;
  treeName: string;
  totalCompleted: number;
  bloomedPots: number;
  currentMonth: number;
  pots: MonthlyPot[];
  showTreeName: boolean;
  onTreeNameToggle: (v: boolean) => void;
  onClose: () => void;
}) {
  const { dragProps, sheetStyle } = useDragSheet(onClose);
  return (
    <div className="fixed inset-0 z-[60] flex items-end" style={{ background: 'rgba(42,27,14,0.35)' }} onClick={onClose}>
      <div
        className="w-full max-w-md mx-auto"
        style={{ ...sheetStyle, background: '#FBF6EE', borderRadius: '28px 28px 0 0', padding: '0 16px 40px', maxHeight: '85vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div {...dragProps} style={{ ...dragProps.style, display: 'flex', justifyContent: 'center', padding: '12px 0 16px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D9C8AC' }}/>
        </div>

        {/* 히어로 */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
            <TreeImage treeType={treeType} treeEmoji={treeEmoji} size={96} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#9A7553', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
            {year}년 보호수
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#2A1B0E', letterSpacing: '-0.025em' }}>
            {treeName}
          </div>
          <div style={{ fontSize: 13, color: '#7B5530', marginTop: 6 }}>
            우리 동산이 자라고 있어요 🌿
          </div>
        </div>

        {/* 연간 통계 타일 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 24 }}>
          {[
            { label: '자란 잎', value: totalCompleted },
            { label: '꽃핀 화분', value: bloomedPots },
            { label: '시작한 달', value: currentMonth },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: '#FFFCF7', borderRadius: 16, padding: '14px 0', textAlign: 'center', boxShadow: '0 1px 2px rgba(74,46,22,0.05)' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#2A1B0E', letterSpacing: '-0.02em' }}>{value}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9A7553', letterSpacing: '0.04em', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* 이름 표시 토글 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFCF7', borderRadius: 16, padding: '12px 16px', marginBottom: 16, boxShadow: '0 1px 2px rgba(74,46,22,0.05)' }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#2A1B0E' }}>이름 표시</div>
          <button
            onClick={() => onTreeNameToggle(!showTreeName)}
            style={{
              width: 44, height: 26, borderRadius: 13,
              background: showTreeName ? '#5C3A1F' : '#D9C8AC',
              border: 'none', cursor: 'pointer', position: 'relative',
              transition: 'background 0.2s',
            }}
          >
            <div style={{
              position: 'absolute', top: 3,
              left: showTreeName ? 21 : 3,
              width: 20, height: 20, borderRadius: '50%',
              background: '#FBF6EE',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>

        {/* 월별 요약 */}
        <div style={{ fontSize: 11, fontWeight: 800, color: '#9A7553', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
          월별 기록
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: currentMonth }).map((_, i) => {
            const month = i + 1;
            const pot = pots.find((p) => p.month === month);
            const completed = pot?.growth_points ?? 0;
            const stage = pot ? stageFromPoints(completed) : 1;
            const plant = plants.find((p) => p.id === pot?.plant_id);
            const isCurrent = month === currentMonth;

            return (
              <div
                key={month}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: isCurrent ? 'rgba(242,198,110,0.15)' : '#FFFCF7',
                  borderRadius: 16, padding: '12px 14px',
                  boxShadow: isCurrent ? '0 0 0 1.5px rgba(242,198,110,0.6)' : '0 1px 2px rgba(74,46,22,0.05)',
                }}
              >
                <div style={{ lineHeight: 1 }}>
                  <PotCell stage={stage} plantId={pot?.plant_id ?? null} soilType={pot?.soil_type ?? 'rich'} size={28} preferArtwork/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#2A1B0E' }}>
                      {MONTH_KO[i]}
                    </span>
                    {isCurrent && (
                      <span style={{ fontSize: 9.5, fontWeight: 800, color: '#5C3A1F', background: 'rgba(242,198,110,0.7)', padding: '1px 7px', borderRadius: 9999 }}>
                        지금
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: '#9A7553', marginLeft: 2 }}>
                      {plant?.name?.ko ?? '미선택'}
                    </span>
                  </div>
                  {/* 단계 도트 */}
                  <div style={{ display: 'flex', gap: 4, marginTop: 5 }}>
                    {[1,2,3,4,5].map((s) => (
                      <div key={s} style={{ width: 20, height: 4, borderRadius: 2, background: s <= stage ? '#9A7CC9' : '#EDE3D4' }}/>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#7B5530', whiteSpace: 'nowrap' }}>
                  {completed}잎
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── 공유 캡처 오버레이 ────────────────────────────────────────────
function ScreenshotOverlay({ pots, treeType, year, currentMonth, onClose }: {
  pots: MonthlyPot[];
  treeType: string;
  year: number;
  currentMonth: number;
  onClose: () => void;
}) {
  const treeEmoji = TREE_EMOJI[treeType] ?? '🌳';
  const treeName = TREE_NAME[treeType] ?? '보호수';
  const [shareBg, setShareBg] = useState(() =>
    (typeof window !== 'undefined' ? localStorage.getItem('duip:shareBg') : null) ?? 'sunset'
  );

  const bgPreset = SHARE_BACKGROUNDS.find(b => b.id === shareBg) ?? SHARE_BACKGROUNDS[0];
  const isNight = bgPreset.dark;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: bgPreset.bg,
        overflow: 'hidden', cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        animation: 'overlayIn 0.2s ease',
      }}
    >
      <style>{`@keyframes overlayIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
      {/* 안내 힌트 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        paddingTop: 'max(env(safe-area-inset-top), 20px)',
        display: 'flex', justifyContent: 'center', zIndex: 2,
      }}>
        <div style={{
          background: isNight ? 'rgba(255,255,255,0.12)' : 'rgba(20,8,2,0.50)',
          backdropFilter: 'blur(6px)',
          borderRadius: 9999, padding: '7px 20px',
          fontSize: 12, fontWeight: 700, color: 'rgba(251,246,238,0.92)',
          letterSpacing: '-0.01em',
        }}>
          📸 스크린샷 후 탭하여 닫기
        </div>
      </div>

      {/* 보호수 */}
      <div style={{
        position: 'absolute', left: '50%', top: -116,
        transform: 'translateX(-50%)',
        filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.35))',
        zIndex: 2, pointerEvents: 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <TreeImage treeType={treeType} treeEmoji={treeEmoji} size={498} />
        <div style={{
          marginTop: 6, fontSize: 11, fontWeight: 800, color: '#FBF6EE',
          background: 'rgba(20,8,2,0.45)', backdropFilter: 'blur(4px)',
          padding: '3px 12px', borderRadius: 9999,
          letterSpacing: '0.04em', textAlign: 'center',
        }}>
          {treeName}
        </div>
      </div>

      {/* 화분들 */}
      {Array.from({ length: 12 }).map((_, i) => {
        const month = i + 1;
        if (month > currentMonth) return null;
        const pot = pots.find((p) => p.month === month);
        const stage = pot ? stageFromPoints(pot.growth_points) : 1;
        const pos = POT_POSITIONS[i];
        const isCurrent = month === currentMonth;
        return (
          <div
            key={month}
            style={{
              position: 'absolute', left: `${pot?.pos_x != null ? pot.pos_x : pos.left}%`, bottom: `${pot?.pos_y != null ? pot.pos_y : pos.bottomPct}%`,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              transform: isCurrent ? 'translateX(-50%) scale(1.15)' : 'translateX(-50%)',
              transformOrigin: 'bottom center',
              filter: isCurrent ? 'drop-shadow(0 0 14px rgba(242,198,110,0.85))' : 'none',
              zIndex: isCurrent ? pos.zIndex + 1 : pos.zIndex,
              pointerEvents: 'none',
            }}
          >
            <PotCell stage={stage} plantId={pot?.plant_id ?? null} soilType={pot?.soil_type ?? 'rich'} size={isCurrent ? 44 : 38} preferArtwork/>
            <div style={{
              marginTop: 2, fontSize: 9.5, fontWeight: 800,
              color: isCurrent ? '#5C3A1F' : 'rgba(251,229,184,0.9)',
              background: isCurrent ? 'rgba(242,198,110,0.92)' : 'rgba(30,10,5,0.38)',
              padding: '2px 6px', borderRadius: 9999, letterSpacing: '-0.01em',
              backdropFilter: 'blur(3px)',
            }}>
              {MONTH_KO[i]}
            </div>
          </div>
        );
      })}

      {/* 하단 브랜딩 (캡처 영역 안) */}
      <div style={{
        position: 'absolute', bottom: 'calc(var(--tabbar-h) + 12px)', left: '50%', transform: 'translateX(-50%)',
        background: isNight ? 'rgba(255,255,255,0.12)' : 'rgba(251,246,238,0.90)',
        backdropFilter: 'blur(8px)',
        borderRadius: 9999, padding: '10px 24px',
        fontSize: 13, fontWeight: 800,
        color: isNight ? '#E8D8FF' : '#5C3A1F',
        whiteSpace: 'nowrap', zIndex: 4,
        boxShadow: isNight ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 12px rgba(74,46,22,0.12)',
      }}>
        🌿 두잎 · {year}년 동산
      </div>

      {/* 배경 선택 스와치 (캡처 영역 밖 — 화면 맨 아래) */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
          paddingTop: 10,
          background: 'rgba(10,5,2,0.55)', backdropFilter: 'blur(10px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10,
          zIndex: 10,
        }}
      >
        {SHARE_BACKGROUNDS.map((b) => (
          <button
            key={b.id}
            onClick={() => {
              setShareBg(b.id);
              localStorage.setItem('duip:shareBg', b.id);
            }}
            title={b.label}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: b.bg, border: 'none', cursor: 'pointer',
              boxShadow: shareBg === b.id
                ? '0 0 0 2px #FBF6EE, 0 0 0 4px rgba(251,246,238,0.5)'
                : '0 0 0 1.5px rgba(255,255,255,0.25)',
              transition: 'box-shadow 0.15s',
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
