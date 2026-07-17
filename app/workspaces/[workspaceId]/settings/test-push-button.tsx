'use client';

import { useState } from 'react';
import { useToast } from '@/components/toast';

export default function TestPushButton() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    try {
      const res = await fetch('/api/push/test', { method: 'POST' });
      const data: { sent?: number; failed?: number } = await res.json();
      if (!res.ok) throw new Error();
      const sent = data.sent ?? 0;
      const failed = data.failed ?? 0;
      if (sent === 0 && failed === 0) {
        showToast('등록된 알림 기기가 없어요', 'error');
      } else if (sent > 0) {
        showToast(`발송 ${sent}건 성공${failed > 0 ? ` · ${failed}건 실패` : ''}`);
      } else {
        showToast(`발송 ${failed}건 실패`, 'error');
      }
    } catch {
      showToast('테스트 발송에 실패했어요', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: '#FFFCF7', borderRadius: 16, padding: '14px 16px',
      boxShadow: '0 1px 2px rgba(74,46,22,0.05)', marginTop: 10,
    }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#2A1B0E', letterSpacing: '-0.01em' }}>
          테스트 알림
        </div>
        <div style={{ fontSize: 12, color: '#8A7359', marginTop: 2 }}>
          내 모든 기기로 즉시 발송해 확인
        </div>
      </div>
      <button
        onClick={send}
        disabled={loading}
        style={{
          height: 34, padding: '0 16px', borderRadius: 9999, border: 'none',
          background: '#F4E8D6', color: '#7B5530',
          fontSize: 12, fontWeight: 800, cursor: loading ? 'default' : 'pointer',
          opacity: loading ? 0.55 : 1,
          transition: 'all 0.15s',
        }}
      >
        {loading ? '...' : '보내기'}
      </button>
    </div>
  );
}
