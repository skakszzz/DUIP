import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TodayView from './today-view';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ workspaceId: string }>;
}

export default async function TodayPage({ params }: Props) {
  const { workspaceId } = await params;
  const supabase = await createClient();

  // ── 1단계: 인증 (필수 선행) ──────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const _now = new Date();
  const today = `${_now.getFullYear()}-${String(_now.getMonth()+1).padStart(2,'0')}-${String(_now.getDate()).padStart(2,'0')}`;
  const inThirtyDays = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate() + 30).toISOString().slice(0, 10);

  // ── 2단계: 독립 쿼리 5개 동시 실행 ──────────────────────────────
  const [
    { data: workspace },
    { data: wsExtra },
    { data: membership },
    { data: members },
    { data: items },
  ] = await Promise.all([
    supabase.from('workspaces').select('id, name, tree_type').eq('id', workspaceId).maybeSingle(),
    supabase.from('workspaces').select('tree_selected_year').eq('id', workspaceId).maybeSingle(),
    supabase.from('memberships').select('display_name, avatar, color').eq('workspace_id', workspaceId).eq('user_id', user.id).single(),
    supabase.from('memberships').select('user_id, display_name, avatar, color').eq('workspace_id', workspaceId),
    supabase.from('items')
      .select('id, title, description, type, timeframe, is_completed, owner_user_id, created_by, is_recurring, recurrence_rule, recurrence_last_done, event_date')
      .eq('workspace_id', workspaceId)
      .or(`timeframe.eq.daily,is_recurring.eq.true,and(event_date.gte.${today},event_date.lte.${inThirtyDays})`)
      .order('created_at', { ascending: false }),
  ]);

  if (!workspace) redirect('/workspaces');
  if (!membership) redirect('/workspaces');

  // ── 3단계: 화분 upsert → 조회 (순서 보장 필요) ───────────────────
  await supabase.from('monthly_pots').upsert(
    { workspace_id: workspaceId, year: _now.getFullYear(), month: _now.getMonth() + 1, soil_type: 'rich', growth_points: 0 },
    { onConflict: 'workspace_id,year,month', ignoreDuplicates: true }
  );
  const { data: monthlyPot } = await supabase
    .from('monthly_pots')
    .select('plant_id, soil_type, growth_points')
    .eq('workspace_id', workspaceId)
    .eq('year', _now.getFullYear())
    .eq('month', _now.getMonth() + 1)
    .maybeSingle();

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
