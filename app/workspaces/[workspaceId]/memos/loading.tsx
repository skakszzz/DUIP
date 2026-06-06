// app/workspaces/[workspaceId]/memos/loading.tsx
// 메모 탭 로딩 폴백 — 다른 탭과 동일한 "불러오는 중".
export default function Loading() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#FBF6EE', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, zIndex: 50 }}>
      <div className="duip-load-mark" style={{ transformOrigin: 'bottom center' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 21c0-5 3-8 8-8-.3 5-3 8-8 8Z" fill="#7B5530" />
          <path d="M12 21c-5 0-8-3-8-8 5 .3 8 3 8 8Z" fill="#7C9466" />
          <path d="M12 21V11" stroke="#34200E" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#8A7359', letterSpacing: '-0.01em' }}>불러오는 중…</div>
      <style>{`
        .duip-load-mark{animation:duipSway 1.6s ease-in-out infinite;}
        @keyframes duipSway{0%,100%{transform:rotate(-6deg);}50%{transform:rotate(6deg);}}
        @media (prefers-reduced-motion: reduce){.duip-load-mark{animation:none;}}
      `}</style>
    </div>
  );
}
