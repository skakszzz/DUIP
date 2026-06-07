'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const T = {
  ink: '#2A1B0E', inkMute: '#8A7359',
  wood600: '#9A7553', wood700: '#7B5530', wood800: '#5C3A1F',
  paper: '#FFFCF7', bisque: '#EADFC7',
};

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: i < 12
    ? `오전 ${i === 0 ? 12 : i}시`
    : `오후 ${i === 12 ? 12 : i - 12}시`,
}));

interface Props {
  workspaceId: string;
  initialHour: number;
}

export default function NotificationHourPicker({ workspaceId, initialHour }: Props) {
  const router = useRouter();
  const [hour, setHour] = useState(initialHour);
  const [saving, setSaving] = useState(false);

  async function handleChange(newHour: number) {
    setHour(newHour);
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from('workspaces')
      .update({ notification_hour: newHour })
      .eq('id', workspaceId);
    setSaving(false);
    router.refresh();
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: T.paper, borderRadius: 16, padding: '14px 16px',
      boxShadow: '0 1px 2px rgba(74,46,22,0.05)', marginTop: 10,
    }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, letterSpacing: '-0.01em' }}>
          알림 시간
        </div>
        <div style={{ fontSize: 12, color: T.inkMute, marginTop: 2 }}>
          {saving ? '저장 중…' : '매일 이 시각에 D-Day · D-1 알림'}
        </div>
      </div>
      <select
        value={hour}
        onChange={(e) => handleChange(Number(e.target.value))}
        style={{
          height: 34, padding: '0 10px', borderRadius: 9999,
          border: `1.5px solid ${T.bisque}`,
          background: T.paper, color: T.wood800,
          fontSize: 13, fontWeight: 800, cursor: 'pointer',
          outline: 'none', fontFamily: 'inherit',
        }}
      >
        {HOUR_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </div>
  );
}
