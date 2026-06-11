'use client';

import { useState } from 'react';
import { useDragSheet } from '@/lib/use-drag-sheet';
import { createClient } from '@/lib/supabase/client';
import type { TreeType } from '@/lib/types';

interface Props {
  workspaceId: string;
  currentYear: number;
  onDone: (treeType: TreeType) => void;
  onSkip?: () => void;
}

const TREES: { id: TreeType; name: string; metaphor: string }[] = [
  { id: 'cherry', name: '벚꽃나무', metaphor: '봄마다 화사하게 피어나는' },
  { id: 'olive',  name: '올리브나무', metaphor: '평화와 풍요를 함께 나누는' },
  { id: 'ginkgo', name: '은행나무', metaphor: '천 년을 지켜온 깊은 인연' },
  { id: 'pine',   name: '소나무', metaphor: '사시사철 변치 않는 곧은 마음' },
  { id: 'maple',  name: '단풍나무', metaphor: '계절마다 더 깊어지는 빛깔' },
];

export default function TreePickerSheet({ workspaceId, currentYear, onDone, onSkip }: Props) {
  const { dragProps, sheetStyle } = useDragSheet(() => onSkip?.());
  const [selected, setSelected] = useState<TreeType | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!selected) return;
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from('workspaces')
      .update({ tree_type: selected, tree_selected_year: currentYear })
      .eq('id', workspaceId);
    setLoading(false);
    onDone(selected);
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'flex-end', background: 'rgba(42,27,14,0.50)' }}
      onClick={() => onSkip?.()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ ...sheetStyle, width: '100%', maxWidth: 448, margin: '0 auto', background: '#FBF6EE', borderRadius: '28px 28px 0 0', padding: '0 16px 36px' }}
      >
        {/* 핸들 + 나중에 — 드래그 영역 */}
        <div {...dragProps} style={{ ...dragProps.style, display: 'flex', alignItems: 'center', padding: '12px 0 16px', position: 'relative' }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D9C8AC' }}/>
          </div>
          {onSkip && (
            <button
              onClick={onSkip}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C8B89A', fontSize: 13, padding: '0 4px', lineHeight: 1, position: 'absolute', right: 4 }}
            >
              나중에
            </button>
          )}
        </div>

        {/* 배경 장식 */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(220,209,232,0.4) 0%, rgba(246,231,184,0.3) 100%)',
          borderRadius: 20, padding: '16px 16px 14px', marginBottom: 20,
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(242,198,110,0.3), transparent 70%)', pointerEvents: 'none' }}/>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#9A7553', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
            {currentYear}년 보호수 선택
          </p>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#2A1B0E', marginBottom: 4, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            올해의 나무를 골라요 🌳
          </p>
          <p style={{ fontSize: 13, color: '#5C3A1F', lineHeight: 1.5, margin: 0 }}>
            보호수는 한 해 동안 우리 동산을 지켜줘요
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {TREES.map(tree => {
            const on = selected === tree.id;
            return (
              <button
                key={tree.id}
                onClick={() => setSelected(tree.id)}
                style={{
                  borderRadius: 18,
                  border: `2px solid ${on ? '#9A7CC9' : 'transparent'}`,
                  background: on ? 'rgba(154,124,201,0.10)' : '#FFFCF7',
                  boxShadow: on ? '0 0 0 1px rgba(154,124,201,0.25), 0 4px 12px rgba(74,46,22,0.08)' : '0 2px 6px rgba(74,46,22,0.07)',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'all 0.15s',
                  textAlign: 'left',
                }}
              >
                <img
                  src={`/trees/${tree.id}.webp`}
                  alt={tree.name}
                  style={{ width: 56, height: 56, objectFit: 'contain', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#2A1B0E' }}>{tree.name}</div>
                  <div style={{ fontSize: 12, color: '#8A7359', marginTop: 3, lineHeight: 1.4 }}>{tree.metaphor}</div>
                </div>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: on ? '#9A7CC9' : '#F4E8D6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {on && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5 10 17.5 19 7.5"/>
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selected || loading}
          style={{
            width: '100%', height: 52, borderRadius: 9999, border: 'none',
            background: selected ? '#5C3A1F' : '#E8D9C3',
            color: selected ? '#FBF6EE' : '#B09779',
            fontSize: 15, fontWeight: 800, cursor: selected ? 'pointer' : 'default',
            boxShadow: selected ? '0 8px 24px rgba(74,46,22,0.22)' : 'none',
            opacity: loading ? 0.55 : 1,
            transition: 'all 0.2s',
          }}
        >
          {loading ? '저장 중...' : `${currentYear}년 보호수로 지정하기 🌳`}
        </button>
      </div>
    </div>
  );
}
