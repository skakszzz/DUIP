// app/workspaces/[workspaceId]/memos/memos-view.tsx
// 메모 목록 (클라이언트) — 구글 Keep 스타일 2열 그리드.
// 본문이 카드를 채우고, 제목·작성자·날짜는 아래 얇은 한 줄로.
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  MEMO_TINTS, Doodle, StrokesSvg, MemoAvatars, blockAuthors,
  type MemoRow, type MemoMember, type MemoBlock, type TintKey,
} from '@/components/memo-shared';

interface Props {
  workspaceId: string;
  userId: string;
  workspaceName: string;
  members: MemoMember[];
  initialMemos: MemoRow[];
}

const T = {
  cream: '#FBF6EE', paper: '#FFFCF7', ink: '#2A1B0E', inkSoft: '#5C3A1F',
  inkMute: '#8A7359', inkFade: '#B09779', wood600: '#9A7553', wood700: '#7B5530', wood800: '#5C3A1F',
  bisque: '#EADFC7', taupe: '#D9C8AC',
  sh1: '0 1px 2px rgba(74,46,22,0.05)',
  sh2: '0 2px 8px rgba(74,46,22,0.06), 0 1px 2px rgba(74,46,22,0.04)',
};

function relDate(iso: string): string {
  const d = new Date(iso), now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff <= 0) return '오늘';
  if (diff === 1) return '어제';
  if (diff < 7) return `${diff}일 전`;
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// 블록 배열에서 카드 본문 미리보기 결정
function previewOf(blocks: MemoBlock[]) {
  const check = blocks.find((b) => b.kind === 'check') as Extract<MemoBlock, { kind: 'check' }> | undefined;
  const draw = blocks.find((b) => b.kind === 'draw') as Extract<MemoBlock, { kind: 'draw' }> | undefined;
  const text = blocks.find((b) => b.kind === 'text') as Extract<MemoBlock, { kind: 'text' }> | undefined;
  // 우선순위: 그림 → 체크 → 글 (첫 등장 블록 기준이 자연스러우면 blocks[0]로 바꿔도 됨)
  if (blocks[0]?.kind === 'draw' && draw) return { type: 'draw' as const, draw };
  if (check) return { type: 'check' as const, check };
  if (draw) return { type: 'draw' as const, draw };
  if (text) return { type: 'text' as const, text: text.text };
  return { type: 'empty' as const };
}

