// 브라우저 전용 — 푸시 구독의 유일한 primitive 모듈.
// 구독 상태 판정·구독·해지는 반드시 여기(+use-push-status 훅)를 거친다.

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    typeof Notification !== 'undefined'
  );
}

// 현재 기기의 푸시 구독을 확보해 서버에 저장한다.
// 권한 프롬프트는 pushManager.subscribe() 호출 시점에 브라우저가 띄운다.
export async function ensurePushSubscription(workspaceId: string): Promise<boolean> {
  if (!isPushSupported()) return false;

  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    });
  }

  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: sub.toJSON(), workspaceId }),
  });
  return res.ok;
}

// 현재 기기 구독 해지 + 서버 row 삭제
export async function unsubscribePush(workspaceId: string): Promise<void> {
  if (!isPushSupported()) return;

  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) await sub.unsubscribe();

  await fetch('/api/push/subscribe', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspaceId }),
  });
}
