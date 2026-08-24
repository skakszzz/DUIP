'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { SoilType } from '@/lib/types';
import { PlantArt } from '@/components/plant-art';
import { PLANT_ARTWORK } from '@/lib/data/plant-artwork';

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

// 식물 레이어가 컨테이너(size×size) 위로 튀어나오는 비율.
// PotView를 overflow:hidden 컨테이너에 넣으면 이만큼 상단이 잘리므로,
// 잘림 없이 담으려면 높이 size*(1+이 값)을 확보하고 하단 정렬할 것.
export const POT_VIEW_TOP_OVERFLOW = -PLANT_OFFSET_Y; // 0.230

interface PotViewProps {
  soilId: SoilType;
  plantId: string | null;
  stage: 1 | 2 | 3 | 4 | 5;
  size?: number;
  preferArtwork?: boolean;
}

export function PotView({ soilId, plantId, stage, size = 200, preferArtwork }: PotViewProps) {
  const soilSrc = `/pots/soil-${soilId}.webp`;
  const [artError, setArtError] = useState(false);

  // 원화 렌더링 조건: preferArtwork 켜짐 + 해당 식물 webp 존재 + stage >= 2 + 로드 에러 없음
  const hasArt = !!(preferArtwork && plantId && PLANT_ARTWORK.has(plantId));
  const showArtwork = stage >= 2 && hasArt && !artError;

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

      {/* 상단 레이어: 원화 WebP 또는 SVG (stage 1은 실사 이미지가 없어 항상 SVG 새싹) */}
      {plantId && (
        <div style={{ position: 'absolute', top: offsetPx, left: 0, width: size, height: size }}>
          {showArtwork ? (
            <Image
              src={`/plants/${plantId}/stage${stage}.webp`}
              alt=""
              fill
              sizes={`${size}px`}
              draggable={false}
              style={{ objectFit: 'contain' }}
              onError={() => setArtError(true)}
            />
          ) : (
            <PlantArt id={plantId} stage={stage} size={size} showPot={false} />
          )}
        </div>
      )}
    </div>
  );
}
