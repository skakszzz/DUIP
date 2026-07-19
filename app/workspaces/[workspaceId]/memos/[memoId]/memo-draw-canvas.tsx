// app/workspaces/[workspaceId]/memos/[memoId]/memo-draw-canvas.tsx
// 손그림 캔버스 — 포인터로 자유 드로잉, 색연필/마커 팔레트. 정규화 좌표(0~1)로 저장.
'use client';

import { useRef, useState } from 'react';
import { CRAYON, type Stroke } from '@/components/memo-shared';

interface Props {
  initial: Stroke[];
  onSave: (strokes: Stroke[]) => void;
  onCancel: () => void;
}

type Tool = 'pen' | 'marker' | 'eraser';
const TOOL_WIDTH: Record<Tool, number> = { pen: 3, marker: 7, eraser: 0 };

export default function MemoDrawCanvas({ initial, onSave, onCancel }: Props) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>(initial ?? []);
  const [current, setCurrent] = useState<Stroke | null>(null);
  const [color, setColor] = useState(CRAYON[1]);
  const [tool, setTool] = useState<Tool>('pen');
  const drawing = useRef(false);

  function pt(e: React.PointerEvent): [number, number] {
    const r = surfaceRef.current!.getBoundingClientRect();
    return [
      Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
      Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)),
    ];
  }

  function down(e: React.PointerEvent) {
    if (tool === 'eraser') { eraseAt(pt(e)); drawing.current = true; return; }
    drawing.current = true;
    setCurrent({ color, width: TOOL_WIDTH[tool], points: [pt(e)] });
  }
  function move(e: React.PointerEvent) {
    if (!drawing.current) return;
    if (tool === 'eraser') { eraseAt(pt(e)); return; }
    setCurrent((c) => (c ? { ...c, points: [...c.points, pt(e)] } : c));
  }
  function up() {
    if (current && current.points.length > 1) setStrokes((s) => [...s, current]);
    setCurrent(null);
    drawing.current = false;
  }
  function eraseAt([x, y]: [number, number]) {
    setStrokes((s) => s.filter((st) => !st.points.some(([px, py]) => Math.hypot(px - x, py - y) < 0.04)));
  }

  const W = 360, H = 480;
  const toPts = (st: Stroke) => st.points.map(([x, y]) => `${x * W},${y * H}`).join(' ');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#FFFDF8', display: 'flex', flexDirection: 'column' }}>
      {/* 상단바 */}
      <div style={{ display: 'flex', alignItems: 'center', paddingTop: 'calc(14px + env(safe-area-inset-top, 0px))', paddingLeft: 14, paddingRight: 14, paddingBottom: 8, gap: 8 }}>
        <button onClick={onCancel} style={{ height: 36, padding: '0 14px', borderRadius: 9999, background: '#FFFCF7', border: 'none', boxShadow: '0 1px 2px rgba(74,46,22,0.05)', fontSize: 13, fontWeight: 700, color: '#7B5530', cursor: 'pointer' }}>취소</button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 800, color: '#2A1B0E' }}>그리기</div>
        <button onClick={() => onSave(strokes)} style={{ height: 36, padding: '0 16px', borderRadius: 9999, background: '#5C3A1F', color: '#FBF6EE', border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>완료</button>
      </div>

      {/* 캔버스 */}
      <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '0 16px 12px' }}>
        <div
          ref={surfaceRef}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}
          style={{ width: '100%', maxWidth: W, aspectRatio: `${W} / ${H}`, position: 'relative', borderRadius: 20, background: '#FFFEFB', boxShadow: 'inset 0 0 0 1px #EADFC7, 0 2px 10px rgba(74,46,22,0.06)', touchAction: 'none', cursor: 'crosshair', overflow: 'hidden' }}
        >
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }}>
            <defs><pattern id="md-dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#E3D6BC" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#md-dots)" />
          </svg>
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {strokes.map((st, i) => (
              <polyline key={i} points={toPts(st)} fill="none" stroke={st.color} strokeWidth={st.width} strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {current && <polyline points={toPts(current)} fill="none" stroke={current.color} strokeWidth={current.width} strokeLinecap="round" strokeLinejoin="round" />}
          </svg>
        </div>
      </div>

      {/* 도구 독 */}
      <div style={{ padding: '0 16px calc(20px + env(safe-area-inset-bottom,0px))' }}>
        {/* 색상 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
          {CRAYON.map((c) => {
            const on = c === color && tool !== 'eraser';
            return (
              <button key={c} onClick={() => { setColor(c); if (tool === 'eraser') setTool('pen'); }}
                style={{ width: on ? 34 : 28, height: on ? 34 : 28, borderRadius: 9999, background: c, border: 'none', cursor: 'pointer', boxShadow: on ? `0 0 0 3px #FFFDF8, 0 0 0 5px ${c}` : '0 2px 6px rgba(74,46,22,0.18)' }} />
            );
          })}
        </div>
        {/* 도구 */}
        <div style={{ background: '#FFFCF7', borderRadius: 9999, boxShadow: '0 8px 24px rgba(74,46,22,0.08)', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
          {([['pen', '펜'], ['marker', '마커'], ['eraser', '지우개']] as [Tool, string][]).map(([t, label]) => {
            const on = tool === t;
            return (
              <button key={t} onClick={() => setTool(t)} style={{ flex: 1, height: 42, borderRadius: 9999, border: 'none', cursor: 'pointer', background: on ? '#F4EBD9' : 'transparent', color: on ? '#5C3A1F' : '#8A7359', fontSize: 12.5, fontWeight: on ? 800 : 600 }}>{label}</button>
            );
          })}
          <div style={{ width: 1, height: 22, background: '#EADFC7', margin: '0 4px' }} />
          <button onClick={() => setStrokes((s) => s.slice(0, -1))} style={{ width: 42, height: 42, borderRadius: 9999, border: 'none', background: 'transparent', cursor: 'pointer', display: 'grid', placeItems: 'center' }} aria-label="실행취소">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A7359" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
