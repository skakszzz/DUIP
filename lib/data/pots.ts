// lib/data/pots.ts
// 두잎 DO-IF — 빈 화분 (Stage 1) 흙 종류 4종
//
// ⚠️ 레이어드 렌더링 구조 (CRITICAL)
// ─────────────────────────────────────────────────────────────
// Stage 1 이미지 = "화분 + 흙" 전체 (배경 레이어)
// Stage 2~5 이미지 = "식물만" (위 레이어, 화분·흙 없음, 투명 배경)
// 앱은 두 PNG를 같은 1024×1024 크기로 정확히 겹쳐서 보여줌
//
// 좌표 규칙 (Stage 1 ↔ Stage 2~5 정렬용):
//   - 화분 림(rim) 위치:     y ≈ 50%
//   - 흙 표면(soil surface): y ≈ 55~60%  ← 식물이 여기서부터 자람
//   - 화분 바닥:             y ≈ 85~90%
//   - 화면 상단 절반(0~50%): 투명 — Stage 2~5 식물이 들어갈 자리
//
// 사용 방법:
// 1. 각 흙의 imagePrompt를 GPT(DALL-E 3) 또는 Gemini(Imagen)에 통째로 복사 → 빈 화분 이미지 생성
// 2. 생성된 PNG를 public/pots/{id}.png 로 저장
//    (rich → soil-rich.png, granite → soil-granite.png, sand → soil-sand.png, moss → soil-moss.png)
// 3. 매월 1일 식물 선택 시 흙 종류도 함께 고름 (식물에 따라 default 추천)

import type { SoilType } from '../types';

export interface SoilVariant {
  id: SoilType;
  nameKo: string;
  nameEn: string;
  description: string;        // 사용자에게 보여줄 한 줄 설명
  suitableFor: string;        // 어떤 식물에 어울리는지
  imagePrompt: string;        // 이미지 생성용 (빈 화분 + 이 흙)
}

