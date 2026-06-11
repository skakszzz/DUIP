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

  const { data: inviteInfo } = await supabase.rpc('get_invite_info', { p_code: token });

  if (!inviteInfo || inviteInfo.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF6EE]">
        <div className="text-center">
          <div className="text-4xl mb-3">🍂</div>
          <p className="text-[#9B7B52]">초대 링크를 찾을 수 없거나 만료됐어요</p>
        </div>
      </div>
    );
  }

  return (
    <JoinForm
      token={token}
      workspaceId={inviteInfo[0].workspace_id}
      workspaceName={inviteInfo[0].workspace_name ?? '동산'}
      userId={user.id}
    />
  );
}
