# 두잎 DO-IF — 개발 진행 현황

> 마지막 업데이트: 2026-05-28
> 기준 브랜치: main
> 배포: Vercel (운영 중)
> 실행: `npm run dev` → http://localhost:3000

---

## 프로젝트 개요

부부가 함께 쓰는 "1년 가능성 보드" 앱.
TODO / WISH / 기타 3종 아이템을 관리하고, 매월 화분을 키워 동산을 완성한다.
화분 성장 5단계 (흙 → 새싹 → 잎 → 성숙기 → 꽃핌), 연간 보호수 1그루.

---

## 기술 스택

| 영역 | 스택 |
|------|------|
| 프레임워크 | Next.js 16.2.6 (App Router, Turbopack) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS v4 + 인라인 style (우드·크림 디자인 시스템) |
| 백엔드 | Supabase (Auth 매직링크, PostgreSQL, Realtime) |
| 배포 | Vercel ✅ (운영 중) |
| 알림 | Web Push (VAPID), Vercel Cron |

---

## 전체 완료 현황

| Phase | 내용 | 상태 |
|-------|------|------|
| 1 | 기초 셋업 + 인증 + 워크스페이스 | ✅ |
| 2 | 일간보드 뷰 + 화분 성장 | ✅ |
| 3 | 아이템 상세 편집 모달 | ✅ |
| 4 | 탭바 + 3탭 전체 화면 리디자인 | ✅ |
| 5 | 아이템 기능 확장 (UPCOMING, event_date, 반복) | ✅ |
| 6 | 화원(동산) 완성 | ✅ |
| 7 | PWA + Web Push 알림 | ✅ |

---

## Phase 1 — 기초 셋업 + 인증 + 동산 관리 ✅

완료일: 2026-05-17

- [x] Next.js 16 프로젝트 생성 (`proxy.ts` 기반 미들웨어)
- [x] Supabase 연동
- [x] 매직링크 로그인 (`app/login/page.tsx`)
- [x] 동산(Workspace) 목록 페이지 (`app/workspaces/page.tsx`)
- [x] 새 동산 만들기 (`app/workspaces/new/page.tsx`) — 보호수 5종 선택, 프로필 설정
- [x] 초대 링크 생성 (`app/workspaces/[workspaceId]/settings/page.tsx`)
- [x] 초대 수락 + 합류 (`app/join/[token]/page.tsx`)
- [x] Supabase SSR 세션 관리 (`lib/supabase/proxy.ts`)
- [x] 식물 80종 데이터 (`lib/data/plants.ts`, `plant-emojis.ts`)
- [x] 화분 흙 4종 데이터 (`lib/data/pots.ts`)
- [x] 보호수 5종 타입 (`lib/types.ts`)

---

## Phase 2 — 일간보드 뷰 + 화분 성장 ✅

완료일: 2026-05-20

- [x] 오늘 전용 페이지 (`app/workspaces/[workspaceId]/today/page.tsx`)
- [x] TodayView 클라이언트 컴포넌트 (`today-view.tsx`)
- [x] PotView 컴포넌트 (`components/pot-view.tsx`) — 단계별 식물 크기 변화
- [x] 식물 이모지 매핑 80종 (`lib/data/plant-emojis.ts`)

---

## Phase 3 — 아이템 상세 편집 모달 ✅

완료일: 2026-05-25

- [x] ItemEditModal (`components/item-edit-modal.tsx`)
- [x] board.tsx + today-view.tsx에 아이템 클릭 → 편집 모달 연결
- [x] 완료 버튼 클릭 시 이벤트 버블링 차단

---

## Phase 4 — 탭바 + 3탭 전체 화면 리디자인 ✅

완료일: 2026-05-26

- [x] 하단 탭바 (`components/tab-bar.tsx`) — 홈 / 캘린더 / 동산
- [x] Workspace Layout (`app/workspaces/[workspaceId]/layout.tsx`) — TabBar 자동 주입
- [x] BloomOverlay (`components/bloom-overlay.tsx`) — 100% 완료 시 축하 오버레이
- [x] PWA 아이콘 생성 (`public/icon-192.png`, `public/icon-512.png`)
- [x] 홈 탭 TodayView 완성 (헤더, 식물 카드, 완료 섹션, FAB)
- [x] 이번 달 탭 (`/workspaces/[workspaceId]`) — Pebble 카드, 그룹 섹션, FAB
- [x] 캘린더 탭 (`/calendar`) — 목판 배경 그리드, 월 네비, dot 표시, 날짜 패널
- [x] 동산 탭 (`/garden`) — SVG 자연 배경, 보호수 이미지, 화분 배치

