import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CalendarView from './calendar-view';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ workspaceId: string }>;
}

export default async function CalendarPage({ params }: Props) {
  const { workspaceId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, name')
    .eq('id', workspaceId)
    .single();
  if (!workspace) redirect('/workspaces');

  const { data: membership } = await supabase
    .from('memberships')
    .select('display_name, avatar, color')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single();
  if (!membership) redirect('/workspaces');

  const { data: members } = await supabase
    .from('memberships')
    .select('user_id, display_name, avatar, color')
    .eq('workspace_id', workspaceId);

  // event_date가 있는 항목만 캘린더에 표시
  const { data: items } = await supabase
    .from('items')
    .select('id, title, type, event_date, event_end_date, is_completed, owner_user_id')
    .eq('workspace_id', workspaceId)
    .not('event_date', 'is', null)
    .order('event_date', { ascending: true });

  return (
    <div className="min-h-screen bg-[#FBF6EE]">
      <div className="max-w-md mx-auto px-4" style={{ paddingTop: 52, paddingBottom: 100 }}>
        {/* 헤더 */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#2A1B0E', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
            캘린더
          </div>
          <div style={{ fontSize: 12, color: '#8A7359', marginTop: 2, fontWeight: 600 }}>
            {workspace.name}
          </div>
        </div>

        <CalendarView
          workspaceId={workspaceId}
          userId={user.id}
          initialItems={items ?? []}
          members={members ?? []}
        />
      </div>
    </div>
  );
}
