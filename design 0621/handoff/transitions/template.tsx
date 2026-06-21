// app/workspaces/[workspaceId]/template.tsx
//
// 탭 전환 연출 — "페이드 + 떠오름" (확정안).
// template.tsx 는 layout.tsx 와 달리 **라우트 이동마다 다시 마운트**됩니다.
// → 홈/메모/캘린더/동산 사이를 오갈 때마다 새 화면이 0.5초 연출로 "도착"합니다.
// 탭바는 layout.tsx 에 있어 그대로 머물고, 이 안의 children 만 다시 그려집니다.
//
// 배치: app/workspaces/[workspaceId]/template.tsx  (단 하나, 탭 세그먼트들의 부모)
'use client';

export default function WorkspaceTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div className="duip-page-enter">
      {children}
      <style>{`
        .duip-page-enter{
          animation: duipRise .5s cubic-bezier(.22,.7,.3,1) both;
          will-change: opacity, transform;
        }
        @keyframes duipRise{
          from{ opacity:0; transform: translateY(16px); }
          to  { opacity:1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce){
          .duip-page-enter{ animation: duipFade .25s ease both; }
          @keyframes duipFade{ from{opacity:0} to{opacity:1} }
        }
      `}</style>
    </div>
  );
}
