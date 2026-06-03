'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useDragSheet } from '@/lib/use-drag-sheet';
import { EmptyGarden } from '@/components/empty-states';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { plants } from '@/lib/data/plants';
import { soilVariants } from '@/lib/data/pots';
import { PLANT_EMOJIS } from '@/lib/data/plant-emojis';
import { PotView } from '@/components/pot-view';
import type { SoilType } from '@/lib/types';

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
  completed_at: string | null;
}

interface Props {
  workspaceId: string;
  year: number;
  pots: MonthlyPot[];
  monthStats: MonthStat[];
  treeType: string;
  workspaceName: string;
}

const TREE_EMOJI: Record<string, string> = {
  cherry: '🌸', olive: '🫒', ginkgo: '🍂', pine: '🌲', maple: '🍁',
};
const TREE_NAME: Record<string, string> = {
  cherry: '벚나무', olive: '올리브나무', ginkgo: '은행나무', pine: '소나무', maple: '단풍나무',
};

const MONTH_KO = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

const GROWTH_LABELS = ['', '흙', '새싹', '잎', '성숙기', '꽃핌'];

const MONTHLY_TARGET = 300; // 하루 10개 × 30일 = 100%

function getStage(completed: number): 1 | 2 | 3 | 4 | 5 {
  const pct = completed / MONTHLY_TARGET;
  if (pct === 0) return 1;
  if (pct < 0.25) return 2;
  if (pct < 0.5) return 3;
  if (pct < 0.75) return 4;
  return 5;
}