export const soilVariants: SoilVariant[] = [
  {
    id: 'rich',
    nameKo: '검은흙',
    nameEn: 'Rich Soil',
    description: '촉촉하고 영양 많은 일반 분갈이흙',
    suitableFor: '관엽·꽃·허브 대부분',
    imagePrompt: `A minimalist hand-drawn illustration of an empty small terracotta pot filled with rich dark potting soil.
Style: soft flat illustration with delicate line work, vintage children's gardening storybook aesthetic. Front view, slight 10° downward angle.

Color palette:
- Pot body: warm terracotta clay (#D88E63), darker rim (#C97149)
- Soft highlight on left side: lighter terracotta (#E6A988)
- Soil: deep dark brown (#3F2A1A), moist crumbly texture, slightly uneven surface, organic and lush

Composition (CRITICAL — must follow exactly for layered compositing):
- Square 1:1, 1024×1024
- Pot occupies the LOWER half of the frame: rim at approximately y=50% (middle of frame), pot base at approximately y=85-90%
- Soil surface visible at the top of the pot interior, positioned at approximately y=55-60% from the top
- Upper half of the frame (y=0 to y=50%) is fully transparent — this space is where the plant overlay will appear
- Background fully transparent everywhere outside the pot

Strictly avoid: text, plants, sprouts, leaves, decorations, dramatic shadows, ground line below the pot.`,
  },
  {
    id: 'granite',
    nameKo: '마사토',
    nameEn: 'Decomposed Granite',
    description: '거칠고 배수 잘 되는 자갈 흙',
    suitableFor: '다육이·선인장',
    imagePrompt: `A minimalist hand-drawn illustration of an empty small terracotta pot filled with coarse decomposed granite.
Style: soft flat illustration with delicate line work, vintage children's gardening storybook aesthetic. Front view, slight 10° downward angle.

Color palette:
- Pot body: warm terracotta clay (#D88E63), darker rim (#C97149)
- Soft highlight on left side: lighter terracotta (#E6A988)
- Soil: warm beige-grey (#B8A088), gritty texture with visible small grains, uniform pale tone, well-draining feel

Composition (CRITICAL — must follow exactly for layered compositing):
- Square 1:1, 1024×1024
- Pot occupies the LOWER half of the frame: rim at approximately y=50% (middle of frame), pot base at approximately y=85-90%
- Soil surface visible at the top of the pot interior, positioned at approximately y=55-60% from the top
- Upper half of the frame (y=0 to y=50%) is fully transparent — this space is where the plant overlay will appear
- Background fully transparent everywhere outside the pot

Strictly avoid: text, plants, sprouts, leaves, decorations, dramatic shadows, ground line below the pot.`,
  },
  {
    id: 'sand',
    nameKo: '모래',
    nameEn: 'Fine Sand',
    description: '곱고 마른 흰 모래',
    suitableFor: '선인장·아가베·리톱스',
    imagePrompt: `A minimalist hand-drawn illustration of an empty small terracotta pot filled with fine pale sand.
Style: soft flat illustration with delicate line work, vintage children's gardening storybook aesthetic. Front view, slight 10° downward angle.

Color palette:
- Pot body: warm terracotta clay (#D88E63), darker rim (#C97149)
- Soft highlight on left side: lighter terracotta (#E6A988)
- Soil: light cream beige (#E6D4B0), smooth fine grains, very pale and uniform, beachy feel

Composition (CRITICAL — must follow exactly for layered compositing):
- Square 1:1, 1024×1024
- Pot occupies the LOWER half of the frame: rim at approximately y=50% (middle of frame), pot base at approximately y=85-90%
- Soil surface visible at the top of the pot interior, positioned at approximately y=55-60% from the top, smooth and even
- Upper half of the frame (y=0 to y=50%) is fully transparent — this space is where the plant overlay will appear
- Background fully transparent everywhere outside the pot

Strictly avoid: text, plants, sprouts, leaves, decorations, dramatic shadows, ground line below the pot.`,
  },
  {
    id: 'moss',
    nameKo: '이끼흙',
    nameEn: 'Moss-topped Soil',
    description: '촉촉한 흙 위에 작은 이끼가 자란',
    suitableFor: '은방울꽃·고사리·에어플랜트',
    imagePrompt: `A minimalist hand-drawn illustration of an empty small terracotta pot filled with dark soil topped with patches of soft green moss.
Style: soft flat illustration with delicate line work, vintage children's gardening storybook aesthetic. Front view, slight 10° downward angle.

Color palette:
- Pot body: warm terracotta clay (#D88E63), darker rim (#C97149)
- Soft highlight on left side: lighter terracotta (#E6A988)
- Soil: dark brown base (#3F2A1A) with sparse mossy green flecks and small tufts (#7BAE7E)

Composition (CRITICAL — must follow exactly for layered compositing):
- Square 1:1, 1024×1024
- Pot occupies the LOWER half of the frame: rim at approximately y=50% (middle of frame), pot base at approximately y=85-90%
- Soil surface visible at the top of the pot interior, positioned at approximately y=55-60% from the top, scattered with small bright green moss tufts (woodland feel)
- Upper half of the frame (y=0 to y=50%) is fully transparent — this space is where the plant overlay will appear
- Background fully transparent everywhere outside the pot

Strictly avoid: text, plants, sprouts, leaves growing upward, decorations, dramatic shadows, ground line below the pot.`,
  },
];

// ============ 헬퍼 함수 ============

export function getSoilById(id: SoilType): SoilVariant | undefined {
  return soilVariants.find(s => s.id === id);
}

export function getDefaultSoilForPlant(plantCategory: string): SoilType {
  // 식물 카테고리별 추천 흙
  switch (plantCategory) {
    case 'succulent':
    case 'cactus':
      return 'granite';
    case 'desert':
      return 'sand';
    case 'fern':
    case 'forest':
      return 'moss';
    default:
      return 'rich';
  }
}
