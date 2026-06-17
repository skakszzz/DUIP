'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const T = {
  cream: '#FBF6EE', paper: '#FFFCF7',
  ink: '#2A1B0E', inkMute: '#8A7359',
  bisque: '#EADFC7', taupe: '#D9C8AC',
  err: '#C77C6A', errLight: '#F7EAE7',
};

export default function DeleteWorkspaceButton({ workspaceId, workspaceName }: { workspaceId: string; workspaceName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState('');

  async function handleDelete() {
    setDeleting(true);
    setErr('');
    const supabase = createClient();

    // 연관 레코드를 순서대로 삭제 후 워크스페이스 삭제
    const steps = [
      () => supabase.from('invites').delete().eq('workspace_id', workspaceId),
      () => supabase.from('items').delete().eq('workspace_id', workspaceId),
      () => supabase.from('monthly_pots').delete().eq('workspace_id', workspaceId),
      () => supabase.from('memos').delete().eq('workspace_id', workspaceId),
      () => supabase.from('memberships').delete().eq('workspace_id', workspaceId),
      () => supabase.from('workspaces').delete().eq('id', workspaceId),
    ];

    for (const step of steps) {
      const { error } = await step();
      if (error) { setErr(error.message); setDeleting(false); return; }
    }

    router.push('/workspaces');
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          width: '100%', height: 46, borderRadius: 9999, border: `1.5px solid ${T.err}`,
          background: T.errLight, color: T.err,
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}
      >
        동산 삭제
      </button>

      {open && (
        <div
          onClick={() => !deleting && setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(42,27,14,0.45)', display: 'flex', alignItems: 'flex-end' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 440, margin: '0 auto',
              background: T.cream, borderRadius: '28px 28px 0 0',
              padding: '0 20px calc(40px + env(safe-area-inset-bottom))',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 24px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: T.taupe }} />
            </div>

            <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 12 }}>🥀</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.ink, textAlign: 'center', letterSpacing: '-0.02em', marginBottom: 8 }}>
              정말 삭제할까요?
            </div>
            <div style={{ fontSize: 13.5, color: T.inkMute, textAlign: 'center', lineHeight: 1.6, marginBottom: 28 }}>
              <b style={{ color: T.ink }}>{'"'}{workspaceName}{'"'}</b> 동산과<br />
              모든 할일·소망·메모·화분 기록이<br />
              영구적으로 삭제돼요. 되돌릴 수 없어요.
            </div>

            {err && (
              <div style={{ fontSize: 13, color: T.err, textAlign: 'center', marginBottom: 14 }}>{err}</div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  height: 50, borderRadius: 9999, border: 'none',
                  background: T.err, color: '#fff',
                  fontSize: 15, fontWeight: 800, cursor: 'pointer',
                  opacity: deleting ? 0.5 : 1,
                }}
              >
                {deleting ? '삭제 중…' : '네, 삭제할게요'}
              </button>
              <button
                onClick={() => setOpen(false)}
                disabled={deleting}
                style={{
                  height: 46, borderRadius: 9999,
                  border: `1.5px solid ${T.bisque}`,
                  background: T.paper, color: T.inkMute,
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
