// app/workspaces/[workspaceId]/memos/[memoId]/page.tsx
// 메모 상세 (서버) — 한 메모 + 멤버 로드.
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import MemoDetailView from './memo-detail-view';
import type { MemoRow } from '@/components/memo-shared';

export const revalidate = 10;

interface Props {
  params: Promise<{ workspaceId: string; memoId: string }>;
}

export default async function MemoDetailPage({ params }: Props) {
  const { workspaceId, memoId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: membership }, { data: members }, { data: memo }] = await Promise.all([
    supabase.from('memberships').select('display_name').eq('workspace_id', workspaceId).eq('user_id', user.id).single(),
    supabase.from('memberships').select('user_id, display_name, color').eq('workspace_id', workspaceId),
    supabase.from('memos').select('id, workspace_id, title, tint, blocks, created_by, updated_by, created_at, updated_at')
      .eq('id', memoId).eq('workspace_id', workspaceId).maybeSingle(),
  ]);

  if (!membership) redirect('/workspaces');
  if (!memo) notFound();

  return (
    <MemoDetailView
      workspaceId={workspaceId}
      userId={user.id}
      members={members ?? []}
      initialMemo={memo as MemoRow}
    />
  );
}
