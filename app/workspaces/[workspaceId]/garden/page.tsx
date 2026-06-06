import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import GardenView from './garden-view';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ workspaceId: string }>;
}

export default async function GardenPage({ params }: Props) {
  const { workspaceId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, name, tree_type')
    .eq('id', workspaceId)
    .single();
  if (!workspace) redirect('/workspaces');

  const { data: membership } = await supabase
    .from('memberships')
    .select('display_name')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single();
  if (!membership) redirect('/workspaces');

  const now = new Date();
  const year = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // 현재 달 화분이 없으면 자동 생성 (식물 미선택 상태로)
  await supabase.from('monthly_pots').upsert(
    { workspace_id: workspaceId, year, month: currentMonth, soil_type: 'rich', growth_points: 0 },
    { onConflict: 'workspace_id,year,month', ignoreDuplicates: true }
  );

  const { data: pots } = await supabase
    .from('monthly_pots')
    .select('id, month, plant_id, soil_type, growth_points, pos_x, pos_y')
    .eq('workspace_id', workspaceId)
    .eq('year', year)
    .order('month');

  const { data: allItems } = await supabase
    .from('items')
    .select('id, title, type, is_completed, completed_at, created_at')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  // 월별 완료 개수 (completed_at 기준)
  const completedByMonth: Record<number, number> = {};
  for (const item of allItems ?? []) {
    if (!item.is_completed || !item.completed_at) continue;
    const d = new Date(item.completed_at);
    if (d.getFullYear() === year) {
      const m = d.getMonth() + 1;
      completedByMonth[m] = (completedByMonth[m] ?? 0) + 1;
    }
  }

  // non-recurring 완료 개수가 DB값보다 많을 때만 올림 (반복 완료 기여분 보존)
  const potsToSync = (pots ?? []).filter(
    (p) => (completedByMonth[p.month] ?? 0) > p.growth_points
  );
  if (potsToSync.length > 0) {
    await Promise.all(
      potsToSync.map((p) =>
        supabase
          .from('monthly_pots')
          .update({ growth_points: completedByMonth[p.month] ?? 0 })
          .eq('id', p.id)
      )
    );
  }

  // 렌더에 쓸 화분 — DB값과 non-recurring 집계 중 큰 값 사용
  const syncedPots = (pots ?? []).map((p) => ({
    ...p,
    growth_points: Math.max(p.growth_points, completedByMonth[p.month] ?? 0),
  }));

  // 월별 아이템 통계 (G 화면용)
  const monthStats = Array.from({ length: 12 }).map((_, i) => {
    const month = i + 1;
    const items = (allItems ?? []).filter((item) => {
      const d = new Date(item.created_at);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
    return { month, completedCount: completedByMonth[month] ?? 0, items };
  });

  return (
    <GardenView
      workspaceId={workspaceId}
      year={year}
      currentMonth={currentMonth}
      pots={syncedPots}
      monthStats={monthStats}
      treeType={workspace.tree_type}
      workspaceName={workspace.name}
    />
  );
}
