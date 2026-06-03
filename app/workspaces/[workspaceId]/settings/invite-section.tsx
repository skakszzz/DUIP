'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  workspaceId: string;
  userId: string;
}

function generateToken() {
  return Math.random().toString(36).slice(2, 10);
}

export default function InviteSection({ workspaceId, userId }: Props) {
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    const supabase = createClient();
    const token = generateToken();
    const { error } = await supabase.from('invites').insert({
      token,
      workspace_id: workspaceId,
      invited_by: userId,
    });
    setLoading(false);
    if (!error) {
      setLink(`${location.origin}/join/${token}`);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-[#5C3A1F]">멤버 초대</p>
      <p className="text-xs text-[#9B7B52]">초대 링크를 만들어 배우자에게 공유하세요. 7일 후 만료돼요.</p>

      {!link ? (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-full bg-[#5C3A1F] py-3 text-[#FBF6EE] font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? '만드는 중...' : '초대 링크 만들기'}
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="bg-white rounded-xl border border-[#E8D5B8] px-4 py-3">
            <p className="text-xs text-[#9B7B52] break-all">{link}</p>
          </div>
          <button
            onClick={handleCopy}
            className="rounded-full bg-[#B86F4B] py-3 text-white font-medium text-sm transition-opacity hover:opacity-90"
          >
            {copied ? '복사됐어요! ✓' : '링크 복사하기'}
          </button>
        </div>
      )}
    </div>
  );
}
