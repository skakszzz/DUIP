// app/workspaces/[workspaceId]/memos/page.tsx
// 메모 목록 (서버) — 워크스페이스 공유 메모를 최신순으로.
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MemosView from './memos-view';
import type { MemoRow } from '@/components/memo-shared';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ workspaceId: string }>;
}

export default async function MemosPage({ params }: Props) {
  const { workspaceId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: workspace }, { data: membership }, { data: members }, { data: memos }] = await Promise.all([
    supabase.from('workspaces').select('id, name').eq('id', workspaceId).maybeSingle(),
    supabase.from('memberships').select('display_name').eq('workspace_id', workspaceId).eq('user_id', user.id).single(),
    supabase.from('memberships').select('user_id, display_name, color').eq('workspace_id', workspaceId),
    supabase.from('memos').select('id, workspace_id, title, tint, blocks, created_by, updated_by, created_at, updated_at')
      .eq('workspace_id', workspaceId)
      .order('updated_at', { ascending: false }),
  ]);

  if (!workspace) redirect('/workspaces');
  if (!membership) redirect('/workspaces');

  return (
    <MemosView
      workspaceId={workspaceId}
      userId={user.id}
      workspaceName={workspace.name}
      members={members ?? []}
      initialMemos={(memos as MemoRow[]) ?? []}
    />
  );
}
