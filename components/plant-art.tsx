// components/plant-art.tsx
// 두잎 식물 80종 SVG 일러스트 엔진 — 8가지 성장 형태(아키타입) × 5단계.
// 홈 화면 표시/성장 연출에 사용. 동산은 업로드 이미지를 그대로 사용(별개).
//   <PlantArt id="monstera" stage={3} size={120} />   // id = plants.ts의 Plant.id
//
// 이 파일은 생성된 일러스트 코드라 타입 체크를 끕니다(@ts-nocheck).
/* eslint-disable */
// @ts-nocheck
import React from 'react';
import { PLANT_CATALOG } from '@/lib/data/plant-catalog';

const PC = {
  wood800: '#5C3A1F', wood900: '#34200E', stem: '#6E8A52', stemD: '#566E40',
  potLight: '#C9966B', potDark: '#8B5A36', potShadow: '#4A2A11',
};

// ── 화분 + 흙 ──────────────────────────────────────────────────
const ArtPot = () => (
  <g>
    <ellipse cx="60" cy="108" rx="36" ry="3.5" fill={PC.wood900} opacity=".14" />
    <path d="M28 78 H92 L86 102 Q85 106 81 106 H39 Q35 106 34 102 Z" fill={PC.potLight} />
    <path d="M28 78 H92 L90 84 H30 Z" fill={PC.potDark} opacity=".34" />
    <ellipse cx="60" cy="78" rx="32" ry="4.5" fill={PC.potDark} />
    <ellipse cx="60" cy="78" rx="28" ry="2.6" fill={PC.potShadow} opacity=".7" />
    <path d="M34 84 Q33 95 37 102" stroke="#fff" strokeOpacity=".32" strokeWidth="2.5" strokeLinecap="round" fill="none" />
  </g>
);
const ArtSoil = ({ seed = '#C9A86B' }) => (
  <g>
    <ellipse cx="60" cy="78" rx="26" ry="3" fill="#6B4A2A" />
    <path d="M36 78 Q60 70 84 78 Q72 76 60 75 Q48 76 36 78 Z" fill="#6B4A2A" />
    <ellipse cx="50" cy="76" rx="2" ry="1.1" fill="#54381E" />
    <ellipse cx="68" cy="77" rx="2.3" ry="1.1" fill="#54381E" />
    <ellipse cx="60" cy="73" rx="2.4" ry="1.7" fill={seed} />
  </g>
);

// ── leaf path helper (origin at base, points up) ───────────────
const leafD = (shape, len, w) => {
  switch (shape) {
    case 'pointed': return `M0 0 Q${-w} ${-len * .5} 0 ${-len} Q${w} ${-len * .5} 0 0 Z`;
    case 'round':   return `M0 0 Q${-w} ${-len * .6} 0 ${-len} Q${w} ${-len * .6} 0 0 Z`;
    case 'spoon':   return `M0 0 Q${-w * .6} ${-len * .5} ${-w * .5} ${-len * .8} Q0 ${-len} ${w * .5} ${-len * .8} Q${w * .6} ${-len * .5} 0 0 Z`;
    default:        return `M0 0 Q${-w} ${-len * .55} 0 ${-len} Q${w} ${-len * .55} 0 0 Z`;
  }
};

const STG = { 2: 0, 3: 1, 4: 2, 5: 3 }; // growth index

// ════════════ ROSETTE (다육 로제트 / 제비꽃 / 에어플랜트) ════════
function Rosette(cat, stage) {
  const g = STG[stage];
  const cx = 60, cy = 66;
  // pebble (문스톤) — fat egg-shaped plump leaves clustered, few
  if (cat.shape === 'pebble') {
    const n = [3, 5, 8, 11][g];
    const R = [7, 10, 13, 15][g];
    const els = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (i % 2) * .4;
      const rr = i < n - 2 ? R : R * .5;
      const x = cx + Math.cos(a) * rr * .7, y = 70 + Math.sin(a) * rr * .5;
      const col = i % 2 === 0 ? cat.leaf : cat.leaf2;
      els.push(<g key={i}><ellipse cx={x} cy={y} rx={R * .5} ry={R * .62} fill={col} transform={`rotate(${Math.cos(a) * 16} ${x} ${y})`} /><ellipse cx={x - R * .12} cy={y - R * .2} rx={R * .18} ry={R * .26} fill="#fff" opacity=".28" /><ellipse cx={x} cy={y + R * .42} rx={R * .26} ry={R * .14} fill={cat.tip} opacity=".5" /></g>);
    }
    return <g>{els}</g>;
  }
  const counts = [3, 6, 10, 13][g];
  const R = [9, 14, 19, 23][g];
  const w = cat.shape === 'pointed' ? 4 : cat.shape === 'spoon' ? 5.5 : 6;
  const els = [];
  // outer ring
  for (let i = 0; i < counts; i++) {
    const ang = (i / counts) * 360;
    const c = i % 2 === 0 ? cat.leaf : (cat.leaf2 || cat.leaf);
    els.push(
      <g key={`o${i}`} transform={`translate(${cx} ${cy}) rotate(${ang})`}>
        <path d={leafD(cat.shape, R, w)} fill={c} />
        {cat.tip && <circle cx="0" cy={-R + 2} r="2.4" fill={cat.tip} />}
        {cat.curl && <circle cx={w * .3} cy={-R} r="1.4" fill={c} />}
      </g>
    );
  }
  // inner ring (stage 4+)
  if (g >= 2) {
    const n2 = Math.round(counts * .6);
    for (let i = 0; i < n2; i++) {
      const ang = (i / n2) * 360 + 20;
      els.push(
        <g key={`i${i}`} transform={`translate(${cx} ${cy}) rotate(${ang})`}>
          <path d={leafD(cat.shape, R * .6, w * .8)} fill={cat.leaf2 || cat.leaf} />
        </g>
      );
    }
  }
  // center
  els.push(<circle key="c" cx={cx} cy={cy} r={R * .26} fill={cat.center || cat.tip || cat.leaf2 || cat.leaf} />);
  if (cat.center && g >= 2) {
    // small flowers in center (african-violet)
    [[-3, -2], [3, -2], [0, -4], [0, 1]].forEach((p, i) =>
      els.push(<circle key={`f${i}`} cx={cx + p[0]} cy={cy + p[1]} r="2.2" fill={cat.center} />));
    els.push(<circle key="fc" cx={cx} cy={cy - 1} r="1.3" fill="#F2C66E" />);
  }
  return <g>{els}</g>;
}