---

## Phase 5 — 아이템 기능 확장 ✅

완료일: 2026-05-28

- [x] UPCOMING 섹션 (`today-view.tsx`) — D-N 배지, 가까운 순 정렬
- [x] 홈 추가 시트에 "날짜 선택" / "반복 설정" 토글
- [x] ItemEditModal에 event_date 편집, ✕ 초기화
- [x] today/page.tsx 쿼리 확장 — event_date 범위 OR 조건
- [x] 완료 확인 팝업 (UPCOMING 항목 완료 시)

---

## Phase 6 — 화원(동산) 완성 ✅

완료일: 2026-05-28

- [x] 동산 리디자인 — CSS 노을 그라데이션 배경, 반원형 3열 화분 배치
- [x] 보호수 이미지 연동 (`/trees/{treeType}.png`, 2:3 컨테이너, 498px)
- [x] PotView 레이어 정렬 — SOIL_Y / PLANT_ANCHOR_Y 상수 조정 완료
- [x] 식물 선택 시트 (`components/plant-picker-sheet.tsx`) — 카테고리 필터, 흙 선택, 80종 그리드
- [x] 보호수 선택 시트 (`components/tree-picker-sheet.tsx`) — 연간 선택
- [x] 월 상세 시트 (G) — 식물명, 5단계 도트, 통계 타일, 기록 목록
- [x] 연간 보호수 시트 (H) — 연간 통계, 월별 요약
- [x] 공유 캡처 오버레이 (`ScreenshotOverlay`) — 탭바/UI 숨긴 풀스크린 + 브랜딩
- [x] 파트너 없을 때 초대 배너 (홈 탭 상단)
- [x] growth_points 토글 시 자동 업데이트

---

## Phase 7 — PWA + Web Push 알림 ✅

완료일: 2026-05-28

- [x] Service Worker (`public/sw.js`) — 설치/활성화/캐시/Push 수신/알림 클릭
- [x] `ServiceWorkerRegistrar` 컴포넌트 — layout.tsx에서 자동 등록
- [x] `PushNotifManager` 컴포넌트 (`components/push-notif-manager.tsx`) — 구독/해제 UI
- [x] `/api/push/subscribe` 라우트 — POST(구독), DELETE(해제)
- [x] `/api/push/send` 라우트 — 수동 발송용
- [x] `/api/cron/push-events` 라우트 — D-0/D-1 자동 알림, CRON_SECRET 인증
- [x] Vercel Cron 설정 (`vercel.json`) — 매일 09:00 KST (UTC 00:00)
- [x] 설정 화면에 알림 토글 연동
- [x] PWA 매니페스트 + Apple Web App 메타데이터 완료
- [x] OG 태그 (openGraph) 완료

---

## 추가 완료 항목

- [x] `ErrorBoundary` 컴포넌트 (`components/error-boundary.tsx`) — 전역 에러 캐치
- [x] `Gowun Dodum` 폰트 전역 적용 (`app/layout.tsx`)
- [x] `proxy.ts` 매처에 `manifest.json` 제외 (비로그인 PWA 매니페스트 보호)
- [x] `app/icon.svg` 앱 아이콘

---

## 이미지 파일 현황

| 경로 | 상태 | 비고 |
|------|------|------|
| `public/pots/soil-{rich\|granite\|sand\|moss}.png` | ✅ | 1024×1024 |
| `public/plants/{id}/stage{2~5}.png` | ✅ 16종 | 80종 중 16종 (나머지 이모지 폴백) |
| `public/trees/{cherry\|olive\|ginkgo\|pine\|maple}.png` | ✅ | 1024×1536 (2:3) |
| `public/icon-192.png`, `icon-512.png` | ✅ | PWA 아이콘 |
| `public/sw.js` | ✅ | Service Worker |

### 식물 이미지 보유 현황 (16/80종)
basil, black-prince, echeveria, english-ivy, golden-barrel, haworthia,
lavender, monstera, philodendron, plum-blossom, pothos, ranunculus,
rosemary, sedum, string-of-pearls, tillandsia

나머지 64종은 `plant-emojis.ts` 이모지 폴백.

---

## DB 테이블 참고

