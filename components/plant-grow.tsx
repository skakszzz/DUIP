// components/plant-grow.tsx
// 홈 화분 카드용 — PlantArt(80종 SVG)를 감싸 단계 전환 시 성장 연출을 재생.
// 사용:
//   <PlantGrow plantId="monstera" stage={stage} size={214}
//              leavesIn={pts} leavesNeeded={need} onBloom={()=>setShowBloom(true)} />
// stage 값이 올라가면 자동으로 피어오름 + 파티클 연출이 1회 재생됩니다.
// 100% 완료(stage 5 도달) 순간엔 onBloom 콜백으로 BloomOverlay를 띄우세요.
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PlantArt, plantAccent } from './plant-art';

interface Props {
  plantId?: string;         // plants.ts의 Plant.id (예: 'monstera', 'lavender')
  stage: number;            // 1..5
  size?: number;
  leavesIn?: number;        // 이번 단계까지 모은 잎
  leavesNeeded?: number;    // 다음 단계까지 필요한 잎
  showRing?: boolean;       // 원형 진행링 표시 (기본 true)
  onStageUp?: (next: number) => void;
  onBloom?: () => void;     // stage가 5에 도달하는 순간
}

export function PlantGrow({
  plantId = 'lavender', stage, size = 214,
  leavesIn = 0, leavesNeeded = 20, showRing = true,
  onStageUp, onBloom,
}: Props) {
  const { leaf: leafColor, bloom: bloomColor } = plantAccent(plantId);

  const prev = useRef(stage);
  const [playId, setPlayId] = useState(0);
  const [fxTarget, setFxTarget] = useState(0);

  // 단계가 오르면 연출 1회 재생
  useEffect(() => {
    if (stage > prev.current) {
      setFxTarget(stage);
      setPlayId((p) => p + 1);
      onStageUp?.(stage);
      if (stage >= 5) setTimeout(() => onBloom?.(), 700);
      const t = setTimeout(() => setFxTarget(0), 1600);
      return () => clearTimeout(t);
    }
    prev.current = stage;
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const pct = stage >= 5 ? 1 : Math.min(1, leavesIn / Math.max(1, leavesNeeded));
  const ringSize = size + 36;
  const R = ringSize / 2 - 8;
  const Circ = 2 * Math.PI * R;
  const isBloom = fxTarget === 5;

  // 파티클 좌표 계산
  const count = isBloom ? 14 : fxTarget >= 3 ? 9 : 6;
  const palette = isBloom
    ? [bloomColor, '#FBE9BC', '#F2C66E', '#FFFFFF']
    : [leafColor, '#A6C480', '#FFFFFF'];
  const parts = Array.from({ length: count }).map((_, i) => {
    const ang = (Math.PI * 2 * i) / count + (playId % 7) * 0.3;
    const dist = (isBloom ? 78 : 52) + (i % 3) * 14;
    return {
      tx: Math.cos(ang) * dist,
      ty: Math.sin(ang) * dist - (isBloom ? 8 : 4),
      c: palette[i % palette.length],
      r: isBloom ? 7 + (i % 3) * 2 : 5 + (i % 2) * 2,
      rot: (i * 47) % 360,
      delay: (i % 4) * 40,
      bloom: isBloom,
    };
  });

  return (
    <div style={{ position: 'relative', width: ringSize, height: ringSize, margin: '0 auto' }}>
      <GrowKeyframes />

      {showRing && (
        <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}
             style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
          <circle cx={ringSize / 2} cy={ringSize / 2} r={R} stroke="rgba(255,255,255,0.6)" strokeWidth="6" fill="none" />
          <circle cx={ringSize / 2} cy={ringSize / 2} r={R} stroke={bloomColor} strokeWidth="6" fill="none"
                  strokeLinecap="round" strokeDasharray={Circ} strokeDashoffset={Circ * (1 - pct)}
                  style={{ transition: 'stroke-dashoffset 480ms cubic-bezier(.3,.9,.3,1)' }} />
        </svg>
      )}

      <div key={`${stage}-${playId}`}
           className={isBloom ? 'pg-bloom' : playId > 0 ? 'pg-rise' : undefined}
           style={{ position: 'absolute', inset: 18, transformOrigin: 'bottom center' }}>
        <PlantArt id={plantId} stage={Math.min(5, Math.max(1, stage))} size={size} />
      </div>

      {fxTarget > 0 && (
        <div key={playId} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}>
          <div className="pg-pulse" style={{
            position: 'absolute', left: '50%', top: '52%', transform: 'translate(-50%,-50%)',
            width: 60, height: 60, borderRadius: '50%',
            border: `2.5px solid ${isBloom ? bloomColor : leafColor}`,
          }} />
          {isBloom && (
            <div className="pg-rays" style={{
              position: 'absolute', left: '50%', top: '48%', transform: 'translate(-50%,-50%)',
              width: 260, height: 260, borderRadius: '50%',
              background: `conic-gradient(${bloomColor}00 0deg, ${bloomColor}33 14deg, ${bloomColor}00 28deg, ${bloomColor}00 90deg, ${bloomColor}2e 104deg, ${bloomColor}00 118deg, ${bloomColor}00 180deg, ${bloomColor}33 194deg, ${bloomColor}00 208deg, ${bloomColor}00 270deg, ${bloomColor}2e 284deg, ${bloomColor}00 298deg)`,
            }} />
          )}
          {parts.map((p, i) => (
            <div key={i} className="pg-part" style={{
              position: 'absolute', left: '50%', top: '48%',
              '--tx': `${p.tx}px`, '--ty': `${p.ty}px`, '--rot': `${p.rot}deg`,
              animationDelay: `${p.delay}ms`,
            } as React.CSSProperties}>
              {p.bloom
                ? <svg width={p.r * 2} height={p.r * 2} viewBox="0 0 14 14"><path d="M13 11C7 12 2 8 2 2 8 1 13 5 13 11Z" fill={p.c} /></svg>
                : <div style={{ width: p.r, height: p.r, borderRadius: '50%', background: p.c }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 키프레임 — styled-jsx 없이도 동작하도록 <style> 1회 주입.
function GrowKeyframes() {
  return (
    <style>{`
      .pg-rise{animation:pgRise 760ms cubic-bezier(.22,1.1,.32,1) both;}
      @keyframes pgRise{0%{transform:scale(.82) translateY(10px);opacity:.35;}55%{transform:scale(1.05);opacity:1;}100%{transform:scale(1);}}
      .pg-bloom{animation:pgBloom 1000ms cubic-bezier(.18,1.2,.3,1) both;}
      @keyframes pgBloom{0%{transform:scale(.7) translateY(14px) rotate(-3deg);opacity:.3;}45%{transform:scale(1.12) rotate(1.5deg);opacity:1;}70%{transform:scale(.97) rotate(-1deg);}100%{transform:scale(1) rotate(0);}}
      .pg-pulse{animation:pgPulse 900ms ease-out both;}
      @keyframes pgPulse{0%{transform:translate(-50%,-50%) scale(.3);opacity:.7;}100%{transform:translate(-50%,-50%) scale(3.4);opacity:0;}}
      .pg-rays{animation:pgRays 1500ms ease-out both;}
      @keyframes pgRays{0%{transform:translate(-50%,-50%) scale(.5) rotate(0);opacity:0;}30%{opacity:.9;}100%{transform:translate(-50%,-50%) scale(1.25) rotate(34deg);opacity:0;}}
      .pg-part{animation:pgPart 1100ms cubic-bezier(.2,.7,.3,1) both;}
      @keyframes pgPart{0%{transform:translate(-50%,-50%) scale(.2);opacity:0;}18%{opacity:1;transform:translate(calc(-50% + var(--tx)*.5),calc(-50% + var(--ty)*.5)) scale(1.1) rotate(calc(var(--rot)*.5));}100%{transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty) + 26px)) scale(.85) rotate(var(--rot));opacity:0;}}
      @media (prefers-reduced-motion: reduce){.pg-rise,.pg-bloom,.pg-pulse,.pg-rays,.pg-part{animation-duration:1ms!important;}}
    `}</style>
  );
}

export default PlantGrow;