// ════════════ TRAILING (덩굴 / 구슬다육 / 마디선인장) ═══════════
function Trailing(cat, stage) {
  const g = STG[stage];
  const strands = [2, 3, 4, 5][g];
  const len = [22, 34, 46, 58][g];
  const seg = cat.bead === 'segjag' || cat.bead === 'seground';
  const els = [];
  // small crown mound on soil
  els.push(<ellipse key="cr" cx="60" cy="74" rx={6 + g * 2} ry="4" fill={cat.leaf} />);
  for (let s = 0; s < strands; s++) {
    const t = strands === 1 ? .5 : s / (strands - 1);
    const x0 = 44 + t * 32;
    const sway = (s % 2 ? 1 : -1) * (4 + g);
    const yEnd = 74 + len;
    if (seg) {
      // flat segmented cactus stem: chain of pads end to end
      const pads = 2 + g;
      let px = x0, py = 74;
      for (let p = 0; p < pads; p++) {
        const ny = 74 + len * ((p + 1) / pads);
        const nx = x0 + sway * ((p + 1) / pads);
        const mx = (px + nx) / 2, my = (py + ny) / 2;
        const ang = Math.atan2(ny - py, nx - px) * 180 / Math.PI - 90;
        els.push(<g key={`p${s}-${p}`} transform={`translate(${mx} ${my}) rotate(${ang})`}>{SegPad(cat.bead, p % 2 ? cat.leaf2 : cat.leaf)}</g>);
        px = nx; py = ny;
      }
      if (cat.tipBloom && g >= 2) els.push(<g key={`tb${s}`}>{CactusFlower(cat.bead, px, py, cat.tipBloom, cat.droop)}</g>);
      continue;
    }
    const path = `M${x0} 74 Q${x0 + sway} ${74 + len * .5} ${x0 + sway * .4} ${yEnd}`;
    els.push(<path key={`s${s}`} d={path} stroke={cat.leaf2 || cat.leaf} strokeWidth="1.4" fill="none" opacity=".7" />);
    const beads = 3 + g;
    for (let b = 1; b <= beads; b++) {
      const bt = b / (beads + 1);
      const bx = x0 + sway * bt;
      const by = 74 + len * bt;
      const col = b % 2 === 0 ? cat.leaf : (cat.leaf2 || cat.leaf);
      els.push(<TrailBead key={`b${s}-${b}`} shape={cat.bead} x={bx} y={by} c={col} cat={cat} />);
    }
  }
  return <g>{els}</g>;
}
// flat segment pad for christmas/easter cactus
const SegPad = (kind, c) => kind === 'segjag'
  ? <path d="M0 -5 L2.4 -2 L4 1 L2.6 4 L0 5.5 L-2.6 4 L-4 1 L-2.4 -2 Z" fill={c} />  // jagged
  : <path d="M0 -5 Q4 -3 4 1 Q4 4 0 5.5 Q-4 4 -4 1 Q-4 -3 0 -5 Z" fill={c} />;        // scalloped/round
const CactusFlower = (kind, x, y, c, droop) => {
  if (droop) { // christmas — tubular drooping fuchsia
    return <g><path d={`M${x} ${y} q-3 4 -1.5 8 q1.5 -3 1.5 -8`} fill={c} /><path d={`M${x} ${y} q3 4 1.5 8 q-1.5 -3 -1.5 -8`} fill={c} opacity=".85" /><circle cx={x} cy={y + 8} r="1.4" fill="#F0E0B0" /></g>;
  }
  // easter — sharply pointed star blossom
  const els = [];
  for (let j = 0; j < 7; j++) { const a = j / 7 * Math.PI * 2 - Math.PI / 2; const tx = x + Math.cos(a) * 6, ty = y + Math.sin(a) * 6; els.push(<path key={j} d={`M${x} ${y} L${tx - Math.cos(a + .25) * 1.6} ${ty - Math.sin(a + .25) * 1.6} L${tx} ${ty} L${tx - Math.cos(a - .25) * 1.6} ${ty - Math.sin(a - .25) * 1.6} Z`} fill={c} />); }
  els.push(<circle key="c" cx={x} cy={y} r="1.8" fill="#F0E0B0" />);
  return <g>{els}</g>;
};
const TrailBead = ({ shape, x, y, c, cat }) => {
  switch (shape) {
    case 'pearl': return <g><circle cx={x} cy={y} r="3" fill={c} /><circle cx={x - 1} cy={y - 1} r="1" fill="#fff" opacity=".4" /></g>;
    case 'teardrop': return <path d={`M${x} ${y - 3.4} q-2.6 2 -2.6 4 q0 2 2.6 2 q2.6 0 2.6 -2 q0 -2 -2.6 -4Z`} fill={c} />;
    case 'banana': return <path d={`M${x - 3.4} ${y} Q${x} ${y - 5.5} ${x + 3.4} ${y} Q${x} ${y - 2} ${x - 3.4} ${y}Z`} fill={c} />;
    case 'heart': return <g><path d={`M${x} ${y + 2} C${x - 3} ${y - 1} ${x - 3} ${y - 3} ${x} ${y - 1.5} C${x + 3} ${y - 3} ${x + 3} ${y - 1} ${x} ${y + 2}Z`} fill={c} />{cat.veined && <path d={`M${x} ${y - 1.4} L${x - 1.5} ${y + .6} M${x} ${y - 1.4} L${x + 1.5} ${y + .6}`} stroke="#DDE6DF" strokeWidth=".7" fill="none" />}</g>;
    case 'ivy': return <g><path d={`M${x} ${y + 3} L${x - 4} ${y + .5} L${x - 4.5} ${y - 3} L${x - 1.6} ${y - 1.6} L${x} ${y - 4.5} L${x + 1.6} ${y - 1.6} L${x + 4.5} ${y - 3} L${x + 4} ${y + .5} Z`} fill={c} />{cat.veined && <path d={`M${x} ${y + 2} L${x} ${y - 3} M${x} ${y - 1} L${x - 3} ${y - 2} M${x} ${y - 1} L${x + 3} ${y - 2}`} stroke="#C7DBC0" strokeWidth=".6" />}</g>;
    case 'hoya': return <g><ellipse cx={x - 2.6} cy={y} rx="3.4" ry="2.3" fill={c} transform={`rotate(-18 ${x - 2.6} ${y})`} /><ellipse cx={x + 2.6} cy={y} rx="3.4" ry="2.3" fill={cat.leaf2} transform={`rotate(18 ${x + 2.6} ${y})`} /></g>;
    case 'oval': return <g><ellipse cx={x} cy={y} rx="3.4" ry="2.3" fill={c} transform={`rotate(20 ${x} ${y})`} />{cat.stripe && <path d={`M${x - 2.6} ${y + .6} Q${x} ${y - 2} ${x + 2.6} ${y - .6}`} stroke={cat.stripe} strokeWidth=".8" fill="none" />}</g>;
    default: return <circle cx={x} cy={y} r="2.6" fill={c} />;
  }
};

