import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import WorkspacePickerClient from './workspace-picker-client';
import type { Garden } from '@/components/workspace-picker';

export const dynamic = 'force-dynamic';

const TREE_LABEL: Record<string, string> = {
  cherry: '벚꽃나무', olive: '올리브나무', ginkgo: '은행나무',
  pine: '소나무', maple: '단풍나무', zelkova: '느티나무',
};

const PLANT_NAME: Record<string, string> = {
  lavender: '라벤더', tulip: '튤립', echeveria: '에케베리아', monstera: '몬스테라',
  basil: '바질', rosemary: '로즈마리', pothos: '스킨답서스', camellia: '동백',
  haworthia: '하월시아', sedum: '세덤', 'string-of-pearls': '구슬다육',
  'black-prince': '흑법사', 'plum-blossom': '매화', 'golden-barrel': '황금별선인장',
  'english-ivy': '아이비', tillandsia: '틸란드시아', ranunculus: '라넌큘러스',
  philodendron: '필로덴드론',
};

function yearLabel(createdAt: string): string {
  const years = new Date().getFullYear() - new Date(createdAt).getFullYear();
  if (years <= 0) return '첫 해';
  const labels = ['', '첫 해', '둘째 해', '셋째 해', '넷째 해', '다섯째 해'];
  return labels[years] ?? `${years}년째`;
}

function getSeasonLabel(): string {
  const now = new Date();
  const m = now.getMonth() + 1;
  const season = m <= 2 || m === 12 ? '겨울' : m <= 5 ? '봄' : m <= 8 ? '여름' : '가을';
  return `${now.getFullYear()}년 ${m}월, ${season}`;
}

export default async function WorkspacesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const { data: myMemberships } = await supabase
    .from('memberships')
    .select('workspace_id, display_name, avatar, color')
    .eq('user_id', user.id);

  const workspaceIds = myMemberships?.map((m) => m.workspace_id) ?? [];
  const myName = myMemberships?.[0]?.display_name ?? user.email?.split('@')[0] ?? '';

  if (!workspaceIds.length) {
    return (
      <WorkspacePickerClient
        gardens={[]}
        userName={myName}
        seasonLabel={getSeasonLabel()}
      />
    );
  }

  const [wsResult, allMemResult, potResult] = await Promise.all([
    supabase
      .from('workspaces')
      .select('id, name, tree_type, created_at')
      .in('id', workspaceIds)
      .order('created_at', { ascending: false }),
    supabase
      .from('memberships')
      .select('workspace_id, display_name, color')
      .in('workspace_id', workspaceIds),
    supabase
      .from('monthly_pots')
      .select('workspace_id, month, plant_id, growth_points')
      .in('workspace_id', workspaceIds)
      .eq('year', currentYear),
  ]);

  const workspaces = wsResult.data ?? [];
  const allMembers = allMemResult.data ?? [];
  const allPots = potResult.data ?? [];

  const gardens: Garden[] = workspaces.map((ws) => {
    const wsMembers = allMembers
      .filter(m => m.workspace_id === ws.id)
      .map(m => ({ initial: m.display_name[0], color: m.color, name: m.display_name }));

    const currentPot = allPots.find(p => p.workspace_id === ws.id && p.month === currentMonth);

    const pots: (string | null)[] = Array.from({ length: 12 }, (_, i) => {
      const pot = allPots.find(p => p.workspace_id === ws.id && p.month === i + 1);
      return pot?.plant_id ?? null;
    });

    const plantName = currentPot?.plant_id
      ? (PLANT_NAME[currentPot.plant_id] ?? currentPot.plant_id)
      : '씨앗';

    return {
      id: ws.id,
      name: ws.name,
      year: yearLabel(ws.created_at),
      treeType: ws.tree_type ?? 'pine',
      treeLabel: TREE_LABEL[ws.tree_type] ?? ws.tree_type,
      members: wsMembers,
      monthLabel: `${currentMonth}월 · ${plantName}`,
      monthPlantId: currentPot?.plant_id ?? undefined,
      leavesIn: currentPot?.growth_points ?? 0,
      leavesNeeded: 20,
      pots,
      currentMonth,
    } satisfies Garden;
  });

  return (
    <WorkspacePickerClient
      gardens={gardens}
      userName={myName}
      seasonLabel={getSeasonLabel()}
    />
  );
}
