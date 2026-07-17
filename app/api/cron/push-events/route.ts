import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { sendPushToSubs, type PushSubRow } from '@/lib/push-send';

export const dynamic = 'force-dynamic';

// 구독은 (user_id, workspace_id) 단위라 workspace_id 필터로는 마지막으로
// 구독한 동산에만 묶인다 → 멤버 user_id 기준으로 조회하고 endpoint 중복 제거
async function getWorkspaceSubs(
  supabase: ReturnType<typeof createAdminClient>,
  workspaceId: string,
): Promise<PushSubRow[]> {
  const { data: members } = await supabase
    .from('memberships')
    .select('user_id')
    .eq('workspace_id', workspaceId);
  const userIds = (members ?? []).map((m) => m.user_id);
  if (userIds.length === 0) return [];

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .in('user_id', userIds);

  const seen = new Set<string>();
  const uniq: PushSubRow[] = [];
  for (const s of subs ?? []) {
    if (seen.has(s.endpoint)) continue;
    seen.add(s.endpoint);
    uniq.push(s);
  }
  return uniq;
}

// checked: notification_hour가 현재 KST 시각과 일치한 워크스페이스 수
// matched: 그 워크스페이스들의 오늘/내일 event_date 미완료 아이템 수
// sent/failed: 구독 단위 웹푸시 발송 성공/실패 건수 (이벤트 리마인더)
// monthly_sent/monthly_failed: 매월 1일 화분 선택 유도 푸시 발송 건수
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const counts = { checked: 0, matched: 0, sent: 0, failed: 0, monthly_sent: 0, monthly_failed: 0 };
  const done = (extra?: Record<string, unknown>) => {
    console.log(JSON.stringify({ route: 'cron/push-events', ...counts, ...extra }));
    return NextResponse.json(counts);
  };

  // KST = UTC+9 기준 오늘/내일
  const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const kstHour = kstNow.getUTCHours();
  const today    = kstNow.toISOString().slice(0, 10);
  const tomorrow = new Date(kstNow.getTime() + 86400000).toISOString().slice(0, 10);

  // ?simulate=monthly (Bearer 인증 동일): monthly 분기를 날짜(1일)·시각(notification_hour)
  // 조건 모두 무시하고 전체 워크스페이스 대상으로 실행. 일반 크론 경로는 그대로.
  const simulateMonthly = req.nextUrl.searchParams.get('simulate') === 'monthly';

  // 이 시각(KST 시)에 알림을 보낼 워크스페이스만 조회
  const { data: workspaces, error: wsError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('notification_hour', kstHour);

  if (wsError) return done({ error: `workspaces: ${wsError.message}` });
  counts.checked = workspaces?.length ?? 0;
  if (!simulateMonthly && (!workspaces || workspaces.length === 0)) return done();

  const workspaceIds = (workspaces ?? []).map((w) => w.id);

  // ── 매월 1일: 새 화분 선택 유도 푸시 ──────────────────────────────
  if (kstNow.getUTCDate() === 1 || simulateMonthly) {
    const year  = kstNow.getUTCFullYear();
    const month = kstNow.getUTCMonth() + 1;

    let monthlyWsIds = workspaceIds;
    if (simulateMonthly) {
      const { data: allWs, error: allWsError } = await supabase.from('workspaces').select('id');
      if (allWsError) return done({ error: `workspaces(all): ${allWsError.message}` });
      monthlyWsIds = (allWs ?? []).map((w) => w.id);
    }

    const { data: potRows, error: potError } = await supabase
      .from('monthly_pots')
      .select('workspace_id, plant_id')
      .eq('year', year)
      .eq('month', month)
      .in('workspace_id', monthlyWsIds);

    if (potError) return done({ error: `monthly_pots: ${potError.message}` });
    const potByWs = new Map((potRows ?? []).map((p) => [p.workspace_id, p]));

    for (const wsId of monthlyWsIds) {
      // row 자체가 없거나 plant_id가 null이면 아직 미선택
      if (potByWs.get(wsId)?.plant_id) continue;

      const subs = await getWorkspaceSubs(supabase, wsId);
      if (subs.length === 0) continue;

      const r = await sendPushToSubs(supabase, subs, {
        title: `${month}월의 새 화분을 골라주세요 🌱`,
        body: '이번 달 함께 키울 식물이 기다리고 있어요',
        tag: `monthly-pot-${wsId}-${year}-${month}`,
      });
      counts.monthly_sent += r.sent;
      counts.monthly_failed += r.failed;
    }
  }

  // ── 이벤트 리마인더 (오늘/내일 event_date) ────────────────────────
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
    const subs = await getWorkspaceSubs(supabase, workspaceId);
    if (subs.length === 0) continue;

    for (const item of wItems) {
      const isToday = item.event_date === today;
      const title = isToday ? `📅 오늘: ${item.title}` : `⏰ 내일: ${item.title}`;
      const body  = isToday ? '오늘 예정된 일이 있어요!' : '내일 예정된 일이 있어요!';

      const r = await sendPushToSubs(supabase, subs, { title, body, tag: item.id });
      counts.sent += r.sent;
      counts.failed += r.failed;
    }
  }

  return done();
}
