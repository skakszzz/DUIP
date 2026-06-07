'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const T = {
  ink: '#2A1B0E', inkMute: '#8A7359',
  wood600: '#9A7553', wood700: '#7B5530', wood800: '#5C3A1F',
  bisque: '#EADFC7', paper: '#FFFCF7',
  err: '#C77C6A',
};

interface Props {
  workspaceId: string;
  userId: string;
  initialName: string;
  avatar: string;
  color: string;
  isOwner: boolean;
}

export default function EditDisplayName({ workspaceId, userId, initialName, avatar, color, isOwner }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setEditing(true);
    setErr('');
    setTimeout(() => inputRef.current?.select(), 30);
  }

  async function save() {
    const trimmed = value.trim();
    if (!trimmed) { setErr('이름을 입력해주세요'); return; }
    if (trimmed === initialName) { setEditing(false); return; }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('memberships')
      .update({ display_name: trimmed })
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);
    setSaving(false);
    if (error) { setErr('저장 실패: ' + error.message); return; }
    setEditing(false);
    router.refresh();
  }

  function cancel() {
    setValue(initialName);
    setEditing(false);
    setErr('');
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 9999,
        background: color + '33',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0,
      }}>
        {avatar}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <div>
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => { setValue(e.target.value); setErr(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) save(); if (e.key === 'Escape') cancel(); }}
              maxLength={20}
              style={{
                width: '100%', boxSizing: 'border-box',
                height: 38, borderRadius: 10, border: `1.5px solid ${err ? T.err : T.wood600}`,
                background: T.paper, padding: '0 10px',
                fontSize: 14, fontWeight: 700, color: T.ink,
                outline: 'none', fontFamily: 'inherit',
              }}
            />
            {err && <div style={{ fontSize: 11, color: T.err, marginTop: 3 }}>{err}</div>}
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button
                onClick={save}
                disabled={saving}
                style={{
                  flex: 1, height: 36, borderRadius: 9999, border: 'none',
                  background: T.wood800, color: '#FBF6EE',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  opacity: saving ? 0.5 : 1,
                }}
              >{saving ? '저장 중…' : '저장'}</button>
              <button
                onClick={cancel}
                style={{
                  flex: 1, height: 36, borderRadius: 9999,
                  border: `1.5px solid ${T.bisque}`, background: T.paper,
                  color: T.wood700, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >취소</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{value}</div>
            <button
              onClick={startEdit}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: T.inkMute }}
              aria-label="닉네임 수정"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {isOwner && !editing && (
        <div style={{
          padding: '3px 10px', borderRadius: 9999,
          background: T.bisque, fontSize: 11, fontWeight: 700, color: T.wood600, flexShrink: 0,
        }}>관리자</div>
      )}
    </div>
  );
}
