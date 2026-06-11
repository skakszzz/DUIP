export default function GardenLoading() {
  return (
    <div style={{ position: 'relative', minHeight: 'calc(100svh - 60px)', overflow: 'hidden', background: '#EAF1F0' }}>
      <style>{`
        @keyframes gl-sway { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} }
        @keyframes gl-pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes gl-drift { 0%{transform:translateX(0)} 100%{transform:translateX(18px)} }
        @media (prefers-reduced-motion: reduce){ .gl-anim{animation:none!important} }
      `}</style>
      <svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice"
           style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="gl-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EAF1F0"/><stop offset="48%" stopColor="#FBEFD2"/><stop offset="100%" stopColor="#EAD49C"/>
          </linearGradient>
        </defs>
        <rect width="390" height="844" fill="url(#gl-sky)"/>
        <g className="gl-anim" style={{ animation: 'gl-drift 6s ease-in-out infinite alternate' }} opacity=".5">
          <ellipse cx="90" cy="150" rx="34" ry="13" fill="#fff"/><ellipse cx="118" cy="155" rx="22" ry="9" fill="#fff"/>
          <ellipse cx="290" cy="110" rx="28" ry="11" fill="#fff"/>
        </g>
        <path d="M-10 560 Q 110 505 210 530 Q 320 555 400 518 L400 844 L-10 844 Z" fill="#BBD3B4" opacity=".8"/>
        <path d="M-10 640 Q 90 585 200 610 Q 310 635 400 595 L400 844 L-10 844 Z" fill="#97BC8B"/>
        <path d="M-10 730 Q 110 695 200 712 Q 290 728 400 692 L400 844 L-10 844 Z" fill="#79A06E"/>
      </svg>
      <div style={{ position: 'absolute', left: '50%', top: '42%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
        <svg width="54" height="54" viewBox="0 0 24 24" fill="none" className="gl-anim"
             style={{ transformOrigin: 'bottom center', animation: 'gl-sway 1.6s ease-in-out infinite' }}>
          <path d="M12 21v-7" stroke="#5C8A4E" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 14c-4 0-6.5-2.6-7-6 4 0 6.6 2 7 6Z" fill="#7C9466"/>
          <path d="M12 14c4 0 6.5-2.6 7-6-4 0-6.6 2-7 6Z" fill="#A0B88A"/>
        </svg>
        <div className="gl-anim" style={{ marginTop: 10, fontSize: 13.5, fontWeight: 700, color: '#5C3A1F', animation: 'gl-pulse 1.6s ease-in-out infinite' }}>
          동산에 물 주는 중…
        </div>
      </div>
    </div>
  );
}