// ════════════ LEAFY (관엽 / 허브 / 줄기식물) ═══════════════════
function Leafy(cat, stage) {
  const g = STG[stage];
  // special: upright blades — sword/strap/snake/dracaena
  if (cat.leaf === 'sword' || cat.leaf === 'strap' || cat.leaf === 'snake' || cat.leaf === 'dracaena') {
    const snake = cat.leaf === 'snake';
    const drac = cat.leaf === 'dracaena';
    const blades = snake ? [3, 4, 6, 7][g] : [3, 5, 7, 8][g];
    const h = [22, 34, 46, 56][g];
    const thick = snake ? 4 : drac ? 2 : 2.6;
    const els = [];
    if (drac) els.push(<line key="trunk" x1="60" y1="78" x2="60" y2={78 - h * .5} stroke="#7B5A38" strokeWidth="2.4" strokeLinecap="round" />);
    for (let i = 0; i < blades; i++) {
      const t = blades === 1 ? .5 : i / (blades - 1);
      const x = 60 + (t - .5) * (snake ? 8 + g * 4 : 10 + g * 6);
      const baseY = drac ? 78 - h * .5 : 78;
      const tilt = (t - .5) * (drac ? 60 : cat.arch ? 34 : snake ? 8 : 12);
      const len = (drac ? h * .6 : h) * (1 - Math.abs(t - .5) * (drac ? .2 : .5));
      const col = i % 2 === 0 ? cat.color : cat.color2;
      els.push(
        <g key={i} transform={`translate(${x} ${baseY}) rotate(${tilt})`}>
          <path d={`M0 0 Q${-thick} ${-len * .5} 0 ${-len} Q${thick} ${-len * .5} 0 0Z`} fill={snake ? cat.color : col} />
          {snake && <path d={`M0 0 Q${-thick + .8} ${-len * .5} 0 ${-len} Q${thick - .8} ${-len * .5} 0 0Z`} fill={cat.color2} opacity=".45" />}
          {snake && [0.25, 0.45, 0.65, 0.85].map((b, j) => <path key={j} d={`M${-thick + 1} ${-len * b} Q0 ${-len * b - 1.5} ${thick - 1} ${-len * b}`} stroke={cat.color} strokeWidth="1.4" fill="none" opacity=".8" />)}
          {snake && <path d={`M0 0 Q-${thick} ${-len * .5} 0 ${-len}`} stroke="#D9C06A" strokeWidth="1" fill="none" />}
          {drac && [0.4, 0.7].map((b, j) => <path key={j} d={`M0 ${-len * b}`} />)}
        </g>
      );
    }
    if (drac) { // top tuft hint
      els.push(<circle key="tuft" cx="60" cy={78 - h * .5} r="2" fill={cat.color2} />);
    }
    return <g>{els}</g>;
  }
  // special: zz-plant — upright arching stems with paired oval leaflets
  if (cat.leaf === 'zz') {
    const stems = [2, 3, 4, 5][g];
    const h = [22, 34, 46, 56][g];
    const els = [];
    for (let i = 0; i < stems; i++) {
      const t = stems === 1 ? .5 : i / (stems - 1);
      const bend = (t - .5) * (18 + g * 4);
      const tipX = 60 + bend, tipY = 78 - h * (1 - Math.abs(t - .5) * .25);
      const midX = 60 + bend * .4, midY = 78 - h * .5;
      els.push(<path key={`st${i}`} d={`M60 78 Q${midX} ${midY} ${tipX} ${tipY}`} stroke="#3E6B3E" strokeWidth="1.8" fill="none" strokeLinecap="round" />);
      const pairs = 4;
      for (let p = 1; p <= pairs; p++) {
        const pt = p / (pairs + 0.5);
        const lx = 60 + bend * pt * .9, ly = 78 - (78 - tipY) * pt;
        const col = p % 2 ? cat.color : cat.color2;
        els.push(<ellipse key={`l${i}-${p}-a`} cx={lx - 3.5} cy={ly} rx="3.6" ry="2.2" fill={col} transform={`rotate(-28 ${lx - 3.5} ${ly})`} />);
        els.push(<ellipse key={`l${i}-${p}-b`} cx={lx + 3.5} cy={ly} rx="3.6" ry="2.2" fill={col} transform={`rotate(28 ${lx + 3.5} ${ly})`} />);
      }
      els.push(<ellipse key={`tip${i}`} cx={tipX} cy={tipY} rx="3.2" ry="2" fill={cat.color} transform={`rotate(${bend} ${tipX} ${tipY})`} />);
    }
    return <g>{els}</g>;
  }
  // special: bamboo (행운죽)
  if (cat.leaf === 'bamboo') {
    const stalks = [1, 2, 3, 4][g];
    const els = [];
    for (let i = 0; i < stalks; i++) {
      const t = stalks === 1 ? .5 : i / (stalks - 1);
      const x = 60 + (t - .5) * (8 + g * 6);
      const top = [60, 50, 42, 34][g];
      els.push(<line key={`st${i}`} x1={x} y1="78" x2={x} y2={top} stroke={cat.color} strokeWidth="3.2" strokeLinecap="round" />);
      [0.66, 0.4].forEach((n, j) => els.push(<line key={`nd${i}-${j}`} x1={x - 1.6} y1={78 - (78 - top) * n} x2={x + 1.6} y2={78 - (78 - top) * n} stroke={cat.color2} strokeWidth="1.2" />));
      [[-4, -3], [4, -3], [0, -6]].forEach((p, j) => els.push(<path key={`lf${i}-${j}`} d={leafD('pointed', 9, 2.4)} transform={`translate(${x + p[0]} ${top + p[1]}) rotate(${p[0] * 5})`} fill={cat.color2} />));
    }
    return <g>{els}</g>;
  }
  // special: feather (palm) — fronds
  if (cat.leaf === 'feather') {
    const fronds = [3, 4, 6, 7][g];
    const len = [20, 30, 40, 48][g];
    const els = [];
    for (let i = 0; i < fronds; i++) {
      const t = fronds === 1 ? .5 : i / (fronds - 1);
      const ang = (t - .5) * 120;
      els.push(
        <g key={i} transform={`translate(60 76) rotate(${ang})`}>
          <line x1="0" y1="0" x2="0" y2={-len} stroke={cat.color} strokeWidth="1.4" />
          {Array.from({ length: 6 }).map((_, j) => {
            const ly = -len * (0.3 + j * 0.11);
            return <g key={j}><line x1="0" y1={ly} x2="-5" y2={ly - 3} stroke={cat.color2} strokeWidth="1.2" strokeLinecap="round" /><line x1="0" y1={ly} x2="5" y2={ly - 3} stroke={cat.color2} strokeWidth="1.2" strokeLinecap="round" /></g>;
          })}
        </g>
      );
    }
    return <g>{els}</g>;
  }
  // special: needle (로즈마리) / tiny mat (타임/오레가노)
  if (cat.leaf === 'needle') {
    const stems = [2, 3, 5, 6][g]; const h = [20, 30, 40, 48][g]; const els = [];
    for (let i = 0; i < stems; i++) {
      const t = stems === 1 ? .5 : i / (stems - 1); const x = 60 + (t - .5) * (10 + g * 6); const tilt = (t - .5) * 30;
      els.push(<g key={i} transform={`translate(${x} 78) rotate(${tilt})`}>
        <line x1="0" y1="0" x2="0" y2={-h} stroke={cat.color2} strokeWidth="1.4" />
        {Array.from({ length: Math.round(h / 4) }).map((_, j) => <g key={j}><line x1="0" y1={-6 - j * 4} x2="-3.5" y2={-9 - j * 4} stroke={cat.color} strokeWidth="1" strokeLinecap="round" /><line x1="0" y1={-6 - j * 4} x2="3.5" y2={-9 - j * 4} stroke={cat.color} strokeWidth="1" strokeLinecap="round" /></g>)}
      </g>);
    }
    return <g>{els}</g>;
  }
  // default leafy: central stem(s) + leaf pairs
  const top = cat.mat ? 72 : [64, 54, 44, 34][g];
  const pairs = [2, 3, 4, 5][g];
  const leafLen = (cat.big ? 16 : cat.tiny ? 7 : 11) + g * (cat.big ? 3 : 1.2);
  const els = [];
  if (!cat.mat) els.push(<line key="stem" x1="60" y1="78" x2="60" y2={top} stroke={cat.woody ? '#7B5A38' : PC.stem} strokeWidth={cat.big ? 2.6 : 2} strokeLinecap="round" />);
  for (let i = 0; i < pairs; i++) {
    const ly = cat.mat ? 76 : 78 - ((78 - top) * (i + .6) / pairs);
    const spread = cat.mat ? (i - pairs / 2) * 7 : 0;
    const baseX = cat.mat ? 60 + spread : 60;
    const dir = cat.bushy || cat.mat ? [-1, 1] : [(i % 2 ? 1 : -1)];
    dir.forEach((d, k) => {
      const ang = d * (cat.mat ? 60 : 48) + (cat.bushy ? (k ? 6 : -6) : 0);
      const col = (i + k) % 2 === 0 ? cat.color : cat.color2;
      els.push(
        <g key={`l${i}-${k}`} transform={`translate(${baseX} ${ly}) rotate(${ang})`}>
          {LeafShape(cat.leaf, leafLen, col, cat)}
        </g>
      );
    });
    // top extra for bushy
    if (cat.bushy && i === pairs - 1) els.push(<g key={`lt${i}`} transform={`translate(60 ${top + 2})`}>{LeafShape(cat.leaf, leafLen * .9, cat.color, cat)}</g>);
  }
  // crowning leaf
  if (!cat.mat && !cat.bushy) els.push(<g key="crown" transform={`translate(60 ${top})`}>{LeafShape(cat.leaf, leafLen, cat.color, cat)}</g>);
  // bloom additions
  if (cat.bract && g >= 2) els.push(<g key="bract"><path d={`M66 ${top + 4} C72 ${top} 73 ${top + 6} 67 ${top + 9} C63 ${top + 7} 62 ${top + 2} 66 ${top + 4}Z`} fill={cat.bract} /><line x1="68" y1={top + 4} x2="69" y2={top - 2} stroke="#F2D98C" strokeWidth="1.4" /></g>);
  if (cat.spathe && g >= 3) els.push(<g key="spathe"><path d={`M62 ${top + 2} Q58 ${top - 8} 64 ${top - 10} Q70 ${top - 6} 66 ${top + 3}Z`} fill={cat.spathe} /><line x1="64" y1={top - 8} x2="64.5" y2={top - 2} stroke="#E8D08C" strokeWidth="1.6" /></g>);
  if (cat.bloom && g >= 2) {
    [[-4, -2], [4, -2], [0, -5], [-2, 0], [2, 0]].forEach((p, i) => els.push(<circle key={`bl${i}`} cx={60 + p[0]} cy={top + p[1]} r="2.4" fill={cat.bloom} />));
  }
  return <g>{els}</g>;
}

