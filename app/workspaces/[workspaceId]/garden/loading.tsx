// 공통 로딩 폴백 — 화면 진입(Server Component 데이터 패칭) 동안 "불러오는 중" 표시.
// 같은 내용을 각 탭 세그먼트의 loading.tsx 로 두면 홈/캘린더/동산이 동일하게 동작합니다.
//
// 배치 (각각 같은 파일을 복사):
//   app/workspaces/[workspaceId]/today/loading.tsx
//   app/workspaces/[workspaceId]/calendar/loading.tsx
//   app/workspaces/[workspaceId]/garden/loading.tsx
//   app/workspaces/[workspaceId]/loading.tsx        ← '이번 달' 보드까지 통일하려면
//
// Next.js App Router가 각 page.tsx(async)가 데이터를 기다리는 동안
// 자동으로 이 컴포넌트를 Suspense 폴백으로 보여줍니다. 별도 배선 불필요.

export default function Loading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#FBF6EE',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        zIndex: 50,
      }}
    >
      {/* 두 잎 마크가 살랑 — 브랜드 일관 */}
      <div className="duip-load-mark" style={{ transformOrigin: 'bottom center' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 21c0-5 3-8 8-8-.3 5-3 8-8 8Z" fill="#7B5530" />
          <path d="M12 21c-5 0-8-3-8-8 5 .3 8 3 8 8Z" fill="#7C9466" />
          <path d="M12 21V11" stroke="#34200E" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#8A7359', letterSpacing: '-0.01em' }}>
        불러오는 중…
      </div>

      <style>{`
        .duip-load-mark{animation:duipSway 1.6s ease-in-out infinite;}
        @keyframes duipSway{0%,100%{transform:rotate(-6deg);}50%{transform:rotate(6deg);}}
        @media (prefers-reduced-motion: reduce){.duip-load-mark{animation:none;}}
      `}</style>
    </div>
  );
}
