// 각 탭 세그먼트의 loading.tsx — 같은 스켈레톤을 variant 만 바꿔 렌더.
// 아래 4개를 각각 해당 경로에 복사하세요. (기존 빈 loading.tsx 를 대체)
//
// ── app/workspaces/[workspaceId]/today/loading.tsx
import TabSkeleton from '@/components/tab-skeleton';
export default function Loading() {
  return <TabSkeleton variant="home" />;
}

/* ────────────────────────────────────────────────────────────
// ── app/workspaces/[workspaceId]/memos/loading.tsx
import TabSkeleton from '@/components/tab-skeleton';
export default function Loading() {
  return <TabSkeleton variant="memo" />;
}

// ── app/workspaces/[workspaceId]/calendar/loading.tsx
import TabSkeleton from '@/components/tab-skeleton';
export default function Loading() {
  return <TabSkeleton variant="calendar" />;
}

// ── app/workspaces/[workspaceId]/garden/loading.tsx
import TabSkeleton from '@/components/tab-skeleton';
export default function Loading() {
  return <TabSkeleton variant="garden" />;
}
──────────────────────────────────────────────────────────── */