// leaf shapes for Leafy
function LeafShape(shape, len, c, cat) {
  const w = len * .55;
  switch (shape) {
    case 'heart': return <path d={`M0 0 C${-w} ${-len * .4} ${-w} ${-len} 0 ${-len * .85} C${w} ${-len} ${w} ${-len * .4} 0 0Z`} fill={c} />;
    case 'split': return <g><path d={`M0 0 Q${-w} ${-len * .5} 0 ${-len} Q${w} ${-len * .5} 0 0Z`} fill={c} /><path d={`M-2 ${-len * .3} L-${w * .6} ${-len * .35} M-2 ${-len * .55} L-${w * .55} ${-len * .6} M2 ${-len * .45} L${w * .6} ${-len * .5}`} stroke="#FBF6EE" strokeWidth="1.4" strokeLinecap="round" /></g>;
    case 'monstera': {
      // heart-shaped leaf with split edges + fenestration holes
      const lobe = (sx) => `M0 ${-len * .12} Q${sx * w} ${-len * .1} ${sx * w * .9} ${-len * .42} L${sx * w * .45} ${-len * .4} L${sx * w * .78} ${-len * .66} L${sx * w * .4} ${-len * .64} L${sx * w * .6} ${-len * .9} L0 ${-len * .82}Z`;
      return <g>
        <path d={`M0 0 C${-w} ${-len * .35} ${-w * .9} ${-len * .92} 0 ${-len} C${w * .9} ${-len * .92} ${w} ${-len * .35} 0 0Z`} fill={c} />
        <path d={lobe(-1)} fill="#FBF6EE" opacity=".9" />
        <path d={lobe(1)} fill="#FBF6EE" opacity=".9" />
        <ellipse cx={-w * .32} cy={-len * .52} rx={w * .12} ry={len * .07} fill="#FBF6EE" opacity=".9" />
        <ellipse cx={w * .32} cy={-len * .58} rx={w * .12} ry={len * .07} fill="#FBF6EE" opacity=".9" />
        <line x1="0" y1={-len * .05} x2="0" y2={-len * .9} stroke={c} strokeWidth="1" opacity=".5" />
      </g>;
    }
    case 'violin': return <path d={`M0 0 Q${-w * .7} ${-len * .3} ${-w * .5} ${-len * .55} Q${-w} ${-len * .8} 0 ${-len} Q${w} ${-len * .8} ${w * .5} ${-len * .55} Q${w * .7} ${-len * .3} 0 0Z`} fill={c} />;
    case 'oval': return <ellipse cx="0" cy={-len / 2} rx={w * .8} ry={len / 2} fill={c} />;
    case 'round': return <ellipse cx="0" cy={-len / 2} rx={w} ry={len / 2} fill={c} />;
    case 'toothed': return <path d={`M0 0 Q${-w} ${-len * .5} 0 ${-len} Q${w} ${-len * .5} 0 0Z`} fill={c} stroke={c} strokeWidth=".5" />;
    case 'scallop': return <path d={`M0 0 Q${-w} ${-len * .4} ${-w * .5} ${-len * .8} Q0 ${-len} ${w * .5} ${-len * .8} Q${w} ${-len * .4} 0 0Z`} fill={c} />;
    case 'lance': return <path d={`M0 0 Q${-w * .6} ${-len * .5} 0 ${-len} Q${w * .6} ${-len * .5} 0 0Z`} fill={c} />;
    case 'oblong': return <ellipse cx="0" cy={-len / 2} rx={w * .7} ry={len / 2} fill={c} />;
    case 'strap': return <path d={`M0 0 Q-2 ${-len * .5} 0 ${-len} Q2 ${-len * .5} 0 0Z`} fill={c} />;
    case 'curl': return <g><path d={`M0 0 Q${-w} ${-len * .5} 0 ${-len} Q${w} ${-len * .5} 0 0Z`} fill={c} /><path d={`M0 ${-len * .3} Q${-w * .4} ${-len * .5} 0 ${-len * .7}`} stroke={c} strokeWidth="1.6" fill="none" /></g>;
    case 'lobe': return <path d={`M0 0 Q${-w} ${-len * .3} ${-w * .5} ${-len * .6} Q${-w} ${-len * .8} 0 ${-len} Q${w} ${-len * .8} ${w * .5} ${-len * .6} Q${w} ${-len * .3} 0 0Z`} fill={c} />;
    case 'wing': return <path d={`M0 0 C${-w * 1.2} ${-len * .3} ${-w} ${-len} 2 ${-len * .9} C${w} ${-len} ${w * .7} ${-len * .3} 0 0Z`} fill={c} />;
    case 'tiny': return <ellipse cx="0" cy={-len / 2} rx={w} ry={len / 2} fill={c} />;
    default: return <ellipse cx="0" cy={-len / 2} rx={w * .8} ry={len / 2} fill={c} />;
  }
}

