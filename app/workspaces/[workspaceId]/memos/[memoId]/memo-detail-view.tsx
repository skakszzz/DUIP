// app/workspaces/[workspaceId]/memos/[memoId]/memo-detail-view.tsx
// 메모 상세 (클라이언트) — 읽기 뷰 우선. 열면 읽기 전용 완성 뷰, [수정]으로 편집 진입.
// 편집은 블록형(글/체크리스트/그림) 자유 혼합, 박스 없이 한 장의 문서처럼 이어짐.
// 변경은 디바운스로 자동 저장.
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  MEMO_TINTS, TINT_ORDER, StrokesSvg, MemoAvatars, blockAuthors,
  type MemoRow, type MemoMember, type MemoBlock, type CheckItem, type TintKey,
} from '@/components/memo-shared';
import FloatingSheet from '@/components/floating-sheet';
import MemoDrawCanvas from './memo-draw-canvas';

const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'b' + Math.random().toString(36).slice(2));

interface Props { workspaceId: string; userId: string; members: MemoMember[]; initialMemo: MemoRow }

const T = {
  cream: '#FBF6EE', paper: '#FFFCF7', ink: '#2A1B0E', inkSoft: '#5C3A1F',
  inkMute: '#8A7359', inkFade: '#B09779', wood600: '#9A7553', wood700: '#7B5530', wood800: '#5C3A1F',
  sand: '#F4EBD9', bisque: '#EADFC7', taupe: '#D9C8AC', sage: '#7C9466',
  err: '#C77C6A', errLight: '#F7EAE7',
  sh1: '0 1px 2px rgba(74,46,22,0.05)',
};

// 읽기 뷰에서 꾹 눌러도 브라우저 텍스트 선택/복사가 뜨지 않게
const NO_SELECT: React.CSSProperties = {
  userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none',
};

