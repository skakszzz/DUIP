// lib/data/plants.ts
// 두잎 DO-IF — 식물 80종 데이터 + 이미지 프롬프트
//
// ⚠️ 레이어드 렌더링 구조 (CRITICAL)
// ─────────────────────────────────────────────────────────────
// Stage 1 이미지 = "화분 + 흙" 전체 (pots.ts, 배경 레이어)
// Stage 2~5 이미지 = "식물만" (위 레이어, 화분·흙 없음, 투명 배경)
// → 식물 이미지에는 절대 화분/흙/지면을 그리지 말 것
//
// 좌표 규칙 (pots.ts와 정렬):
//   - 식물 베이스(뿌리 시작점): y ≈ 55~60%  ← 흙 표면 위치와 정확히 일치
//   - 식물은 위로 자람 (y=55% → y=0~5% 방향)
//   - 화면 하단(흙 표면 아래): 투명
//   - 배경 전체: 투명
//
// 사용 방법:
// 1. 각 식물의 imagePrompts.stage2~5를 GPT(DALL-E 3) 또는 Gemini(Imagen)에 넣어 이미지 생성
// 2. 마스터 프롬프트 + 단계별 PLANT_CHARACTER 조합해서 사용
// 3. 생성된 PNG를 public/plants/{id}/stage{N}.png 로 저장 (투명 배경 필수)
//
// ============================================================
// 마스터 프롬프트 (Stage 2~5 공통, {PLANT_CHARACTER} 부분만 단계별로 교체)
// ============================================================
//
//   A minimalist hand-drawn illustration of {PLANT_CHARACTER}.
//   Style: soft flat illustration with delicate line work, vintage children's
//   gardening storybook aesthetic. Front view, slight 10° downward angle.
//
//   Composition (CRITICAL — must follow exactly for layered compositing):
//   - Square 1:1, 1024×1024
//   - Render ONLY THE PLANT — no pot, no soil, no ground, no container of any kind
//   - Plant base (where roots/stem meets the soil) positioned at approximately y=55-60% from the top
//   - Plant grows UPWARD from that base point into the upper half of the frame
//   - Bottom half of the frame (y=55-100%) is fully transparent below the plant base
//   - Background fully transparent everywhere
//
//   Strictly avoid:
//   - Drawing any pot, container, terracotta, ceramic, or vessel of any kind
//   - Drawing any soil, dirt, sand, gravel, moss, or ground surface
//   - Drawing leaves or stems "spilling over" or "draping down" (plant grows up only)
//   - Text, decorations, dramatic shadows, ground line, horizon
//
// ============================================================

export type PlantCategory =
  | 'succulent'      // 다육이
  | 'houseplant'     // 관엽
  | 'flowering'      // 꽃피는 식물
  | 'herb'           // 허브
  | 'korean'         // 한국 전통/계절
  | 'cactus'         // 선인장
  | 'climber'        // 덩굴
  | 'special';       // 특수 (에어플랜트, 분재 등)

export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'all';
export type SoilType = 'rich' | 'granite' | 'sand' | 'moss';

export interface Plant {
  id: string;                          // 영문 ID, 파일명·DB 키로 사용
  name: { ko: string; en: string };
  scientific: string;
  category: PlantCategory;
  season: Season;                      // 가장 어울리는 계절
  difficulty: 1 | 2 | 3;               // ★1~★3 (1이 가장 쉬움)
  flowerLanguage: string;              // 꽃말 또는 식물의 상징
  metaphor: string;                    // 부부에게 들려줄 한 줄 의미
  defaultSoil: SoilType;
  imagePrompts: {
    stage2: string;
    stage3: string;
    stage4: string;
    stage5: string;
  };
}