// ════════════ STALK (꽃대 식물) ════════════════════════════════
function Stalk(cat, stage) {
  const g = STG[stage];
  const els = [];
  // base leaves
  const bl = [2, 3, 4, 4][g];
  for (let i = 0; i < bl; i++) {
    const d = i % 2 ? 1 : -1; const ang = d * 46 + (i > 1 ? d * 12 : 0);
    els.push(<g key={`bl${i}`} transform={`translate(60 78) rotate(${ang})`}><path d={leafD('pointed', 14 + g, 4)} fill={cat.leaf} /></g>);
  }
  if (g === 0) return <g>{els}</g>; // sprout = just leaves
  const stalkTop = cat.low ? 64 : [62, 50, 38, 30][g];
  const stalks = cat.multi ? [1, 2, 3, 3][g] : 1;
  for (let s = 0; s < stalks; s++) {
    const sx = 60 + (stalks > 1 ? (s - (stalks - 1) / 2) * 12 : 0);
    const top = stalkTop + (s ? 6 : 0);
    if (!cat.low) els.push(<line key={`sk${s}`} x1="60" y1="76" x2={sx} y2={top} stroke={PC.stem} strokeWidth="1.8" strokeLinecap="round" />);
    const budOnly = g === 1; // young = bud
    els.push(<g key={`bloom${s}`}>{Bloom(cat, sx, top, budOnly, g)}</g>);
  }
  return <g>{els}</g>;
}
function Bloom(cat, x, y, bud, g) {
  const C = cat.bcolor, C2 = cat.bcolor2 || cat.bcolor;
  if (bud) return <ellipse cx={x} cy={y} rx="3.5" ry="5" fill={C} transform={`rotate(8 ${x} ${y})`} />;
  switch (cat.bloom) {
    case 'spike': {
      const els = [<line key="s" x1={x} y1={y} x2={x} y2={y - 20} stroke={cat.leaf} strokeWidth="1.4" />];
      for (let j = 0; j < 6; j++) els.push(<circle key={j} cx={x + (j % 2 ? 1.8 : -1.8)} cy={y - 2 - j * 3.2} r="2.6" fill={j % 2 ? C2 : C} />);
      els.push(<circle key="t" cx={x} cy={y - 21} r="2" fill={C} />);
      return <g>{els}</g>;
    }
    case 'cup': return <path d={`M${x - 6} ${y - 6} Q${x - 6} ${y - 18} ${x} ${y - 18} Q${x + 6} ${y - 18} ${x + 6} ${y - 6} Q${x} ${y} ${x - 6} ${y - 6}Z`} fill={C} stroke={C2} strokeWidth=".6" />;
    case 'layered': {
      const els = [<circle key="o" cx={x} cy={y - 9} r="9" fill={C} />];
      [[-3, -2, 5], [3, -1, 4], [-1, 3, 4], [0, -3, 3.5]].forEach((p, i) => els.push(<circle key={i} cx={x + p[0]} cy={y - 9 + p[1]} r={p[2]} fill={C2} opacity={.85} />));
      els.push(<circle key="c" cx={x} cy={y - 9} r="2.4" fill={C} />);
      return <g>{els}</g>;
    }
    case 'ruffle': {
      const els = [];
      for (let j = 0; j < 12; j++) { const a = (j / 12) * Math.PI * 2; els.push(<ellipse key={j} cx={x + Math.cos(a) * 7} cy={y - 9 + Math.sin(a) * 7} rx="4" ry="2.6" transform={`rotate(${a * 57 + 90} ${x + Math.cos(a) * 7} ${y - 9 + Math.sin(a) * 7})`} fill={j % 2 ? C : C2} />); }
      els.push(<circle key="c" cx={x} cy={y - 9} r="5" fill={C} />);
      return <g>{els}</g>;
    }
    case 'ray': {
      const els = []; const n = cat.small ? 8 : 11;
      for (let j = 0; j < n; j++) { const a = (j / n) * Math.PI * 2; const cx2 = x + Math.cos(a) * 8, cy2 = y - 8 + Math.sin(a) * 8; els.push(<ellipse key={j} cx={cx2} cy={cy2} rx="4.5" ry="2.3" transform={`rotate(${a * 57 + 90} ${cx2} ${cy2})`} fill={C} />); }
      els.push(<circle key="c" cx={x} cy={y - 8} r={cat.small ? 3 : 4.5} fill={C2} />);
      return <g>{els}</g>;
    }
    case 'trumpet': {
      const els = [<line key="s" x1={x} y1={y} x2={x + 6} y2={y - 16} stroke={cat.leaf} strokeWidth="1.4" />];
      [0, 1, 2, 3].forEach(j => { const tx = x + 2 + j * 2, ty = y - 4 - j * 4; els.push(<path key={j} d={`M${tx} ${ty} q-3 -3 0 -5 q3 2 0 5Z`} fill={j % 2 ? C2 : C} />); });
      return <g>{els}</g>;
    }
    case 'bell': {
      const els = [<path key="s" d={`M${x} ${y} Q${x + 8} ${y - 10} ${x + 6} ${y - 20}`} stroke={cat.leaf} strokeWidth="1.4" fill="none" />];
      [0, 1, 2, 3].forEach(j => { const bx = x + 6 - j * 1.5, by = y - 6 - j * 3.6; els.push(<path key={j} d={`M${bx - 2.4} ${by} a2.4 2.4 0 0 0 4.8 0 q-2.4 3 -2.4 0Z`} fill={C} />); });
      return <g>{els}</g>;
    }
    case 'upswept': return <g><path d={`M${x} ${y - 6} Q${x - 5} ${y - 16} ${x - 2} ${y - 18}`} stroke={C} strokeWidth="3.2" strokeLinecap="round" fill="none" /><path d={`M${x} ${y - 6} Q${x + 5} ${y - 16} ${x + 2} ${y - 18}`} stroke={C2} strokeWidth="3.2" strokeLinecap="round" fill="none" /><circle cx={x} cy={y - 6} r="2" fill={C2} /></g>;
    case 'radial': {
      const els = [<circle key="o" cx={x} cy={y - 9} r="9" fill={C2} />];
      for (let j = 0; j < 16; j++) { const a = (j / 16) * Math.PI * 2; els.push(<line key={j} x1={x} y1={y - 9} x2={x + Math.cos(a) * 9} y2={y - 9 + Math.sin(a) * 9} stroke={C} strokeWidth="1.2" />); }
      els.push(<circle key="c" cx={x} cy={y - 9} r="3.5" fill={C} />);
      return <g>{els}</g>;
    }
    default: return <circle cx={x} cy={y - 8} r="7" fill={C} />;
  }
}

