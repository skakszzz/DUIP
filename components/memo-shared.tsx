// components/memo-shared.tsx
// 메모 탭 공용 — 틴트 팔레트, 손그림 doodle, 아바타, 타입.
// 목록 뷰와 상세 에디터가 함께 import.
'use client';

import React from 'react';

// ── 블록 타입 ───────────────────────────────────────────────────
export interface CheckItem { id: string; text: string; done: boolean; author?: string }
export interface Stroke { color: string; width: number; points: [number, number][] } // points: 0~1 정규화
export type MemoBlock =
  | { id: string; kind: 'text';  text: string; author?: string }
  | { id: string; kind: 'check'; items: CheckItem[]; author?: string }
  | { id: string; kind: 'draw';  strokes: Stroke[]; w?: number; h?: number; author?: string };

export interface MemoRow {
  id: string;
  workspace_id: string;
  title: string;
  tint: TintKey;
  blocks: MemoBlock[];
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemoMember { user_id: string; display_name: string; color: string }

// ── 스티키노트 틴트 (크림 위에서 따뜻하게 읽히는 종이 톤) ──────────
export type TintKey = 'butter' | 'mint' | 'peach' | 'lavender' | 'paper';
export const MEMO_TINTS: Record<TintKey, { bg: string; edge: string; ink: string }> = {
  butter:   { bg: '#FBF1D6', edge: '#EEDDA6', ink: '#7A5A12' },
  mint:     { bg: '#E6EFDD', edge: '#CADFBC', ink: '#4E6B3C' },
  peach:    { bg: '#FBE2D4', edge: '#F1C8B2', ink: '#9A5238' },
  lavender: { bg: '#ECE5F1', edge: '#D7C9E1', ink: '#6A5480' },
  paper:    { bg: '#FFFCF7', edge: '#EADFC7', ink: '#7B5530' },
};
export const TINT_ORDER: TintKey[] = ['paper', 'butter', 'mint', 'peach', 'lavender'];

// ── 색연필/마커 팔레트 (브랜드 조화) ───────────────────────────────
export const CRAYON = ['#5C3A1F', '#C77C6A', '#7C9466', '#D9A227', '#6E86C9', '#B5689A'];

// ── 손그림 doodle (목록 썸네일/빈 그림 블록용) ─────────────────────
export function Doodle({ kind, size = 120, stroke = '#5C3A1F' }: { kind: string; size?: number; stroke?: string }) {
  const common = { width: size, height: size * 0.74, viewBox: '0 0 160 118', fill: 'none' as const, stroke, strokeWidth: 3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (kind) {
    case 'plants':
      return (
        <svg {...common}>
          <path d="M44 96c-2-9-3-18-2-27" stroke="#7C9466" />
          <path d="M42 78c-9-3-15-11-15-20 9 1 16 8 16 18" stroke="#7C9466" fill="#7C9466" fillOpacity=".12" />
          <path d="M44 74c7-5 11-14 9-23-7 3-12 12-10 21" stroke="#7C9466" fill="#7C9466" fillOpacity=".12" />
          <path d="M30 96h26l-3 16c-.3 2-2 3-4 3H37c-2 0-3.7-1-4-3l-3-16Z" stroke="#C77C6A" fill="#C77C6A" fillOpacity=".1" />
          <path d="M27 92h32" stroke="#C77C6A" />
          <circle cx="108" cy="44" r="9" stroke="#D9A227" fill="#D9A227" fillOpacity=".15" />
          <path d="M108 35c2-6 0-12-4-15M108 35c-3-5-9-7-14-6M108 53v34" stroke="#7C9466" />
          <path d="M96 108h26l-2 12c-.2 1.6-1.6 2.8-3.2 2.8h-15.6c-1.6 0-3-1.2-3.2-2.8l-2-12Z" stroke="#C77C6A" fill="#C77C6A" fillOpacity=".1" />
          <path d="M93 105h32" />
        </svg>
      );
    case 'heart':
      return (
        <svg {...common} stroke="#C77C6A">
          <path d="M80 100C40 74 28 56 30 40c1.6-14 18-20 30-9 4 4 6 8 6 8s2-4 6-8c12-11 28-5 30 9 2 16-10 34-50 60Z" fill="#C77C6A" fillOpacity=".12" />
          <path d="M104 30c5 1 9 5 10 11" opacity=".5" />
        </svg>
      );
    case 'house':
      return (
        <svg {...common}>
          <path d="M30 64 80 30l50 34" stroke="#C77C6A" />
          <path d="M40 60v44h80V60" fill="#FBF1D6" fillOpacity=".4" />
          <path d="M68 104V78h24v26" stroke="#7C9466" />
          <path d="M114 40v12" stroke="#C77C6A" />
          <path d="M126 92c8-2 14-9 14-18" stroke="#7C9466" opacity=".6" />
        </svg>
      );
    case 'route':
      return (
        <svg {...common}>
          <path d="M34 96c10-2 14-12 8-20s-2-20 12-22 30 4 40-6" stroke="#6E86C9" strokeDasharray="2 9" />
          <circle cx="34" cy="96" r="6" stroke="#C77C6A" fill="#C77C6A" fillOpacity=".15" />
          <path d="M110 30c0 8-6 12-6 12s-6-4-6-12a6 6 0 0 1 12 0Z" stroke="#7C9466" fill="#7C9466" fillOpacity=".15" />
          <circle cx="104" cy="30" r="2.4" fill="#7C9466" stroke="none" />
        </svg>
      );
    case 'cake':
      return (
        <svg {...common} stroke="#B5689A">
          <path d="M40 70h80v30c0 2-2 4-4 4H44c-2 0-4-2-4-4V70Z" fill="#B5689A" fillOpacity=".1" />
          <path d="M40 84c8 6 16 6 20 0 4 6 12 6 20 0 4 6 12 6 20 0 4 6 12 6 20 0" stroke="#FBF1D6" />
          <path d="M58 70V54M80 70V50M102 70V54" stroke="#D9A227" />
          <path d="M58 50c-2-3 0-6 0-6s2 3 0 6ZM80 46c-2-3 0-6 0-6s2 3 0 6ZM102 50c-2-3 0-6 0-6s2 3 0 6Z" fill="#C77C6A" stroke="#C77C6A" />
        </svg>
      );
    default:
      return <svg {...common}><path d="M40 80q40-50 80 0" stroke="#7C9466" /></svg>;
  }
}

// 그림 블록 strokes → SVG polyline 렌더 (정규화 좌표 → 박스 크기)
export function StrokesSvg({ strokes, w, h, style }: { strokes: Stroke[]; w: number; h: number; style?: React.CSSProperties }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={style}>
      {strokes.map((s, i) => (
        <polyline
          key={i}
          points={s.points.map(([x, y]) => `${x * w},${y * h}`).join(' ')}
          fill="none" stroke={s.color} strokeWidth={s.width}
          strokeLinecap="round" strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

// ── 작성자 아바타 (겹침) ────────────────────────────────────────
export function MemoAvatars({ authors, members, size = 18 }: { authors: string[]; members: MemoMember[]; size?: number }) {
  const uniq = Array.from(new Set(authors)).slice(0, 3);
  return (
    <div style={{ display: 'flex' }}>
      {uniq.map((uid, i) => {
        const m = members.find((mm) => mm.user_id === uid);
        if (!m) return null;
        return (
          <div key={uid} style={{
            width: size, height: size, borderRadius: '50%',
            background: m.color, color: '#fff',
            fontSize: size * 0.46, fontWeight: 800,
            display: 'grid', placeItems: 'center',
            boxShadow: '0 0 0 2px #FFFCF7', marginLeft: i ? -size * 0.34 : 0,
          }}>
            {m.display_name.charAt(0)}
          </div>
        );
      })}
    </div>
  );
}

// 블록 배열에서 작성자 uid 모으기
export function blockAuthors(blocks: MemoBlock[], createdBy: string): string[] {
  const set = new Set<string>([createdBy]);
  for (const b of blocks) { if (b.author) set.add(b.author); }
  return [...set];
}
