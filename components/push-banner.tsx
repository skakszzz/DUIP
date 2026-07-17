'use client';

import { useState, useEffect } from 'react';
import { ensurePushSubscription } from '@/lib/push-client';
import { useToast } from '@/components/toast';

const DISMISS_KEY = 'push_banner_dismissed';

// 권한이 아직 default일 때 홈 상단에 1회성으로 뜨는 알림 유도 배너
export default function PushBanner({ workspaceId }: { workspaceId: string }) {
  const { showToast } = useToast();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'default') return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
  }, []);

  if (!visible) return null;

  async function enable() {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
    try {
      const ok = await ensurePushSubscription(workspaceId);
      if (ok) showToast('알림이 켜졌어요 🌱');
    } catch {
      // 권한 거부 등 — 조용히 무시
    }
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  }

  return (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      <button
        onClick={enable}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          background: 'linear-gradient(135deg, rgba(154,124,201,0.12), rgba(242,198,110,0.14))',
          borderRadius: 18, padding: '12px 48px 12px 14px',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          boxShadow: '0 1px 4px rgba(74,46,22,0.06)',
        }}
      >
        <div style={{ fontSize: 26, lineHeight: 1 }}>🔔</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#2A1B0E', letterSpacing: '-0.01em' }}>
            알림을 켜면 매달 새 화분 소식을 받아요 🌱
          </div>
          <div style={{ fontSize: 11.5, color: '#8A7359', marginTop: 2 }}>
            탭해서 알림 켜기
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9A7553" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
      <button
        onClick={dismiss}
        style={{
          position: 'absolute', top: 8, right: 10,
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 4, lineHeight: 1,
          color: '#B09779', fontSize: 16,
        }}
        aria-label="닫기"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  );
}
