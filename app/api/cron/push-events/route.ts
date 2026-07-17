import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createAdminClient } from '@/lib/supabase-admin';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export const dynamic = 'force-dynamic';

// checked: notification_hour가 현재 KST 시각과 일치한 워크스페이스 수
// matched: 그 워크스페이스들의 오늘/내일 event_date 미완료 아이템 수
// sent/failed: 구독 단위 웹푸시 발송 성공/실패 건수
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const counts = { checked: 0, matched: 0, sent: 0, failed: 0 };
  const done = (extra?: Record<string, unknown>) => {
    console.log(JSON.stringify({ route: 'cron/push-events', ...counts, ...extra }));
    return NextResponse.json(counts);
  };

  // KST = UTC+9 기준 오늘/내일
  const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const kstHour = kstNow.getUTCHours();
  const today    = kstNow.toISOString().slice(0, 10);
  const tomorrow = new Date(kstNow.getTime() + 86400000).toISOString().slice(0, 10);

  // 이 시각(KST 시)에 알림을 보낼 워크스페이스만 조회
  const { data: workspaces, error: wsError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('notification_hour', kstHour);

  if (wsError) return done({ error: `workspaces: ${wsError.message}` });
  counts.checked = workspaces?.length ?? 0;
  if (!workspaces || workspaces.length === 0) return done();

  const workspaceIds = workspaces.map((w) => w.id);

  const { data: items, error: itemsError } = await supabase
    .from('items')
    .select('id, title, workspace_id, event_date')
    .eq('is_completed', false)
    .in('event_date', [today, tomorrow])
    .in('workspace_id', workspaceIds);

  if (itemsError) return done({ error: `items: ${itemsError.message}` });
  counts.matched = items?.length ?? 0;
  if (!items || items.length === 0) return done();

  const byWorkspace = items.reduce<Record<string, typeof items>>((acc, item) => {
    (acc[item.workspace_id] = acc[item.workspace_id] ?? []).push(item);
    return acc;
  }, {});

  for (const [workspaceId, wItems] of Object.entries(byWorkspace)) {
    const { data: subs, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('workspace_id', workspaceId);

    if (subsError || !subs || subs.length === 0) continue;

    for (const item of wItems) {
      const isToday = item.event_date === today;
      const title = isToday ? `📅 오늘: ${item.title}` : `⏰ 내일: ${item.title}`;
      const body  = isToday ? '오늘 예정된 일이 있어요!' : '내일 예정된 일이 있어요!';

      const results = await Promise.allSettled(
        subs.map((sub) =>
          webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify({ title, body, tag: item.id })
          )
        )
      );

      for (const r of results) {
        if (r.status === 'fulfilled') counts.sent++;
        else counts.failed++;
      }
    }
  }

  return done();
}
