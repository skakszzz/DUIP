import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import JoinForm from './join-form';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function JoinPage({ params }: Props) {
  const { token } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/join/${token}`);
  }

  const { data: invite } = await supabase
    .from('invites')
    .select('token, workspace_id, expires_at, used_at')
    .eq('token', token)
    .single();

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF6EE]">
        <div className="text-center">
          <div className="text-4xl mb-3">🍂</div>
          <p className="text-[#9B7B52]">초대 링크를 찾을 수 없어요</p>
        </div>
      </div>
    );
  }

  if (invite.used_at || new Date(invite.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF6EE]">
        <div className="text-center">
          <div className="text-4xl mb-3">⏰</div>
          <p className="text-[#9B7B52]">만료된 초대 링크예요</p>
        </div>
      </div>
    );
  }

  const { data: existingMembership } = await supabase
    .from('memberships')
    .select('user_id')
    .eq('workspace_id', invite.workspace_id)
    .eq('user_id', user.id)
    .single();

  if (existingMembership) {
    redirect(`/workspaces/${invite.workspace_id}`);
  }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('name')
    .eq('id', invite.workspace_id)
    .single();

  return (
    <JoinForm
      token={token}
      workspaceId={invite.workspace_id}
      workspaceName={workspace?.name ?? '동산'}
      userId={user.id}
    />
  );
}