// ════════════ WOODY (꽃나무: 매화·동백·개나리 등) ═══════════════
function Woody(cat, stage) {
  const g = STG[stage];
  const els = [];
  const h = [16, 28, 40, 50][g];
  // forsythia bush — many arching stems from the base
  if (cat.bush) {
    const stems = [3, 4, 6, 7][g];
    for (let i = 0; i < stems; i++) {
      const t = stems === 1 ? .5 : i / (stems - 1);
      const dir = (t - .5);
      const tipX = 60 + dir * (28 + g * 6);
      const tipY = 78 - h * (1 - Math.abs(dir) * .4);
      const cx = 60 + dir * 10, cy = 78 - h * .7;
      els.push(<path key={`st${i}`} d={`M60 78 Q${cx} ${cy} ${tipX} ${tipY}`} stroke="#7B5A38" strokeWidth="1.8" fill="none" strokeLinecap="round" />);
      if (g <= 1) { els.push(<path key={`lf${i}`} d={leafD('pointed', 7, 2.2)} transform={`translate(${tipX} ${tipY})`} fill={cat.leaf} />); }
      else { // yellow flowers along the stem
        const n = 3 + g;
        for (let b = 1; b <= n; b++) { const bt = b / (n + 1); const bx = 60 + (tipX - 60) * bt, by = 78 + (tipY - 78) * bt; els.push(<g key={`fl${i}-${b}`}>{Blossom(cat, bx, by, g)}</g>); }
      }
    }
    return <g>{els}</g>;
  }
  // trunk + branches
  els.push(<path key="tr" d={`M58 78 Q57 ${78 - h * .6} 60 ${78 - h}`} stroke="#7B5A38" strokeWidth="3" fill="none" strokeLinecap="round" />);
  const branches = g === 0 ? [] : cat.arch
    ? [[60, 78 - h * .5, 40, 78 - h * .8], [60, 78 - h * .6, 80, 78 - h * .9]]
    : [[59, 78 - h * .55, 46, 78 - h * .85], [60, 78 - h * .7, 74, 78 - h], [60, 78 - h, 60, 78 - h - 8]];
  branches.forEach((b, i) => els.push(<path key={`b${i}`} d={`M${b[0]} ${b[1]} Q${(b[0] + b[2]) / 2} ${b[1] - 4} ${b[2]} ${b[3]}`} stroke="#7B5A38" strokeWidth="2" fill="none" strokeLinecap="round" />));
  // sparse leaves
  const tips = g === 0 ? [[60, 78 - h]] : cat.arch ? [[40, 78 - h * .8], [80, 78 - h * .9], [60, 78 - h - 8]] : [[46, 78 - h * .85], [74, 78 - h], [60, 78 - h - 8], [58, 78 - h * .55]];
  if (g <= 1) tips.forEach((t, i) => els.push(<path key={`lf${i}`} d={leafD('pointed', 8, 2.6)} transform={`translate(${t[0]} ${t[1]})`} fill={cat.leaf} />));
  // lush evergreen leaves at every stage (camellia) — glossy dark ovals around branch tips
  if (cat.lush && g >= 2) tips.forEach((t, i) => [-7, 7, 0].forEach((dx, j) => els.push(<ellipse key={`ll${i}-${j}`} cx={t[0] + dx} cy={t[1] + 5} rx="3" ry="5" fill={cat.leaf} transform={`rotate(${dx * 3} ${t[0] + dx} ${t[1] + 5})`} />)));
  // blossoms (stage 4+)
  if (g >= 2) tips.forEach((t, i) => els.push(<g key={`bl${i}`}>{Blossom(cat, t[0], t[1], g)}</g>));
  return <g>{els}</g>;
}
function Blossom(cat, x, y, g) {
  const C = cat.blossom, C2 = cat.blossom2 || cat.blossom;
  if (g === 2) return <circle cx={x} cy={y} r="3" fill={C} />; // bud
  switch (cat.petals) {
    case 'four': { const els = []; for (let j = 0; j < 4; j++) { const a = (j / 4) * Math.PI * 2; els.push(<ellipse key={j} cx={x + Math.cos(a) * 3.4} cy={y + Math.sin(a) * 3.4} rx="3" ry="1.8" transform={`rotate(${a * 57 + 90} ${x + Math.cos(a) * 3.4} ${y + Math.sin(a) * 3.4})`} fill={C} />); } els.push(<circle key="c" cx={x} cy={y} r="1.6" fill={C2} />); return <g>{els}</g>; }
    case 'layered': {
      const R = cat.bigBloom ? 9 : 6;
      return <g><circle cx={x} cy={y} r={R} fill={C} /><circle cx={x - R * .35} cy={y - R * .15} r={R * .5} fill={C2} /><circle cx={x + R * .35} cy={y + R * .15} r={R * .42} fill={C2} /><circle cx={x} cy={y - R * .3} r={R * .4} fill={C2} opacity=".8" /><circle cx={x} cy={y} r={R * .3} fill={cat.accent || '#F2C66E'} />{cat.bigBloom && [0, 1, 2, 3, 4].map(j => { const a = j / 5 * Math.PI * 2; return <circle key={j} cx={x + Math.cos(a) * R * .28} cy={y + Math.sin(a) * R * .28} r=".9" fill={cat.accent || '#F2C66E'} />; })}</g>;
    }
    case 'tulip': return <path d={`M${x - 5} ${y} Q${x - 5} ${y - 11} ${x} ${y - 11} Q${x + 5} ${y - 11} ${x + 5} ${y} Q${x} ${y + 2} ${x - 5} ${y}Z`} fill={C} stroke={C2} strokeWidth=".5" />;
    default: { const els = []; for (let j = 0; j < 5; j++) { const a = (j / 5) * Math.PI * 2 - Math.PI / 2; els.push(<circle key={j} cx={x + Math.cos(a) * 3.6} cy={y + Math.sin(a) * 3.6} r="2.6" fill={C} />); } els.push(<circle key="c" cx={x} cy={y} r="1.8" fill={cat.accent || C2} />); return <g>{els}</g>; }
  }
}

