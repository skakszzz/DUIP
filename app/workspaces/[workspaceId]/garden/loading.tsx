export default function Loading() {
  return (
    <div
      style={{
        minHeight: '100svh',
        background: '#EAF1F0',
        opacity: 0,
        animation: 'duipLoadFade 0.3s ease 0.15s forwards',
      }}
    >
      <style>{`
        @keyframes duipLoadFade { to { opacity: 1 } }
        @media (prefers-reduced-motion: reduce){ div { animation: none !important } }
      `}</style>
    </div>
  );
}
