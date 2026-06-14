'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ItemType, RecurrenceRule } from '@/lib/types';
import ItemEditModal from '@/components/item-edit-modal';
import { TYPE_COLOR, TYPE_TINT, TYPE_LABEL, TYPE_OPTIONS } from '@/lib/item-style';
import { TypeIcon } from '@/components/type-icon';
import { Pebble } from '@/components/pebble';
import { useToast } from '@/components/toast';

interface Item {
  id: string;
  title: string;
  description: string | null;
  type: ItemType;
  timeframe: string;
  is_completed: boolean;
  owner_user_id: string | null;
  created_by: string;
  is_recurring: boolean;
  recurrence_rule: RecurrenceRule | null;
  event_date: string | null;
}

interface Member {
  user_id: string;
  display_name: string;
  avatar: string;
  color: string;
}

interface Props {
  workspaceId: string;
  userId: string;
  initialItems: Item[];
  members: Member[];
  initialYear: number;
  initialMonth: number;
}

const TYPES: ItemType[] = ['TODO', 'WISH', 'ETC'];

function TypeBucket({ type, count }: { type: ItemType; count: number }) {
  const color = TYPE_COLOR[type];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 2px 10px' }}>
      <div style={{ width: 8, height: 8, borderRadius: 9999, background: color, flexShrink: 0 }}/>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#9A7553', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
        {TYPE_LABEL[type]}
      </div>
      <div style={{ flex: 1, height: 1, background: '#EADFC7' }}/>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#8A7359' }}>{count}</div>
    </div>
  );
}