export default function MemoDetailView({ workspaceId, userId, members, initialMemo }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialMemo.title);
  const [tint, setTint] = useState<TintKey>(initialMemo.tint);
  const [blocks, setBlocks] = useState<MemoBlock[]>(initialMemo.blocks ?? []);
  const [drawingId, setDrawingId] = useState<string | null>(null); // 편집 중인 그림 블록
  const [saving, setSaving] = useState(false);

  // 빈 메모(새로 만든 것)는 곧장 편집, 내용이 있으면 읽기 뷰부터
  const emptyMemo = !initialMemo.title.trim() && (initialMemo.blocks?.length ?? 0) === 0;
  const [mode, setMode] = useState<'read' | 'edit'>(emptyMemo ? 'edit' : 'read');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const first = useRef(true);

  // ── 디바운스 자동 저장 ──
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const t = setTimeout(async () => {
      setSaving(true);
      const supabase = createClient();
      await supabase.from('memos').update({ title, tint, blocks, updated_by: userId }).eq('id', initialMemo.id);
      setSaving(false);
    }, 700);
    return () => clearTimeout(t);
  }, [title, tint, blocks]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 블록 조작 ──
  const update = (id: string, fn: (b: MemoBlock) => MemoBlock) => setBlocks((bs) => bs.map((b) => (b.id === id ? fn(b) : b)));
  const remove = (id: string) => setBlocks((bs) => bs.filter((b) => b.id !== id));
  function addBlock(kind: MemoBlock['kind']) {
    const base = { id: uid(), author: userId };
    const b: MemoBlock =
      kind === 'text' ? { ...base, kind: 'text', text: '' }
      : kind === 'check' ? { ...base, kind: 'check', items: [{ id: uid(), text: '', done: false, author: userId }] }
      : { ...base, kind: 'draw', strokes: [], w: 360, h: 480 };
    setBlocks((bs) => [...bs, b]);
    if (kind === 'draw') setDrawingId(b.id);
  }

  async function deleteMemo() {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from('memos').delete().eq('id', initialMemo.id);
    if (error) { setDeleting(false); return; }
    router.replace(`/workspaces/${workspaceId}/memos`);
  }

  const drawingBlock = blocks.find((b) => b.id === drawingId && b.kind === 'draw') as Extract<MemoBlock, { kind: 'draw' }> | undefined;
  const authors = blockAuthors(blocks, initialMemo.created_by);
  const hasContent = blocks.some((b) =>
    (b.kind === 'text' && b.text.trim()) ||
    (b.kind === 'check' && b.items.length > 0) ||
    (b.kind === 'draw' && b.strokes.length > 0)
  );

  const chip: React.CSSProperties = { height: 34, padding: '0 14px', borderRadius: 9999, border: `1px solid ${T.bisque}`, background: T.paper, color: T.wood700, fontSize: 13, fontWeight: 700, cursor: 'pointer' };

  return (
    <div style={{ minHeight: '100dvh', background: T.cream, ...(mode === 'read' ? NO_SELECT : null) }}>
      <div style={{ maxWidth: 448, margin: '0 auto', padding: '14px 16px 150px' }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <button onClick={() => router.push(`/workspaces/${workspaceId}/memos`)} style={{ width: 36, height: 36, borderRadius: 9999, background: T.paper, boxShadow: T.sh1, border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }} aria-label="뒤로">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.wood800} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            {mode === 'edit' && (
              <span style={{ fontSize: 11, color: T.inkFade, fontWeight: 600, paddingLeft: 4 }}>{saving ? '저장 중…' : '저장됨'}</span>
            )}
          </div>

          {mode === 'read' ? (
            <>
              <button onClick={() => setMode('edit')} style={chip}>수정</button>
              <button onClick={() => setConfirmDelete(true)} style={{ ...chip, border: 'none', background: T.errLight, color: T.err }}>삭제</button>
            </>
          ) : (
            <>
              {/* 틴트 선택 (편집 전용) */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginRight: 4 }}>
                {TINT_ORDER.map((k) => {
                  const on = k === tint;
                  return <button key={k} onClick={() => setTint(k)} style={{ width: on ? 22 : 18, height: on ? 22 : 18, borderRadius: 9999, background: MEMO_TINTS[k].bg, border: `2px solid ${on ? T.wood800 : MEMO_TINTS[k].edge}`, cursor: 'pointer', padding: 0 }} aria-label={k} />;
                })}
              </div>
              <button onClick={() => setMode('read')} style={{ ...chip, border: 'none', background: T.wood800, color: T.cream }}>완료</button>
            </>
          )}
        </div>

        {/* 제목 */}
        {mode === 'read' ? (
          <div style={{ fontSize: 25, fontWeight: 800, color: T.ink, letterSpacing: '-0.03em', lineHeight: 1.2, minHeight: 30, wordBreak: 'break-word' }}>
            {title || '제목 없음'}
          </div>
        ) : (
          <input
            value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목"
            style={{ display: 'block', width: '100%', background: 'transparent', border: 'none', outline: 'none', padding: 0, fontSize: 25, fontWeight: 800, color: T.ink, letterSpacing: '-0.03em', lineHeight: 1.2 }}
          />
        )}

        {/* 작성자 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0 16px', paddingBottom: 16, borderBottom: `1px solid ${T.bisque}` }}>
          <MemoAvatars authors={authors} members={members} size={22} />
          <span style={{ fontSize: 11.5, color: T.inkMute, fontWeight: 600 }}>
            {members.filter((m) => authors.includes(m.user_id)).map((m) => m.display_name).join(' · ') || '함께'} 편집
          </span>
        </div>

        {/* 블록 */}
        {mode === 'read' ? (
          hasContent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {blocks.map((b) => <BlockRead key={b.id} block={b} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: T.inkFade, fontSize: 13.5, lineHeight: 1.6 }}>
              아직 내용이 없어요.<br />‘수정’을 눌러 채워보세요.
            </div>
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {blocks.map((b) => (
              <BlockEditor
                key={b.id} block={b} userId={userId}
                onChange={(fn) => update(b.id, fn)} onRemove={() => remove(b.id)}
                onEditDraw={() => setDrawingId(b.id)}
              />
            ))}
            {blocks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 0', color: T.inkFade, fontSize: 13.5 }}>
                아래에서 글 · 체크리스트 · 그림을 더해보세요
              </div>
            )}
          </div>
        )}
      </div>

      {/* 편집: 블록 추가 툴바 */}
      {mode === 'edit' && (
        <div style={{ position: 'fixed', left: 12, right: 12, bottom: 'calc(72px + env(safe-area-inset-bottom,0px))', maxWidth: 424, margin: '0 auto', zIndex: 60, background: T.wood800, borderRadius: 9999, boxShadow: '0 14px 30px rgba(74,46,22,0.3)', padding: '8px 10px', display: 'flex', gap: 6 }}>
          {([['text', '텍스트', 'M8 7h8M8 12h8M8 17h5'], ['check', '체크', 'M4 12.5 7 15.5 12 9'], ['draw', '그림', 'M4 20l4-1 11-11-3-3L5 16l-1 4Z']] as [MemoBlock['kind'], string, string][]).map(([k, label, d]) => (
            <button key={k} onClick={() => addBlock(k)} style={{ flex: 1, height: 40, borderRadius: 9999, border: 'none', background: 'transparent', color: T.cream, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.cream} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>{label}
            </button>
          ))}
        </div>
      )}

      {/* 그리기 모드 */}
      {drawingBlock && (
        <MemoDrawCanvas
          initial={drawingBlock.strokes}
          onCancel={() => setDrawingId(null)}
          onSave={(strokes) => { update(drawingBlock.id, (b) => (b.kind === 'draw' ? { ...b, strokes } : b)); setDrawingId(null); }}
        />
      )}

      {/* 삭제 확인 (1회) */}
      {confirmDelete && (
        <FloatingSheet onClose={() => !deleting && setConfirmDelete(false)} scrim="rgba(42,27,14,0.45)" draggable={false}>
          <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 12 }}>🗑️</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.ink, textAlign: 'center', letterSpacing: '-0.02em', marginBottom: 8 }}>
            메모를 삭제할까요?
          </div>
          <div style={{ fontSize: 13.5, color: T.inkMute, textAlign: 'center', lineHeight: 1.6, marginBottom: 28 }}>
            삭제한 메모는 되돌릴 수 없어요.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={deleteMemo} disabled={deleting} style={{ height: 50, borderRadius: 9999, border: 'none', background: T.err, color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', opacity: deleting ? 0.5 : 1 }}>
              {deleting ? '삭제 중…' : '네, 삭제할게요'}
            </button>
            <button onClick={() => setConfirmDelete(false)} disabled={deleting} style={{ height: 46, borderRadius: 9999, border: `1.5px solid ${T.bisque}`, background: T.paper, color: T.inkMute, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              취소
            </button>
          </div>
        </FloatingSheet>
      )}
    </div>
  );
}