// ════════════ TREE (분재 / 침엽수) ═════════════════════════════
function Tree(cat, stage) {
  const g = STG[stage];
  const h = [18, 30, 42, 52][g];
  const trunk = cat.trunk || '#7B5A38';
  const els = [];
  const trunkD = cat.curve ? `M58 78 Q70 ${78 - h * .5} 56 ${78 - h}` : `M58 78 Q56 ${78 - h * .55} 60 ${78 - h}`;
  els.push(<path key="t" d={trunkD} stroke={trunk} strokeWidth="3.4" fill="none" strokeLinecap="round" />);
  const topX = cat.curve ? 56 : 60, topY = 78 - h;
  if (cat.canopy === 'cone') {
    els.push(<path key="c" d={`M${topX} ${topY - h * .5} L${topX - 14 - g * 2} 78 L${topX + 14 + g * 2} 78 Z`} fill={cat.color} />);
    els.push(<path key="c2" d={`M${topX} ${topY - h * .5} L${topX - 9} ${78 - h * .3} L${topX + 9} ${78 - h * .3}Z`} fill={cat.color2} opacity=".5" />);
    for (let j = 0; j < 14; j++) { const yy = topY - h * .4 + j * (h * .9 / 14); const ww = (yy - (topY - h * .5)) * .42; els.push(<line key={`n${j}`} x1={topX} y1={yy} x2={topX - ww} y2={yy + 2} stroke={cat.color2} strokeWidth=".7" />); }
  } else if (cat.canopy === 'needle') {
    const tufts = [[topX, topY], [topX - 12, topY + 6], [topX + 12, topY + 4], [topX - 6, topY - 6], [topX + 7, topY - 5]].slice(0, [1, 3, 4, 5][g]);
    tufts.forEach((t, i) => { for (let j = 0; j < 7; j++) { const a = (j / 7) * Math.PI - Math.PI; els.push(<line key={`${i}-${j}`} x1={t[0]} y1={t[1]} x2={t[0] + Math.cos(a) * 7} y2={t[1] + Math.sin(a) * 7} stroke={j % 2 ? cat.color2 : cat.color} strokeWidth="1.3" strokeLinecap="round" />); } });
  } else if (cat.canopy === 'fan') {
    const cl = [[topX, topY], [topX - 11, topY + 5], [topX + 11, topY + 4], [topX - 4, topY - 7], [topX + 6, topY - 5]].slice(0, [2, 3, 4, 5][g]);
    cl.forEach((t, i) => [-8, 0, 8].forEach((a, j) => els.push(<path key={`${i}-${j}`} d={`M${t[0]} ${t[1]} q-4 -5 -2 -8 q2 1 4 0 q2 3 -2 8Z`} transform={`rotate(${a} ${t[0]} ${t[1]})`} fill={(i + j) % 2 ? cat.color2 : cat.color} />)));
  } else { // cloud
    const blobs = [[topX, topY, 10], [topX - 9, topY + 4, 7], [topX + 9, topY + 3, 7], [topX, topY - 7, 7]].slice(0, [1, 2, 3, 4][g]);
    blobs.forEach((b, i) => els.push(<circle key={i} cx={b[0]} cy={b[1]} r={b[2] + g} fill={i % 2 ? cat.color2 : cat.color} />));
  }
  return <g>{els}</g>;
}

