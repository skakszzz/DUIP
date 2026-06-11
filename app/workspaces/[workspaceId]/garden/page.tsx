import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { kstNow } from '@/lib/dates';
import GardenView from './garden-view';

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

  const now = kstNow();
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
    .select('id, title, type, is_completed, created_at')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

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
      pots={pots ?? []}
      monthStats={monthStats}
      treeType={workspace.tree_type}
      workspaceName={workspace.name}
    />
  );
}
