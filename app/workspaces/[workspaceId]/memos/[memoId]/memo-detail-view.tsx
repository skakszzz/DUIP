// app/workspaces/[workspaceId]/memos/[memoId]/memo-detail-view.tsx
// 메모 상세 (클라이언트) — 블록형 에디터: 글 / 체크리스트 / 그림 자유 혼합.
// 변경은 디바운스로 자동 저장. 블록마다 작성자 기록.
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  MEMO_TINTS, TINT_ORDER, StrokesSvg, MemoAvatars, blockAuthors,
  type MemoRow, type MemoMember, type MemoBlock, type CheckItem, type TintKey,
} from '@/components/memo-shared';
import MemoDrawCanvas from './memo-draw-canvas';

const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'b' + Math.random().toString(36).slice(2));

interface Props { workspaceId: string; userId: string; members: MemoMember[]; initialMemo: MemoRow }

const T = {
  cream: '#FBF6EE', paper: '#FFFCF7', ink: '#2A1B0E', inkSoft: '#5C3A1F',
  inkMute: '#8A7359', inkFade: '#B09779', wood600: '#9A7553', wood700: '#7B5530', wood800: '#5C3A1F',
  sand: '#F4EBD9', bisque: '#EADFC7', taupe: '#D9C8AC', sage: '#7C9466',
  sh1: '0 1px 2px rgba(74,46,22,0.05)',
};