// ════════════ CACTUS (선인장 / 리톱스) ═════════════════════════
function Cactus(cat, stage) {
  const g = STG[stage];
  const els = [];
  if (cat.body === 'pebble') { // lithops
    const pairs = [1, 2, 3, 3][g];
    for (let i = 0; i < pairs; i++) {
      const x = 60 + (i - (pairs - 1) / 2) * 13; const w = 6 + g;
      els.push(<g key={i}><ellipse cx={x - w * .55} cy="73" rx={w * .55} ry={w * .8} fill={cat.leaf} /><ellipse cx={x + w * .55} cy="73" rx={w * .55} ry={w * .8} fill={cat.leaf2} /><line x1={x} y1={73 - w * .7} x2={x} y2={73 + w * .5} stroke="#4A3520" strokeWidth="1" /></g>);
      if (g >= 2 && i === 0) els.push(<g key="fl">{[0, 1, 2, 3, 4, 5, 6, 7].map(j => { const a = j / 8 * Math.PI * 2; return <ellipse key={j} cx={x + Math.cos(a) * 4} cy={71 + Math.sin(a) * 4} rx="2.6" ry="1.2" transform={`rotate(${a * 57} ${x + Math.cos(a) * 4} ${71 + Math.sin(a) * 4})`} fill={cat.bloom} />; })}<circle cx={x} cy="71" r="1.6" fill="#E8B43A" /></g>);
    }
    return <g>{els}</g>;
  }
  if (cat.body === 'pads') { // bunny ears
    const pads = [[60, 70, 9, 12]].concat(g >= 1 ? [[52, 58, 7, 9]] : []).concat(g >= 2 ? [[68, 57, 7, 9]] : []).concat(g >= 3 ? [[60, 50, 6, 8]] : []);
    pads.forEach((p, i) => { els.push(<ellipse key={i} cx={p[0]} cy={p[1]} rx={p[2]} ry={p[3]} fill={i % 2 ? cat.leaf2 : cat.leaf} />); for (let d = 0; d < 8; d++) { const da = (d / 8) * Math.PI * 2; els.push(<circle key={`${i}-${d}`} cx={p[0] + Math.cos(da) * p[2] * 0.55} cy={p[1] + Math.sin(da) * p[3] * 0.55} r=".7" fill={cat.spine} />); } });
    return <g>{els}</g>;
  }
  if (cat.body === 'moon') { // moon cactus: column + colored cap
    const ch = [10, 16, 22, 28][g];
    els.push(<rect key="col" x="55" y={78 - ch} width="10" height={ch} rx="4" fill={cat.leaf} />);
    [0.3, 0.6].forEach((r, j) => els.push(<line key={`r${j}`} x1={55 + 10 * r} y1={78 - ch} x2={55 + 10 * r} y2="78" stroke={cat.leaf2} strokeWidth=".8" />));
    const cr = 6 + g;
    els.push(<circle key="cap" cx="60" cy={78 - ch - cr * .4} r={cr} fill={cat.cap} />);
    for (let j = 0; j < 8; j++) { const a = j / 8 * Math.PI * 2; els.push(<line key={`s${j}`} x1="60" y1={78 - ch - cr * .4} x2={60 + Math.cos(a) * cr} y2={78 - ch - cr * .4 + Math.sin(a) * cr} stroke={cat.spine} strokeWidth=".7" />); }
    return <g>{els}</g>;
  }
  // globe (golden barrel)
  const R = [8, 13, 18, 22][g];
  els.push(<ellipse key="b" cx="60" cy={78 - R * .85} rx={R} ry={R * 1.05} fill={cat.leaf} />);
  els.push(<ellipse key="b2" cx="60" cy={78 - R * .85} rx={R * .6} ry={R * 1.05} fill={cat.leaf2} opacity=".4" />);
  for (let j = 0; j < 9; j++) { const rx = -R + (j / 8) * 2 * R; els.push(<path key={`rib${j}`} d={`M${60 + rx * .9} ${78 - R * 1.7} Q${60 + rx} ${78 - R * .85} ${60 + rx * .9} ${78}`} stroke={cat.spine} strokeWidth=".8" fill="none" opacity=".8" />); }
  return <g>{els}</g>;
}

// ════════════ MOSS (코케다마) ══════════════════════════════════
function Moss(cat, stage) {
  const g = STG[stage];
  const els = [<circle key="ball" cx="60" cy="84" r="18" fill={cat.moss} />];
  els.push(<circle key="ball2" cx="60" cy="84" r="18" fill="#000" opacity=".06" />);
  for (let j = 0; j < 14; j++) { const a = (j / 14) * Math.PI * 2, r = 14 + (j % 3) * 1.6; els.push(<circle key={`m${j}`} cx={60 + Math.cos(a) * r} cy={84 + Math.sin(a) * r * .8} r="2" fill={j % 2 ? cat.leaf2 : cat.moss} opacity=".7" />); }
  // top plant
  const blades = [2, 3, 5, 6][g], h = [10, 16, 22, 28][g];
  for (let i = 0; i < blades; i++) { const t = blades === 1 ? .5 : i / (blades - 1); const x = 60 + (t - .5) * 16; const tilt = (t - .5) * 36; els.push(<path key={`bl${i}`} d={`M0 0 Q-1.6 ${-h * .5} 0 ${-h} Q1.6 ${-h * .5} 0 0Z`} transform={`translate(${x} 70) rotate(${tilt})`} fill={i % 2 ? cat.leaf : cat.leaf2} />); }
  return <g>{els}</g>;
}

// ── Dispatcher ─────────────────────────────────────────────────
const FORMS = { rosette: Rosette, trailing: Trailing, leafy: Leafy, stalk: Stalk, woody: Woody, tree: Tree, cactus: Cactus, moss: Moss };

const PlantArt = ({ id, stage = 3, size = 120, showPot = true, style = undefined }) => {
  const cat = PLANT_CATALOG[id] || PLANT_CATALOG.echeveria;
  const render = FORMS[cat.form] || Rosette;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={style}>
      {showPot && <ArtPot />}
      {stage <= 0 ? (
        <ArtSoil seed={cat.bcolor || cat.blossom || cat.cap || cat.tip || '#C9A86B'} />
      ) : stage === 1 ? (
        // 1단계 = 어린 싹: 2단계 형태를 기준점(60,78)에서 축소해 재사용 (기존 stage별 크기 스케일 그대로 활용)
        <g transform="translate(60 78) scale(0.42) translate(-60 -78)">{render(cat, 2)}</g>
      ) : (
        render(cat, stage)
      )}
    </svg>
  );
};

export { PlantArt, ArtPot, ArtSoil };
export default PlantArt;

// 링/파티클 색 등에 쓸 대표 색 (잎/꽃) — plant-grow가 사용.
export function plantAccent(id: string): { leaf: string; bloom: string } {
  const c = PLANT_CATALOG[id] || {};
  const leaf = c.leaf || c.color || c.color2 || '#7C9466';
  const bloom = c.bloom || c.bcolor || c.blossom || c.cap || c.tipBloom || c.center || c.tip || leaf;
  return { leaf, bloom };
}
