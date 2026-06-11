'use client';

import { useState } from 'react';
import { useDragSheet } from '@/lib/use-drag-sheet';
import { PlantArt } from '@/components/plant-art';
import { createClient } from '@/lib/supabase/client';
import { plants } from '@/lib/data/plants';
import type { PlantCategory } from '@/lib/data/plants';
import { soilVariants } from '@/lib/data/pots';
import { PLANT_EMOJIS } from '@/lib/data/plant-emojis';
import { PotView } from '@/components/pot-view';
import type { SoilType } from '@/lib/types';

interface Props {
  workspaceId: string;
  year: number;
  month: number;
  onDone: (pot: { plant_id: string; soil_type: string }) => void;
  onSkip?: () => void;
}

const CATEGORY_LABELS: Record<PlantCategory, string> = {
  succulent: '다육이',
  houseplant: '관엽',
  flowering: '꽃',
  herb: '허브',
  korean: '한국',
  cactus: '선인장',
  climber: '덩굴',
  special: '특수',
};
const CATEGORIES: PlantCategory[] = ['succulent', 'houseplant', 'flowering', 'herb', 'korean', 'cactus', 'climber', 'special'];

function PlantImage({ plantId, size }: { plantId: string; size: number }) {
  return <PlantArt id={plantId} stage={5} size={size} showPot={false} />;
}

export default function PlantPickerSheet({ workspaceId, year, month, onDone, onSkip }: Props) {
  const { dragProps, sheetStyle } = useDragSheet(() => onSkip?.());
  const [step, setStep] = useState<'soil' | 'plant'>('soil');
  const [selectedSoil, setSelectedSoil] = useState<SoilType | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [category, setCategory] = useState<PlantCategory>('succulent');
  const [loading, setLoading] = useState(false);

  const filteredPlants = plants.filter(p => p.category === category);
  const selectedPlantData = selectedPlant ? plants.find(p => p.id === selectedPlant) : null;

  async function handleConfirm() {
    if (!selectedSoil || !selectedPlant) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('monthly_pots')
      .upsert(
        { workspace_id: workspaceId, year, month, plant_id: selectedPlant, soil_type: selectedSoil },
        { onConflict: 'workspace_id,year,month' }
      )
      .select('plant_id, soil_type')
      .single();
    setLoading(false);
    if (data) onDone({ plant_id: data.plant_id, soil_type: data.soil_type });
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'flex-end', background: 'rgba(42,27,14,0.50)' }}
      onClick={() => onSkip?.()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ ...sheetStyle, width: '100%', maxWidth: 448, margin: '0 auto', background: '#FBF6EE', borderRadius: '28px 28px 0 0', padding: '0 16px 36px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20, overflowY: 'auto', flex: 1 }}>
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
                  <div style={{ overflow: 'hidden', width: 64, height: 64, flexShrink: 0 }}>
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

            {/* 식물 그리드 */}
            <div style={{ overflowY: 'auto', flex: 1, marginBottom: 14 }}>
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
