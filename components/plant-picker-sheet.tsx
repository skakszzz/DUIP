'use client';

import { useState } from 'react';
import { useDragSheet } from '@/lib/use-drag-sheet';
import { PlantArt } from '@/components/plant-art';
import { createClient } from '@/lib/supabase/client';
import { plants } from '@/lib/data/plants';
import type { PlantCategory } from '@/lib/data/plants';
import { soilVariants } from '@/lib/data/pots';
import { PotView, POT_VIEW_TOP_OVERFLOW } from '@/components/pot-view';
import type { SoilType } from '@/lib/types';

// 화분 선택의 유일한 시트 — 홈·동산 공용. 픽커 구현이 두 곳이면 안 된다.
export interface PickedPot {
  id: string;
  month: number;
  plant_id: string;
  soil_type: SoilType;
  growth_points: number;
  pos_x: number | null;
  pos_y: number | null;
}

interface Props {
  workspaceId: string;
  year: number;
  month: number;
  /** 바꾸기 모드: 현재 화분의 흙 — 지정 시 식물 단계에서 시작 */
  initialSoil?: SoilType | null;
  /** 바꾸기 모드: 현재 화분의 식물 — 선택된 상태로 열림 */
  initialPlantId?: string | null;
  onDone: (pot: PickedPot) => void;
  onSkip?: () => void;
}

type CategoryTab = PlantCategory | 'all';

const CATEGORY_LABELS: Record<CategoryTab, string> = {
  all: '전체',
  succulent: '다육이',
  houseplant: '관엽',
  flowering: '꽃',
  herb: '허브',
  korean: '한국',
  cactus: '선인장',
  climber: '덩굴',
  special: '특수',
};
const CATEGORIES: CategoryTab[] = ['all', 'succulent', 'houseplant', 'flowering', 'herb', 'korean', 'cactus', 'climber', 'special'];

function PlantImage({ plantId, size }: { plantId: string; size: number }) {
  return <PlantArt id={plantId} stage={5} size={size} showPot={false} />;
}

