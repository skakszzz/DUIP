import { createClient, getCachedUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { kstNow } from '@/lib/dates';
import GardenView from './garden-view';

interface Props {
  params: Promise<{ workspaceId: string }>;
}

export default async function GardenPage({ params }: Props) {
  const { workspaceId } = await params;
  const supabase = await createClient();

  const user = await getCachedUser();
  if (!user) redirect('/login');

  const now = kstNow();
  const year = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // 독립 쿼리 4개 동시 실행
  const [
    { data: workspace },
    { data: membership },
    { data: pots },
    { data: allItems },
  ] = await Promise.all([
    supabase.from('workspaces').select('id, name, tree_type').eq('id', workspaceId).single(),
    supabase.from('memberships').select('display_name').eq('workspace_id', workspaceId).eq('user_id', user.id).single(),
    supabase.from('monthly_pots')
      .select('id, month, plant_id, soil_type, growth_points, pos_x, pos_y')
      .eq('workspace_id', workspaceId)
      .eq('year', year)
      .order('month'),
    supabase.from('items')
      .select('id, title, type, is_completed, created_at')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false }),
  ]);

  if (!workspace) redirect('/workspaces');
  if (!membership) redirect('/workspaces');

  // 현재 달 화분이 없으면 자동 생성 (식물 미선택 상태로) 후 재조회 — stale props 방지
  let potRows = pots ?? [];
  if (!potRows.find(p => p.month === currentMonth)) {
    await supabase.from('monthly_pots').upsert(
      { workspace_id: workspaceId, year, month: currentMonth, soil_type: 'rich', growth_points: 0 },
      { onConflict: 'workspace_id,year,month', ignoreDuplicates: true }
    );
    const { data: refreshed } = await supabase.from('monthly_pots')
      .select('id, month, plant_id, soil_type, growth_points, pos_x, pos_y')
      .eq('workspace_id', workspaceId)
      .eq('year', year)
      .order('month');
    potRows = refreshed ?? potRows;
  }

  const monthStats = Array.from({ length: 12 }).map((_, i) => {
    const month = i + 1;
    const items = (allItems ?? []).filter((item) => {
      const d = new Date(item.created_at);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
    return { month, completedCount: items.filter((item) => item.is_completed).length, items };
  });

  return (
    <GardenView
      workspaceId={workspaceId}
      year={year}
      currentMonth={currentMonth}
      pots={potRows}
      monthStats={monthStats}
      treeType={workspace.tree_type}
    />
  );
}
