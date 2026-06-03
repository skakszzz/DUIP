// components/onboarding.tsx
// 로그인/첫 합류 직후 3스텝 온보딩 — 환영 → 파트너 초대 → 첫 씨앗 심기.
// 자기완결형. 부모에서 라우팅/Supabase 콜백만 연결하세요.
//
//   <Onboarding
//     myName="은석"
//     inviteCode="DOIF-72K"
//     month={5}
//     onInvite={() => shareInviteLink()}     // 초대 링크 보내기
//     onPickSeed={(species) => savePot(species)}  // 첫 화분 종 저장
//     onDone={() => router.replace(`/workspaces/${id}/today`)}
//   />
'use client';

import React, { useState } from 'react';
import { PlantArt } from './plant-art';
import { PLANT_NAMES } from '@/lib/data/plant-catalog';

const T = {
  cream: '#FBF6EE', paper: '#FFFCF7', sand: '#F4EBD9', taupe: '#D9C8AC',
  ink: '#2A1B0E', inkSoft: '#5C3A1F', inkMute: '#8A7359', inkFade: '#B09779',
  wood600: '#9A7553', wood700: '#7B5530', wood800: '#5C3A1F',
  sage: '#7C9466', lavender: '#DCD1E8', butter: '#F6E7B8',
  sh2: '0 2px 8px rgba(74,46,22,0.06), 0 1px 2px rgba(74,46,22,0.04)',
  sh3: '0 8px 24px rgba(74,46,22,0.08), 0 2px 6px rgba(74,46,22,0.04)',
  family: '"Gowun Dodum", -apple-system, BlinkMacSystemFont, sans-serif',
};

const Dots = ({ active }: { active: number }) => (
  <div style={{ display: 'flex', gap: 7, justifyContent: 'center' }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{
        width: i === active ? 22 : 7, height: 7, borderRadius: 4,
        background: i === active ? T.wood800 : T.taupe, transition: 'all 200ms',
      }} />
    ))}
  </div>
);

const Sky = () => (
  <svg viewBox="0 0 390 360" preserveAspectRatio="xMidYMax slice"
       style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 360, pointerEvents: 'none' }}>
    <defs>
      <linearGradient id="ob-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FBF7EE" /><stop offset="60%" stopColor="#FCF3E2" /><stop offset="100%" stopColor="#FBEFD9" />
      </linearGradient>
      <radialGradient id="ob-sun" cx="22%" cy="26%" r="42%">
        <stop offset="0%" stopColor="#FFF6DC" stopOpacity="0.9" /><stop offset="60%" stopColor="#FBE9BC" stopOpacity="0.3" /><stop offset="100%" stopColor="#FBE9BC" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="390" height="360" fill="url(#ob-sky)" />
    <circle cx="86" cy="94" r="150" fill="url(#ob-sun)" />
    <g opacity="0.55"><ellipse cx="280" cy="80" rx="30" ry="11" fill="#fff" /><ellipse cx="300" cy="84" rx="20" ry="8" fill="#fff" /></g>
  </svg>
);

const Shell = ({ children, dot }: { children: React.ReactNode; dot: number }) => (
  <div style={{
    position: 'relative', width: '100%', maxWidth: 440, minHeight: '100dvh',
    margin: '0 auto', background: T.cream, overflow: 'hidden',
    display: 'flex', flexDirection: 'column', fontFamily: T.family, color: T.ink,
  }}>
    <Sky />
    {children}
    <div style={{ position: 'relative', zIndex: 2, padding: '0 24px 40px' }}>
      <Dots active={dot} />
    </div>
  </div>
);

const CTA = ({ label, onClick, icon }: { label: string; onClick?: () => void; icon?: React.ReactNode }) => (
  <button onClick={onClick} style={{
    width: '100%', height: 54, borderRadius: 999, border: 'none', cursor: 'pointer',
    background: T.wood800, color: T.cream, fontFamily: T.family,
    fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', boxShadow: T.sh3,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
  }}>{icon}{label}</button>
);

export interface OnboardingProps {
  myName?: string;
  partnerName?: string;
  inviteCode?: string;
  month?: number;
  onInvite?: () => void;
  onPickSeed?: (plantId: string) => void;
  onDone?: () => void;
}

