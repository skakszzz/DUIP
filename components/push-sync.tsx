'use client';

import { usePushStatus } from '@/lib/use-push-status';

// 훅의 부수효과(권한 granted 시 조용한 재구독)만 빌려 쓰는 레이아웃용 컴포넌트.
// 구독 로직 자체는 전부 use-push-status/push-client에 있다.
export default function PushSync({ workspaceId }: { workspaceId: string }) {
  usePushStatus(workspaceId);
  return null;
}