export default function MemosView({ workspaceId, userId, workspaceName, members, initialMemos }: Props) {
  const router = useRouter();
  const [memos] = useState<MemoRow[]>(initialMemos);
  const [creating, setCreating] = useState(false);

  async function createMemo() {
    if (creating) return;
    setCreating(true);
    const supabase = createClient();
    const tints: TintKey[] = ['paper', 'butter', 'mint', 'peach', 'lavender'];
    const tint = tints[memos.length % tints.length];
    const { data, error } = await supabase
      .from('memos')
      .insert({ workspace_id: workspaceId, title: '', tint, blocks: [], created_by: userId, updated_by: userId })
      .select('id')
      .single();
    setCreating(false);
    if (error) { alert('메모 생성 실패: ' + error.message); return; }
    if (data) router.push(`/workspaces/${workspaceId}/memos/${data.id}`);
  }

  return (
    <div style={{ minHeight: '100dvh', background: T.cream, fontFamily: '"Pretendard Variable","Pretendard",-apple-system,sans-serif' }}>
      <div style={{ maxWidth: 448, margin: '0 auto', padding: '52px 16px 110px' }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: T.ink, letterSpacing: '-0.03em', lineHeight: 1.1 }}>메모</div>
            <div style={{ fontSize: 12, color: T.inkMute, marginTop: 3, fontWeight: 600 }}>{workspaceName} · {memos.length}개</div>
          </div>
        </div>

        {/* 빈 상태 */}
        {memos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 30px' }}>
            <div style={{ display: 'grid', placeItems: 'center', marginBottom: 12 }}>
              <Doodle kind="plants" size={130} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: T.ink, letterSpacing: '-0.02em' }}>첫 메모를 적어볼까요</div>
            <div style={{ fontSize: 13, color: T.inkMute, lineHeight: 1.6, marginTop: 8 }}>
              글·체크리스트·그림을 한곳에.<br />둘이 함께 채워가요.
            </div>
          </div>
        ) : (
          /* 그리드 */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: 192, gap: 12 }}>
            {memos.map((m) => {
              const tint = MEMO_TINTS[m.tint] ?? MEMO_TINTS.paper;
              const pv = previewOf(m.blocks);
              const authors = blockAuthors(m.blocks, m.created_by);
              return (
                <button
                  key={m.id}
                  onClick={() => router.push(`/workspaces/${workspaceId}/memos/${m.id}`)}
                  style={{
                    textAlign: 'left', cursor: 'pointer', padding: 0,
                    background: T.paper, borderRadius: 18, overflow: 'hidden',
                    boxShadow: T.sh2, border: `1px solid ${T.bisque}66`,
                    borderTop: `3px solid ${tint.edge}`,
                    display: 'flex', flexDirection: 'column',
                  }}
                >
                  {/* 본문 hero */}
                  {pv.type === 'draw' ? (
                    <div style={{ flex: 1, display: 'grid', placeItems: 'center', background: tint.bg }}>
                      {pv.draw.strokes?.length
                        ? <StrokesSvg strokes={pv.draw.strokes} w={150} h={104} />
                        : <Doodle kind="plants" size={104} />}
                    </div>
                  ) : pv.type === 'check' ? (
                    <div style={{ flex: 1, padding: '12px 13px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {pv.check.items.slice(0, 4).map((it) => (
                        <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span style={{
                            width: 15, height: 15, borderRadius: 5, flex: '0 0 auto',
                            background: it.done ? T.wood700 : 'transparent',
                            boxShadow: it.done ? 'none' : `inset 0 0 0 1.6px ${tint.edge}`,
                            display: 'grid', placeItems: 'center',
                          }}>
                            {it.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5 10 17.5 19 7.5" /></svg>}
                          </span>
                          <span style={{
                            fontSize: 12.5, color: it.done ? T.inkFade : T.inkSoft,
                            textDecoration: it.done ? 'line-through' : 'none', textDecorationColor: T.inkFade,
                            letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>{it.text || '항목'}</span>
                        </div>
                      ))}
                    </div>
                  ) : pv.type === 'text' ? (
                    <div style={{ flex: 1, padding: '12px 13px 8px' }}>
                      <div style={{
                        fontSize: 12.5, color: T.inkSoft, lineHeight: 1.55, letterSpacing: '-0.01em', whiteSpace: 'pre-line',
                        display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>{pv.text}</div>
                    </div>
                  ) : (
                    <div style={{ flex: 1, display: 'grid', placeItems: 'center', background: tint.bg, color: tint.ink, fontSize: 13, fontWeight: 700 }}>
                      비어 있어요
                    </div>
                  )}

                  {/* 얇은 메타 푸터 */}
                  <div style={{ height: 34, flex: '0 0 auto', padding: '0 11px', background: tint.bg, borderTop: `1px solid ${tint.edge}66`, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 800, color: T.ink, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.title || '제목 없음'}
                    </div>
                    <MemoAvatars authors={authors} members={members} size={16} />
                    <div style={{ fontSize: 9.5, color: tint.ink, fontWeight: 700, opacity: 0.85, whiteSpace: 'nowrap', flex: '0 0 auto' }}>{relDate(m.updated_at)}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 새 메모 FAB */}
      <button
        onClick={createMemo}
        disabled={creating}
        style={{
          position: 'fixed', right: 'max(18px, calc(50% - 206px))', bottom: 84, zIndex: 40,
          width: 58, height: 58, borderRadius: 9999, border: 'none', cursor: 'pointer',
          background: T.wood800, color: T.cream, opacity: creating ? 0.6 : 1,
          display: 'grid', placeItems: 'center',
          boxShadow: '0 16px 32px rgba(74,46,22,0.32), 0 4px 10px rgba(74,46,22,0.18)',
        }}
        aria-label="새 메모"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.cream} strokeWidth={2.4} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      </button>
    </div>
  );
}