// ── 읽기(완성) 뷰 블록 렌더 — 순수 보기 전용, 가이드/체크토글 없음 ─────
function BlockRead({ block }: { block: MemoBlock }) {
  if (block.kind === 'text') {
    if (!block.text.trim()) return null;
    return <div style={{ fontSize: 15.5, color: T.inkSoft, lineHeight: 1.7, letterSpacing: '-0.01em', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{block.text}</div>;
  }
  if (block.kind === 'check') {
    if (block.items.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {block.items.map((it) => (
          <div key={it.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '3px 0' }}>
            <span style={{ width: 20, height: 20, borderRadius: 6, flex: '0 0 auto', marginTop: 1, background: it.done ? T.wood700 : 'transparent', boxShadow: it.done ? 'none' : `inset 0 0 0 2px ${T.taupe}`, display: 'grid', placeItems: 'center' }}>
              {it.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5 10 17.5 19 7.5" /></svg>}
            </span>
            <span style={{ fontSize: 15, color: it.done ? T.inkFade : T.ink, textDecorationLine: it.done ? 'line-through' : 'none', textDecorationColor: T.inkFade, lineHeight: 1.5, letterSpacing: '-0.01em' }}>{it.text || '항목'}</span>
          </div>
        ))}
      </div>
    );
  }
  // draw
  if (block.strokes.length === 0) return null;
  return (
    <div style={{ display: 'grid', placeItems: 'center', padding: '4px 0' }}>
      <StrokesSvg strokes={block.strokes} w={320} h={427} />
    </div>
  );
}

// ── 편집 블록 (박스 없이 문서처럼) ─────────────────────────────────
function BlockEditor({ block, userId, onChange, onRemove, onEditDraw }: {
  block: MemoBlock; userId: string;
  onChange: (fn: (b: MemoBlock) => MemoBlock) => void; onRemove: () => void; onEditDraw: () => void;
}) {
  return (
    <div style={{ position: 'relative', paddingRight: 22 }}>
      {/* 은은한 블록 삭제 */}
      <button onClick={onRemove} style={{ position: 'absolute', top: 0, right: -6, background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: T.inkFade, opacity: 0.55, lineHeight: 0 }} aria-label="블록 삭제">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </button>

      {block.kind === 'text' && (
        <textarea
          value={block.text}
          onChange={(e) => onChange((b) => (b.kind === 'text' ? { ...b, text: e.target.value } : b))}
          placeholder="여기에 글을 적어보세요"
          rows={Math.max(2, block.text.split('\n').length)}
          style={{ display: 'block', width: '100%', resize: 'none', background: 'transparent', border: 'none', outline: 'none', padding: 0, fontSize: 15.5, color: T.inkSoft, lineHeight: 1.7, letterSpacing: '-0.01em', fontFamily: 'inherit' }}
        />
      )}

      {block.kind === 'check' && (
        <CheckEditor block={block} userId={userId} onChange={onChange} />
      )}

      {block.kind === 'draw' && (
        block.strokes.length ? (
          <button onClick={onEditDraw} style={{ width: '100%', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <StrokesSvg strokes={block.strokes} w={300} h={400} />
          </button>
        ) : (
          <button onClick={onEditDraw} style={{ width: '100%', background: 'transparent', borderRadius: 14, border: `1.5px dashed ${T.bisque}`, padding: '28px 0', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <span style={{ fontSize: 13, color: T.inkFade, fontWeight: 700 }}>＋ 여기에 그림</span>
          </button>
        )
      )}
    </div>
  );
}

// ── 체크리스트 에디터 (편집 전용) ──────────────────────────────────
function CheckEditor({ block, userId, onChange }: { block: Extract<MemoBlock, { kind: 'check' }>; userId: string; onChange: (fn: (b: MemoBlock) => MemoBlock) => void }) {
  const setItems = (fn: (items: CheckItem[]) => CheckItem[]) => onChange((b) => (b.kind === 'check' ? { ...b, items: fn(b.items) } : b));
  return (
    <div>
      {block.items.map((it) => (
        <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
          <button onClick={() => setItems((items) => items.map((x) => (x.id === it.id ? { ...x, done: !x.done } : x)))}
            style={{ width: 22, height: 22, borderRadius: 7, flex: '0 0 auto', cursor: 'pointer', background: it.done ? T.wood700 : 'transparent', border: 'none', boxShadow: it.done ? 'none' : `inset 0 0 0 2px ${T.taupe}`, display: 'grid', placeItems: 'center' }}>
            {it.done && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5 10 17.5 19 7.5" /></svg>}
          </button>
          <input
            value={it.text}
            onChange={(e) => setItems((items) => items.map((x) => (x.id === it.id ? { ...x, text: e.target.value } : x)))}
            placeholder="항목"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: 0, fontSize: 14.5, color: it.done ? T.inkFade : T.ink, textDecorationLine: it.done ? 'line-through' : 'none', textDecorationColor: T.inkFade, letterSpacing: '-0.01em', fontFamily: 'inherit' }}
          />
          <button onClick={() => setItems((items) => items.filter((x) => x.id !== it.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.inkFade, padding: 2 }} aria-label="항목 삭제">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
      ))}
      <button
        onClick={() => setItems((items) => [...items, { id: uid(), text: '', done: false, author: userId }])}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer', color: T.inkFade }}
      >
        <span style={{ width: 22, height: 22, borderRadius: 7, boxShadow: `inset 0 0 0 2px ${T.taupe}66`, display: 'grid', placeItems: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.inkFade} strokeWidth={2.2} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </span>
        <span style={{ fontSize: 14, letterSpacing: '-0.01em' }}>항목 추가</span>
      </button>
    </div>
  );
}