export default function MemoDetailView({ workspaceId, userId, members, initialMemo }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialMemo.title);
  const [tint, setTint] = useState<TintKey>(initialMemo.tint);
  const [blocks, setBlocks] = useState<MemoBlock[]>(initialMemo.blocks ?? []);
  const [drawingId, setDrawingId] = useState<string | null>(null); // 편집 중인 그림 블록
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setDeleteConfirm(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);
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
    const supabase = createClient();
    await supabase.from('memos').delete().eq('id', initialMemo.id);
    router.replace(`/workspaces/${workspaceId}/memos`);
  }

  const drawingBlock = blocks.find((b) => b.id === drawingId && b.kind === 'draw') as Extract<MemoBlock, { kind: 'draw' }> | undefined;
  const authors = blockAuthors(blocks, initialMemo.created_by);

  return (
    <div style={{ minHeight: '100dvh', background: T.cream }}>
      <div style={{ maxWidth: 448, margin: '0 auto', padding: '14px 16px 150px' }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <button onClick={() => router.push(`/workspaces/${workspaceId}/memos`)} style={{ width: 36, height: 36, borderRadius: 9999, background: T.paper, boxShadow: T.sh1, border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer' }} aria-label="뒤로">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.wood800} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div style={{ flex: 1, fontSize: 11, color: T.inkFade, fontWeight: 600, paddingLeft: 4 }}>{saving ? '저장 중…' : '저장됨'}</div>
          {/* 틴트 선택 */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginRight: 4 }}>
            {TINT_ORDER.map((k) => {
              const on = k === tint;
              return <button key={k} onClick={() => setTint(k)} style={{ width: on ? 22 : 18, height: on ? 22 : 18, borderRadius: 9999, background: MEMO_TINTS[k].bg, border: `2px solid ${on ? T.wood800 : MEMO_TINTS[k].edge}`, cursor: 'pointer', padding: 0 }} aria-label={k} />;
            })}
          </div>
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button onClick={() => { setMenuOpen((v) => !v); setDeleteConfirm(false); }} style={{ width: 36, height: 36, borderRadius: 9999, background: T.paper, boxShadow: T.sh1, border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer' }} aria-label="더보기">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="6" cy="12" r="1.4" fill={T.wood700} /><circle cx="12" cy="12" r="1.4" fill={T.wood700} /><circle cx="18" cy="12" r="1.4" fill={T.wood700} /></svg>
            </button>
            {menuOpen && (
              <div style={{ position: 'absolute', right: 0, top: 42, zIndex: 30, borderRadius: 14, background: T.paper, boxShadow: '0 8px 24px rgba(74,46,22,0.16)', overflow: 'hidden', minWidth: 130 }}>
                {!deleteConfirm ? (
                  <button onClick={() => setDeleteConfirm(true)} style={{ display: 'block', width: '100%', height: 44, padding: '0 16px', border: 'none', cursor: 'pointer', background: 'transparent', fontSize: 13.5, fontWeight: 700, color: '#B5483A', textAlign: 'left' }}>메모 삭제</button>
                ) : (
                  <>
                    <div style={{ padding: '10px 14px 4px', fontSize: 11.5, color: T.inkMute, fontWeight: 600 }}>정말 삭제할까요?</div>
                    <button onClick={deleteMemo} style={{ display: 'block', width: '100%', height: 40, padding: '0 16px', border: 'none', cursor: 'pointer', background: '#B5483A', fontSize: 13.5, fontWeight: 800, color: '#fff', textAlign: 'left' }}>네, 삭제</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 제목 + 작성자 */}
        <input
          value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목"
          style={{ display: 'block', width: '100%', background: 'transparent', border: 'none', outline: 'none', padding: 0, fontSize: 25, fontWeight: 800, color: T.ink, letterSpacing: '-0.03em', lineHeight: 1.2 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0 16px', paddingBottom: 16, borderBottom: `1px solid ${T.bisque}` }}>
          <MemoAvatars authors={authors} members={members} size={22} />
          <span style={{ fontSize: 11.5, color: T.inkMute, fontWeight: 600 }}>
            {members.filter((m) => authors.includes(m.user_id)).map((m) => m.display_name).join(' · ') || '함께'} 편집
          </span>
        </div>

        {/* 블록들 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {blocks.map((b) => (
            <BlockEditor
              key={b.id} block={b} members={members} userId={userId} tint={tint}
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
      </div>

      {/* 블록 추가 툴바 */}
      <div style={{ position: 'fixed', left: 12, right: 12, bottom: 'calc(72px + env(safe-area-inset-bottom,0px))', maxWidth: 424, margin: '0 auto', zIndex: 60, background: T.wood800, borderRadius: 9999, boxShadow: '0 14px 30px rgba(74,46,22,0.3)', padding: '8px 10px', display: 'flex', gap: 6 }}>
        {([['text', '텍스트', 'M8 7h8M8 12h8M8 17h5'], ['check', '체크', 'M4 12.5 7 15.5 12 9'], ['draw', '그림', 'M4 20l4-1 11-11-3-3L5 16l-1 4Z']] as [MemoBlock['kind'], string, string][]).map(([k, label, d]) => (
          <button key={k} onClick={() => addBlock(k)} style={{ flex: 1, height: 40, borderRadius: 9999, border: 'none', background: 'transparent', color: T.cream, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.cream} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>{label}
          </button>
        ))}
      </div>

      {/* 그리기 모드 */}
      {drawingBlock && (
        <MemoDrawCanvas
          initial={drawingBlock.strokes}
          onCancel={() => setDrawingId(null)}
          onSave={(strokes) => { update(drawingBlock.id, (b) => (b.kind === 'draw' ? { ...b, strokes } : b)); setDrawingId(null); }}
        />
      )}
    </div>
  );
}

// ── 블록 에디터 (종류별) ───────────────────────────────────────────
function BlockEditor({ block, members, userId, tint, onChange, onRemove, onEditDraw }: {
  block: MemoBlock; members: MemoMember[]; userId: string; tint: TintKey;
  onChange: (fn: (b: MemoBlock) => MemoBlock) => void; onRemove: () => void; onEditDraw: () => void;
}) {
  const meta = MEMO_TINTS[tint] ?? MEMO_TINTS.paper;
  const author = members.find((m) => m.user_id === block.author);

  return (
    <div style={{ position: 'relative', background: T.paper, borderRadius: 18, padding: '14px 14px 12px', boxShadow: '0 1px 2px rgba(74,46,22,0.05)', border: `1px solid ${T.bisque}66` }}>
      {/* 작은 헤더: 종류 + 작성자 + 삭제 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
        <span style={{ height: 20, padding: '0 8px', borderRadius: 9999, background: meta.bg, color: meta.ink, fontSize: 10, fontWeight: 800, display: 'inline-flex', alignItems: 'center' }}>
          {block.kind === 'text' ? '글' : block.kind === 'check' ? '체크리스트' : '그림'}
        </span>
        {author && <span style={{ fontSize: 10.5, color: T.inkMute, fontWeight: 600 }}>{author.display_name}</span>}
        <div style={{ flex: 1 }} />
        <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: T.inkFade }} aria-label="블록 삭제">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </div>

      {block.kind === 'text' && (
        <textarea
          value={block.text}
          onChange={(e) => onChange((b) => (b.kind === 'text' ? { ...b, text: e.target.value } : b))}
          placeholder="무엇이든 적어보세요"
          rows={Math.max(2, block.text.split('\n').length)}
          style={{ display: 'block', width: '100%', resize: 'none', background: 'transparent', border: 'none', outline: 'none', padding: 0, fontSize: 14.5, color: T.inkSoft, lineHeight: 1.65, letterSpacing: '-0.01em', fontFamily: 'inherit' }}
        />
      )}

      {block.kind === 'check' && (
        <CheckEditor block={block} userId={userId} onChange={onChange} />
      )}

      {block.kind === 'draw' && (
        <button onClick={onEditDraw} style={{ width: '100%', background: '#FFFDF8', borderRadius: 14, border: `1px solid ${T.bisque}`, padding: 10, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
          {block.strokes.length
            ? <StrokesSvg strokes={block.strokes} w={300} h={400} />
            : <span style={{ fontSize: 13, color: T.inkMute, fontWeight: 700, padding: '24px 0' }}>＋ 여기를 눌러 그리기</span>}
        </button>
      )}
    </div>
  );
}

// ── 체크리스트 에디터 ──────────────────────────────────────────────
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
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: 0, fontSize: 14.5, color: it.done ? T.inkFade : T.ink, textDecoration: it.done ? 'line-through' : 'none', letterSpacing: '-0.01em', fontFamily: 'inherit' }}
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