export function Onboarding({
  myName = '은석', partnerName = '소현', inviteCode = 'DOIF-72K', month = 5,
  onInvite, onPickSeed, onDone,
}: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [seed, setSeed] = useState<string>('lavender');
  const seedOptions: string[] = ['lavender', 'tulip', 'echeveria', 'basil'];

  // ── Step 1 · 환영 ──
  if (step === 0) {
    return (
      <Shell dot={0}>
        <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 36px' }}>
          <PlantArt id="lavender" stage={3} size={188} />
          <div style={{ fontSize: 11, fontWeight: 700, color: T.wood600, letterSpacing: '0.24em', marginTop: 14 }}>DO · IF</div>
          <h1 style={{ fontSize: 27, fontWeight: 700, color: T.ink, letterSpacing: '-0.03em', lineHeight: 1.32, margin: '10px 0 0' }}>
            둘이 함께 키우는<br />가능성 보드
          </h1>
          <p style={{ fontSize: 14, color: T.inkMute, lineHeight: 1.65, margin: '12px 0 0', maxWidth: 280 }}>
            하고 싶은 일, 가고 싶은 곳, 작은 약속들.<br />해낼 때마다 우리 화분이 한 잎씩 자라요.
          </p>
        </div>
        <div style={{ position: 'relative', zIndex: 2, padding: '0 24px 18px' }}>
          <CTA label="시작하기" onClick={() => setStep(1)} />
        </div>
      </Shell>
    );
  }

  // ── Step 2 · 파트너 초대 ──
  if (step === 1) {
    return (
      <Shell dot={1}>
        <div style={{ position: 'relative', zIndex: 2, flex: 1, padding: '40px 28px 0' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: T.ink, letterSpacing: '-0.025em', lineHeight: 1.34 }}>
            함께할 사람을<br />초대해요
          </h1>
          <p style={{ fontSize: 13.5, color: T.inkMute, lineHeight: 1.6, marginTop: 10 }}>
            동산은 둘이서 키워요. 링크를 보내면<br />상대도 같은 동산에 들어와요.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, margin: '34px 0 30px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: 999, background: T.sage, color: '#fff', fontSize: 26, fontWeight: 700, display: 'grid', placeItems: 'center', boxShadow: T.sh2 }}>{myName[0]}</div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: T.ink, marginTop: 8 }}>{myName}</div>
              <div style={{ fontSize: 10.5, color: T.sage, fontWeight: 700, marginTop: 1 }}>나</div>
            </div>
            <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
              <path d="M2 10h30" stroke={T.taupe} strokeWidth="2" strokeLinecap="round" strokeDasharray="2 5" />
              <path d="M30 5l6 5-6 5" stroke={T.taupe} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: 999, background: T.sand, display: 'grid', placeItems: 'center', boxShadow: `inset 0 0 0 2px ${T.taupe}` }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={T.inkFade} strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: T.inkMute, marginTop: 8 }}>{partnerName}</div>
              <div style={{ fontSize: 10.5, color: T.inkFade, fontWeight: 700, marginTop: 1 }}>초대 대기</div>
            </div>
          </div>

          <div style={{ background: T.paper, borderRadius: 20, padding: '16px 18px', boxShadow: T.sh2, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10.5, color: T.inkMute, fontWeight: 600, letterSpacing: '0.06em' }}>초대 코드</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.wood800, letterSpacing: '0.18em', marginTop: 2, fontFamily: 'ui-monospace, Menlo, monospace' }}>{inviteCode}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 999, background: T.sand, display: 'grid', placeItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.wood700} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="12" height="12" rx="2.5" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></svg>
            </div>
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 2, padding: '0 24px 14px' }}>
          <CTA label="초대 링크 보내기" onClick={onInvite}
               icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.cream} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l16-8-6 16-3-6-7-2Z" /></svg>} />
          <button onClick={() => setStep(2)} style={{ width: '100%', height: 44, marginTop: 12, borderRadius: 999, border: 'none', background: 'transparent', color: T.inkMute, fontFamily: T.family, fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>
            나중에 할게요
          </button>
        </div>
      </Shell>
    );
  }

  // ── Step 3 · 첫 씨앗 ──
  return (
    <Shell dot={2}>
      <div style={{ position: 'relative', zIndex: 2, flex: 1, padding: '40px 28px 0' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: T.ink, letterSpacing: '-0.025em', lineHeight: 1.34 }}>
          {month}월의 첫 씨앗을<br />골라볼까요
        </h1>
        <p style={{ fontSize: 13.5, color: T.inkMute, lineHeight: 1.6, marginTop: 10 }}>
          이번 달 함께 키울 화분이에요.<br />매달 새로운 씨앗을 심을 수 있어요.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 26 }}>
          {seedOptions.map((sk) => {
            const sel = seed === sk;
            return (
              <button key={sk} onClick={() => setSeed(sk)} style={{
                borderRadius: 22, padding: '18px 12px 14px', cursor: 'pointer',
                background: sel ? `linear-gradient(160deg, ${T.lavender}aa, ${T.paper})` : T.paper,
                boxShadow: sel ? T.sh3 : T.sh2, border: sel ? `2px solid ${T.wood800}` : '2px solid transparent',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative',
              }}>
                {sel && (
                  <div style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: 999, background: T.wood800, display: 'grid', placeItems: 'center' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.cream} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5 10 17.5 19 7.5" /></svg>
                  </div>
                )}
                <PlantArt id={sk} stage={1} size={88} />
                <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{PLANT_NAMES[sk]}</div>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ position: 'relative', zIndex: 2, padding: '20px 24px 18px' }}>
        <CTA label="이 씨앗 심기" onClick={() => { onPickSeed?.(seed); onDone?.(); }}
             icon={<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={T.cream} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12" /><path d="M12 12c0-4 3-7 7-7-.4 4-3 7-7 7Z" /><path d="M12 14C8.5 14 6 11.5 6 8c3.5 0 6 2.5 6 6Z" /></svg>} />
      </div>
    </Shell>
  );
}

export default Onboarding;