// 화분 렌더링 (실제 이미지 + 이모지 폴백)
function PotCell({ stage, plantId, soilType, size = 52 }: { stage: number; plantId: string | null; soilType: SoilType; size?: number }) {
  return (
    <div style={{ filter: stage === 5 ? 'drop-shadow(0 0 8px rgba(242,198,110,0.6))' : 'none' }}>
      <PotView
        soilId={soilType}
        plantId={plantId}
        stage={stage as 1 | 2 | 3 | 4 | 5}
        size={size}
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
        src={`/trees/${treeType}.png`}
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
  { left: 16, bottomPct: 10.5, zIndex: 5 }, // 1월
  { left: 84, bottomPct: 10.0, zIndex: 5 }, // 2월
  { left: 33, bottomPct: 16.5, zIndex: 4 }, // 3월
  { left: 67, bottomPct: 17.0, zIndex: 4 }, // 4월
  { left: 50, bottomPct: 22.0, zIndex: 3 }, // 5월
  { left:  8, bottomPct: 16.0, zIndex: 4 }, // 6월
  { left: 92, bottomPct: 16.0, zIndex: 4 }, // 7월
  { left: 25, bottomPct: 22.5, zIndex: 3 }, // 8월
  { left: 75, bottomPct: 22.5, zIndex: 3 }, // 9월
  { left: 42, bottomPct: 27.0, zIndex: 2 }, // 10월
  { left: 58, bottomPct: 27.0, zIndex: 2 }, // 11월
  { left: 50, bottomPct: 31.0, zIndex: 1 }, // 12월
];

export default function GardenView({ workspaceId, year, pots: initialPots, monthStats, treeType, workspaceName }: Props) {
  const router = useRouter();
  const currentMonth = new Date().getMonth() + 1;
  const [pots, setPots] = useState<MonthlyPot[]>(initialPots);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [showTreeSheet, setShowTreeSheet] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [screenshotMode, setScreenshotMode] = useState(false);

  // 화분 드래그 배치
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingMonth, setDraggingMonth] = useState<number | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handlePotPointerDown(month: number, e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    longPressTimer.current = setTimeout(() => {
      setDraggingMonth(month);
      setIsDragActive(true);
    }, 500);
  }

  function handlePotPointerMove(e: React.PointerEvent) {
    if (!isDragActive || draggingMonth === null || !containerRef.current) return;
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(98, Math.max(2, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(60, Math.max(5, ((rect.bottom - e.clientY) / rect.height) * 100));
    setPots(prev => prev.map(p => p.month === draggingMonth ? { ...p, pos_x: x, pos_y: y } : p));
  }

  const saveDragPosition = useCallback(async (month: number) => {
    const pot = pots.find(p => p.month === month);
    if (!pot || pot.pos_x == null) return;
    const supabase = (await import('@/lib/supabase/client')).createClient();
    await supabase.from('monthly_pots')
      .update({ pos_x: pot.pos_x, pos_y: pot.pos_y })
      .eq('id', pot.id);
  }, [pots]);

  function handlePotPointerUp(month: number) {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (isDragActive) {
      saveDragPosition(month);
      setIsDragActive(false);
      setDraggingMonth(null);
    }
  }

  const treeEmoji = TREE_EMOJI[treeType] ?? '🌳';
  const treeName = TREE_NAME[treeType] ?? '보호수';

  const selectedPot = pots.find((p) => p.month === pickerMonth);
  const totalCompleted = pots.reduce((sum, p) => sum + p.growth_points, 0);
  const bloomedPots = pots.filter((p) => getStage(p.growth_points) === 5).length;

  async function selectPlant(plantId: string, soilId: SoilType) {
    if (!selectedPot) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from('monthly_pots').update({ plant_id: plantId, soil_type: soilId, selected_at: new Date().toISOString() }).eq('id', selectedPot.id);
    setSaving(false);
    setShowPicker(false);
    router.refresh();
  }

  const filteredPlants = categoryFilter === 'all' ? plants : plants.filter((p) => p.category === categoryFilter);

  const CATEGORY_LABELS: Record<string, string> = {
    succulent: '다육이', houseplant: '관엽', flowering: '꽃', herb: '허브', korean: '한국 전통', cactus: '선인장', climber: '덩굴', special: '특수',
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative', width: '100%', height: 'calc(100svh - 60px)',
        overflow: 'hidden', minHeight: 520, background: '#EAF1F0',
      }}
    >

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

      {/* 보호수 — 화면 중앙 상단, 크게 */}
      <button
        onClick={() => setShowTreeSheet(true)}
        style={{
          position: 'absolute',
          left: '50%', top: -116,
          transform: 'translateX(-50%)',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
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
        <TreeImage treeType={treeType} treeEmoji={treeEmoji} size={498} />
        <div style={{
          marginTop: 6, fontSize: 11, fontWeight: 800, color: '#FBF6EE',
          background: 'rgba(20,8,2,0.45)', backdropFilter: 'blur(4px)',
          padding: '3px 12px', borderRadius: 9999,
          letterSpacing: '0.04em',
        }}>
          {treeName}
        </div>
      </button>

      {/* 월별 화분들 — 보호수 앞·양옆 3열 배치 */}
      {Array.from({ length: 12 }).map((_, i) => {
        const month = i + 1;
        if (month > currentMonth) return null;
        const pot = pots.find((p) => p.month === month);
        const completed = pot?.growth_points ?? 0;
        const stage = pot ? getStage(completed) : 1;
        const pos = POT_POSITIONS[i];
        const isCurrent = month === currentMonth;

        const isDragging = draggingMonth === month && isDragActive;
        const left   = pot?.pos_x != null ? pot.pos_x : pos.left;
        const bottom = pot?.pos_y != null ? pot.pos_y : pos.bottomPct;

        return (
          <button
            key={month}
            onClick={() => { if (!isDragActive) setSelectedMonth(month); }}
            onPointerDown={(e) => handlePotPointerDown(month, e)}
            onPointerMove={handlePotPointerMove}
            onPointerUp={() => handlePotPointerUp(month)}
            onPointerCancel={() => handlePotPointerUp(month)}
            style={{
              position: 'absolute',
              left: `${left}%`,
              bottom: `${bottom}%`,
              background: 'none', border: 'none', cursor: isDragging ? 'grabbing' : 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              transform: isCurrent && !isDragging ? 'translateX(-50%) scale(1.15)' : 'translateX(-50%)',
              transformOrigin: 'bottom center',
              transition: isDragging ? 'none' : 'transform 0.2s',
              filter: isDragging
                ? 'drop-shadow(0 0 20px rgba(92,58,31,0.5))'
                : isCurrent ? 'drop-shadow(0 0 14px rgba(242,198,110,0.85))' : 'none',
              zIndex: isDragging ? 20 : isCurrent ? pos.zIndex + 1 : pos.zIndex,
              touchAction: 'none',
            }}
          >
            <PotCell
              stage={stage}
              plantId={pot?.plant_id ?? null}
              soilType={pot?.soil_type ?? 'rich'}
              size={isCurrent ? 44 : 38}
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

      {/* 드래그 중 안내 */}
      {isDragActive && (
        <div style={{
          position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(92,58,31,0.85)', backdropFilter: 'blur(6px)',
          borderRadius: 9999, padding: '7px 18px',
          fontSize: 12, fontWeight: 700, color: '#FBF6EE',
          whiteSpace: 'nowrap', zIndex: 25, pointerEvents: 'none',
        }}>
          원하는 위치에 놓아주세요
        </div>
      )}

      {/* 화분이 1개 이하일 때 동산 안내 */}
      {pots.filter(p => p.plant_id).length <= 1 && (
        <EmptyGarden month={currentMonth} />
      )}

      {/* 하단 정보 칩 */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
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

      {/* 식물 선택 시트 */}
      {showPicker && pickerMonth !== null && selectedPot && (
        <PlantPickerSheet
          month={pickerMonth}
          pot={selectedPot}
          filteredPlants={filteredPlants}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          categoryLabels={CATEGORY_LABELS}
          saving={saving}
          onSelect={selectPlant}
          onClose={() => { setShowPicker(false); setPickerMonth(null); }}
          router={router}
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
  const stage = pot ? getStage(completed) : 1;
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
            <PotCell stage={stage} plantId={pot?.plant_id ?? null} soilType={pot?.soil_type ?? 'rich'} size={64}/>
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
function TreeDetailSheet({ year, treeType, treeEmoji, treeName, totalCompleted, bloomedPots, currentMonth, pots, onClose }: {
  year: number;
  treeType: string;
  treeEmoji: string;
  treeName: string;
  totalCompleted: number;
  bloomedPots: number;
  currentMonth: number;
  pots: MonthlyPot[];
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

        {/* 월별 요약 */}
        <div style={{ fontSize: 11, fontWeight: 800, color: '#9A7553', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
          월별 기록
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: currentMonth }).map((_, i) => {
            const month = i + 1;
            const pot = pots.find((p) => p.month === month);
            const completed = pot?.growth_points ?? 0;
            const stage = pot ? getStage(completed) : 1;
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
                  <PotCell stage={stage} plantId={pot?.plant_id ?? null} soilType={pot?.soil_type ?? 'rich'} size={28}/>
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

// ── 식물 선택 시트 ────────────────────────────────────────────────
function PlantPickerSheet({ month, pot, filteredPlants, categoryFilter, onCategoryChange, categoryLabels, saving, onSelect, onClose, router }: {
  month: number;
  pot: MonthlyPot;
  filteredPlants: typeof plants;
  categoryFilter: string;
  onCategoryChange: (c: string) => void;
  categoryLabels: Record<string, string>;
  saving: boolean;
  onSelect: (plantId: string, soilId: SoilType) => void;
  onClose: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end" style={{ background: 'rgba(42,27,14,0.4)' }} onClick={onClose}>
      <div
        className="w-full max-w-md mx-auto"
        style={{ background: '#FBF6EE', borderRadius: '28px 28px 0 0', padding: '0 0 40px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 10px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D9C8AC' }}/>
        </div>
        <div style={{ padding: '0 16px' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#2A1B0E', letterSpacing: '-0.02em', marginBottom: 4 }}>
            {MONTH_KO[month - 1]} 식물 고르기
          </div>
          <div style={{ fontSize: 12, color: '#8A7359', marginBottom: 12 }}>
            흙: <strong>{soilVariants.find(s => s.id === pot.soil_type)?.nameKo}</strong>
          </div>
          {/* 흙 선택 */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {soilVariants.map((soil) => (
              <button
                key={soil.id}
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.from('monthly_pots').update({ soil_type: soil.id }).eq('id', pot.id);
                  router.refresh();
                }}
                style={{
                  flex: 1, height: 34, borderRadius: 10, border: 'none',
                  background: pot.soil_type === soil.id ? '#5C3A1F' : '#F4EBD9',
                  color: pot.soil_type === soil.id ? '#FBF6EE' : '#7B5530',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}
              >
                {soil.nameKo}
              </button>
            ))}
          </div>
          {/* 카테고리 필터 */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 10 }}>
            <button onClick={() => onCategoryChange('all')} style={{ flexShrink: 0, height: 28, padding: '0 12px', borderRadius: 9999, border: 'none', background: categoryFilter === 'all' ? '#5C3A1F' : '#F4EBD9', color: categoryFilter === 'all' ? '#FBF6EE' : '#7B5530', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>전체</button>
            {Object.entries(categoryLabels).map(([k, v]) => (
              <button key={k} onClick={() => onCategoryChange(k)} style={{ flexShrink: 0, height: 28, padding: '0 12px', borderRadius: 9999, border: 'none', background: categoryFilter === k ? '#5C3A1F' : '#F4EBD9', color: categoryFilter === k ? '#FBF6EE' : '#7B5530', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>{v}</button>
            ))}
          </div>
        </div>
        {/* 식물 목록 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {filteredPlants.map((plant) => (
              <button
                key={plant.id}
                onClick={() => onSelect(plant.id, pot.soil_type)}
                disabled={saving}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: pot.plant_id === plant.id ? '#5C3A1F' : '#FFFCF7',
                  borderRadius: 14, padding: '10px 12px',
                  border: 'none', cursor: 'pointer',
                  boxShadow: pot.plant_id === plant.id ? '0 4px 12px rgba(74,46,22,0.18)' : '0 1px 2px rgba(74,46,22,0.05)',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: 22, lineHeight: 1 }}>{PLANT_EMOJIS[plant.id] ?? '🌿'}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: pot.plant_id === plant.id ? '#FBF6EE' : '#2A1B0E' }}>{plant.name.ko}</div>
                  <div style={{ fontSize: 10, color: pot.plant_id === plant.id ? 'rgba(251,246,238,0.7)' : '#9A7553', marginTop: 1 }}>{plant.flowerLanguage}</div>
                </div>
              </button>
            ))}
          </div>
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

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'linear-gradient(180deg, #1E0F3C 0%, #52204E 18%, #9E3D58 32%, #C85038 50%, #E88845 65%, #F5C070 80%, #FBE5B8 100%)',
        overflow: 'hidden', cursor: 'pointer',
      }}
    >
      {/* 안내 힌트 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        paddingTop: 'max(env(safe-area-inset-top), 20px)',
        display: 'flex', justifyContent: 'center', zIndex: 2,
      }}>
        <div style={{
          background: 'rgba(20,8,2,0.50)', backdropFilter: 'blur(6px)',
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
        const stage = pot ? getStage(pot.growth_points) : 1;
        const pos = POT_POSITIONS[i];
        const isCurrent = month === currentMonth;
        return (
          <div
            key={month}
            style={{
              position: 'absolute', left: `${pos.left}%`, bottom: `${pos.bottomPct}%`,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              transform: isCurrent ? 'translateX(-50%) scale(1.15)' : 'translateX(-50%)',
              transformOrigin: 'bottom center',
              filter: isCurrent ? 'drop-shadow(0 0 14px rgba(242,198,110,0.85))' : 'none',
              zIndex: isCurrent ? pos.zIndex + 1 : pos.zIndex,
              pointerEvents: 'none',
            }}
          >
            <PotCell stage={stage} plantId={pot?.plant_id ?? null} soilType={pot?.soil_type ?? 'rich'} size={isCurrent ? 44 : 38} />
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

      {/* 하단 브랜딩 */}
      <div style={{
        position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(251,246,238,0.90)', backdropFilter: 'blur(8px)',
        borderRadius: 9999, padding: '10px 24px',
        fontSize: 13, fontWeight: 800, color: '#5C3A1F',
        whiteSpace: 'nowrap', zIndex: 4,
        boxShadow: '0 2px 12px rgba(74,46,22,0.12)',
      }}>
        🌿 두잎 · {year}년 동산
      </div>
    </div>
  );
}
