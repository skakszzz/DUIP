// components/tab-skeleton.tsx
//
// 탭 로딩 갭을 채우는 스켈레톤 — 빈 크림화면 깜빡임을 대체합니다.
// 각 탭의 loading.tsx 가 이걸 렌더하면, 데이터 패칭 0.5초 동안
// 빈화면 대신 화면 골격이 잔잔히 떠오르며 보입니다.
'use client';

interface Props {
  /** 'home' | 'memo' | 'calendar' | 'garden' — 탭별 골격 모양 */
  variant?: 'home' | 'memo' | 'calendar' | 'garden';
  title?: string;
}

export default function TabSkeleton({ variant = 'home', title }: Props) {
  const bar = (w: number | string, h: number, r = 10, opacity = 1) => (
    <div className="duip-sk-shimmer" style={{ width: w, height: h, borderRadius: r, opacity }} />
  );

  return (
    <div className="duip-page-enter" style={{ paddingBottom: 96 }}>
      {/* 헤더 자리 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 18px 18px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {bar(70, 11)}
          {bar(130, 20)}
        </div>
        {bar(38, 38, 999)}
      </div>

      {/* 본문 골격 — 탭별 */}
      {variant === 'memo' ? (
        <div style={{ display: 'flex', gap: 11, padding: '0 16px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11 }}>
            {bar('100%', 96, 18)} {bar('100%', 70, 18, 0.7)} {bar('100%', 54, 18, 0.5)}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11 }}>
            {bar('100%', 70, 18, 0.85)} {bar('100%', 90, 18, 0.6)}
          </div>
        </div>
      ) : variant === 'calendar' ? (
        <div style={{ padding: '0 16px' }}>{bar('100%', 360, 22)}</div>
      ) : variant === 'garden' ? (
        <div style={{ display: 'grid', placeItems: 'center', paddingTop: 40, gap: 24 }}>
          {bar(180, 180, 999, 0.6)} {bar(150, 14, 8)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, padding: '0 18px' }}>
          {[1, 0.82, 0.64, 0.46].map((o, i) => (
            <div key={i}>{bar('100%', 62, 18, o)}</div>
          ))}
        </div>
      )}

      <style>{`
        .duip-page-enter{ animation: duipRise .5s cubic-bezier(.22,.7,.3,1) both; }
        @keyframes duipRise{ from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        .duip-sk-shimmer{ position:relative; overflow:hidden; background:#F4EBD9; }
        .duip-sk-shimmer::after{
          content:""; position:absolute; inset:0; transform:translateX(-100%);
          background:linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent);
          animation: duipSk 1.1s ease-in-out infinite;
        }
        @keyframes duipSk{ 100%{ transform:translateX(100%) } }
        @media (prefers-reduced-motion: reduce){
          .duip-page-enter{ animation: none }
          .duip-sk-shimmer::after{ animation: none }
        }
      `}</style>
    </div>
  );
}
