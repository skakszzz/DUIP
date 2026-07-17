// 브라우저 전용 — 현재 기기의 푸시 구독을 확보해 서버에 저장한다.
// 권한 프롬프트는 pushManager.subscribe() 호출 시점에 브라우저가 띄운다.
export async function ensurePushSubscription(workspaceId: string): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;

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
