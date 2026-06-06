'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { WorkspacePicker, type Garden } from '@/components/workspace-picker';

const AVATAR_OPTIONS = ['🌱', '🌸', '🍀', '🌻', '🌺', '🌿', '🍃', '🌾'];
const COLOR_OPTIONS = [
  '#7BAE7E', '#B86F4B', '#D88E63', '#9B7B52',
  '#A8C99B', '#F0B5A0', '#5C3A1F', '#8B5E3C',
];

const T = {
  cream: '#FBF6EE', paper: '#FFFCF7',
  ink: '#2A1B0E', inkMute: '#8A7359', inkFade: '#B09779',
  wood700: '#7B5530', wood800: '#5C3A1F',
  bisque: '#EADFC7', taupe: '#D9C8AC',
  err: '#C77C6A',
};

interface PendingInvite { token: string; workspaceId: string; workspaceName: string }

interface Props {
  gardens: Garden[];
  userName: string;
  seasonLabel: string;
  userId: string;
}

export default function WorkspacePickerClient({ gardens, userName, seasonLabel, userId }: Props) {
  const router = useRouter();
  const [showJoin, setShowJoin] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [checking, setChecking] = useState(false);
  const [codeErr, setCodeErr] = useState('');
  const [pending, setPending] = useState<PendingInvite | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState('🌸');
  const [color, setColor] = useState('#B86F4B');
  const [joining, setJoining] = useState(false);
  const [joinErr, setJoinErr] = useState('');

  function closeSheet() {
    setShowJoin(false);
    setCodeInput('');
    setCodeErr('');
    setPending(null);
    setDisplayName('');
    setAvatar('🌸');
    setColor('#B86F4B');
    setJoinErr('');
  }

  async function handleCodeSubmit() {
    const code = codeInput.trim().toUpperCase();
    if (code.length !== 6) { setCodeErr('6자리 코드를 입력해주세요'); return; }
    setChecking(true);
    setCodeErr('');
    const supabase = createClient();
    const { data: invite } = await supabase
      .from('invites')
      .select('token, workspace_id, expires_at, used_at')
      .eq('token', code)
      .maybeSingle();

    if (!invite) { setChecking(false); setCodeErr('코드를 찾을 수 없어요'); return; }
    if (invite.used_at || new Date(invite.expires_at) < new Date()) {
      setChecking(false); setCodeErr('만료된 코드예요'); return;
    }

    const { data: existing } = await supabase
      .from('memberships').select('user_id')
      .eq('workspace_id', invite.workspace_id).eq('user_id', userId).maybeSingle();
    if (existing) { router.push(`/workspaces/${invite.workspace_id}/today`); return; }

    const { data: ws } = await supabase
      .from('workspaces').select('name').eq('id', invite.workspace_id).maybeSingle();

    setChecking(false);
    setPending({ token: code, workspaceId: invite.workspace_id, workspaceName: ws?.name ?? '동산' });
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!pending || !displayName.trim()) return;
    setJoining(true); setJoinErr('');
    const supabase = createClient();
    const { error } = await supabase.from('memberships').insert({
      workspace_id: pending.workspaceId,
      user_id: userId,
      display_name: displayName.trim(),
      avatar, color, role: 'member',
    });
    if (error) { setJoinErr(error.message); setJoining(false); return; }
    await supabase.from('invites').update({ used_at: new Date().toISOString() }).eq('token', pending.token);
    router.push(`/workspaces/${pending.workspaceId}/today`);
  }

  return (
    <>
      <WorkspacePicker
        gardens={gardens}
        userName={userName}
        seasonLabel={seasonLabel}
        maxGardens={3}
        onOpen={(id) => router.push(`/workspaces/${id}/today`)}
        onNew={() => router.push('/workspaces/new')}
        onSettings={() => router.push('/settings')}
        onJoinCode={() => setShowJoin(true)}
      />

      {showJoin && (
        <div
          onClick={closeSheet}
          style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(42,27,14,0.38)', display: 'flex', alignItems: 'flex-end' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 440, margin: '0 auto',
              background: T.cream, borderRadius: '28px 28px 0 0',
              padding: '0 20px calc(36px + env(safe-area-inset-bottom))',
              fontFamily: '"Pretendard Variable","Pretendard",-apple-system,sans-serif',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 22px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: T.taupe }} />
            </div>

            {!pending ? (
              <>
                <div style={{ marginBottom: 22 }}>
                  <div style={{ fontSize: 21, fontWeight: 800, color: T.ink, letterSpacing: '-0.02em' }}>코드로 참가하기</div>
                  <div style={{ fontSize: 13.5, color: T.inkMute, marginTop: 6, lineHeight: 1.55 }}>배우자가 알려준 6자리 코드를 입력하세요</div>
                </div>
                <input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                  placeholder="AB3K7M"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCodeSubmit()}
                  style={{
                    display: 'block', width: '100%', boxSizing: 'border-box',
                    background: T.paper, border: `1.5px solid ${codeErr ? T.err : T.bisque}`,
                    borderRadius: 16, padding: '16px 18px',
                    fontSize: 30, fontWeight: 800, color: T.ink, letterSpacing: '0.2em',
                    textAlign: 'center', outline: 'none', fontFamily: 'inherit',
                  }}
                />
                {codeErr && (
                  <div style={{ fontSize: 13, color: T.err, textAlign: 'center', marginTop: 8 }}>{codeErr}</div>
                )}
                <button
                  onClick={handleCodeSubmit}
                  disabled={checking || codeInput.length < 6}
                  style={{
                    width: '100%', height: 50, borderRadius: 9999, border: 'none',
                    background: T.wood800, color: T.cream, marginTop: 14,
                    fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    opacity: (checking || codeInput.length < 6) ? 0.45 : 1,
                  }}
                >
                  {checking ? '확인 중…' : '확인하기'}
                </button>
              </>
            ) : (
              <form onSubmit={handleJoin}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 21, fontWeight: 800, color: T.ink, letterSpacing: '-0.02em' }}>{pending.workspaceName}에 합류!</div>
                  <div style={{ fontSize: 13.5, color: T.inkMute, marginTop: 6 }}>내 이름과 아바타를 골라주세요</div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.wood700, marginBottom: 6 }}>내 이름</div>
                  <input
                    required value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="소현" autoFocus
                    style={{
                      display: 'block', width: '100%', boxSizing: 'border-box',
                      background: T.paper, border: `1.5px solid ${T.bisque}`,
                      borderRadius: 14, padding: '13px 16px',
                      fontSize: 16, color: T.ink, outline: 'none', fontFamily: 'inherit',
                    }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.wood700, marginBottom: 8 }}>아바타</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {AVATAR_OPTIONS.map((a) => (
                      <button key={a} type="button" onClick={() => setAvatar(a)} style={{
                        width: 42, height: 42, borderRadius: 9999, fontSize: 22, border: 'none',
                        background: avatar === a ? T.wood800 : T.paper,
                        boxShadow: avatar === a ? 'none' : `0 0 0 1.5px ${T.bisque}`,
                        cursor: 'pointer', display: 'grid', placeItems: 'center',
                      }}>{a}</button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 22 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.wood700, marginBottom: 8 }}>내 색깔</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {COLOR_OPTIONS.map((c) => (
                      <button key={c} type="button" onClick={() => setColor(c)} style={{
                        width: 32, height: 32, borderRadius: 9999, border: 'none',
                        background: c, cursor: 'pointer',
                        boxShadow: color === c ? `0 0 0 3px ${T.cream}, 0 0 0 5px ${c}` : 'none',
                      }} />
                    ))}
                  </div>
                </div>

                {joinErr && <div style={{ fontSize: 13, color: T.err, textAlign: 'center', marginBottom: 10 }}>{joinErr}</div>}

                <button type="submit" disabled={joining || !displayName.trim()} style={{
                  width: '100%', height: 50, borderRadius: 9999, border: 'none',
                  background: T.wood800, color: T.cream,
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  opacity: (joining || !displayName.trim()) ? 0.45 : 1,
                }}>
                  {joining ? '합류 중…' : '합류하기 🌱'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