export default function PlantPickerSheet({ workspaceId, year, month, initialSoil, initialPlantId, onDone, onSkip }: Props) {
  const { dragProps, sheetStyle } = useDragSheet(() => onSkip?.());
  const [step, setStep] = useState<'soil' | 'plant'>(initialSoil ? 'plant' : 'soil');
  const [selectedSoil, setSelectedSoil] = useState<SoilType | null>(initialSoil ?? null);
  const [selectedPlant, setSelectedPlant] = useState<string | null>(initialPlantId ?? null);
  const [category, setCategory] = useState<CategoryTab>(() => {
    if (!initialPlantId) return 'succulent';
    return plants.find(p => p.id === initialPlantId)?.category ?? 'all';
  });
  const [loading, setLoading] = useState(false);

  const filteredPlants = category === 'all' ? plants : plants.filter(p => p.category === category);
  const selectedPlantData = selectedPlant ? plants.find(p => p.id === selectedPlant) : null;

  async function handleConfirm() {
    if (!selectedSoil || !selectedPlant) return;
    setLoading(true);
    const supabase = createClient();
    // growth_points를 payload에 넣지 않음 — 월 중 바꾸기에도 성장점수 보존
    const { data } = await supabase
      .from('monthly_pots')
      .upsert(
        { workspace_id: workspaceId, year, month, plant_id: selectedPlant, soil_type: selectedSoil, selected_at: new Date().toISOString() },
        { onConflict: 'workspace_id,year,month' }
      )
      .select('id, month, plant_id, soil_type, growth_points, pos_x, pos_y')
      .single();
    setLoading(false);
    if (data) onDone(data as PickedPot);
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'flex-end', background: 'rgba(42,27,14,0.50)' }}
      onClick={() => onSkip?.()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ ...sheetStyle, width: '100%', maxWidth: 448, margin: '0 auto', background: '#FBF6EE', borderRadius: '28px 28px 0 0', padding: '0 16px calc(20px + env(safe-area-inset-bottom, 0px))', maxHeight: '90dvh', display: 'flex', flexDirection: 'column' }}
      >
        {/* 핸들 + 닫기 — 드래그 영역 */}
        <div {...dragProps} style={{ ...dragProps.style, display: 'flex', alignItems: 'center', padding: '12px 0 8px', flexShrink: 0 }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D9C8AC' }}/>
          </div>
          {onSkip && (
            <button
              onClick={onSkip}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C8B89A', fontSize: 13, padding: '0 4px', lineHeight: 1, position: 'absolute', right: 20 }}
            >
              나중에
            </button>
          )}
        </div>

        {step === 'soil' ? (
          /* ── Step 1: 흙 선택 ──────────────────────────────────── */
          <>
            <p style={{ fontSize: 11, fontWeight: 800, color: '#9A7553', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4, flexShrink: 0 }}>
              {month}월 화분 고르기
            </p>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#2A1B0E', marginBottom: 4, letterSpacing: '-0.025em', flexShrink: 0 }}>
              어떤 흙을 담을까요?
            </p>
            <p style={{ fontSize: 13, color: '#8A7359', marginBottom: 20, lineHeight: 1.5, flexShrink: 0 }}>
              흙에 따라 잘 자라는 식물이 달라져요
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20, overflowY: 'auto', flex: 1, minHeight: 0, overscrollBehavior: 'contain', touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
              {soilVariants.map(soil => {
                const on = selectedSoil === soil.id;
                return (
                  <button
                    key={soil.id}
                    onClick={() => setSelectedSoil(soil.id)}
                    style={{
                      borderRadius: 20,
                      border: `2px solid ${on ? '#9A7CC9' : 'transparent'}`,
                      background: on ? 'rgba(154,124,201,0.10)' : '#FFFCF7',
                      boxShadow: on ? '0 0 0 1px rgba(154,124,201,0.3), 0 4px 12px rgba(74,46,22,0.08)' : '0 2px 8px rgba(74,46,22,0.07)',
                      padding: '16px 12px',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                      transition: 'all 0.15s',
                    }}
                  >
                    <img src={`/pots/soil-${soil.id}.webp`} alt={soil.nameKo} style={{ width: 80, height: 80, objectFit: 'contain' }} />
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#2A1B0E' }}>{soil.nameKo}</div>
                    <div style={{ fontSize: 11, color: '#8A7359', textAlign: 'center', lineHeight: 1.4 }}>{soil.description}</div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => selectedSoil && setStep('plant')}
              disabled={!selectedSoil}
              style={{
                flexShrink: 0,
                width: '100%', height: 52, borderRadius: 9999, border: 'none',
                background: selectedSoil ? '#5C3A1F' : '#E8D9C3',
                color: selectedSoil ? '#FBF6EE' : '#B09779',
                fontSize: 15, fontWeight: 800, cursor: selectedSoil ? 'pointer' : 'default',
                boxShadow: selectedSoil ? '0 8px 24px rgba(74,46,22,0.22)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              다음 → 식물 고르기
            </button>
          </>
        ) : (
          /* ── Step 2: 식물 선택 ──────────────────────────────────── */
          <>
            {/* 뒤로 + 미리보기 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexShrink: 0 }}>
              <button
                onClick={() => setStep('soil')}
                style={{
                  width: 32, height: 32, borderRadius: 9999, border: 'none',
                  background: '#F4E8D6', color: '#9B7B52',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>

              {selectedSoil && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  {/* 식물이 화분 위로 튀어나오는 만큼 높이를 확보하고 하단 정렬 — overflow:hidden 금지 (상단 잘림) */}
                  <div style={{ width: 64, height: Math.round(64 * (1 + POT_VIEW_TOP_OVERFLOW)), display: 'flex', alignItems: 'flex-end', flexShrink: 0 }}>
                    <PotView
                      soilId={selectedSoil}
                      plantId={selectedPlant}
                      stage={selectedPlant ? 5 : 1}
                      size={64}
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#2A1B0E', lineHeight: 1.3 }}>
                      {selectedPlantData ? selectedPlantData.name.ko : '식물을 골라주세요'}
                    </div>
                    {selectedPlantData ? (
                      <div style={{ fontSize: 11, color: '#9A7553', marginTop: 2, lineHeight: 1.3 }}>
                        {selectedPlantData.flowerLanguage}
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: '#C8B89A', marginTop: 2 }}>
                        아래 목록에서 선택하세요
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 카테고리 탭 */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 12, flexShrink: 0, paddingBottom: 2 }}>
              {CATEGORIES.map(cat => {
                const on = category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    style={{
                      flexShrink: 0,
                      height: 30, padding: '0 12px', borderRadius: 9999, border: 'none',
                      background: on ? '#5C3A1F' : '#F4E8D6',
                      color: on ? '#FBF6EE' : '#9B7B52',
                      fontSize: 12, fontWeight: 800, cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                );
              })}
            </div>

            {/* 식물 그리드 — 스크롤 전용 영역 (시트 드래그는 상단 핸들에서만) */}
            <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, marginBottom: 14, overscrollBehavior: 'contain', touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {filteredPlants.map(plant => {
                  const on = selectedPlant === plant.id;
                  return (
                    <button
                      key={plant.id}
                      onClick={() => setSelectedPlant(plant.id)}
                      style={{
                        borderRadius: 16,
                        border: `2px solid ${on ? '#9A7CC9' : 'transparent'}`,
                        background: on ? 'rgba(154,124,201,0.10)' : '#FFFCF7',
                        boxShadow: on ? '0 0 0 1px rgba(154,124,201,0.25), 0 2px 8px rgba(74,46,22,0.06)' : '0 1px 4px rgba(74,46,22,0.06)',
                        padding: '10px 8px 8px',
                        cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PlantImage plantId={plant.id} size={52} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#2A1B0E', textAlign: 'center', lineHeight: 1.3, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {plant.name.ko}
                      </div>
                      <div style={{ fontSize: 9.5, color: '#9A7553', textAlign: 'center', lineHeight: 1.3, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {plant.flowerLanguage}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 확정 버튼 */}
            <button
              onClick={handleConfirm}
              disabled={!selectedPlant || loading}
              style={{
                flexShrink: 0,
                width: '100%', height: 52, borderRadius: 9999, border: 'none',
                background: selectedPlant ? '#5C3A1F' : '#E8D9C3',
                color: selectedPlant ? '#FBF6EE' : '#B09779',
                fontSize: 15, fontWeight: 800, cursor: selectedPlant ? 'pointer' : 'default',
                boxShadow: selectedPlant ? '0 8px 24px rgba(74,46,22,0.22)' : 'none',
                opacity: loading ? 0.55 : 1,
                transition: 'all 0.2s',
              }}
            >
              {loading ? '저장 중...' : `${month}월 화분 확정하기 🌱`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
