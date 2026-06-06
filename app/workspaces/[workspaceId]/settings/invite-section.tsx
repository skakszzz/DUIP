'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  workspaceId: string;
  userId: string;
}

const T = {
  cream: '#FBF6EE', paper: '#FFFCF7',
  ink: '#2A1B0E', inkMute: '#8A7359', inkFade: '#B09779',
  wood700: '#7B5530', wood800: '#5C3A1F',
  bisque: '#EADFC7',
};

function generateCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function InviteSection({ workspaceId, userId }: Props) {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    const supabase = createClient();
    const token = generateCode();
    const { error } = await supabase.from('invites').insert({
      token,
      workspace_id: workspaceId,
      invited_by: userId,
    });
    setLoading(false);
    if (!error) setCode(token);
  }

  async function handleShare() {
    const msg = `두잎 참가 코드: ${code}\n앱에서 "코드로 참가하기"를 누르고 입력하면 돼요 🌿`;
    if (navigator.share) {
      await navigator.share({ title: '두잎 초대', text: msg });
    } else {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontFamily: '"Pretendard Variable","Pretendard",-apple-system,sans-serif' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, marginBottom: 4 }}>멤버 초대</div>
        <div style={{ fontSize: 12.5, color: T.inkMute, lineHeight: 1.6 }}>
          코드를 만들어 배우자에게 알려주세요.<br />
          배우자는 앱 첫 화면에서 <b style={{ color: T.wood700 }}>코드로 참가하기</b>를 누르면 돼요.
        </div>
      </div>

      {!code ? (
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            height: 46, borderRadius: 9999, border: 'none',
            background: T.wood800, color: T.cream,
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? '만드는 중…' : '참가 코드 만들기'}
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{
            background: T.paper, borderRadius: 20, padding: '20px 0',
            textAlign: 'center', border: `1.5px solid ${T.bisque}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.inkFade, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>참가 코드</div>
            <div style={{ fontSize: 40, fontWeight: 800, color: T.ink, letterSpacing: '0.22em' }}>{code}</div>
            <div style={{ fontSize: 11.5, color: T.inkFade, marginTop: 10 }}>7일 후 만료돼요</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleShare} style={{
              flex: 1, height: 44, borderRadius: 9999, border: 'none',
              background: T.wood800, color: T.cream,
              fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
            }}>
              공유하기
            </button>
            <button onClick={handleCopy} style={{
              flex: 1, height: 44, borderRadius: 9999, border: `1.5px solid ${T.bisque}`,
              background: T.paper, color: T.wood700,
              fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
            }}>
              {copied ? '복사됐어요 ✓' : '코드 복사'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
