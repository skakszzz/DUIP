import { useState, useEffect, useCallback } from 'react';
import { isPushSupported, ensurePushSubscription, unsubscribePush } from '@/lib/push-client';

// unsupported: 사파리 탭·인앱 등 PWA 미설치 환경 (Push API 자체가 없음)
// granted_no_sub: 권한은 granted인데 이 기기에 구독이 없음 (조용한 재구독 실패 시 잔류)
export type PushStatus =
  | 'loading'
  | 'unsupported'
  | 'default'
  | 'denied'
  | 'granted_no_sub'
  | 'subscribed';

async function readStatus(): Promise<Exclude<PushStatus, 'loading'>> {
  if (!isPushSupported()) return 'unsupported';
  const perm = Notification.permission;
  if (perm === 'denied') return 'denied';
  if (perm === 'default') return 'default';
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  return sub ? 'subscribed' : 'granted_no_sub';
}

// 구독 상태·액션의 단일 훅 — 배너·설정 등 모든 화면은 이것만 사용한다.
export function usePushStatus(workspaceId: string) {
  const [status, setStatus] = useState<PushStatus>('loading');

  const refresh = useCallback(async () => {
    setStatus(await readStatus());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 권한이 granted면 조용한 재구독/서버 동기화 (세션당 1회) — 구 push-sync 로직
      if (isPushSupported() && Notification.permission === 'granted') {
        const key = `push_synced_${workspaceId}`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1');
          await ensurePushSubscription(workspaceId).catch(() => {});
        }
      }
      const s = await readStatus();
      if (!cancelled) setStatus(s);
    })();
    return () => { cancelled = true; };
  }, [workspaceId]);

  // 권한 요청 + 구독 + 서버 저장. 성공 여부 반환, 상태는 항상 재판정.
  const enable = useCallback(async (): Promise<boolean> => {
    let ok = false;
    try {
      ok = await ensurePushSubscription(workspaceId);
    } catch {
      // 권한 거부/프롬프트 닫힘 등 — refresh가 상태를 반영
    }
    await refresh();
    return ok;
  }, [workspaceId, refresh]);

  const disable = useCallback(async () => {
    try {
      await unsubscribePush(workspaceId);
    } catch {}
    await refresh();
  }, [workspaceId, refresh]);

  return { status, enable, disable };
}
