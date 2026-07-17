import webpush from 'web-push';
import type { SupabaseClient } from '@supabase/supabase-js';

let vapidConfigured = false;
function ensureVapid() {
  if (vapidConfigured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  vapidConfigured = true;
}

export interface PushSubRow {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushPayload {
  title: string;
  body: string;
  tag?: string;
}

// 서버 전용 (web-push + service role). 410 Gone/404 응답을 받은 만료 구독은
// endpoint 기준으로 자동 삭제한다 — 같은 endpoint가 여러 워크스페이스 row로
// 존재해도 기기 자체가 만료된 것이므로 전부 지우는 게 맞다.
export async function sendPushToSubs(
  admin: SupabaseClient,
  subs: PushSubRow[],
  payload: PushPayload,
): Promise<{ sent: number; failed: number }> {
  if (subs.length === 0) return { sent: 0, failed: 0 };
  ensureVapid();

  const json = JSON.stringify(payload);
  const results = await Promise.allSettled(
    subs.map((s) =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        json,
      )
    )
  );

  let sent = 0;
  let failed = 0;
  const goneEndpoints: string[] = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      sent++;
      return;
    }
    failed++;
    const code = (r.reason as { statusCode?: number } | undefined)?.statusCode;
    if (code === 410 || code === 404) goneEndpoints.push(subs[i].endpoint);
  });

  if (goneEndpoints.length > 0) {
    await admin.from('push_subscriptions').delete().in('endpoint', goneEndpoints);
  }

  return { sent, failed };
}
