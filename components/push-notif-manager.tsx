'use client';

import { useState, useEffect } from 'react';

interface Props {
  workspaceId: string;
}

export default function PushNotifManager({ workspaceId }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'on' | 'unsupported'>('idle');

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus('unsupported');
      return;
    }
    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) => {
        setStatus(sub ? 'on' : 'idle');
      })
    );
  }, []);

  async function subscribe() {
    setStatus('loading');
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      });
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON(), workspaceId }),
      });
      setStatus('on');
    } catch {
      setStatus('idle');
    }
  }

  async function unsubscribe() {
    setStatus('loading');
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId }),
      });
    }
    setStatus('idle');
  }

  if (status === 'unsupported') return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: '#FFFCF7', borderRadius: 16, padding: '14px 16px',
      boxShadow: '0 1px 2px rgba(74,46,22,0.05)',
    }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#2A1B0E', letterSpacing: '-0.01em' }}>
          일정 알림
        </div>
        <div style={{ fontSize: 12, color: '#8A7359', marginTop: 2 }}>
          {status === 'on' ? 'D-Day · D-1 이벤트 알림 켜짐' : '이벤트 날짜 하루 전 · 당일 알림'}
        </div>
      </div>
      <button
        onClick={status === 'on' ? unsubscribe : subscribe}
        disabled={status === 'loading'}
        style={{
          height: 34, padding: '0 16px', borderRadius: 9999, border: 'none',
          background: status === 'on' ? '#F4E8D6' : '#5C3A1F',
          color: status === 'on' ? '#9B7B52' : '#FBF6EE',
          fontSize: 12, fontWeight: 800, cursor: status === 'loading' ? 'default' : 'pointer',
          opacity: status === 'loading' ? 0.55 : 1,
          transition: 'all 0.15s',
        }}
      >
        {status === 'loading' ? '...' : status === 'on' ? '끄기' : '켜기'}
      </button>
    </div>
  );
}
