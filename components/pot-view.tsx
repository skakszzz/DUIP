'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { SoilType } from '@/lib/types';
import { getPlantEmoji } from '@/lib/data/plant-emojis';

// ─────────────────────────────────────────────────────────────────
// 화분/식물 레이어 정렬 상수
// 이미지 제작 규칙(pots.ts / plants.ts 주석)에서 도출한 초기값.
// 브라우저 실물 확인 후 0.01 단위로 조정 — 두 값이 완벽히 일치하면 오프셋은 0.
//
//  SOIL_Y         화분 이미지(1024×1024) 내 흙 표면 위치 (0=상단, 1=하단)
//                 pots.ts 설계 규칙: 흙 표면 ≈ 55~60%
//
//  PLANT_ANCHOR_Y 식물 이미지(1024×1024) 내 밑동(뿌리 시작점) 위치
//                 plants.ts 설계 규칙: 밑동 ≈ 55~60%
//
//  PLANT_OFFSET_Y SOIL_Y - PLANT_ANCHOR_Y
//                 양수 → 식물 이미지를 아래로 이동 (화분 안으로 파고듦)
//                 음수 → 식물 이미지를 위로 이동 (화분 위로 뜸)
//                 두 값이 같으면 0 → 이미지 제작 규칙이 정확히 지켜진 경우
// ─────────────────────────────────────────────────────────────────
const SOIL_Y          = 0.425;
const PLANT_ANCHOR_Y  = 0.655;
const PLANT_OFFSET_Y  = SOIL_Y - PLANT_ANCHOR_Y;  // -0.230

// 이모지 폴백 성장 단계별 크기 비율 (size 기준)
const STAGE_SCALE: Record<number, number> = {
  1: 0,
  2: 0.20,
  3: 0.27,
  4: 0.33,
  5: 0.40,
};

interface PotViewProps {
  soilId: SoilType;
  plantId: string | null;
  stage: 1 | 2 | 3 | 4 | 5;
  size?: number;
}

export function PotView({ soilId, plantId, stage, size = 200 }: PotViewProps) {
  const [plantError, setPlantError] = useState(false);

  const soilSrc = `/pots/soil-${soilId}.png`;
  const plantSrc = stage >= 2 && plantId && !plantError
    ? `/plants/${plantId}/stage${stage}.png`
    : null;
  const plantEmoji = getPlantEmoji(plantId);

  // 식물 이미지 수직 오프셋 (px)
  const offsetPx = PLANT_OFFSET_Y * size;

  return (
    // overflow: visible — 식물이 화분 위로 자라나올 수 있도록
    <div style={{ position: 'relative', width: size, height: size, overflow: 'visible' }}>

      {/* 하단 레이어: 화분 + 흙 이미지 */}
      <Image
        src={soilSrc}
        alt=""
        fill
        sizes={`${size}px`}
        draggable={false}
        style={{ objectFit: 'fill' }}
      />

      {/* 상단 레이어: 식물 PNG — SOIL_Y 기준으로 밑동 앵커링 */}
      {plantSrc && (
        <div style={{ position: 'absolute', top: offsetPx, left: 0, width: size, height: size }}>
          <Image
            src={plantSrc}
            alt=""
            fill
            sizes={`${size}px`}
            draggable={false}
            onError={() => setPlantError(true)}
            style={{ objectFit: 'fill' }}
          />
        </div>
      )}

      {/* 폴백: 이모지 — 흙 표면(SOIL_Y) 위에 올라오도록 paddingBottom 계산 */}
      {stage >= 2 && !plantSrc && plantEmoji && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: (1 - SOIL_Y) * size,
          }}
        >
          <span
            style={{
              fontSize: size * STAGE_SCALE[stage],
              lineHeight: 1,
              filter: stage === 5 ? 'drop-shadow(0 0 4px rgba(255,180,0,0.5))' : undefined,
            }}
          >
            {plantEmoji}
          </span>
        </div>
      )}
    </div>
  );
}
