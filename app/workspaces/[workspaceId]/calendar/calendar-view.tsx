'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import FloatingSheet from '@/components/floating-sheet';
import { EmptyCalendar } from '@/components/empty-states';
import { createClient } from '@/lib/supabase/client';
import { kstNow } from '@/lib/dates';
import type { ItemType } from '@/lib/types';
import { OwnerAvatar } from '@/components/owner-avatar';
import { TYPE_COLOR, TYPE_TINT, TYPE_LABEL, TYPE_OPTIONS } from '@/lib/item-style';
import { TypeIcon } from '@/components/type-icon';
import { useToast } from '@/components/toast';

interface CalItem {
  id: string;
  title: string;
  type: ItemType;
  event_date: string; // 'YYYY-MM-DD'
  event_end_date?: string | null; // null = 단일 날짜, 값 = 여러 날 리본
  is_completed: boolean;
  owner_user_id: string | null;
  is_shared?: boolean;
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
  initialItems: CalItem[];
  members: Member[];
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function toDateKey(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function CalendarView({ workspaceId, userId, initialItems, members }: Props) {
  const { showToast } = useToast();
  const router = useRouter();
  const now = kstNow();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-based
  const [items, setItems] = useState<CalItem[]>(initialItems);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [addDateKey, setAddDateKey] = useState('');

  // 파트너 변경 실시간 동기화
  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handlePayload(payload: { eventType: string; new: any; old: any }) {
      if (payload.eventType === 'INSERT') {
        const n = payload.new as CalItem;
        if (!n.event_date) return;
        setItems((prev) => prev.some((i) => i.id === n.id) ? prev : [...prev, n]);
      } else if (payload.eventType === 'UPDATE') {
        const n = payload.new as CalItem;
        if (!n.event_date) {
          setItems((prev) => prev.filter((i) => i.id !== n.id));
        } else {
          setItems((prev) => prev.map((i) => i.id === n.id ? n : i));
        }
      } else if (payload.eventType === 'DELETE') {
        setItems((prev) => prev.filter((i) => i.id !== payload.old.id));
      }
    }

    function subscribe() {
      channel = supabase
        .channel(`calendar:${workspaceId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'items', filter: `workspace_id=eq.${workspaceId}` }, handlePayload)
        .subscribe();
    }

    function unsubscribe() {
      if (channel) { supabase.removeChannel(channel); channel = null; }
    }

    function handleVisibility() {
      if (document.hidden) { unsubscribe(); } else { subscribe(); }
    }

    subscribe();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      unsubscribe();
    };
  }, [workspaceId]);

  // 달력 그리드 계산
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();

  // 날짜별 아이템 그룹 (단일 날짜 칩용)
  const itemsByDate: Record<string, CalItem[]> = {};
  for (const item of items) {
    if (!item.event_date) continue;
    const d = item.event_date.slice(0, 10);
    if (!itemsByDate[d]) itemsByDate[d] = [];
    itemsByDate[d].push(item);
  }

  // 여러 날 리본 아이템 — 이 달과 겹치는 이벤트 전체 포함
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  const monthStart = `${monthKey}-01`;
  const monthEnd   = `${monthKey}-${String(daysInMonth).padStart(2, '0')}`;
  const ribbonItems = items.filter(
    i => i.event_end_date && i.event_end_date > i.event_date
      && i.event_date <= monthEnd && i.event_end_date >= monthStart
  );

  // 주(week) 배열 빌드: 각 week는 7개 (null = 빈 칸)
  const weeks: Array<Array<number | null>> = [];
  let curWeek: Array<number | null> = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    curWeek.push(d);
    if (curWeek.length === 7) { weeks.push(curWeek); curWeek = []; }
  }
  if (curWeek.length > 0) {
    while (curWeek.length < 7) curWeek.push(null);
    weeks.push(curWeek);
  }

  // 이 주에서 리본이 걸치는 열 계산
  function layoutWeekRibbons(week: Array<number | null>) {
    return ribbonItems.flatMap(item => {
      // 이 달 이전에 시작했으면 1일부터, 이 달 이후에 끝나면 말일까지 클램핑
      const startsThisMonth = item.event_date.slice(0, 7) === monthKey;
      const endsThisMonth   = item.event_end_date!.slice(0, 7) === monthKey;
      const startD = startsThisMonth ? parseInt(item.event_date.slice(8, 10)) : 1;
      const endD   = endsThisMonth   ? parseInt(item.event_end_date!.slice(8, 10)) : daysInMonth;

      let fromCol = -1, toCol = -1, startsHere = false, endsHere = false;
      week.forEach((day, ci) => {
        if (day === null) return;
        if (day >= startD && day <= endD) {
          if (fromCol === -1) { fromCol = ci; if (startsThisMonth && day === startD) startsHere = true; }
          toCol = ci;
          if (endsThisMonth && day === endD) endsHere = true;
        }
      });
      if (fromCol === -1) return [];
      return [{ item, fromCol, toCol, startsHere, endsHere }];
    });
  }

  function prevMonth() {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
    setSelectedDay(null);
  }

  const selectedKey = selectedDay ? toDateKey(year, month, selectedDay) : null;
  const selectedItems = selectedKey ? (itemsByDate[selectedKey] ?? []) : [];

  async function toggleComplete(item: CalItem) {
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
    } else {
      router.refresh();
    }
  }

  const isToday = (d: number) => year === now.getFullYear() && month === now.getMonth() + 1 && d === now.getDate();

  return (
    <div className="duip-page-enter" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* 월 네비게이션 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 4px 20px' }}>
        <button
          onClick={prevMonth}
          style={{ width: 36, height: 36, borderRadius: 9999, background: '#FFFCF7', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(74,46,22,0.05)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B5530" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#2A1B0E', letterSpacing: '-0.025em' }}>
            {year}년 {month}월
          </div>
        </div>
        <button
          onClick={nextMonth}
          style={{ width: 36, height: 36, borderRadius: 9999, background: '#FFFCF7', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(74,46,22,0.05)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B5530" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      {/* 페이퍼 카드 배경 */}
      <div style={{
        borderRadius: 24,
        padding: '14px 10px 8px',
        background: '#FFFCF7',
        boxShadow: '0 2px 8px rgba(74,46,22,0.06), 0 1px 2px rgba(74,46,22,0.04)',
      }}>
        {/* 요일 헤더 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
          {WEEKDAYS.map((wd, i) => (
            <div key={wd} style={{
              textAlign: 'center', fontSize: 11, fontWeight: 800,
              color: i === 0 ? '#C77C6A' : i === 6 ? '#7C9466' : '#8A7359',
              paddingBottom: 6, letterSpacing: '0.06em',
            }}>
              {wd}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 — 주(week)별 행으로 렌더링해 리본 오버레이 지원 */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {weeks.map((week, wi) => {
            const weekRibbons = layoutWeekRibbons(week);
            return (
              <div key={wi} style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {week.map((day, ci) => {
                  if (day === null) return <div key={`e-${wi}-${ci}`} style={{ minHeight: 72 }}/>;
                  const key = toDateKey(year, month, day);
                  // 리본 아이템은 칩에서 제외
                  const chipItems = (itemsByDate[key] ?? []).filter(
                    i => !i.event_end_date || i.event_end_date <= i.event_date
                  );
                  const isSelected = selectedDay === day;
                  const today = isToday(day);
                  const isSun = (firstDay + day - 1) % 7 === 0;
                  const isSat = (firstDay + day - 1) % 7 === 6;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                      style={{
                        minHeight: 72, display: 'flex', flexDirection: 'column', alignItems: 'center',
                        padding: '7px 0 8px',
                        borderRadius: 14,
                        background: isSelected ? '#5C3A1F' : today ? '#F6E7B8' : 'transparent',
                        boxShadow: today && !isSelected ? 'inset 0 0 0 1.5px rgba(201,149,53,0.35)' : 'none',
                        border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                      }}
                    >
                      <span style={{
                        fontSize: 14, fontWeight: 800, lineHeight: 1, marginBottom: 5,
                        color: isSelected ? '#FBF6EE' : today ? '#34200E' : isSun ? '#C77C6A' : isSat ? '#7C9466' : '#2A1B0E',
                      }}>
                        {day}
                      </span>
                      {/* 단일 날짜 칩 도트 */}
                      <div style={{ display: 'flex', gap: 3, minHeight: 6, alignItems: 'center' }}>
                        {chipItems.slice(0, 3).map((item, idx) => (
                          <div key={idx} style={{
                            width: 5, height: 5, borderRadius: 9999,
                            background: isSelected ? 'rgba(251,246,238,0.75)' : TYPE_COLOR[item.type],
                            opacity: item.is_completed ? 0.45 : 1,
                          }}/>
                        ))}
                        {chipItems.length > 3 && <div style={{ width: 5, height: 5, borderRadius: 9999, background: 'rgba(158,143,127,0.45)' }}/>}
                      </div>
                    </button>
                  );
                })}
                {/* 여러 날 리본 오버레이 */}
                {weekRibbons.map(({ item, fromCol, toCol, startsHere, endsHere }) => {
                  const colW = 100 / 7;
                  const borderL = startsHere ? 9999 : 4;
                  const borderR = endsHere   ? 9999 : 4;
                  return (
                    <div
                      key={item.id + '-' + wi}
                      style={{
                        position: 'absolute',
                        left: `calc(${fromCol * colW}% + 3px)`,
                        width: `calc(${(toCol - fromCol + 1) * colW}% - 6px)`,
                        top: 36,
                        height: 16,
                        background: TYPE_TINT[item.type],
                        color: TYPE_COLOR[item.type],
                        borderTopLeftRadius: borderL, borderBottomLeftRadius: borderL,
                        borderTopRightRadius: borderR, borderBottomRightRadius: borderR,
                        display: 'flex', alignItems: 'center', padding: '0 6px',
                        fontSize: 10, fontWeight: 800, letterSpacing: '-0.01em',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        boxShadow: `0 1px 3px rgba(74,46,22,0.10), inset 0 0 0 1px rgba(255,255,255,0.45)`,
                        pointerEvents: 'none',
                      }}
                    >
                      {startsHere && item.title}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* 이 달 일정 없음 */}
      {items.length === 0 && selectedDay === null && <EmptyCalendar />}

      {/* 날짜 선택 상세 패널 */}
      {selectedDay !== null && (
        <div style={{ marginTop: 20, borderRadius: 24, background: '#FFFCF7', padding: '18px 16px 16px', boxShadow: '0 2px 8px rgba(74,46,22,0.06), 0 1px 2px rgba(74,46,22,0.04)' }}>
          {/* 패널 헤더 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#2A1B0E', letterSpacing: '-0.02em' }}>
              {month}월 {selectedDay}일
              {isToday(selectedDay) && (
                <span style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 800, color: '#5C3A1F', background: 'rgba(92,58,31,0.08)', padding: '2px 8px', borderRadius: 9999 }}>
                  오늘
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setAddDateKey(toDateKey(year, month, selectedDay));
                setShowAddSheet(true);
              }}
              style={{
                height: 32, padding: '0 14px', borderRadius: 9999, border: 'none',
                background: '#5C3A1F', color: '#FBF6EE',
                fontSize: 12, fontWeight: 800, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              추가
            </button>
          </div>

          {/* 아이템 목록 */}
          {selectedItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px 0', color: '#8A7359', fontSize: 13 }}>
              이 날에는 아직 아무것도 없어요
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedItems.map((item) => {
                const color  = TYPE_COLOR[item.type];
                const tint   = TYPE_TINT[item.type];
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: item.is_completed ? `${tint}55` : '#F8F3EC',
                      borderRadius: 16, padding: '10px 12px',
                    }}
                  >
                    <button
                      onClick={() => toggleComplete(item)}
                      style={{
                        flexShrink: 0, width: 28, height: 28, borderRadius: 9999,
                        background: item.is_completed ? color : tint,
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: item.is_completed ? 'none' : `inset 0 0 0 1.5px ${color}40`,
                      }}
                    >
                      {item.is_completed
                        ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5 10 17.5 19 7.5"/></svg>
                        : <TypeIcon type={item.type} size={13} color={color}/>
                      }
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 700, color: item.is_completed ? '#B09779' : '#2A1B0E',
                        textDecorationLine: item.is_completed ? 'line-through' : 'none',
                        textDecorationColor: '#B09779',
                        letterSpacing: '-0.01em', lineHeight: 1.25,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 11, color: TYPE_COLOR[item.type], fontWeight: 700, marginTop: 1 }}>
                        {TYPE_LABEL[item.type]}
                      </div>
                    </div>
                    <OwnerAvatar item={item} members={members} size={22} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 추가 시트 */}
      {showAddSheet && (
        <CalAddSheet
          workspaceId={workspaceId}
          userId={userId}
          members={members}
          presetDate={addDateKey}
          onClose={() => setShowAddSheet(false)}
          onAdded={(item) => setItems((prev) => [...prev, item])}
        />
      )}
    </div>
  );
}

// ── 캘린더 추가 시트 ──────────────────────────────────────────────
function CalAddSheet({ workspaceId, userId, members, presetDate, onClose, onAdded }: {
  workspaceId: string;
  userId: string;
  members: Member[];
  presetDate: string;
  onClose: () => void;
  onAdded: (item: CalItem) => void;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const composingRef = useRef(false);
  const [type, setType] = useState<ItemType>('TODO');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(presetDate);
  const [multiDay, setMultiDay] = useState(false);
  const [eventEndDate, setEventEndDate] = useState('');
  const [ownerUserId, setOwnerUserId] = useState<string>(userId);
  const [isShared, setIsShared] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (composingRef.current || !title.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const endDate = multiDay && eventEndDate && eventEndDate > eventDate ? eventEndDate : null;
    const { data, error } = await supabase.from('items').insert({
      workspace_id: workspaceId,
      created_by: userId,
      owner_user_id: isShared ? null : ownerUserId,
      is_shared: isShared,
      title: title.trim(),
      description: description.trim() || null,
      type,
      timeframe: 'oneshot',
      event_date: eventDate || null,
      event_end_date: endDate,
    }).select().single();
    setLoading(false);
    if (error) { showToast('추가 실패: ' + error.message, 'error'); return; }
    if (data) onAdded(data as CalItem);
    router.refresh();
    onClose();
  }

  return (
    <FloatingSheet onClose={onClose} scrim="rgba(42,27,14,0.40)">
        <p style={{ fontSize: 11, fontWeight: 800, color: '#9A7553', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
          새 항목 추가
        </p>

        {/* 종류 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
          {TYPE_OPTIONS.map(({ value, label }) => {
            const on = type === value;
            const color = TYPE_COLOR[value];
            const tint  = TYPE_TINT[value];
            return (
              <button
                key={value} type="button" onClick={() => setType(value)}
                style={{
                  height: 70, borderRadius: 16, border: 'none',
                  background: on ? '#5C3A1F' : '#FFFCF7',
                  boxShadow: on ? '0 8px 24px rgba(74,46,22,0.22)' : '0 1px 2px rgba(74,46,22,0.05)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                  cursor: 'pointer',
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 9999, background: on ? '#FBF6EE' : tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TypeIcon type={value} size={13} color={on ? '#5C3A1F' : color}/>
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: on ? '#FBF6EE' : '#2A1B0E' }}>{label}</div>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* 제목 */}
          <div style={{ background: '#FFFCF7', borderRadius: 16, padding: '12px 16px', boxShadow: '0 1px 2px rgba(74,46,22,0.05)' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#8A7359', letterSpacing: '0.06em', marginBottom: 4 }}>제목</div>
            <input
              required value={title} onChange={(e) => setTitle(e.target.value)}
              onCompositionStart={() => { composingRef.current = true; }}
              onCompositionEnd={(e) => { composingRef.current = false; setTitle((e.target as HTMLInputElement).value); }}
              placeholder="무엇을 함께 할까요?" autoFocus
              style={{ display: 'block', width: '100%', background: 'none', border: 'none', outline: 'none', padding: 0, fontSize: 16, fontWeight: 700, color: '#2A1B0E', letterSpacing: '-0.01em' }}
            />
          </div>

          {/* 날짜 */}
          <div style={{ background: '#FFFCF7', borderRadius: 16, padding: '12px 16px', boxShadow: '0 1px 2px rgba(74,46,22,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#8A7359', letterSpacing: '0.06em' }}>언제</div>
              <button
                type="button"
                onClick={() => { setMultiDay(v => !v); if (multiDay) setEventEndDate(''); }}
                style={{
                  height: 22, padding: '0 10px', borderRadius: 9999, border: 'none',
                  background: multiDay ? '#5C3A1F' : '#F4E8D6',
                  color: multiDay ? '#FBF6EE' : '#9B7B52',
                  fontSize: 10, fontWeight: 800, cursor: 'pointer',
                }}
              >
                여러 날
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', padding: 0, fontSize: 16, fontWeight: 700, color: '#2A1B0E', cursor: 'pointer' }}
              />
              {multiDay && (
                <>
                  <span style={{ fontSize: 12, color: '#B09779' }}>~</span>
                  <input
                    type="date" value={eventEndDate} min={eventDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', padding: 0, fontSize: 16, fontWeight: 700, color: '#2A1B0E', cursor: 'pointer' }}
                  />
                </>
              )}
            </div>
          </div>

          {/* 메모 */}
          <div style={{ background: '#FFFCF7', borderRadius: 16, padding: '12px 16px', boxShadow: '0 1px 2px rgba(74,46,22,0.05)' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#8A7359', letterSpacing: '0.06em', marginBottom: 4 }}>메모</div>
            <input
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="메모를 적어볼까요"
              style={{ display: 'block', width: '100%', background: 'none', border: 'none', outline: 'none', padding: 0, fontSize: 16, color: '#5C3A1F', letterSpacing: '-0.01em' }}
            />
          </div>

          {/* 담당자 */}
          {members.length > 1 && (
            <div style={{ background: '#FFFCF7', borderRadius: 16, padding: '12px 16px', boxShadow: '0 1px 2px rgba(74,46,22,0.05)' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#8A7359', letterSpacing: '0.06em', marginBottom: 4 }}>누가</div>
              <select
                value={isShared ? '__shared__' : ownerUserId}
                onChange={(e) => {
                  if (e.target.value === '__shared__') { setIsShared(true); }
                  else { setIsShared(false); setOwnerUserId(e.target.value); }
                }}
                style={{ display: 'block', width: '100%', background: 'none', border: 'none', outline: 'none', padding: 0, fontSize: 14, fontWeight: 700, color: '#2A1B0E', cursor: 'pointer' }}
              >
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>{m.avatar} {m.display_name}</option>
                ))}
                <option value="__shared__">👥 둘이 같이</option>
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
    </FloatingSheet>
  );
}
