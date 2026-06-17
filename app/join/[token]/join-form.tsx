'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const AVATAR_OPTIONS = ['🌱', '🌸', '🍀', '🌻', '🌺', '🌿', '🍃', '🌾'];
const COLOR_OPTIONS = [
  '#7BAE7E', '#B86F4B', '#D88E63', '#9B7B52',
  '#A8C99B', '#F0B5A0', '#5C3A1F', '#8B5E3C',
];

interface Props {
  token: string;
  workspaceName: string;
}

export default function JoinForm({ token, workspaceName }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState('🌸');
  const [color, setColor] = useState('#B86F4B');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) return;
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc('join_workspace_with_code', {
      p_code: token,
      p_display_name: displayName.trim(),
      p_avatar: avatar,
      p_color: color,
    });

    if (rpcError || !data?.ok) {
      const errCode = data?.error_code ?? '';
      if (errCode === 'NOT_FOUND') setError('코드를 찾을 수 없어요');
      else if (errCode === 'EXPIRED') setError('만료된 코드예요');
      else setError('합류에 실패했어요. 다시 시도해주세요');
      setLoading(false);
      return;
    }

    router.push(`/workspaces/${data.workspace_id}/today`);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#FBF6EE]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌱</div>
          <h1 className="text-xl font-semibold text-[#5C3A1F] mb-1">
            {workspaceName}에 합류하기
          </h1>
          <p className="text-sm text-[#9B7B52]">함께 동산을 가꿔요</p>
        </div>

        <form onSubmit={handleJoin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#5C3A1F]">내 이름</label>
            <input
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="소현"
              className="rounded-xl border border-[#E8D5B8] bg-white px-4 py-3 text-[#5C3A1F] placeholder:text-[#C8B89A] focus:outline-none focus:ring-2 focus:ring-[#B86F4B]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#5C3A1F]">아바타</label>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_OPTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  className={`text-2xl w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    avatar === a ? 'bg-[#5C3A1F]' : 'bg-white border border-[#E8D5B8]'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#5C3A1F]">내 색깔</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-[#5C3A1F]' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[#5C3A1F] py-3 text-[#FBF6EE] font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? '합류 중...' : '합류하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
