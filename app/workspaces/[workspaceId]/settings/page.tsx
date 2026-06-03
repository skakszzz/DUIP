import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import InviteSection from './invite-section';
import PushNotifManager from '@/components/push-notif-manager';
import Link from 'next/link';

interface Props {
  params: Promise<{ workspaceId: string }>;
}

export default async function SettingsPage({ params }: Props) {
  const { workspaceId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, name, tree_type')
    .eq('id', workspaceId)
    .single();
  if (!workspace) redirect('/workspaces');

  const { data: myMembership } = await supabase
    .from('memberships')
    .select('display_name, avatar, color, role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#FBF6EE]">
      <div className="max-w-md mx-auto px-4 pt-8 pb-24">
        <div className="flex items-center gap-3 mb-8">
          <Link href={`/workspaces/${workspaceId}/today`} className="text-[#9B7B52] hover:text-[#5C3A1F]">←</Link>
          <h1 className="text-xl font-semibold text-[#5C3A1F]">동산 설정</h1>
        </div>

        <div className="bg-[#F4E8D6] rounded-2xl p-4 mb-4">
          <p className="text-xs text-[#9B7B52] mb-1">동산 이름</p>
          <p className="font-medium text-[#5C3A1F]">{workspace.name}</p>
        </div>

        {myMembership && (
          <div className="bg-[#F4E8D6] rounded-2xl p-4 mb-6">
            <p className="text-xs text-[#9B7B52] mb-3">내 프로필</p>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                style={{ backgroundColor: myMembership.color + '33' }}
              >
                {myMembership.avatar}
              </div>
              <span className="text-sm text-[#5C3A1F]">{myMembership.display_name}</span>
              {myMembership.role === 'owner' && (
                <span className="text-xs text-[#9B7B52] ml-auto">관리자</span>
              )}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#9A7553', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>알림</p>
          <PushNotifManager workspaceId={workspaceId} />
        </div>

        <InviteSection workspaceId={workspaceId} userId={user.id} />
      </div>
    </div>
  );
}
