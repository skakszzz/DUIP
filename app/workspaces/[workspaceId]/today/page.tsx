import { createClient, getCachedUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { kstNow } from '@/lib/dates';
import TodayView from './today-view';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ workspaceId: string }>;
}

export default async function TodayPage({ params }: Props) {
  const { workspaceId } = await params;
  const supabase = await createClient();

  // ── 1단계: 인증 (필수 선행) ──────────────────────────────────────
  const user = await getCachedUser();
  if (!user) redirect('/login');

  const _now = kstNow();
  const today = `${_now.getFullYear()}-${String(_now.getMonth()+1).padStart(2,'0')}-${String(_now.getDate()).padStart(2,'0')}`;
  const inThirtyDays = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate() + 30).toISOString().slice(0, 10);

  // 이번 달 범위 (growth_events 조회용) — done_on은 date 컬럼이라 문자열로 직접 경계 계산
  const _year = _now.getFullYear();
  const _month = _now.getMonth() + 1;
  const monthStart = `${_year}-${String(_month).padStart(2, '0')}-01`;
  const monthEnd = _month === 12 ? `${_year + 1}-01-01` : `${_year}-${String(_month + 1).padStart(2, '0')}-01`;

  // ── 2단계: 독립 쿼리 7개 동시 실행 (monthly_pots select 포함) ──
  const [
    { data: workspace },
    { data: wsExtra },
    { data: membership },
    { data: members },
    { data: items },
    { data: existingPot },
    { data: growthEvents },
  ] = await Promise.all([
    supabase.from('workspaces').select('id, name, tree_type').eq('id', workspaceId).maybeSingle(),
    supabase.from('workspaces').select('tree_selected_year').eq('id', workspaceId).maybeSingle(),
    supabase.from('memberships').select('display_name, avatar, color').eq('workspace_id', workspaceId).eq('user_id', user.id).single(),
    supabase.from('memberships').select('user_id, display_name, avatar, color').eq('workspace_id', workspaceId),
    supabase.from('items')
      .select('id, title, description, type, timeframe, is_completed, completed_at, owner_user_id, created_by, is_recurring, recurrence_rule, recurrence_last_done, event_date')
      .eq('workspace_id', workspaceId)
      .or(`timeframe.eq.daily,is_recurring.eq.true,and(event_date.gte.${today},event_date.lte.${inThirtyDays})`)
      .order('created_at', { ascending: false }),
    supabase.from('monthly_pots')
      .select('plant_id, soil_type, growth_points')
      .eq('workspace_id', workspaceId)
      .eq('year', _now.getFullYear())
      .eq('month', _now.getMonth() + 1)
      .maybeSingle(),
    supabase.from('growth_events')
      .select('id, title, kind')
      .eq('workspace_id', workspaceId)
      .gte('done_on', monthStart)
      .lt('done_on', monthEnd)
      .order('done_on', { ascending: true }),
  ]);

  if (!workspace) redirect('/workspaces');
  if (!membership) redirect('/workspaces');

  // ── 3단계: 화분이 없을 때만 upsert ────────────────────────────────
  let monthlyPot = existingPot;
  if (!existingPot) {
    await supabase.from('monthly_pots').upsert(
      { workspace_id: workspaceId, year: _now.getFullYear(), month: _now.getMonth() + 1, soil_type: 'rich', growth_points: 0 },
      { onConflict: 'workspace_id,year,month', ignoreDuplicates: true }
    );
    const { data: newPot } = await supabase
      .from('monthly_pots')
      .select('plant_id, soil_type, growth_points')
      .eq('workspace_id', workspaceId)
      .eq('year', _now.getFullYear())
      .eq('month', _now.getMonth() + 1)
      .maybeSingle();
    monthlyPot = newPot;
  }

  const treeSelectedYear: number | null =
    (wsExtra as { tree_selected_year?: number | null } | null)?.tree_selected_year ?? null;

  return (
    <TodayView
      workspaceId={workspaceId}
      userId={user.id}
      initialItems={items ?? []}
      members={members ?? []}
      workspaceName={workspace.name}
      serverToday={today}
      monthlyPot={monthlyPot ?? null}
      growthEvents={growthEvents ?? []}
      treeType={workspace.tree_type}
      treeSelectedYear={treeSelectedYear}
      currentUser={{
        displayName: membership.display_name,
        avatar: membership.avatar,
        color: membership.color,
      }}
    />
  );
}
