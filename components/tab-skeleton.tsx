'use client';

interface Props {
  variant?: 'home' | 'memo' | 'calendar' | 'garden';
}

export default function TabSkeleton({ variant = 'home' }: Props) {
  const bar = (w: number | string, h: number, r = 10, opacity = 1) => (
    <div className="duip-sk-shimmer" style={{ width: w, height: h, borderRadius: r, opacity }} />
  );

  return (
    <div className="duip-page-enter" style={{ paddingBottom: 96 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'calc(8px + env(safe-area-inset-top, 0px))', paddingLeft: 18, paddingRight: 18, paddingBottom: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {bar(70, 11)}
          {bar(130, 20)}
        </div>
        {bar(38, 38, 999)}
      </div>

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
    </div>
  );
}
