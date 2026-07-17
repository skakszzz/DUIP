'use client';

import { useState } from 'react';
import { usePushStatus, type PushStatus } from '@/lib/use-push-status';
import { useToast } from '@/components/toast';

interface Props {
  workspaceId: string;
}

const STATUS_DESC: Record<Exclude<PushStatus, 'loading'>, string> = {
  unsupported: 'iPhone에서는 홈 화면에 추가한 앱에서만 알림을 받을 수 있어요',
  default: '매달 화분 소식과 일정 알림을 받아보세요',
  denied: 'iPhone 설정 > 알림 > 두잎에서 허용해 주세요',
  granted_no_sub: '알림 연결이 끊어졌어요 — 다시 연결해 주세요',
  subscribed: '이 기기에서 알림 켜짐',
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: '#FFFCF7', borderRadius: 16, padding: '14px 16px',
      boxShadow: '0 1px 2px rgba(74,46,22,0.05)',
    }}>
      {children}
    </div>
  );
}

function CardText({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ minWidth: 0, paddingRight: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#2A1B0E', letterSpacing: '-0.01em' }}>
        {title}
      </div>
      <div style={{ fontSize: 12, color: '#8A7359', marginTop: 2, lineHeight: 1.4 }}>
        {desc}
      </div>
    </div>
  );
}

function CardButton({ label, onClick, disabled, primary }: {
  label: string; onClick: () => void; disabled: boolean; primary: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 34, padding: '0 16px', borderRadius: 9999, border: 'none', flexShrink: 0,
        background: primary ? '#5C3A1F' : '#F4E8D6',
        color: primary ? '#FBF6EE' : '#9B7B52',
        fontSize: 12, fontWeight: 800, cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'all 0.15s',
      }}
    >
      {disabled ? '...' : label}
    </button>
  );
}

// 설정 알림 섹션 — 상태 판정·구독·해지는 전부 usePushStatus 훅에 위임
export default function PushNotifManager({ workspaceId }: Props) {
  const { showToast } = useToast();
  const { status, enable, disable } = usePushStatus(workspaceId);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);

  async function handleEnable() {
    setBusy(true);
    const ok = await enable();
    setBusy(false);
    if (ok) showToast('알림이 켜졌어요 🌱');
  }

  async function handleDisable() {
    setBusy(true);
    await disable();
    setBusy(false);
  }

  async function handleTest() {
    setTesting(true);
    try {
      const res = await fetch('/api/push/test', { method: 'POST' });
      const data: { sent?: number; failed?: number } = await res.json();
      if (!res.ok) throw new Error();
      const sent = data.sent ?? 0;
      const failed = data.failed ?? 0;
      if (sent > 0) {
        showToast(`발송 ${sent}건 성공${failed > 0 ? ` · ${failed}건 실패` : ''}`);
      } else if (failed > 0) {
        showToast(`발송 ${failed}건 실패`, 'error');
      } else {
        // 서버에 이 계정의 구독 row가 없음 — 재등록으로 연결 (막다른 골목 금지)
        await enable();
        showToast('이 기기를 다시 등록했어요 · 한 번 더 눌러주세요');
      }
    } catch {
      showToast('테스트 발송에 실패했어요', 'error');
    } finally {
      setTesting(false);
    }
  }

  if (status === 'loading') {
    return (
      <Card>
        <CardText title="알림 받기" desc="상태 확인 중..." />
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardText title="알림 받기" desc={STATUS_DESC[status]} />
        {status === 'default' && (
          <CardButton label="알림 켜기" onClick={handleEnable} disabled={busy} primary />
        )}
        {status === 'granted_no_sub' && (
          <CardButton label="다시 연결" onClick={handleEnable} disabled={busy} primary />
        )}
        {status === 'subscribed' && (
          <CardButton label="끄기" onClick={handleDisable} disabled={busy} primary={false} />
        )}
      </Card>

      {status === 'subscribed' && (
        <div style={{ marginTop: 10 }}>
          <Card>
            <CardText title="테스트 알림" desc="내 모든 기기로 즉시 발송해 확인" />
            <CardButton label="보내기" onClick={handleTest} disabled={testing} primary={false} />
          </Card>
        </div>
      )}
    </>
  );
}
