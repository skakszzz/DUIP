import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import InviteSection from './invite-section';
import PushNotifManager from '@/components/push-notif-manager';
import DeleteWorkspaceButton from './delete-workspace-button';
import LeaveWorkspaceButton from './leave-workspace-button';
import Link from 'next/link';

interface Props {
  params: Promise<{ workspaceId: string }>;
}

const T = {
  cream: '#FBF6EE', paper: '#FFFCF7',
  ink: '#2A1B0E', inkMute: '#8A7359', inkFade: '#B09779',
  wood600: '#9A7553', wood700: '#7B5530', wood800: '#5C3A1F',
  bisque: '#EADFC7', sand: '#F4E8D6',
};

export default async function SettingsPage({ params }: Props) {
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

  const { data: myMembership } = await supabase
    .from('memberships')
    .select('display_name, avatar, color, role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single();

  return (
    <div style={{ minHeight: '100dvh', background: T.cream, fontFamily: '"Pretendard Variable","Pretendard",-apple-system,sans-serif' }}>
      <div style={{ maxWidth: 448, margin: '0 auto', padding: '52px 16px 100px' }}>

        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <Link
            href={`/workspaces/${workspaceId}/today`}
            style={{
              width: 36, height: 36, borderRadius: 9999,
              background: T.paper, border: `1px solid ${T.bisque}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.wood700} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </Link>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.ink, letterSpacing: '-0.025em' }}>동산 설정</div>
        </div>

        {/* 동산 이름 */}
        <div style={{ background: T.sand, borderRadius: 20, padding: '14px 16px', marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.wood600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>동산 이름</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.ink }}>{workspace.name}</div>
        </div>

        {/* 내 프로필 */}
        {myMembership && (
          <div style={{ background: T.sand, borderRadius: 20, padding: '14px 16px', marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.wood600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>내 프로필</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9999,
                background: myMembership.color + '33',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>
                {myMembership.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{myMembership.display_name}</div>
              </div>
              {myMembership.role === 'owner' && (
                <div style={{
                  padding: '3px 10px', borderRadius: 9999,
                  background: T.bisque, fontSize: 11, fontWeight: 700, color: T.wood600,
                }}>관리자</div>
              )}
            </div>
          </div>
        )}

        {/* 알림 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: T.wood600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>알림</div>
          <PushNotifManager workspaceId={workspaceId} />
        </div>

        {/* 초대 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: T.wood600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>멤버</div>
          <InviteSection workspaceId={workspaceId} userId={user.id} />
        </div>

        {/* 위험 구역 */}
        {myMembership && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#C77C6A', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>위험 구역</div>
            {myMembership.role === 'owner'
              ? <DeleteWorkspaceButton workspaceId={workspaceId} workspaceName={workspace.name} />
              : <LeaveWorkspaceButton workspaceId={workspaceId} workspaceName={workspace.name} userId={user.id} />
            }
          </div>
        )}

        {/* 동산 선택으로 */}
        <Link
          href="/workspaces"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            height: 48, borderRadius: 9999,
            border: `1.5px solid ${T.bisque}`,
            background: T.paper,
            fontSize: 14, fontWeight: 700, color: T.wood700,
            textDecoration: 'none',
            marginTop: 8,
          }}
        >
          🌿 동산 선택으로
        </Link>

      </div>
    </div>
  );
}