export const plants: Plant[] = [
  // ====== 다육이 (15) ======
  {
    id: 'echeveria',
    name: { ko: '에케베리아', en: 'Echeveria' },
    scientific: 'Echeveria elegans',
    category: 'succulent',
    season: 'all',
    difficulty: 1,
    flowerLanguage: '변하지 않는 사랑',
    metaphor: '바쁜 일상에도 천천히, 단단하게 자라는 우리',
    defaultSoil: 'granite',
    imagePrompts: {
      stage2: 'a tiny echeveria seedling: 3-4 small rounded baby leaves clustered at a base point, pale green with hints of pink',
      stage3: 'a young echeveria: small rosette of 6-8 plump pale blue-green leaves starting to form a spiral pattern',
      stage4: 'an echeveria nearly full: tight rosette of 10-12 plump blue-green leaves with pink-tinged tips, visible spiral',
      stage5: 'a mature Echeveria elegans: full symmetrical rosette of plump pale blue-green leaves with pink-blushed tips, viewed slightly from above'
    }
  },
  {
    id: 'haworthia',
    name: { ko: '하월시아', en: 'Haworthia' },
    scientific: 'Haworthia cooperi',
    category: 'succulent',
    season: 'all',
    difficulty: 1,
    flowerLanguage: '인내, 강인함',
    metaphor: '조용히 자기 자리를 지키는 사람의 따뜻함',
    defaultSoil: 'granite',
    imagePrompts: {
      stage2: 'a tiny haworthia sprout: 2-3 small translucent green pointed leaves emerging from a base point',
      stage3: 'a young haworthia: small cluster of 5-6 plump translucent green pointed leaves',
      stage4: 'a haworthia nearly full: tight cluster of 8-10 translucent jewel-like green pointed leaves',
      stage5: 'a mature Haworthia cooperi: dense rosette of plump translucent green pointed leaves resembling small jewels, viewed from a slight angle'
    }
  },
  {
    id: 'sedum',
    name: { ko: '세덤', en: 'Sedum' },
    scientific: 'Sedum morganianum',
    category: 'succulent',
    season: 'summer',
    difficulty: 1,
    flowerLanguage: '평온',
    metaphor: '일상의 작은 행복이 차곡차곡 쌓이듯',
    defaultSoil: 'granite',
    imagePrompts: {
      stage2: 'a tiny sedum sprout: a few small green bead-like leaves clustered at a base point',
      stage3: 'a young sedum: short stem with rows of small plump green bead leaves overlapping',
      stage4: 'a sedum nearly full: short trailing stems with dense rows of plump green bead leaves, gentle droop',
      stage5: 'a mature Sedum morganianum (burros tail): trailing stems heavy with overlapping plump blue-green bead leaves cascading downward'
    }
  },
  {
    id: 'string-of-pearls',
    name: { ko: '구슬다육 (러브체인)', en: 'String of Pearls' },
    scientific: 'Senecio rowleyanus',
    category: 'succulent',
    season: 'all',
    difficulty: 2,
    flowerLanguage: '둥글둥글한 사랑',
    metaphor: '둘이 이어진 작은 약속들이 길게 길게',
    defaultSoil: 'granite',
    imagePrompts: {
      stage2: 'a tiny string of pearls sprout: 4-5 small round green pea-like beads on a short thread',
      stage3: 'a young string of pearls: a few short threads with green pea-like beads trailing downward',
      stage4: 'a string of pearls nearly full: multiple medium-length threads of green pea beads cascading down',
      stage5: 'a mature String of Pearls: long trailing strands of round green pea-like beads cascading downward'
    }
  },
  {
    id: 'black-prince',
    name: { ko: '흑법사', en: 'Black Prince' },
    scientific: 'Aeonium arboreum Atropurpureum',
    category: 'succulent',
    season: 'autumn',
    difficulty: 2,
    flowerLanguage: '깊은 매력',
    metaphor: '어두운 색 속에서 빛나는 깊은 마음',
    defaultSoil: 'granite',
    imagePrompts: {
      stage2: 'a tiny black prince sprout: 3-4 small dark burgundy leaves with green centers clustered at a base point',
      stage3: 'a young black prince: small rosette of 8-10 dark burgundy leaves with sage green near the base, on a short stem',
      stage4: 'a black prince nearly full: full rosette of 12-15 dark burgundy leaves with green base, on a visible stem',
      stage5: 'a mature Black Prince (aeonium): striking rosette of glossy dark burgundy leaves with sage green near the base, atop a slender stem'
    }
  },
  {
    id: 'moonstone',
    name: { ko: '문스톤', en: 'Moonstone' },
    scientific: 'Pachyphytum oviferum',
    category: 'succulent',
    season: 'winter',
    difficulty: 2,
    flowerLanguage: '순수함',
    metaphor: '서로를 비추는 달처럼 잔잔한 빛',
    defaultSoil: 'granite',
    imagePrompts: {
      stage2: 'a tiny moonstone sprout: 3-4 small pale lavender-green plump egg-shaped leaves at a base point',
      stage3: 'a young moonstone: cluster of 6-8 plump pale lavender egg-shaped leaves with chalky frost finish',
      stage4: 'a moonstone nearly full: rounded cluster of 10-12 plump pale lavender egg-shaped leaves with soft chalky finish',
      stage5: 'a mature Moonstone (Pachyphytum): cluster of plump egg-shaped leaves in pale lavender-blue with a chalky frost finish, like small moons'
    }
  },
  {
    id: 'jade-plant',
    name: { ko: '옥동자 (제이드)', en: 'Jade Plant' },
    scientific: 'Crassula ovata',
    category: 'succulent',
    season: 'all',
    difficulty: 1,
    flowerLanguage: '행운, 번영',
    metaphor: '함께라면 작은 결정도 큰 행운이 되어',
    defaultSoil: 'granite',
    imagePrompts: {
      stage2: 'a tiny jade plant sprout: 2-3 small plump oval green leaves on a tiny stem',
      stage3: 'a young jade plant: short branched stem with 6-10 plump oval glossy green leaves',
      stage4: 'a jade plant nearly full: thicker trunk with multiple branches, 20+ plump oval glossy green leaves with red-tinged edges',
      stage5: 'a mature Jade Plant (Crassula ovata): tree-like form with thick brown trunk, branches full of plump glossy green oval leaves with subtle red edges'
    }
  },
  {
    id: 'lithops',
    name: { ko: '리톱스', en: 'Lithops' },
    scientific: 'Lithops aucampiae',
    category: 'succulent',
    season: 'autumn',
    difficulty: 3,
    flowerLanguage: '나만의 빛',
    metaphor: '돌 같이 단단하다가도, 때가 되면 꽃이 피는',
    defaultSoil: 'sand',
    imagePrompts: {
      stage2: 'a tiny lithops emerging: one small stone-like pebble shape just visible above the sand',
      stage3: 'a young lithops: 2-3 small stone-like pebble pairs in muted gray-brown tones',
      stage4: 'a lithops nearly full: cluster of pebble-pair bodies in muted earthy tones, with a tiny yellow bud forming in the cleft',
      stage5: 'a mature Lithops aucampiae: cluster of stone-like succulent pebble pairs in earthy gray-brown patterning, one with a small yellow daisy-like flower in the cleft'
    }
  },
  {
    id: 'graptopetalum',
    name: { ko: '그라프토페탈럼', en: 'Graptopetalum' },
    scientific: 'Graptopetalum paraguayense',
    category: 'succulent',
    season: 'spring',
    difficulty: 1,
    flowerLanguage: '시간이 만드는 아름다움',
    metaphor: '오래 함께할수록 깊어지는 색',
    defaultSoil: 'granite',
    imagePrompts: {
      stage2: 'a tiny graptopetalum sprout: 3-4 small pale ghost-green leaves clustered at a base point',
      stage3: 'a young graptopetalum: rosette of 6-8 pale ghost-green leaves with subtle pink-purple tinge',
      stage4: 'a graptopetalum nearly full: full rosette of 10-12 pointed pale leaves blending ghost-green and dusty pink',
      stage5: 'a mature Graptopetalum (ghost plant): full rosette of pointed leaves in pale ghost-green that shifts to dusty pink at the tips, with a subtle silver bloom'
    }
  },
  {
    id: 'aeonium',
    name: { ko: '아이오니움', en: 'Aeonium' },
    scientific: 'Aeonium arboreum',
    category: 'succulent',
    season: 'winter',
    difficulty: 2,
    flowerLanguage: '꿋꿋함',
    metaphor: '겨울에도 푸르게 서 있는 우리',
    defaultSoil: 'granite',
    imagePrompts: {
      stage2: 'a tiny aeonium sprout: small cluster of 4-5 flat green leaves at a base point',
      stage3: 'a young aeonium: small flat rosette of 8-10 spoon-shaped green leaves on a short stem',
      stage4: 'an aeonium nearly full: medium flat rosette of 12-15 spoon-shaped green leaves on a visible stem',
      stage5: 'a mature Aeonium arboreum: large flat rosette of spoon-shaped glossy green leaves arranged like a dinner plate, atop a slender brown stem'
    }
  },
  {
    id: 'kalanchoe',
    name: { ko: '칼란코에', en: 'Kalanchoe' },
    scientific: 'Kalanchoe blossfeldiana',
    category: 'succulent',
    season: 'winter',
    difficulty: 1,
    flowerLanguage: '설렘',
    metaphor: '잿빛 계절에도 작은 설렘이 피어나길',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny kalanchoe sprout: 2-3 small scalloped green leaves at a base point',
      stage3: 'a young kalanchoe: short stems with 6-8 scalloped glossy green leaves, no flowers yet',
      stage4: 'a kalanchoe nearly full: bushy stems with thick scalloped green leaves, first cluster of small coral-pink flower buds forming',
      stage5: 'a mature Kalanchoe blossfeldiana: compact bush of thick scalloped glossy green leaves with clusters of small bright coral-pink four-petaled flowers'
    }
  },
  {
    id: 'portulacaria',
    name: { ko: '포르툴라카리아', en: 'Elephant Bush' },
    scientific: 'Portulacaria afra',
    category: 'succulent',
    season: 'all',
    difficulty: 1,
    flowerLanguage: '관용',
    metaphor: '서로를 너그럽게 품는 마음',
    defaultSoil: 'granite',
    imagePrompts: {
      stage2: 'a tiny elephant bush sprout: a few small round green leaves on a short reddish stem',
      stage3: 'a young elephant bush: branching reddish stems with many small round glossy green leaves',
      stage4: 'an elephant bush nearly full: dense branching reddish-brown stems with abundant small round glossy leaves',
      stage5: 'a mature Portulacaria afra (elephant bush): bonsai-like form with reddish-brown branching stems and abundant tiny round glossy green leaves'
    }
  },
  {
    id: 'green-necklace',
    name: { ko: '그린네크리스', en: 'String of Bananas' },
    scientific: 'Senecio radicans',
    category: 'succulent',
    season: 'all',
    difficulty: 2,
    flowerLanguage: '연결',
    metaphor: '서로 이어진 매일이 만드는 길',
    defaultSoil: 'granite',
    imagePrompts: {
      stage2: 'a tiny string of bananas sprout: 3-4 small banana-shaped green leaves on a short strand',
      stage3: 'a young string of bananas: short trailing strands with curved green banana-shaped leaves',
      stage4: 'a string of bananas nearly full: medium trailing strands with abundant banana-shaped green leaves',
      stage5: 'a mature String of Bananas (Senecio radicans): long trailing strands with abundant curved banana-shaped pale green leaves cascading downward'
    }
  },
  {
    id: 'agave',
    name: { ko: '아가베', en: 'Agave' },
    scientific: 'Agave parryi',
    category: 'succulent',
    season: 'summer',
    difficulty: 1,
    flowerLanguage: '단단함',
    metaphor: '뾰족한 마음도 시간이 다듬어 주는',
    defaultSoil: 'sand',
    imagePrompts: {
      stage2: 'a tiny agave sprout: 3-4 small pointed blue-gray leaves clustered tightly',
      stage3: 'a young agave: small rosette of 6-8 thick pointed blue-gray leaves with subtle marginal teeth',
      stage4: 'an agave nearly full: medium rosette of 10-12 thick pointed blue-gray leaves with visible marginal spines',
      stage5: 'a mature Agave parryi: full symmetrical rosette of thick pointed blue-gray leaves with reddish-brown marginal spines and a darker spine at each tip'
    }
  },
  {
    id: 'perle-von-nurnberg',
    name: { ko: '펄에코베리아', en: 'Perle von Nürnberg' },
    scientific: 'Echeveria Perle von Nürnberg',
    category: 'succulent',
    season: 'spring',
    difficulty: 2,
    flowerLanguage: '귀한 인연',
    metaphor: '평범한 날에도 빛나는 우리 사이',
    defaultSoil: 'granite',
    imagePrompts: {
      stage2: 'a tiny perle sprout: 3-4 small dusty pink-lavender leaves at a base point',
      stage3: 'a young perle: small rosette of dusty pink-lavender leaves with chalky finish',
      stage4: 'a perle nearly full: rosette of 12-14 spoon-shaped dusty pink-lavender leaves with deeper pink edges',
      stage5: 'a mature Perle von Nürnberg: elegant rosette of spoon-shaped pinkish-lavender leaves with deeper pink edges and a powdery chalky bloom on the surface'
    }
  },

  // ====== 관엽 (15) ======
  {
    id: 'monstera',
    name: { ko: '몬스테라', en: 'Monstera' },
    scientific: 'Monstera deliciosa',
    category: 'houseplant',
    season: 'all',
    difficulty: 1,
    flowerLanguage: '기쁜 소식',
    metaphor: '잎에 구멍이 나도 멋스러운, 우리 흠도 그래',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny monstera sprout: a single small heart-shaped green leaf with smooth edges, no splits',
      stage3: 'a young monstera: 2-3 medium heart-shaped green leaves, smooth without splits',
      stage4: 'a monstera nearly full: 3-4 large green leaves with first noticeable splits and small fenestrations forming',
      stage5: 'a mature Monstera deliciosa: 4-5 large rich green leaves with characteristic deep splits and oval fenestrations, on slender vining stems'
    }
  },
  {
    id: 'philodendron',
    name: { ko: '필로덴드론', en: 'Philodendron' },
    scientific: 'Philodendron hederaceum',
    category: 'houseplant',
    season: 'all',
    difficulty: 1,
    flowerLanguage: '한결같음',
    metaphor: '늘 같은 자리에서 푸른 사람',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny philodendron sprout: 1-2 small heart-shaped green leaves on a short stem',
      stage3: 'a young philodendron: short vining stems with 4-6 small heart-shaped glossy green leaves',
      stage4: 'a philodendron nearly full: trailing vining stems with abundant heart-shaped glossy green leaves',
      stage5: 'a mature Philodendron hederaceum (heartleaf): long trailing vines with abundant glossy heart-shaped green leaves cascading down'
    }
  },
  {
    id: 'pothos',
    name: { ko: '스킨답서스', en: 'Pothos' },
    scientific: 'Epipremnum aureum',
    category: 'houseplant',
    season: 'all',
    difficulty: 1,
    flowerLanguage: '오래된 우정',
    metaphor: '무심한 듯 곁에 늘 있는 친구 같은',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny pothos sprout: 1-2 small heart-shaped green leaves with hint of yellow variegation',
      stage3: 'a young pothos: short vining stems with 4-6 heart-shaped green-and-yellow variegated leaves',
      stage4: 'a pothos nearly full: trailing stems with abundant heart-shaped green leaves marbled with golden-yellow variegation',
      stage5: 'a mature Golden Pothos: long trailing vines with abundant heart-shaped leaves in green marbled with bright golden-yellow variegation'
    }
  },
  {
    id: 'snake-plant',
    name: { ko: '산세베리아', en: 'Snake Plant' },
    scientific: 'Sansevieria trifasciata',
    category: 'houseplant',
    season: 'all',
    difficulty: 1,
    flowerLanguage: '강인함',
    metaphor: '말 없이도 단단한 마음',
    defaultSoil: 'granite',
    imagePrompts: {
      stage2: 'a tiny snake plant sprout: 2-3 short upright pointed green-banded leaves',
      stage3: 'a young snake plant: cluster of 4-5 upright sword-shaped green leaves with horizontal pale bands',
      stage4: 'a snake plant nearly full: cluster of 6-8 tall upright sword-shaped leaves with bold horizontal pale-green bands',
      stage5: 'a mature Sansevieria trifasciata: cluster of tall upright sword-shaped green leaves with bold horizontal pale yellow-green bands and yellow leaf margins'
    }
  },
  {
    id: 'zz-plant',
    name: { ko: '금전수 (ZZ)', en: 'ZZ Plant' },
    scientific: 'Zamioculcas zamiifolia',
    category: 'houseplant',
    season: 'all',
    difficulty: 1,
    flowerLanguage: '번창',
    metaphor: '조용히 차곡차곡 쌓이는 풍요',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny zz plant sprout: 1-2 small glossy dark green oval leaflets on a short stem',
      stage3: 'a young zz plant: 1-2 short stems with rows of small glossy dark green oval leaflets',
      stage4: 'a zz plant nearly full: 3-4 medium stems with rows of glossy dark green oval leaflets',
      stage5: 'a mature ZZ Plant: multiple thick upright stems lined with rows of glossy waxy dark green oval leaflets, sculptural look'
    }
  },
  {
    id: 'fiddle-leaf-fig',
    name: { ko: '떡갈잎 고무나무', en: 'Fiddle Leaf Fig' },
    scientific: 'Ficus lyrata',
    category: 'houseplant',
    season: 'all',
    difficulty: 2,
    flowerLanguage: '우아함',
    metaphor: '큰 잎으로 천천히, 우리만의 공간을 만들어가는',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny fiddle leaf fig sprout: 1-2 small violin-shaped green leaves on a short stem',
      stage3: 'a young fiddle leaf fig: a slender stem with 3-4 medium violin-shaped glossy green leaves',
      stage4: 'a fiddle leaf fig nearly full: upright trunk with 5-6 large violin-shaped glossy green leaves with prominent veins',
      stage5: 'a mature Fiddle Leaf Fig: upright woody trunk with 7-8 large violin-shaped glossy deep green leaves with prominent pale veins'
    }
  },
  {
    id: 'calathea',
    name: { ko: '칼라테아', en: 'Calathea' },
    scientific: 'Calathea orbifolia',
    category: 'houseplant',
    season: 'all',
    difficulty: 2,
    flowerLanguage: '새로운 시작',
    metaphor: '낮엔 활짝, 밤엔 살포시 잠드는 우리의 하루',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny calathea sprout: 1-2 small round green leaves with subtle silver stripes',
      stage3: 'a young calathea: 3-4 medium round leaves with silver-banded patterns on green',
      stage4: 'a calathea nearly full: 5-6 large round green leaves with bold silver concentric stripes',
      stage5: 'a mature Calathea orbifolia: large round leaves striped with bold silver and pale green concentric bands, on slender stems'
    }
  },
  {
    id: 'peperomia',
    name: { ko: '페페로미아', en: 'Peperomia' },
    scientific: 'Peperomia obtusifolia',
    category: 'houseplant',
    season: 'all',
    difficulty: 1,
    flowerLanguage: '소박한 행복',
    metaphor: '작아도 충분히 빛나는 매일',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny peperomia sprout: 2-3 small round thick green leaves clustered low',
      stage3: 'a young peperomia: compact cluster of 6-8 round thick glossy green leaves',
      stage4: 'a peperomia nearly full: full bushy cluster of round thick glossy green leaves on short stems',
      stage5: 'a mature Peperomia obtusifolia: bushy compact form with thick round glossy deep green leaves on short reddish stems'
    }
  },
  {
    id: 'rubber-tree',
    name: { ko: '인도고무나무', en: 'Rubber Tree' },
    scientific: 'Ficus elastica',
    category: 'houseplant',
    season: 'all',
    difficulty: 1,
    flowerLanguage: '영원한 행복',
    metaphor: '단단한 잎처럼 변치 않는 약속',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny rubber tree sprout: 1-2 small oval glossy green leaves on a short stem',
      stage3: 'a young rubber tree: slender stem with 3-4 medium oval glossy dark green leaves',
      stage4: 'a rubber tree nearly full: upright stem with 5-6 large oval glossy deep green leaves',
      stage5: 'a mature Ficus elastica: upright woody trunk with 7-8 large oval glossy deep green leaves with subtle burgundy undertones'
    }
  },
  {
    id: 'dracaena',
    name: { ko: '드라세나', en: 'Dracaena' },
    scientific: 'Dracaena fragrans',
    category: 'houseplant',
    season: 'all',
    difficulty: 1,
    flowerLanguage: '꿈',
    metaphor: '함께 꾸는 큰 꿈, 조용히 키워가는',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny dracaena sprout: 3-4 short narrow green leaves clustered at a base point',
      stage3: 'a young dracaena: short stalk with cluster of slender pointed striped green leaves',
      stage4: 'a dracaena nearly full: medium stalk with cluster of long slender striped green leaves arching outward',
      stage5: 'a mature Dracaena fragrans (lucky tree): a tall woody stalk topped with a cluster of long slender arching striped green leaves with yellow centers'
    }
  },
  {
    id: 'anthurium',
    name: { ko: '안스리움', en: 'Anthurium' },
    scientific: 'Anthurium andraeanum',
    category: 'houseplant',
    season: 'all',
    difficulty: 2,
    flowerLanguage: '열정',
    metaphor: '하트 모양으로 마음을 보여주는 식물',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny anthurium sprout: 1-2 small heart-shaped green leaves',
      stage3: 'a young anthurium: 3-4 medium heart-shaped glossy green leaves, no flowers yet',
      stage4: 'an anthurium nearly full: 4-5 heart-shaped glossy green leaves with first small heart-shaped coral-pink flower bract emerging',
      stage5: 'a mature Anthurium: glossy heart-shaped deep green leaves with one or two striking heart-shaped waxy coral-pink flower bracts'
    }
  },
  {
    id: 'spathiphyllum',
    name: { ko: '스파티필름 (평화의 백합)', en: 'Peace Lily' },
    scientific: 'Spathiphyllum wallisii',
    category: 'houseplant',
    season: 'all',
    difficulty: 1,
    flowerLanguage: '평화, 순결',
    metaphor: '다툼 후에도 다시 피어나는 흰 마음',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny peace lily sprout: 1-2 small pointed dark green leaves emerging from a base point',
      stage3: 'a young peace lily: cluster of 3-4 lance-shaped glossy dark green leaves on slender stems',
      stage4: 'a peace lily nearly full: bushy cluster of lance-shaped glossy dark green leaves with first small white spathe forming',
      stage5: 'a mature Peace Lily: bushy cluster of lance-shaped glossy dark green leaves with elegant white spathes around yellow spadix flowers'
    }
  },
  {
    id: 'dieffenbachia',
    name: { ko: '디펜바키아', en: 'Dieffenbachia' },
    scientific: 'Dieffenbachia seguine',
    category: 'houseplant',
    season: 'all',
    difficulty: 1,
    flowerLanguage: '자신감',
    metaphor: '큰 잎처럼 둘이 함께라면 더 당당해지는',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny dieffenbachia sprout: 1-2 small oval green leaves with subtle pale speckles',
      stage3: 'a young dieffenbachia: 3-4 medium oval leaves with green and cream-yellow speckle patterns',
      stage4: 'a dieffenbachia nearly full: short trunk with 5-6 large oval leaves richly speckled in cream-yellow on green',
      stage5: 'a mature Dieffenbachia: thick trunk with broad oval leaves dramatically speckled and splashed in cream-yellow and green'
    }
  },
  {
    id: 'aglaonema',
    name: { ko: '아글라오네마', en: 'Aglaonema' },
    scientific: 'Aglaonema commutatum',
    category: 'houseplant',
    season: 'all',
    difficulty: 1,
    flowerLanguage: '풍요',
    metaphor: '잎잎이 다른 무늬처럼, 우리도 서로 다르게 풍성하게',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny aglaonema sprout: 1-2 small oval leaves with silver-green pattern',
      stage3: 'a young aglaonema: 3-4 medium oval leaves with silver and dark green patterns',
      stage4: 'an aglaonema nearly full: bushy cluster of oval leaves boldly patterned in silver, pink edges, and dark green',
      stage5: 'a mature Aglaonema (Chinese evergreen): cluster of oval leaves with striking silver-and-green patterns and subtle pink leaf margins'
    }
  },
  {
    id: 'parlor-palm',
    name: { ko: '테이블 야자', en: 'Parlor Palm' },
    scientific: 'Chamaedorea elegans',
    category: 'houseplant',
    season: 'all',
    difficulty: 1,
    flowerLanguage: '평온한 일상',
    metaphor: '햇살 아래서 천천히 흔들리는 우리집의 평화',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny parlor palm sprout: 2-3 small thin pinnate green leaflets',
      stage3: 'a young parlor palm: 3-4 slender stalks with small feather-like green leaflets',
      stage4: 'a parlor palm nearly full: cluster of slender stalks with full feather-like green fronds',
      stage5: 'a mature Parlor Palm: dense cluster of slender bamboo-like stalks with elegant arching feather-like green fronds'
    }
  },

  // ====== 꽃피는 식물 (15) ======
  {
    id: 'lavender',
    name: { ko: '라벤더', en: 'Lavender' },
    scientific: 'Lavandula angustifolia',
    category: 'flowering',
    season: 'spring',
    difficulty: 2,
    flowerLanguage: '침묵, 기다림',
    metaphor: '느린 사랑이 가장 깊은 향을 낸다',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny lavender seedling: two pairs of thin needle-like silver-green leaves, no stem yet',
      stage3: 'a young lavender: 4-5 slim silver-green upright stems with small needle leaves, no flowers',
      stage4: 'a lavender bush forming: multiple silver-green stems with packed needle leaves, first small purple buds at stem tops',
      stage5: 'a full bloom lavender: bushy silver-green silhouette with full purple flower spikes at every stem top, airy fragrant mood'
    }
  },
  {
    id: 'ranunculus',
    name: { ko: '라넌큘러스', en: 'Ranunculus' },
    scientific: 'Ranunculus asiaticus',
    category: 'flowering',
    season: 'spring',
    difficulty: 2,
    flowerLanguage: '당신의 매력에 둘러싸여',
    metaphor: '얇은 꽃잎이 겹겹이 쌓인 마음',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny ranunculus sprout: 2-3 small lobed green leaves at a base point',
      stage3: 'a young ranunculus: short stems with 5-6 lobed parsley-like green leaves, no flowers yet',
      stage4: 'a ranunculus nearly full: slender stems with leaves and first tight rounded peach-colored bud',
      stage5: 'a full bloom ranunculus: one or two layered rose-like blooms in soft peach atop slender stems with lobed green leaves below'
    }
  },
  {
    id: 'tulip',
    name: { ko: '튤립', en: 'Tulip' },
    scientific: 'Tulipa gesneriana',
    category: 'flowering',
    season: 'spring',
    difficulty: 2,
    flowerLanguage: '진실한 사랑',
    metaphor: '단정한 한 송이가 전하는 가장 솔직한 말',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny tulip sprout: a single pointed green leaf emerging upright from a base point',
      stage3: 'a young tulip: 2-3 broader green leaves at the base with a short central stalk forming',
      stage4: 'a tulip nearly full: tall slender stalk with broad green leaves and a tight closed coral-pink bud at top',
      stage5: 'a full bloom tulip: tall slender stalk with broad green leaves and a single elegant goblet-shaped coral-pink flower'
    }
  },
  {
    id: 'rose',
    name: { ko: '미니 장미', en: 'Mini Rose' },
    scientific: 'Rosa chinensis minima',
    category: 'flowering',
    season: 'summer',
    difficulty: 2,
    flowerLanguage: '사랑',
    metaphor: '가시도 향기도 같이 가진 우리',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny rose sprout: 1-2 small compound green leaves with serrated edges',
      stage3: 'a young rose: short woody stem with several compound green leaves',
      stage4: 'a rose nearly full: small bushy plant with compound leaves and first tight pink bud forming',
      stage5: 'a blooming mini rose: small bushy plant with serrated compound green leaves and several open layered soft pink rose flowers'
    }
  },
  {
    id: 'daisy',
    name: { ko: '데이지', en: 'Daisy' },
    scientific: 'Bellis perennis',
    category: 'flowering',
    season: 'spring',
    difficulty: 1,
    flowerLanguage: '순수한 사랑',
    metaphor: '햇살 같은 가벼운 마음',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny daisy sprout: 2-3 small spoon-shaped green leaves at a base point',
      stage3: 'a young daisy: rosette of 5-6 spoon-shaped green leaves, no flowers yet',
      stage4: 'a daisy nearly full: leafy rosette with one short stem holding a tight bud',
      stage5: 'a blooming daisy: rosette of spoon-shaped green leaves with several slender stems each holding a white-petaled flower with yellow center'
    }
  },
  {
    id: 'carnation',
    name: { ko: '카네이션', en: 'Carnation' },
    scientific: 'Dianthus caryophyllus',
    category: 'flowering',
    season: 'spring',
    difficulty: 2,
    flowerLanguage: '존경, 감사',
    metaphor: '말로 못한 고마움을 꽃잎에 담아',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny carnation sprout: 2-3 small narrow blue-green leaves',
      stage3: 'a young carnation: clump of narrow blue-green grass-like leaves with short stems',
      stage4: 'a carnation nearly full: leafy clump with stems and small tight pink-coral buds forming',
      stage5: 'a blooming carnation: clump of narrow blue-green leaves with slender stems topped by ruffled fringed pink-coral flowers'
    }
  },
  {
    id: 'peony',
    name: { ko: '작약', en: 'Peony' },
    scientific: 'Paeonia lactiflora',
    category: 'flowering',
    season: 'spring',
    difficulty: 3,
    flowerLanguage: '부끄러움, 수줍은 사랑',
    metaphor: '꼭 한 번은 피우고 싶은, 마음 속 가장 큰 꽃',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny peony sprout: reddish tinge stem with 2-3 small compound green leaves',
      stage3: 'a young peony: short reddish stem with 4-5 compound dark green leaves',
      stage4: 'a peony nearly full: multiple stems with full compound leaves and one large round tight bud',
      stage5: 'a blooming peony: lush leafy plant with one huge layered ruffled flower in soft blush pink atop a strong stem'
    }
  },
  {
    id: 'anemone',
    name: { ko: '아네모네', en: 'Anemone' },
    scientific: 'Anemone coronaria',
    category: 'flowering',
    season: 'spring',
    difficulty: 2,
    flowerLanguage: '기대, 사랑의 예감',
    metaphor: '오늘 우리가 새롭게 시작하는 한 가지',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny anemone sprout: 2-3 small finely divided green leaves at a base point',
      stage3: 'a young anemone: cluster of finely divided fern-like green leaves, no flowers',
      stage4: 'an anemone nearly full: leafy cluster with a tall slender stem and a closed dark-centered bud',
      stage5: 'a blooming anemone: fern-like green leaves with tall slender stems each holding a flat single flower in deep coral with dark center'
    }
  },
  {
    id: 'freesia',
    name: { ko: '프리지아', en: 'Freesia' },
    scientific: 'Freesia refracta',
    category: 'flowering',
    season: 'spring',
    difficulty: 2,
    flowerLanguage: '순결, 새 출발',
    metaphor: '봄의 시작을 알리는 향',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny freesia sprout: a single thin pointed green leaf emerging',
      stage3: 'a young freesia: 3-4 narrow upright sword-shaped green leaves',
      stage4: 'a freesia nearly full: narrow upright leaves with a slender curved stem ending in a row of small buds',
      stage5: 'a blooming freesia: narrow sword-like green leaves with a curved stem holding a one-sided row of small yellow trumpet flowers'
    }
  },
  {
    id: 'hyacinth',
    name: { ko: '히아신스', en: 'Hyacinth' },
    scientific: 'Hyacinthus orientalis',
    category: 'flowering',
    season: 'spring',
    difficulty: 2,
    flowerLanguage: '변함없는 사랑',
    metaphor: '한결같이 같은 자리에서 피어주는 사람',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny hyacinth sprout: a small bulb visible at a base point with 1-2 stubby green leaf tips',
      stage3: 'a young hyacinth: cluster of upright strap-like green leaves from the bulb',
      stage4: 'a hyacinth nearly full: upright green leaves with a central thick spike of small tight buds',
      stage5: 'a blooming hyacinth: cluster of upright strap-like green leaves with a thick central spike of small star-shaped blush pink fragrant flowers'
    }
  },
  {
    id: 'crocus',
    name: { ko: '크로커스', en: 'Crocus' },
    scientific: 'Crocus vernus',
    category: 'flowering',
    season: 'winter',
    difficulty: 2,
    flowerLanguage: '청춘의 기쁨',
    metaphor: '눈 사이로 가장 먼저 인사하는 봄',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny crocus sprout: small bulb with 1-2 thin grass-like green tips emerging',
      stage3: 'a young crocus: thin grass-like green leaves with a white stripe down the center',
      stage4: 'a crocus nearly full: leaves with a closed lilac-purple bud sitting low at a base point',
      stage5: 'a blooming crocus: thin striped green leaves with several short-stemmed open cup-shaped flowers in lilac-purple, golden centers visible'
    }
  },
  {
    id: 'lily-of-the-valley',
    name: { ko: '은방울꽃', en: 'Lily of the Valley' },
    scientific: 'Convallaria majalis',
    category: 'flowering',
    season: 'spring',
    difficulty: 2,
    flowerLanguage: '다시 찾은 행복',
    metaphor: '작은 종처럼 울리는 일상의 행복',
    defaultSoil: 'moss',
    imagePrompts: {
      stage2: 'a tiny lily of the valley sprout: 1-2 small rolled green leaves emerging from a base point',
      stage3: 'a young lily of the valley: 2-3 broad lance-shaped green leaves unfurled',
      stage4: 'a lily of the valley nearly full: broad green leaves with one arching stem showing small white buds',
      stage5: 'a blooming Lily of the Valley: broad lance-shaped green leaves with arching stems holding rows of tiny white bell-shaped flowers'
    }
  },
  {
    id: 'cyclamen',
    name: { ko: '시클라멘', en: 'Cyclamen' },
    scientific: 'Cyclamen persicum',
    category: 'flowering',
    season: 'winter',
    difficulty: 2,
    flowerLanguage: '수줍음',
    metaphor: '뒤집힌 꽃잎이 부끄럽게 웃는',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny cyclamen sprout: 1-2 small heart-shaped green leaves with subtle silver marbling',
      stage3: 'a young cyclamen: cluster of 4-5 heart-shaped green leaves with silver marbling, no flowers',
      stage4: 'a cyclamen nearly full: leafy cluster with a tall slender stem holding a single nodding bud',
      stage5: 'a blooming Cyclamen: cluster of heart-shaped marbled leaves with several tall slender stems each holding an upswept pink flower with backswept petals'
    }
  },
  {
    id: 'african-violet',
    name: { ko: '아프리칸바이올렛', en: 'African Violet' },
    scientific: 'Saintpaulia ionantha',
    category: 'flowering',
    season: 'all',
    difficulty: 2,
    flowerLanguage: '작은 사랑',
    metaphor: '작아도 자주 피는 마음이 진짜',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny african violet sprout: 2-3 small fuzzy round green leaves at a base point',
      stage3: 'a young african violet: rosette of 5-6 fuzzy round green leaves',
      stage4: 'an african violet nearly full: full rosette of fuzzy green leaves with first small purple buds in the center',
      stage5: 'a blooming African Violet: dense low rosette of fuzzy round dark green leaves with a center cluster of small velvety purple flowers with yellow centers'
    }
  },
  {
    id: 'begonia',
    name: { ko: '베고니아', en: 'Begonia' },
    scientific: 'Begonia rex',
    category: 'flowering',
    season: 'summer',
    difficulty: 2,
    flowerLanguage: '친절',
    metaphor: '잎 자체가 꽃 같은 매일의 다정함',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny begonia sprout: 1-2 small asymmetric heart-shaped green leaves',
      stage3: 'a young begonia: 3-4 asymmetric pointed leaves with silver and burgundy patterns',
      stage4: 'a begonia nearly full: bushy cluster of asymmetric leaves richly patterned in silver, green, and burgundy',
      stage5: 'a mature Begonia rex: cluster of large asymmetric pointed leaves with dramatic silver, burgundy, and green spiral patterning'
    }
  },

  // ====== 허브 (10) ======
  {
    id: 'basil',
    name: { ko: '바질', en: 'Basil' },
    scientific: 'Ocimum basilicum',
    category: 'herb',
    season: 'summer',
    difficulty: 1,
    flowerLanguage: '좋은 소망',
    metaphor: '오늘 저녁 식탁이 조금 더 풍성해지는 마음',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny basil sprout: 1-2 pairs of small oval green leaves',
      stage3: 'a young basil: short stem with 2-3 pairs of bright green oval leaves',
      stage4: 'a basil nearly full: bushy plant with multiple stems and abundant fragrant bright green oval leaves',
      stage5: 'a mature basil plant: lush bushy form with abundant glossy bright green oval pointed leaves on multiple branching stems'
    }
  },
  {
    id: 'rosemary',
    name: { ko: '로즈마리', en: 'Rosemary' },
    scientific: 'Salvia rosmarinus',
    category: 'herb',
    season: 'all',
    difficulty: 1,
    flowerLanguage: '추억, 기억',
    metaphor: '오래 같이 살수록 진해지는 우리만의 향',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny rosemary sprout: short stem with a few small needle-like green leaves',
      stage3: 'a young rosemary: short woody stem with rows of small needle-like green leaves',
      stage4: 'a rosemary nearly full: branching woody stems with abundant short needle leaves in deep green',
      stage5: 'a mature Rosemary: bushy woody stems with abundant short fragrant needle-like leaves in deep green, evoking pine'
    }
  },
  {
    id: 'mint',
    name: { ko: '민트', en: 'Mint' },
    scientific: 'Mentha spicata',
    category: 'herb',
    season: 'summer',
    difficulty: 1,
    flowerLanguage: '미덕',
    metaphor: '한 잎으로도 시원해지는 마음',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny mint sprout: 1-2 pairs of small toothed bright green leaves',
      stage3: 'a young mint: short stems with 3-4 pairs of toothed bright green leaves',
      stage4: 'a mint nearly full: bushy plant with multiple stems and abundant toothed bright green leaves',
      stage5: 'a mature Mint: lush spreading plant with multiple stems and abundant toothed bright green crinkly leaves'
    }
  },
  {
    id: 'thyme',
    name: { ko: '타임', en: 'Thyme' },
    scientific: 'Thymus vulgaris',
    category: 'herb',
    season: 'all',
    difficulty: 1,
    flowerLanguage: '용기',
    metaphor: '작지만 단단한 매일의 한 걸음',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny thyme sprout: short stems with very small green oval leaves',
      stage3: 'a young thyme: low spreading stems with tiny green oval leaves',
      stage4: 'a thyme nearly full: dense low mat of tiny green oval leaves on thin stems',
      stage5: 'a mature Thyme: dense low spreading mat of tiny grayish-green oval leaves on slender woody stems'
    }
  },
  {
    id: 'sage',
    name: { ko: '세이지', en: 'Sage' },
    scientific: 'Salvia officinalis',
    category: 'herb',
    season: 'autumn',
    difficulty: 1,
    flowerLanguage: '지혜',
    metaphor: '오래된 부부의 차분한 지혜',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny sage sprout: 1-2 small velvety silver-green oval leaves',
      stage3: 'a young sage: short stems with 4-5 velvety silver-green oblong leaves',
      stage4: 'a sage nearly full: bushy stems with abundant velvety silver-green oblong leaves',
      stage5: 'a mature Sage: bushy woody stems with abundant velvety silver-green textured oblong leaves'
    }
  },
  {
    id: 'oregano',
    name: { ko: '오레가노', en: 'Oregano' },
    scientific: 'Origanum vulgare',
    category: 'herb',
    season: 'summer',
    difficulty: 1,
    flowerLanguage: '기쁨',
    metaphor: '평범한 요리에 더해지는 작은 환호',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny oregano sprout: short stem with a few small heart-shaped green leaves',
      stage3: 'a young oregano: low spreading stems with paired small green heart-shaped leaves',
      stage4: 'an oregano nearly full: dense low mat of paired heart-shaped green leaves on thin stems',
      stage5: 'a mature Oregano: dense spreading plant with paired small heart-shaped green leaves on thin woody stems'
    }
  },
  {
    id: 'parsley',
    name: { ko: '파슬리', en: 'Parsley' },
    scientific: 'Petroselinum crispum',
    category: 'herb',
    season: 'spring',
    difficulty: 1,
    flowerLanguage: '축제',
    metaphor: '식탁에 초록빛 한 줌 더하는 작은 의식',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny parsley sprout: 1-2 small finely divided green leaves',
      stage3: 'a young parsley: 3-4 finely curled green leaves on short stems',
      stage4: 'a parsley nearly full: bushy cluster of curled and finely divided bright green leaves',
      stage5: 'a mature Parsley: dense bushy cluster of tightly curled finely divided bright green leaves on slender stems'
    }
  },
  {
    id: 'cilantro',
    name: { ko: '고수', en: 'Cilantro' },
    scientific: 'Coriandrum sativum',
    category: 'herb',
    season: 'spring',
    difficulty: 1,
    flowerLanguage: '숨겨진 가치',
    metaphor: '호불호가 있지만 우리만의 취향',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny cilantro sprout: 1-2 pairs of small rounded lobed green leaves',
      stage3: 'a young cilantro: short stems with rounded lobed bright green leaves',
      stage4: 'a cilantro nearly full: leafy cluster with rounded lobed leaves on lower stems, more divided fine leaves at top',
      stage5: 'a mature Cilantro: leafy cluster with rounded lobed leaves below and finely divided feathery leaves on taller stems above'
    }
  },
  {
    id: 'lemon-balm',
    name: { ko: '레몬밤', en: 'Lemon Balm' },
    scientific: 'Melissa officinalis',
    category: 'herb',
    season: 'summer',
    difficulty: 1,
    flowerLanguage: '동정',
    metaphor: '서로를 진정시켜 주는 시원한 마음',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny lemon balm sprout: 1-2 pairs of small toothed bright green leaves',
      stage3: 'a young lemon balm: short stems with paired toothed bright green heart-shaped leaves',
      stage4: 'a lemon balm nearly full: bushy stems with abundant toothed bright green heart-shaped leaves',
      stage5: 'a mature Lemon Balm: lush bushy plant with paired toothed bright green heart-shaped fragrant leaves'
    }
  },
  {
    id: 'chamomile',
    name: { ko: '캐모마일', en: 'Chamomile' },
    scientific: 'Matricaria chamomilla',
    category: 'herb',
    season: 'summer',
    difficulty: 2,
    flowerLanguage: '위로',
    metaphor: '하루의 끝에 마시는 따뜻한 한 잔 같은',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny chamomile sprout: 1-2 small feathery green leaves',
      stage3: 'a young chamomile: branched stems with feathery delicate green leaves',
      stage4: 'a chamomile nearly full: airy stems with feathery leaves and first small white-and-yellow daisy buds',
      stage5: 'a blooming Chamomile: airy delicate plant with feathery green leaves and several small white-petaled flowers with bright yellow centers'
    }
  },

  // ====== 한국 전통 (10) ======
  {
    id: 'plum-blossom',
    name: { ko: '매화', en: 'Plum Blossom' },
    scientific: 'Prunus mume',
    category: 'korean',
    season: 'winter',
    difficulty: 3,
    flowerLanguage: '고결한 마음',
    metaphor: '추위 끝에 가장 먼저 피는 우리의 약속',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny plum blossom seedling: 1-2 small pointed green leaves on a short woody twig',
      stage3: 'a young plum tree: slender woody trunk with a few branches and small pointed green leaves',
      stage4: 'a plum tree nearly full: branching woody form with small leaves and first tight pale-pink buds appearing on bare twigs',
      stage5: 'a blooming Plum Blossom: bonsai-style branching woody trunk with delicate five-petaled pale pink blossoms scattered along the twigs, sparse green leaves'
    }
  },
  {
    id: 'camellia',
    name: { ko: '동백', en: 'Camellia' },
    scientific: 'Camellia japonica',
    category: 'korean',
    season: 'winter',
    difficulty: 2,
    flowerLanguage: '진실한 사랑',
    metaphor: '눈 속에서도 붉게 피어나는',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny camellia sprout: 1-2 small glossy oval dark green leaves',
      stage3: 'a young camellia: short woody stem with 4-5 glossy dark green oval leaves',
      stage4: 'a camellia nearly full: small branching woody plant with glossy leaves and one tight round red-pink bud',
      stage5: 'a blooming Camellia: branching woody plant with glossy dark green oval leaves and one full layered deep coral-pink flower with yellow stamens'
    }
  },
  {
    id: 'azalea',
    name: { ko: '진달래', en: 'Korean Azalea' },
    scientific: 'Rhododendron mucronulatum',
    category: 'korean',
    season: 'spring',
    difficulty: 2,
    flowerLanguage: '사랑의 기쁨',
    metaphor: '봄 산을 분홍으로 물들이는 그 마음',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny azalea sprout: 1-2 small pointed green leaves on a short twig',
      stage3: 'a young azalea: short woody stems with small pointed green leaves',
      stage4: 'an azalea nearly full: branching woody stems with leaves and first delicate pink buds',
      stage5: 'a blooming Korean Azalea: branching woody stems with delicate light pink five-petaled flowers blooming on bare twigs, sparse green leaves'
    }
  },
  {
    id: 'mugunghwa',
    name: { ko: '무궁화', en: 'Rose of Sharon' },
    scientific: 'Hibiscus syriacus',
    category: 'korean',
    season: 'summer',
    difficulty: 2,
    flowerLanguage: '영원, 끈기',
    metaphor: '매일 새로 피우는 같은 약속',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny mugunghwa sprout: 1-2 small toothed green leaves on a short stem',
      stage3: 'a young mugunghwa: short woody stem with several toothed lobed green leaves',
      stage4: 'a mugunghwa nearly full: bushy woody stems with toothed leaves and a tight twisted bud',
      stage5: 'a blooming Rose of Sharon (mugunghwa): bushy woody plant with toothed lobed green leaves and a single large open flower with pale lavender petals and deep red center'
    }
  },
  {
    id: 'forsythia',
    name: { ko: '개나리', en: 'Forsythia' },
    scientific: 'Forsythia koreana',
    category: 'korean',
    season: 'spring',
    difficulty: 1,
    flowerLanguage: '희망, 기대',
    metaphor: '봄을 가장 먼저 외치는 노란 인사',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny forsythia sprout: a short woody twig with 1-2 small pointed green leaves',
      stage3: 'a young forsythia: arching slender woody stems with small pointed green leaves',
      stage4: 'a forsythia nearly full: arching woody stems with first cluster of small yellow buds along the branches',
      stage5: 'a blooming Forsythia: arching slender woody stems covered in clusters of bright yellow four-petaled bell-shaped flowers, sparse leaves'
    }
  },
  {
    id: 'royal-azalea',
    name: { ko: '영산홍', en: 'Royal Azalea' },
    scientific: 'Rhododendron schlippenbachii',
    category: 'korean',
    season: 'spring',
    difficulty: 2,
    flowerLanguage: '사랑의 즐거움',
    metaphor: '한 번 활짝 피우고 가는 봄의 마음',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny royal azalea sprout: 1-2 small oval green leaves',
      stage3: 'a young royal azalea: short woody stem with whorl of 4-5 oval green leaves at the tip',
      stage4: 'a royal azalea nearly full: branching woody stems with whorls of leaves and several pink buds',
      stage5: 'a blooming Royal Azalea: branching woody plant with whorled oval green leaves at branch tips and clusters of large pale pink flowers'
    }
  },
  {
    id: 'pine-bonsai',
    name: { ko: '소나무 분재', en: 'Korean Pine Bonsai' },
    scientific: 'Pinus densiflora',
    category: 'korean',
    season: 'all',
    difficulty: 3,
    flowerLanguage: '장수, 절개',
    metaphor: '오래 가는 부부의 곧은 마음',
    defaultSoil: 'granite',
    imagePrompts: {
      stage2: 'a tiny pine sapling: short bare twig with a small tuft of short pine needles at the tip',
      stage3: 'a young pine: short twisted woody trunk with two small tufts of dark green pine needles',
      stage4: 'a pine bonsai nearly full: short twisted woody trunk with several tufts of dark green pine needles along branches',
      stage5: 'a mature Korean Pine bonsai: characteristically gnarled and twisted woody trunk with several tufts of dark green needle clusters on horizontal branches'
    }
  },
  {
    id: 'ginkgo-bonsai',
    name: { ko: '은행나무 분재', en: 'Ginkgo Bonsai' },
    scientific: 'Ginkgo biloba',
    category: 'korean',
    season: 'autumn',
    difficulty: 3,
    flowerLanguage: '오래된 약속',
    metaphor: '천 년을 지킬 듯한 함께함',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny ginkgo sprout: 1-2 small fan-shaped green leaves',
      stage3: 'a young ginkgo: slender woody stem with several small fan-shaped green leaves',
      stage4: 'a ginkgo bonsai nearly full: short woody trunk with branches holding fan-shaped green leaves',
      stage5: 'a mature Ginkgo bonsai: short woody trunk with horizontal branches holding clusters of fan-shaped green leaves with subtle golden tinge at edges'
    }
  },
  {
    id: 'white-magnolia',
    name: { ko: '백목련', en: 'White Magnolia' },
    scientific: 'Magnolia denudata',
    category: 'korean',
    season: 'spring',
    difficulty: 3,
    flowerLanguage: '고결',
    metaphor: '큰 잎으로 천천히 펼쳐지는 한 마음',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny magnolia sprout: a short woody twig with 1-2 small oval green leaves',
      stage3: 'a young magnolia: short woody stem with a few large oval green leaves',
      stage4: 'a magnolia nearly full: branching woody stems with leaves and one large furry closed bud at a tip',
      stage5: 'a blooming White Magnolia: branching woody stems with one large open creamy-white tulip-shaped flower at the top, sparse green leaves below'
    }
  },
  {
    id: 'apricot-blossom',
    name: { ko: '살구꽃', en: 'Apricot Blossom' },
    scientific: 'Prunus armeniaca',
    category: 'korean',
    season: 'spring',
    difficulty: 3,
    flowerLanguage: '수줍은 사랑',
    metaphor: '연한 분홍빛으로 조용히 다가오는 봄',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny apricot sprout: a short woody twig with 1-2 small pointed green leaves',
      stage3: 'a young apricot tree: slender woody stem with several pointed green leaves',
      stage4: 'an apricot tree nearly full: branching woody trunk with sparse leaves and first pale pink buds on bare twigs',
      stage5: 'a blooming Apricot Blossom: bonsai-style branching woody trunk with delicate five-petaled pale pink flowers scattered along the twigs'
    }
  },

  // ====== 선인장 (5) ======
  {
    id: 'golden-barrel',
    name: { ko: '황금별선인장', en: 'Golden Barrel Cactus' },
    scientific: 'Echinocactus grusonii',
    category: 'cactus',
    season: 'summer',
    difficulty: 1,
    flowerLanguage: '인내',
    metaphor: '겉이 까칠해도 속이 둥근 마음',
    defaultSoil: 'sand',
    imagePrompts: {
      stage2: 'a tiny golden barrel sprout: a small round green sphere with faint ridges',
      stage3: 'a young golden barrel: small round green cactus with visible ridges and tiny golden spines',
      stage4: 'a golden barrel nearly full: medium spherical green cactus with prominent ridges and abundant golden spines',
      stage5: 'a mature Golden Barrel Cactus: round spherical green cactus with prominent vertical ribs covered in abundant glowing golden-yellow spines'
    }
  },
  {
    id: 'christmas-cactus',
    name: { ko: '크리스마스 캑터스', en: 'Christmas Cactus' },
    scientific: 'Schlumbergera buckleyi',
    category: 'cactus',
    season: 'winter',
    difficulty: 1,
    flowerLanguage: '한 해의 끝',
    metaphor: '연말에 함께 보는 작은 빛',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny christmas cactus sprout: 2-3 small flat green segmented pads',
      stage3: 'a young christmas cactus: chains of flat green segmented pads trailing downward',
      stage4: 'a christmas cactus nearly full: cascading chains of flat segmented pads with first small pink buds at tips',
      stage5: 'a blooming Christmas Cactus: cascading chains of flat green segmented pads with vibrant pink tubular flowers blooming at the tips'
    }
  },
  {
    id: 'easter-cactus',
    name: { ko: '이스터 캑터스', en: 'Easter Cactus' },
    scientific: 'Rhipsalidopsis gaertneri',
    category: 'cactus',
    season: 'spring',
    difficulty: 2,
    flowerLanguage: '재회',
    metaphor: '오랜만에 다시 피어나는 마음',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny easter cactus sprout: 2-3 small flat green segmented pads with smooth edges',
      stage3: 'a young easter cactus: chains of flat green segments with rounded edges',
      stage4: 'an easter cactus nearly full: cascading chains of segments with first small star-shaped pink-coral buds',
      stage5: 'a blooming Easter Cactus: cascading chains of flat green segmented pads with star-shaped coral-pink flowers blooming at the tips'
    }
  },
  {
    id: 'moon-cactus',
    name: { ko: '비모란 (월광)', en: 'Moon Cactus' },
    scientific: 'Gymnocalycium mihanovichii',
    category: 'cactus',
    season: 'summer',
    difficulty: 2,
    flowerLanguage: '소소한 행복',
    metaphor: '작아도 강렬한 우리만의 색',
    defaultSoil: 'sand',
    imagePrompts: {
      stage2: 'a tiny moon cactus sprout: a small green spherical base with the slightest hint of pink at top',
      stage3: 'a young moon cactus: green columnar base with a small pink rounded cactus on top',
      stage4: 'a moon cactus nearly full: green columnar base with a medium bright pink ribbed spherical cactus grafted on top',
      stage5: 'a mature Moon Cactus: short green columnar base with a vibrant pink ribbed spherical cactus grafted on top, small spines visible'
    }
  },
  {
    id: 'bunny-ears',
    name: { ko: '토끼귀 선인장', en: 'Bunny Ears Cactus' },
    scientific: 'Opuntia microdasys',
    category: 'cactus',
    season: 'summer',
    difficulty: 1,
    flowerLanguage: '귀여움',
    metaphor: '서로의 귀여운 면을 더 자주 보자',
    defaultSoil: 'sand',
    imagePrompts: {
      stage2: 'a tiny bunny ears sprout: a small flat oval green pad',
      stage3: 'a young bunny ears cactus: one main flat green pad with a small pad starting to grow at the top',
      stage4: 'a bunny ears nearly full: branching flat pads forming bunny-ear shape, covered in tiny golden dots',
      stage5: 'a mature Bunny Ears Cactus: cluster of flat oval green pads branching to resemble bunny ears, covered in tiny golden glochid dots'
    }
  },

  // ====== 덩굴 (5) ======
  {
    id: 'english-ivy',
    name: { ko: '아이비', en: 'English Ivy' },
    scientific: 'Hedera helix',
    category: 'climber',
    season: 'all',
    difficulty: 1,
    flowerLanguage: '신의, 영원한 사랑',
    metaphor: '한쪽이 다른 한쪽을 감싸 안듯',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny ivy sprout: 1-2 small lobed green leaves on a short vine',
      stage3: 'a young ivy: short trailing vines with 4-6 lobed green leaves',
      stage4: 'an ivy nearly full: cascading vines with abundant five-lobed green leaves',
      stage5: 'a mature English Ivy: long cascading vines with abundant glossy five-lobed dark green leaves with pale veins, draping downward'
    }
  },
  {
    id: 'string-of-hearts',
    name: { ko: '하트체인', en: 'String of Hearts' },
    scientific: 'Ceropegia woodii',
    category: 'climber',
    season: 'all',
    difficulty: 2,
    flowerLanguage: '사랑이 흐르는',
    metaphor: '하트 하나하나가 우리의 작은 추억',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny string of hearts sprout: 2-3 small heart-shaped silvery-green leaves on a thread',
      stage3: 'a young string of hearts: short trailing threads with paired small heart-shaped silvery leaves',
      stage4: 'a string of hearts nearly full: cascading delicate threads with paired heart-shaped silvery-green leaves',
      stage5: 'a mature String of Hearts: long delicate trailing threads with paired heart-shaped silvery-green leaves marbled with purple undersides'
    }
  },
  {
    id: 'wandering-jew',
    name: { ko: '자주달개비', en: 'Wandering Jew' },
    scientific: 'Tradescantia zebrina',
    category: 'climber',
    season: 'all',
    difficulty: 1,
    flowerLanguage: '존경하는 마음',
    metaphor: '자줏빛으로 빛나는 우리의 색',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny wandering jew sprout: 1-2 small striped purple-and-silver oval leaves',
      stage3: 'a young wandering jew: short stems with paired striped silver-and-purple oval leaves',
      stage4: 'a wandering jew nearly full: trailing stems with abundant paired purple-striped silver leaves',
      stage5: 'a mature Tradescantia zebrina: cascading stems with paired oval leaves striped in silver and deep purple, with purple undersides'
    }
  },
  {
    id: 'hoya',
    name: { ko: '호야', en: 'Hoya' },
    scientific: 'Hoya carnosa',
    category: 'climber',
    season: 'summer',
    difficulty: 2,
    flowerLanguage: '연인',
    metaphor: '서로를 향해 자라는 잎의 방향',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny hoya sprout: 1-2 small thick oval green leaves on a short vine',
      stage3: 'a young hoya: short vining stems with paired thick oval glossy green leaves',
      stage4: 'a hoya nearly full: trailing vines with abundant thick oval glossy green leaves',
      stage5: 'a mature Hoya carnosa: long trailing vines with paired thick waxy oval green leaves, occasionally hinting at small star-shaped pink flower clusters'
    }
  },
  {
    id: 'passion-flower',
    name: { ko: '시계초', en: 'Passion Flower' },
    scientific: 'Passiflora caerulea',
    category: 'climber',
    season: 'summer',
    difficulty: 3,
    flowerLanguage: '성스러운 사랑',
    metaphor: '복잡해 보여도 한 가운데를 향하는 마음',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny passion flower sprout: 1-2 small lobed green leaves with tiny tendrils',
      stage3: 'a young passion flower: short vining stem with lobed green leaves and curling tendrils',
      stage4: 'a passion flower nearly full: trailing vines with deeply lobed green leaves and first complex bud forming',
      stage5: 'a blooming Passion Flower: trailing vines with deeply lobed green leaves and one intricate radial flower with purple and white filaments around a central column'
    }
  },

  // ====== 특수 (5) ======
  {
    id: 'tillandsia',
    name: { ko: '틸란드시아', en: 'Air Plant' },
    scientific: 'Tillandsia ionantha',
    category: 'special',
    season: 'all',
    difficulty: 1,
    flowerLanguage: '자유로운 사랑',
    metaphor: '뿌리 없이도 함께 있을 수 있다는 믿음',
    defaultSoil: 'moss',
    imagePrompts: {
      stage2: 'a tiny air plant: small cluster of 3-4 slender silvery-green leaves with curling tips',
      stage3: 'a young air plant: small rosette of slender silvery-green curling leaves emerging upward from a base point',
      stage4: 'an air plant nearly full: full rosette of slender curling silvery-green leaves with hint of pink blush at center',
      stage5: 'a mature Tillandsia ionantha: full rosette of slender curling silvery-green leaves blushing pink-red at the center, emerging upward from a base point'
    }
  },
  {
    id: 'tiny-bonsai',
    name: { ko: '미니 분재', en: 'Mini Bonsai' },
    scientific: 'Various',
    category: 'special',
    season: 'all',
    difficulty: 3,
    flowerLanguage: '시간이 만든 작품',
    metaphor: '천천히, 우리 손으로 다듬어 가는 모양',
    defaultSoil: 'granite',
    imagePrompts: {
      stage2: 'a tiny bonsai sapling: short straight slender woody stem with 2-3 small green leaves',
      stage3: 'a young bonsai: short woody stem starting to develop subtle curves with a small canopy of green leaves',
      stage4: 'a bonsai nearly full: characteristically curved woody trunk with a medium rounded canopy of small green leaves',
      stage5: 'a mature mini bonsai: gracefully curved gnarled woody trunk with a rounded cloud-like canopy of small densely packed green leaves'
    }
  },
  {
    id: 'mini-conifer',
    name: { ko: '미니 침엽수', en: 'Mini Conifer' },
    scientific: 'Picea glauca conica',
    category: 'special',
    season: 'winter',
    difficulty: 2,
    flowerLanguage: '변함없음',
    metaphor: '겨울에도 푸른 우리만의 자리',
    defaultSoil: 'rich',
    imagePrompts: {
      stage2: 'a tiny conifer sprout: short upright stem with a few tiny green needles',
      stage3: 'a young conifer: small conical form with short green needles',
      stage4: 'a mini conifer nearly full: small dense conical evergreen with abundant short green needles',
      stage5: 'a mature mini conifer: compact dense conical evergreen with abundant short bright green needles, perfectly shaped like a tiny Christmas tree'
    }
  },
  {
    id: 'moss-ball',
    name: { ko: '이끼볼 (코케다마)', en: 'Kokedama' },
    scientific: 'Various',
    category: 'special',
    season: 'all',
    difficulty: 2,
    flowerLanguage: '둥근 마음',
    metaphor: '둘레가 둥근 우리집의 작은 우주',
    defaultSoil: 'moss',
    imagePrompts: {
      stage2: 'a tiny kokedama: a small round moss ball with one tiny green shoot emerging',
      stage3: 'a young kokedama: a round moss ball with a small cluster of green grass-like leaves on top',
      stage4: 'a kokedama nearly full: a round moss ball topped with a small leafy plant',
      stage5: 'a mature Kokedama: a round mossy ball covered in soft green moss, topped with a small leafy plant emerging upward'
    }
  },
  {
    id: 'lucky-bamboo',
    name: { ko: '행운죽 (개운죽)', en: 'Lucky Bamboo' },
    scientific: 'Dracaena sanderiana',
    category: 'special',
    season: 'all',
    difficulty: 1,
    flowerLanguage: '행운, 번영',
    metaphor: '곧게 함께 자라기로 한 약속',
    defaultSoil: 'sand',
    imagePrompts: {
      stage2: 'a tiny lucky bamboo: a single short green bamboo-like stalk with one tiny leaf cluster at top',
      stage3: 'a young lucky bamboo: 2-3 short bamboo-like green stalks with small leaf clusters at tops',
      stage4: 'a lucky bamboo nearly full: cluster of 3-5 medium bamboo-like green stalks with leaf clusters',
      stage5: 'a mature Lucky Bamboo: cluster of upright bamboo-like green stalks with characteristic ringed nodes and leafy green tufts at the tops'
    }
  },
];

// ============ 헬퍼 함수 ============

export function getPlantsByCategory(category: PlantCategory): Plant[] {
  return plants.filter(p => p.category === category);
}

export function getPlantsBySeason(season: Season): Plant[] {
  return plants.filter(p => p.season === season || p.season === 'all');
}

export function getPlantById(id: string): Plant | undefined {
  return plants.find(p => p.id === id);
}

export function getCurrentSeason(month: number): Season {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}
