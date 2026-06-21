import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import MonthBoard from './board';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ workspaceId: string }>;
}

export default async function MonthPage({ params }: Props) {
  const { workspaceId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, name, tree_type, anniversary')
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

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const firstDay = new Date(year, month - 1, 1).toISOString();
  const lastDay  = new Date(year, month, 0, 23, 59, 59).toISOString();

  const { data: items } = await supabase
    .from('items')
    .select('id, title, description, type, timeframe, is_completed, owner_user_id, created_by, is_recurring, recurrence_rule, event_date')
    .eq('workspace_id', workspaceId)
    .gte('created_at', firstDay)
    .lte('created_at', lastDay)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#FBF6EE]">
      <div className="max-w-md mx-auto px-4" style={{ paddingTop: 'max(env(safe-area-inset-top), 52px)', paddingBottom: 100 }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Link
            href={`/workspaces/${workspaceId}/today`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 34, height: 34, borderRadius: 9999,
              background: '#FFFCF7', boxShadow: '0 1px 2px rgba(74,46,22,0.06)',
              color: '#7B5530', textDecoration: 'none', flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </Link>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#2A1B0E', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
              월간 보드
            </div>
            <div style={{ fontSize: 12, color: '#8A7359', marginTop: 2, fontWeight: 600 }}>
              {workspace.name}
            </div>
          </div>
          <Link
            href={`/workspaces/${workspaceId}/settings`}
            style={{
              width: 34, height: 34, borderRadius: 9999,
              background: '#FFFCF7', boxShadow: '0 1px 2px rgba(74,46,22,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B5530" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>
            </svg>
          </Link>
        </div>

        <MonthBoard
          workspaceId={workspaceId}
          userId={user.id}
          initialItems={items ?? []}
          members={members ?? []}
          initialYear={year}
          initialMonth={month}
        />
      </div>
    </div>
  );
}
