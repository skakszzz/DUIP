# 두잎 DO-IF — CLAUDE.md

## 프로젝트 개요

커플(부부) 공용 할 일 / 소망 보드 앱.  
할 일을 완료할수록 화분 속 식물이 자라는 성장 컨셉.  
Next.js 16 (App Router) + Supabase + TypeScript. PWA 지원.

**핵심 흐름**: 매월 1일 화분(soil) + 식물(plant) 선택 → 일일 체크리스트 완료 → 완료율에 따라 stage 1→5 성장 → 100% 달성 시 BloomOverlay 팝업.

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| Framework | Next.js 16.2.6, React 19, TypeScript 5 |
| Backend | Supabase (Auth · DB · Realtime) |
| Styling | Tailwind CSS 4 + 인라인 스타일 (동적 부분) |
| Animation | framer-motion |
| Calendar | lunar-javascript (음력 변환) |

---

## 폴더 구조

```
duip/
├── app/
│   ├── workspaces/[workspaceId]/
│   │   ├── today/          # 홈(오늘) 탭
│   │   ├── calendar/       # 캘린더 탭
│   │   ├── garden/         # 정원 탭
│   │   ├── page.tsx        # 월간 보드
│   │   └── settings/       # 워크스페이스 설정
│   ├── join/[token]/       # 초대 링크 처리
│   └── workspaces/         # 워크스페이스 목록/생성
├── components/
│   ├── pot-view.tsx        # 화분+식물 레이어드 렌더러 (핵심)
│   ├── item-edit-modal.tsx
│   ├── recurrence-editor.tsx
│   ├── date-input.tsx      # YYYY/MM/DD 자동이동 커스텀 입력
│   ├── bloom-overlay.tsx
│   └── tab-bar.tsx
├── lib/
│   ├── data/
│   │   ├── plants.ts       # ⭐ 식물 80종 — ID의 유일한 source of truth
│   │   ├── pots.ts         # 흙 4종 (rich·granite·sand·moss)
│   │   └── plant-emojis.ts # 이미지 없는 식물의 이모지 폴백
│   ├── types.ts
│   └── supabase/
└── public/
    ├── pots/               # 화분+흙 이미지 (Stage 1 배경 레이어)
    │   ├── soil-rich.png
    │   ├── soil-granite.png
    │   ├── soil-sand.png
    │   └── soil-moss.png
    ├── plants/             # 식물 이미지 (Stage 2~5 위 레이어, 투명 배경)
    │   └── {plantId}/
    │       ├── stage2.png
    │       ├── stage3.png
    │       ├── stage4.png
    │       └── stage5.png
    └── trees/              # 워크스페이스 트리 이미지
        └── {treeType}.png  # cherry·olive·ginkgo·pine·maple
```

---

## plants.ts — 식물 ID 규칙 (CRITICAL)

`lib/data/plants.ts`의 `plants` 배열이 **식물 ID의 유일한 source of truth**다.

- `plant.id` 값 = `public/plants/` 하위 **폴더명**과 반드시 일치해야 한다.
- 새 식물 이미지를 추가할 때: `plants.ts`에 항목이 먼저 있어야 하고, 폴더명은 그 `id` 그대로 사용.
- ID 규칙: 영문 소문자 + 하이픈 (예: `string-of-pearls`, `plum-blossom`)
- 현재 이미지가 존재하는 식물 (16/80): echeveria, haworthia, sedum, string-of-pearls, black-prince, monstera, philodendron, pothos, lavender, ranunculus, basil, rosemary, plum-blossom, golden-barrel, english-ivy, tillandsia
- 이미지 없는 식물은 `plant-emojis.ts`의 이모지로 폴백 (pot-view.tsx 처리)

### 레이어드 렌더링 구조

```
[Stage 1] public/pots/soil-{soilType}.png   — 화분+흙 배경 (항상 표시)
[Stage 2-5] public/plants/{id}/stage{N}.png — 식물만 (투명 배경, 위에 겹침)
```

- 두 이미지 모두 1024×1024 기준, `PotView` 컴포넌트가 `size` prop 비율로 스케일링
- 흙 표면 y≈55~60%, 화분 림 y≈50% — 식물 이미지의 뿌리 시작점과 정렬됨
- `PotView`의 `overflow: visible` → 식물이 화분 위로 자라는 표현

---

## 주요 데이터 모델 (Supabase)

| 테이블 | 핵심 컬럼 |
|--------|-----------|
| `workspaces` | id, name, tree_type, anniversary |
| `memberships` | workspace_id, user_id, display_name, avatar, color, role |
| `items` | id, workspace_id, title, type(TODO/WISH/ETC), timeframe, is_recurring, recurrence_rule(jsonb), event_date, is_completed, recurrence_last_done |
| `monthly_pots` | workspace_id, year, month, plant_id, soil_type |

---

## 성장 단계 계산

```ts
function calcStage(pct: number): 1|2|3|4|5 {
  if (pct === 0)    return 1;
  if (pct < 0.25)   return 2;
  if (pct < 0.5)    return 3;
  if (pct < 0.75)   return 4;
  return 5;
}
```

`pct` = 오늘의 완료 항목 수 / 전체 항목 수 (daily + 반복 + D-0 event_date 포함)

---

## 개발 Phase 진행 이력

| Phase | 내용 | 상태 |
|-------|------|------|
| 1 | 프로젝트 초기 세팅, Auth, 워크스페이스, 멤버십, 초대 링크 | ✅ 완료 |
| 2 | 아이템 CRUD, 오늘 뷰 기본 UI, 타입(TODO/WISH/ETC), 완료 토글 | ✅ 완료 |
| 3 | 식물·화분 시스템, PotView 레이어드 렌더링, monthly_pots 테이블, 정원 뷰 | ✅ 완료 |
| 4 | 반복 일정 (RecurrenceEditor), recurrence_rule jsonb, 반복 완료(recurrence_last_done) | ✅ 완료 |
| 5 | event_date 편집, UPCOMING 섹션(D-30), DateInput 커스텀, 월간 보드 월 탐색, 홈카드 PotView 적용, 설정 뒤로가기 수정, 완료 확인 팝업, hydration 버그 수정 | ✅ 완료 |
| 6 | (다음 단계 — 미정) | 🔲 예정 |
| 7 | Web Push 알림 | 🔲 예정 |

---

## 코딩 규칙

- **서버/클라이언트 날짜 일치**: `today`는 server component(`page.tsx`)에서 계산해 `serverToday` prop으로 내려보낸다. 클라이언트에서 `new Date()`로 독립 계산하지 않는다 (hydration 불일치 방지).
- **인라인 스타일**: Tailwind는 정적 레이아웃에만, 동적 색상·크기는 인라인 스타일 사용.
- **CSS 충돌 주의**: `textDecoration` shorthand와 `textDecorationColor` longhand 혼용 금지 → `textDecorationLine` + `textDecorationColor` 분리 사용.
- **Realtime 구독**: `useRef`로 최신 상태값을 클로저에 캡처해 구독 콜백 내 stale state 방지.
- **comments 최소화**: 자명한 코드에 주석 쓰지 않음. 비자명한 제약·우회책에만 한 줄.