### items
| 컬럼 | 타입 | 비고 |
|------|------|------|
| id | uuid | PK |
| workspace_id | uuid | FK |
| created_by | uuid | FK → auth.users |
| owner_user_id | uuid | 담당자 |
| title | text | |
| description | text | nullable |
| type | text | 'TODO' \| 'WISH' \| 'ETC' |
| timeframe | text | 'daily' \| 'weekly' \| 'monthly' \| 'yearly' \| 'oneshot' |
| is_completed | boolean | |
| completed_at | timestamptz | nullable |
| completed_by | uuid | nullable |
| is_recurring | boolean | |
| recurrence_rule | jsonb | nullable |
| recurrence_last_done | text | nullable (YYYY-MM-DD) |
| event_date | date | nullable (캘린더·UPCOMING용) |
| created_at | timestamptz | |

### monthly_pots
| 컬럼 | 타입 | 비고 |
|------|------|------|
| id | uuid | PK |
| workspace_id | uuid | FK |
| year | int | |
| month | int | 1~12 |
| plant_id | text | nullable |
| soil_type | text | 'rich' \| 'granite' \| 'sand' \| 'moss' |
| growth_points | int | 완료 토글 시 ±1 누적 |
| selected_at | timestamptz | nullable |

### push_subscriptions
| 컬럼 | 타입 | 비고 |
|------|------|------|
| user_id | uuid | PK (with workspace_id) |
| workspace_id | uuid | |
| endpoint | text | |
| p256dh | text | |
| auth | text | |

---

## 환경 변수 목록

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_SUBJECT          # mailto:... 형식
CRON_SECRET            # Vercel Cron 인증 토큰
```

> ⚠️ **주의**: Vercel Cron(`/api/cron/push-events`)은 사용자 세션 없이 실행됨.
> `items` / `push_subscriptions` 테이블에 anon SELECT RLS가 막혀 있으면
> 알림이 발송되지 않음 → Supabase 대시보드에서 해당 테이블 RLS 정책 확인 필요.
> 필요 시 `SUPABASE_SERVICE_ROLE_KEY`를 추가하고 cron route에서 service role 클라이언트 사용.

---

## 알려진 이슈 / 다음 개선 후보

| # | 심각도 | 내용 | 비고 |
|---|--------|------|------|
| 1 | 🟡 중간 | Cron job anon 권한 — RLS에 따라 푸시 미발송 가능 | 위 ⚠️ 참고 |
| 2 | 🟢 낮음 | 캘린더 탭 Realtime 미구독 | 새로고침 시 반영됨 |
| 3 | 🟢 낮음 | 나머지 64종 식물 이미지 미생성 | 이모지 폴백으로 정상 동작 |
| 4 | 🟢 낮음 | 월 전환 시 신규 화분 자동 생성 미구현 | 수동으로 식물 선택 시 생성됨 |
| 5 | 🟢 낮음 | 동산 stage: 홈(오늘 완료율) vs 동산(월간 누적)이 다를 수 있음 | 의도된 설계일 수 있음 |

---

## 파일 구조 (핵심)

```
app/
  layout.tsx                          # 루트 레이아웃, PWA 메타, SW 등록
  workspaces/
    page.tsx                          # 동산 목록
    new/page.tsx                      # 새 동산 만들기
    [workspaceId]/
      layout.tsx                      # TabBar 주입
      page.tsx                        # 이번 달 보드
      board.tsx                       # MonthBoard 클라이언트
      today/
        page.tsx                      # 오늘 (홈 탭)
        today-view.tsx                # TodayView
      calendar/
        page.tsx                      # 캘린더 탭
        calendar-view.tsx             # CalendarView
      garden/
        page.tsx                      # 동산 탭
        garden-view.tsx               # GardenView + ScreenshotOverlay
      settings/
        page.tsx                      # 설정 + 알림 + 초대
        invite-section.tsx            # 초대 링크 섹션
  api/
    push/
      subscribe/route.ts              # 구독 등록/해제
      send/route.ts                   # 수동 발송
    cron/
      push-events/route.ts            # D-0/D-1 자동 알림 (Vercel Cron)
  auth/callback/route.ts              # 매직링크 콜백

components/
  tab-bar.tsx
  bloom-overlay.tsx
  item-edit-modal.tsx
  pot-view.tsx
  plant-picker-sheet.tsx
  tree-picker-sheet.tsx
  push-notif-manager.tsx
  service-worker-registrar.tsx
  error-boundary.tsx
  recurrence-editor.tsx
  date-input.tsx

lib/
  types.ts
  data/
    plants.ts
    plant-emojis.ts
    pots.ts
  supabase/
    client.ts / server.ts / proxy.ts

public/
  manifest.json
  icon-192.png / icon-512.png
  sw.js
  pots/
  plants/{id}/stage{2~5}.png
  trees/
```
