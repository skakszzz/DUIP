'use client';

import { useState } from 'react';
import { useDragSheet } from '@/lib/use-drag-sheet';
import { createClient } from '@/lib/supabase/client';
import type { ItemType, RecurrenceRule } from '@/lib/types';
import { RecurrenceEditor } from './recurrence-editor';
import DateInput from './date-input';

export interface EditableItem {
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

export interface EditMember {
  user_id: string;
  display_name: string;
  avatar: string;
  color: string;
}

interface Props {
  item: EditableItem;
  members: EditMember[];
  onClose: () => void;
  onUpdated: (updated: EditableItem) => void;
  onDeleted?: (id: string) => void;
  /** Phase 4: 반복 설정 영역을 주입할 수 있는 슬롯 */
  recurrenceSlot?: React.ReactNode;
}

const TYPE_TABS: { value: ItemType; emoji: string; label: string }[] = [
  { value: 'TODO', emoji: '✅', label: '할일' },
  { value: 'WISH', emoji: '✨', label: '소망' },
  { value: 'ETC', emoji: '🏷️', label: '기타' },
];

export const TIMEFRAME_OPTIONS = [
  { value: 'daily',   label: '오늘' },
  { value: 'weekly',  label: '이번 주' },
  { value: 'monthly', label: '이번 달' },
  { value: 'yearly',  label: '올해' },
  { value: 'oneshot', label: '한 번' },
];

export default function ItemEditModal({ item, members, onClose, onUpdated, onDeleted, recurrenceSlot }: Props) {
  const { dragProps, sheetStyle } = useDragSheet(onClose);
  const [type, setType]               = useState<ItemType>(item.type);
  const [title, setTitle]             = useState(item.title);
  const [description, setDescription] = useState(item.description ?? '');
  const [timeframe, setTimeframe]     = useState(item.timeframe);
  const [ownerUserId, setOwnerUserId] = useState(item.owner_user_id ?? '');
  const [isRecurring, setIsRecurring] = useState(item.is_recurring ?? false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | null>(item.recurrence_rule ?? null);
  const [eventDate, setEventDate]     = useState(item.event_date ?? '');
  const [scheduleMode, setScheduleMode] = useState<null | 'date' | 'recurring'>(
    item.event_date ? 'date' : item.is_recurring ? 'recurring' : null
  );
  const [saving, setSaving]           = useState(false);

  function pickMode(mode: 'date' | 'recurring') {
    if (scheduleMode === mode) { setScheduleMode(null); return; }
    setScheduleMode(mode);
    if (mode === 'date') { setIsRecurring(false); setRecurrenceRule(null); }
    else { setEventDate(''); }
  }
  const [deleting, setDeleting]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('items')
      .update({
        type,
        title: title.trim(),
        description: description.trim() || null,
        timeframe,
        owner_user_id: ownerUserId || null,
        is_recurring: scheduleMode === 'recurring' && isRecurring,
        recurrence_rule: scheduleMode === 'recurring' && isRecurring ? recurrenceRule : null,
        event_date: scheduleMode === 'date' ? eventDate || null : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id)
      .select()
      .single();
    setSaving(false);
    if (error) { alert('수정 실패: ' + error.message); return; }
    if (data) onUpdated(data as EditableItem);
    onClose();
  }

  async function handleDelete() {
    if (!onDeleted) return;
    if (!confirm('이 항목을 삭제할까요?')) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from('items').delete().eq('id', item.id);
    setDeleting(false);
    if (error) { alert('삭제 실패: ' + error.message); return; }
    onDeleted(item.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-[60]" onClick={onClose}>
      <div
        className="w-full bg-[#FBF6EE] rounded-t-3xl p-6 max-w-md mx-auto"
        style={{
          ...sheetStyle,
          maxHeight: '92svh', overflowY: 'auto',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div {...dragProps} style={{ ...dragProps.style, display: 'flex', justifyContent: 'center', paddingBottom: 20 }}>
          <div className="w-10 h-1 bg-[#E8D5B8] rounded-full" />
        </div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#5C3A1F]">항목 수정</h2>
          {onDeleted && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-[#C8B89A] hover:text-red-400 transition-colors disabled:opacity-50"
            >
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 유형 */}
          <div className="flex gap-2">
            {TYPE_TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs transition-all ${
                  type === t.value ? 'bg-[#5C3A1F] text-white' : 'bg-[#F4E8D6] text-[#9B7B52]'
                }`}
              >
                <span className="text-base">{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* 제목 */}
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="rounded-xl border border-[#E8D5B8] bg-white px-4 py-3 text-[#5C3A1F] placeholder:text-[#C8B89A] focus:outline-none focus:ring-2 focus:ring-[#B86F4B] text-base"
          />

          {/* 메모 */}
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="메모 (선택)"
            className="rounded-xl border border-[#E8D5B8] bg-white px-4 py-3 text-[#5C3A1F] placeholder:text-[#C8B89A] focus:outline-none focus:ring-2 focus:ring-[#B86F4B] text-base"
          />

          {/* 기간 + 담당자 */}
          <div className="flex gap-2">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="flex-1 rounded-xl border border-[#E8D5B8] bg-white px-3 py-2.5 text-[#5C3A1F] text-sm focus:outline-none"
            >
              {TIMEFRAME_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <select
              value={ownerUserId}
              onChange={(e) => setOwnerUserId(e.target.value)}
              className="flex-1 rounded-xl border border-[#E8D5B8] bg-white px-3 py-2.5 text-[#5C3A1F] text-sm focus:outline-none"
            >
              {members.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.avatar} {m.display_name}
                </option>
              ))}
            </select>
          </div>

          {/* 날짜 / 반복 토글 */}
          <div className="rounded-xl border border-[#E8D5B8] bg-white px-3 py-2.5">
            <div className="flex gap-2">
              {(['date', 'recurring'] as const).map((mode) => {
                const on = scheduleMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => pickMode(mode)}
                    className="flex-1 h-8 rounded-full text-xs font-extrabold transition-all"
                    style={{
                      background: on ? '#5C3A1F' : '#F4E8D6',
                      color: on ? '#FBF6EE' : '#9B7B52',
                      border: 'none', cursor: 'pointer',
                    }}
                  >
                    {mode === 'date' ? '날짜 선택' : '반복 설정'}
                  </button>
                );
              })}
            </div>

            {scheduleMode === 'date' && (
              <div className="flex items-center gap-2 mt-3">
                <DateInput
                  value={eventDate}
                  onChange={setEventDate}
                  inputStyle={{ fontSize: 14, color: '#5C3A1F' }}
                />
                {eventDate && (
                  <button
                    type="button"
                    onClick={() => setEventDate('')}
                    className="text-xs text-[#C8B89A] hover:text-[#9B7B52] flex-shrink-0"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {scheduleMode === 'recurring' && (
              <div className="mt-3">
                <RecurrenceEditor
                  isRecurring={isRecurring}
                  rule={recurrenceRule}
                  onChange={(recurring, rule) => { setIsRecurring(recurring); setRecurrenceRule(rule); }}
                />
                {recurrenceSlot}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#5C3A1F] py-3 text-[#FBF6EE] font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