export default function MonthBoard({ workspaceId, userId, initialItems, members, initialYear, initialMonth }: Props) {
  const { showToast } = useToast();
  const now = new Date();
  const curYear  = now.getFullYear();
  const curMonth = now.getMonth() + 1;

  const [viewYear, setViewYear]   = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);
  const [items, setItems]         = useState<Item[]>(initialItems);
  const [loading, setLoading]     = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showForm, setShowForm]   = useState(false);

  const viewRef = useRef({ year: viewYear, month: viewMonth });
  useEffect(() => { viewRef.current = { year: viewYear, month: viewMonth }; }, [viewYear, viewMonth]);

  async function loadMonth(y: number, m: number) {
    setLoading(true);
    const supabase = createClient();
    const firstDay = new Date(y, m - 1, 1).toISOString();
    const lastDay  = new Date(y, m, 0, 23, 59, 59).toISOString();
    const { data } = await supabase
      .from('items')
      .select('id, title, description, type, timeframe, is_completed, owner_user_id, created_by, is_recurring, recurrence_rule, event_date')
      .eq('workspace_id', workspaceId)
      .gte('created_at', firstDay)
      .lte('created_at', lastDay)
      .order('created_at', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  function navigate(delta: number) {
    let y = viewYear, m = viewMonth + delta;
    if (m > 12) { y++; m = 1; }
    if (m < 1)  { y--; m = 12; }
    setViewYear(y); setViewMonth(m);
    loadMonth(y, m);
  }

  const isCurrentMonth = viewYear === curYear && viewMonth === curMonth;

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`board:${workspaceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items', filter: `workspace_id=eq.${workspaceId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const d = new Date(payload.new.created_at as string);
          const { year, month } = viewRef.current;
          if (d.getFullYear() === year && d.getMonth() + 1 === month) {
            setItems((prev) => prev.some((i) => i.id === payload.new.id) ? prev : [payload.new as Item, ...prev]);
          }
        } else if (payload.eventType === 'UPDATE') {
          setItems((prev) => prev.map((i) => i.id === payload.new.id ? (payload.new as Item) : i));
        } else if (payload.eventType === 'DELETE') {
          setItems((prev) => prev.filter((i) => i.id !== payload.old.id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [workspaceId]);

  async function toggleComplete(item: Item) {
    const supabase = createClient();
    const next = !item.is_completed;
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_completed: next } : i));
    const { error } = await supabase.from('items').update({
      is_completed: next,
      completed_at: next ? new Date().toISOString() : null,
      completed_by: next ? userId : null,
    }).eq('id', item.id);
    if (error) {
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_completed: !next } : i));
      showToast('잠시 후 다시 시도해주세요', 'error');
    }
  }

  function getMember(uid: string | null) {
    return members.find((m) => m.user_id === uid);
  }

  const totalCount = items.length;
  const completedCount = items.filter((i) => i.is_completed).length;

  return (
    <div>
      {/* 월 네비게이션 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 36, height: 36, borderRadius: 9999, border: 'none',
            background: '#FFFCF7', boxShadow: '0 1px 2px rgba(74,46,22,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#7B5530',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#2A1B0E', letterSpacing: '-0.02em' }}>
            {viewYear}년 {viewMonth}월
          </div>
          {isCurrentMonth && (
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9A7CC9', marginTop: 2, letterSpacing: '0.04em' }}>
              이번 달
            </div>
          )}
        </div>

        <button
          onClick={() => navigate(+1)}
          disabled={isCurrentMonth}
          style={{
            width: 36, height: 36, borderRadius: 9999, border: 'none',
            background: isCurrentMonth ? 'transparent' : '#FFFCF7',
            boxShadow: isCurrentMonth ? 'none' : '0 1px 2px rgba(74,46,22,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: isCurrentMonth ? 'default' : 'pointer',
            color: isCurrentMonth ? '#D9C8AC' : '#7B5530',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      {/* 로딩 */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#8A7359', fontSize: 13 }}>
          불러오는 중...
        </div>
      )}

      {/* 진행 요약 */}
      {!loading && totalCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 2px 20px', fontSize: 13, color: '#8A7359' }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: '#EDE3D4', overflow: 'hidden' }}>
            <div style={{ width: `${(completedCount / totalCount) * 100}%`, height: '100%', background: '#9A7CC9', transition: 'width 0.4s ease' }}/>
          </div>
          <span style={{ fontWeight: 700, color: '#5C3A1F', whiteSpace: 'nowrap' }}>
            {completedCount}/{totalCount}
          </span>
        </div>
      )}

      {/* 빈 상태 */}
      {!loading && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0 24px' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🌱</div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#2A1B0E', letterSpacing: '-0.01em' }}>아직 아무것도 없어요</p>
          <p style={{ fontSize: 13, color: '#8A7359', marginTop: 4, lineHeight: 1.5 }}>아래 + 버튼으로 첫 항목을 추가해보세요</p>
        </div>
      )}

      {/* 종류별 그룹 */}
      {!loading && TYPES.map((type) => {
        const typeItems = items.filter((i) => i.type === type);
        if (typeItems.length === 0) return null;
        const incomplete = typeItems.filter((i) => !i.is_completed);
        const completed  = typeItems.filter((i) => i.is_completed);
        return (
          <div key={type}>
            <TypeBucket type={type} count={typeItems.length}/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
              {[...incomplete, ...completed].map((item) => (
                <Pebble
                  key={item.id}
                  item={item}
                  completed={item.is_completed}
                  onToggle={(e) => { e.stopPropagation(); toggleComplete(item); }}
                  onClick={() => setEditingItem(item)}
                  ownerMember={getMember(item.owner_user_id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        style={{
          position: 'fixed', right: 18, bottom: 'calc(96px + env(safe-area-inset-bottom, 0px))', zIndex: 40,
          width: 56, height: 56, borderRadius: 9999,
          background: '#5C3A1F', color: '#FBF6EE', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 16px 32px rgba(74,46,22,0.30), 0 4px 10px rgba(74,46,22,0.16)',
          cursor: 'pointer',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FBF6EE" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>

      {editingItem && (
        <ItemEditModal
          item={editingItem}
          members={members}
          onClose={() => setEditingItem(null)}
          onUpdated={(updated) => {
            setItems((prev) => prev.map((i) => i.id === updated.id ? (updated as Item) : i));
            setEditingItem(null);
          }}
          onDeleted={editingItem.created_by === userId ? (id) => {
            setItems((prev) => prev.filter((i) => i.id !== id));
            setEditingItem(null);
          } : undefined}
        />
      )}

      {showForm && (
        <MonthAddSheet
          workspaceId={workspaceId}
          userId={userId}
          members={members}
          onClose={() => setShowForm(false)}
          onAdded={(item) => setItems((prev) => [item, ...prev])}
        />
      )}
    </div>
  );
}

function MonthAddSheet({ workspaceId, userId, members, onClose, onAdded }: {
  workspaceId: string;
  userId: string;
  members: Member[];
  onClose: () => void;
  onAdded: (item: Item) => void;
}) {
  const { showToast } = useToast();
  const [type, setType] = useState<ItemType>('TODO');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ownerUserId, setOwnerUserId] = useState<string>(userId);
  const [loading, setLoading] = useState(false);
  const composingRef = useRef(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (composingRef.current || !title.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.from('items').insert({
      workspace_id: workspaceId,
      created_by: userId,
      owner_user_id: ownerUserId,
      title: title.trim(),
      description: description.trim() || null,
      type,
      timeframe: 'oneshot',
    }).select().single();
    setLoading(false);
    if (error) { showToast('추가 실패: ' + error.message, 'error'); return; }
    if (data) onAdded(data as Item);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end" style={{ background: 'rgba(42,27,14,0.4)' }} onClick={onClose}>
      <div
        className="w-full max-w-md mx-auto"
        style={{ background: '#FBF6EE', borderRadius: '28px 28px 0 0', padding: '0 16px 0', maxHeight: '92svh', overflowY: 'auto', paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 16px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D9C8AC' }}/>
        </div>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#9A7553', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
          새 항목 추가
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
          {TYPE_OPTIONS.map(({ value, label }) => {
            const on = type === value;
            const color = TYPE_COLOR[value];
            const tint  = TYPE_TINT[value];
            return (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                style={{
                  height: 76, borderRadius: 16, border: 'none',
                  background: on ? '#5C3A1F' : '#FFFCF7',
                  boxShadow: on ? '0 8px 24px rgba(74,46,22,0.22)' : '0 1px 2px rgba(74,46,22,0.05)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <div style={{ width: 30, height: 30, borderRadius: 9999, background: on ? '#FBF6EE' : tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TypeIcon type={value} size={14} color={on ? '#5C3A1F' : color}/>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: on ? '#FBF6EE' : '#2A1B0E' }}>{label}</div>
              </button>
            );
          })}
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ background: '#FFFCF7', borderRadius: 16, padding: '12px 16px', boxShadow: '0 1px 2px rgba(74,46,22,0.05)' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#8A7359', letterSpacing: '0.06em', marginBottom: 4 }}>제목</div>
            <input
              required value={title} onChange={(e) => setTitle(e.target.value)}
              onCompositionStart={() => { composingRef.current = true; }}
              onCompositionEnd={() => { composingRef.current = false; }}
              placeholder="무엇을 함께 할까요?" autoFocus
              style={{ display: 'block', width: '100%', background: 'none', border: 'none', outline: 'none', padding: 0, fontSize: 15, fontWeight: 700, color: '#2A1B0E', letterSpacing: '-0.01em' }}
            />
          </div>
          <div style={{ background: '#FFFCF7', borderRadius: 16, padding: '12px 16px', boxShadow: '0 1px 2px rgba(74,46,22,0.05)' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#8A7359', letterSpacing: '0.06em', marginBottom: 4 }}>메모</div>
            <input
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="메모를 적어볼까요"
              style={{ display: 'block', width: '100%', background: 'none', border: 'none', outline: 'none', padding: 0, fontSize: 14, color: '#5C3A1F', letterSpacing: '-0.01em' }}
            />
          </div>
          {members.length > 1 && (
            <div style={{ background: '#FFFCF7', borderRadius: 16, padding: '12px 16px', boxShadow: '0 1px 2px rgba(74,46,22,0.05)' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#8A7359', letterSpacing: '0.06em', marginBottom: 4 }}>누가</div>
              <select
                value={ownerUserId} onChange={(e) => setOwnerUserId(e.target.value)}
                style={{ display: 'block', width: '100%', background: 'none', border: 'none', outline: 'none', padding: 0, fontSize: 14, fontWeight: 700, color: '#2A1B0E', cursor: 'pointer' }}
              >
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>{m.avatar} {m.display_name}</option>
                ))}
              </select>
            </div>
          )}
          <button
            type="submit" disabled={loading}
            style={{
              marginTop: 4, height: 52, borderRadius: 9999, border: 'none',
              background: '#5C3A1F', color: '#FBF6EE',
              fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em',
              cursor: 'pointer', opacity: loading ? 0.55 : 1,
              boxShadow: '0 8px 24px rgba(74,46,22,0.22)',
            }}
          >
            {loading ? '추가 중...' : '추가하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
