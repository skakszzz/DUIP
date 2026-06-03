import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

// Vercel Cron: 매일 오전 9시 (UTC 0시) 실행
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Vercel Cron 인증 확인
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // service role — RLS 우회, 세션 불필요
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  // 오늘(D-0) 또는 내일(D-1) event_date인 미완료 항목 조회
  const { data: items } = await supabase
    .from('items')
    .select('id, title, workspace_id, event_date')
    .eq('is_completed', false)
    .in('event_date', [today, tomorrow]);

  if (!items || items.length === 0) return NextResponse.json({ sent: 0 });

  // 워크스페이스별로 그룹화
  const byWorkspace = items.reduce<Record<string, typeof items>>((acc, item) => {
    (acc[item.workspace_id] = acc[item.workspace_id] ?? []).push(item);
    return acc;
  }, {});

  let totalSent = 0;

  for (const [workspaceId, wItems] of Object.entries(byWorkspace)) {
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('workspace_id', workspaceId);

    if (!subs || subs.length === 0) continue;

    for (const item of wItems) {
      const isToday = item.event_date === today;
      const title = isToday ? `📅 오늘: ${item.title}` : `⏰ 내일: ${item.title}`;
      const body = isToday ? '오늘 예정된 일이 있어요!' : '내일 예정된 일이 있어요!';

      await Promise.allSettled(
        subs.map((sub) =>
          webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify({ title, body, tag: item.id })
          )
        )
      );
      totalSent++;
    }
  }

  return NextResponse.json({ sent: totalSent });
}
