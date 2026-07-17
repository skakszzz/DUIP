'use client';

import { useEffect } from 'react';
import { ensurePushSubscription } from '@/lib/push-client';

// 권한은 granted인데 서버에 이 기기 구독이 없는 경우(만료 후 삭제 등)를
// 앱 진입 시 조용히 재구독으로 복구. upsert라 이미 있어도 무해 — 세션당 1회만.
export default function PushSync({ workspaceId }: { workspaceId: string }) {
  useEffect(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const key = `push_synced_${workspaceId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    ensurePushSubscription(workspaceId).catch(() => {});
  }, [workspaceId]);
  return null;
}
