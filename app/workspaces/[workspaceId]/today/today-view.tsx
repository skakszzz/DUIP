'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useDragSheet } from '@/lib/use-drag-sheet';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { kstToday, kstDateOf } from '@/lib/dates';
import { useToast } from '@/components/toast';
import { STAGE_NEED, stageFromPoints } from '@/lib/growth';
import { TYPE_COLOR, TYPE_TINT, TYPE_OPTIONS } from '@/lib/item-style';
import { TypeIcon } from '@/components/type-icon';
import { Pebble } from '@/components/pebble';
import type { ItemType, RecurrenceRule, SoilType, TreeType } from '@/lib/types';
import { PlantGrow } from '@/components/plant-grow';
import { EmptyHome } from '@/components/empty-states';
import { RecurrenceEditor } from '@/components/recurrence-editor';
import DateInput from '@/components/date-input';
import PushBanner from '@/components/push-banner';
import Link from 'next/link';

const ItemEditModal = dynamic(() => import('@/components/item-edit-modal'), { ssr: false });
const BloomOverlay = dynamic(() => import('@/components/bloom-overlay'), { ssr: false });
const PlantPickerSheet = dynamic(() => import('@/components/plant-picker-sheet'), { ssr: false });
const TreePickerSheet = dynamic(() => import('@/components/tree-picker-sheet'), { ssr: false });

interface Item {
  id: string;
  title: string;
  description: string | null;
  type: ItemType;
  timeframe: string;
  is_completed: boolean;
  completed_at: string | null;
  owner_user_id: string | null;
  is_shared?: boolean;
  created_by: string;
  is_recurring: boolean;
  recurrence_rule: RecurrenceRule | null;
  recurrence_last_done: string | null; // "YYYY-MM-DD"
  event_date: string | null;
}

interface Member {
  user_id: string;
  display_name: string;
  avatar: string;
  color: string;
}

interface MonthlyPot {
  plant_id: string | null;
  soil_type: string;
  growth_points: number;
}

interface Props {
  workspaceId: string;
  userId: string;
  initialItems: Item[];
  members: Member[];
  workspaceName: string;
  serverToday: string;
  monthlyPot: MonthlyPot | null;
  treeType: string;
  treeSelectedYear: number | null;
  currentUser: { displayName: string; avatar: string; color: string };
}

function getTodayLabel(serverToday: string) {
  // 'T12:00:00' 추가로 로컬 타임존에서 올바른 요일/날짜 파싱
  const d = new Date(serverToday + 'T12:00:00');
  const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const weekdays = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
  return { month: months[d.getMonth()], date: d.getDate(), day: weekdays[d.getDay()] };
}

function getCurrentMonth(serverToday: string) {
  return parseInt(serverToday.slice(5, 7), 10);
}

// ── 반복 헬퍼 ────────────────────────────────────────────────────
function matchesToday(rule: RecurrenceRule, serverToday: string): boolean {
  const d = new Date(serverToday + 'T12:00:00');
  if (rule.pattern === 'daily') return true;
  if (rule.pattern === 'weekly') return rule.weekdays?.includes(d.getDay()) ?? false;
  if (rule.pattern === 'monthly') return rule.monthDay === d.getDate();
  return false;
}

function isCompletedToday(item: Item, serverToday: string): boolean {
  if (!item.is_recurring) {
    return item.is_completed && !!item.completed_at && kstDateOf(item.completed_at) === serverToday;
  }
  return item.recurrence_last_done === serverToday;
}

// ── 섹션 구분선 ──────────────────────────────────────────────────
function Bucket({ label, count }: { label: string; count?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 2px 10px' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#9A7553', letterSpacing: '0.14em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {label}
      </div>
      <div style={{ flex: 1, height: 1, background: '#EADFC7' }}/>
      {count != null && (
        <div style={{ fontSize: 11, fontWeight: 700, color: '#8A7359' }}>{count}</div>
      )}
    </div>
  );
}

// ── 이번 달 식물 카드 ─────────────────────────────────────────────
function MonthlyPlantCard({
  month, completedCount, total, expanded, onToggle, monthlyPot, onBloom,
}: {
  month: number; completedCount: number; total: number;
  expanded: boolean; onToggle: () => void;
  monthlyPot: MonthlyPot | null;
  onBloom: () => void;
}) {
  const pct = total > 0 ? completedCount / total : 0;
  const pts = monthlyPot?.growth_points ?? 0;
  const stage = stageFromPoints(pts);
  const base = (STAGE_NEED as readonly number[])[stage - 1] ?? 0;
  const next = (STAGE_NEED as readonly number[])[stage] ?? base;

  if (!expanded) {
    return (
      <div
        onClick={onToggle}
        style={{
          margin: '0 0 14px',
          background: 'linear-gradient(140deg, rgba(220,209,232,0.5), #FFFCF7)',
          borderRadius: 20, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 1px 2px rgba(74,46,22,0.05)',
          cursor: 'pointer',
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <PlantGrow
            plantId={monthlyPot?.plant_id ?? 'lavender'}
            stage={stage} size={44}
            leavesIn={pts - base} leavesNeeded={Math.max(1, next - base)}
            showRing={false}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#2A1B0E', letterSpacing: '-0.02em' }}>
            {month}월 · 성장 중
          </div>
          <div style={{ marginTop: 5, height: 4, borderRadius: 2, background: '#F4EBD9', overflow: 'hidden' }}>
            <div style={{ width: `${pct * 100}%`, height: '100%', background: '#9A7CC9', transition: 'width 0.4s ease' }}/>
          </div>
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: '#5C3A1F', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
          {completedCount}/{total}
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A7359" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>
    );
  }

  return (
    <div
      onClick={onToggle}
      style={{
        margin: '0 0 14px',
        background: 'linear-gradient(160deg, rgba(220,209,232,0.55) 0%, rgba(246,231,184,0.4) 55%, #FFFCF7 100%)',
        borderRadius: 28, padding: '18px 20px',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(74,46,22,0.06), 0 1px 2px rgba(74,46,22,0.04)',
        cursor: 'pointer',
      }}
    >
      {/* 배경 글로우 */}
      <div style={{
        position: 'absolute', top: -50, right: -50,
        width: 180, height: 180, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(242,198,110,0.35), transparent 70%)',
        pointerEvents: 'none',
      }}/>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* SVG 일러스트 + 성장 링 */}
        <div style={{ flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <PlantGrow
            plantId={monthlyPot?.plant_id ?? 'lavender'}
            stage={stage} size={88}
            leavesIn={pts - base} leavesNeeded={Math.max(1, next - base)}
            onBloom={onBloom}
          />
        </div>

        {/* 텍스트 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 10.5, fontWeight: 800, color: '#5C3A1F',
            background: 'rgba(255,253,247,0.75)',
            padding: '4px 10px', borderRadius: 9999,
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: '#9A7CC9', flexShrink: 0 }}/>
            {month}월 · 성장 중
          </div>
          <div style={{ marginTop: 8, fontSize: 19, fontWeight: 800, color: '#2A1B0E', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            오늘 {completedCount}/{total} 완료
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: '#5C3A1F', lineHeight: 1.45 }}>
            {total === 0
              ? '오늘 할 일을 추가해보세요'
              : pct === 1
              ? '모두 완료했어요! 🎉'
              : `${total - completedCount}개 남았어요`}
          </div>
        </div>

        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A7359" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M18 15l-6-6-6 6"/>
        </svg>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────────────────
export default function TodayView({ workspaceId, userId, initialItems, members, workspaceName, serverToday, monthlyPot, treeType: initialTreeType, treeSelectedYear, currentUser }: Props) {
  const { showToast } = useToast();
  const router = useRouter();
  const serverTodayRef = useRef(serverToday);
  useEffect(() => { serverTodayRef.current = serverToday; }, [serverToday]);
  const [items, setItems] = useState<Item[]>(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [confirmItem, setConfirmItem] = useState<Item | null>(null);
  const [plantExpanded, setPlantExpanded] = useState(true);
  const [showBloom, setShowBloom] = useState(false);
  const bloomShownRef = useRef(false);
  // localStorage 키: 날짜가 바뀌면 자동으로 초기화됨
  const bloomStorageKey = `bloom_${workspaceId}_${serverToday}`;

  // ── 화분 & 보호수 선택 ────────────────────────────────────────
  const [yearStr, monthStr] = serverToday.split('-');
  const currentYear  = parseInt(yearStr);
  const currentMonth = parseInt(monthStr);

  const [monthlyPotState, setMonthlyPotState] = useState<MonthlyPot | null>(monthlyPot);
  const [treeType, setTreeType] = useState(initialTreeType);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (localStorage.getItem(`invite_banner_dismissed_${workspaceId}`)) setBannerDismissed(true);
  }, [workspaceId]);

  const needsTreePick = (treeSelectedYear ?? 0) < currentYear;
  const [showTreePicker, setShowTreePicker]   = useState(needsTreePick);
  // row는 서버에서 자동 생성되므로(plant_id null) 존재 여부가 아닌 plant_id로 판단
  const [showPlantPicker, setShowPlantPicker] = useState(!needsTreePick && !monthlyPot?.plant_id);

  function handleTreeDone(newTree: TreeType) {
    setTreeType(newTree);
    setShowTreePicker(false);
    if (!monthlyPotState?.plant_id) setShowPlantPicker(true);
  }

  function handlePlantDone(pot: { plant_id: string; soil_type: string; growth_points: number }) {
    setMonthlyPotState({ plant_id: pot.plant_id, soil_type: pot.soil_type, growth_points: pot.growth_points });
    setShowPlantPicker(false);
  }

  // Supabase 실시간 동기화 (탭 숨김 시 일시정지로 배터리·네트워크 절약)
  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handlePayload(payload: { eventType: string; new: any; old: any }) {
      const todayDate = serverTodayRef.current;
      const _d = new Date(todayDate + 'T00:00:00');
      _d.setDate(_d.getDate() + 30);
      const inThirtyDays = _d.toISOString().slice(0, 10);
      if (payload.eventType === 'INSERT') {
        const n = payload.new;
        const isUpcoming = n.event_date && n.event_date > todayDate && n.event_date <= inThirtyDays;
        if (n.timeframe === 'daily' || n.is_recurring || isUpcoming) {
          setItems((prev) => prev.some((i) => i.id === n.id) ? prev : [n as Item, ...prev]);
        }
      } else if (payload.eventType === 'UPDATE') {
        const n = payload.new;
        const isUpcoming = n.event_date && n.event_date > todayDate && n.event_date <= inThirtyDays;
        if (n.timeframe !== 'daily' && !n.is_recurring && !isUpcoming) {
          setItems((prev) => prev.filter((i) => i.id !== n.id));
        } else {
          setItems((prev) => prev.map((i) => (i.id === n.id ? (n as Item) : i)));
        }
      } else if (payload.eventType === 'DELETE') {
        setItems((prev) => prev.filter((i) => i.id !== payload.old.id));
      }
    }

    function subscribe() {
      channel = supabase
        .channel(`today:${workspaceId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'items', filter: `workspace_id=eq.${workspaceId}` }, handlePayload)
        .subscribe();
    }

    function unsubscribe() {
      if (channel) { supabase.removeChannel(channel); channel = null; }
    }

    function handleVisibility() {
      if (document.hidden) {
        unsubscribe();
      } else {
        const nowDate = kstToday();
        if (nowDate !== serverTodayRef.current) {
          router.refresh();
        } else {
          subscribe();
        }
      }
    }

    subscribe();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      unsubscribe();
    };
  }, [workspaceId]);

  const today = serverToday; // 서버에서 내려온 날짜 사용 → SSR/hydration 일치
  const _d = new Date(today);
  const inThirtyDays = new Date(_d.getFullYear(), _d.getMonth(), _d.getDate() + 30).toISOString().slice(0, 10);

  // D-0 아이템: event_date = 오늘인 일반 항목도 오늘 섹션에 포함
  const visibleItems = items.filter(i => {
    if (i.is_recurring) return i.recurrence_rule != null && matchesToday(i.recurrence_rule, today);
    if (i.event_date && i.event_date > today) return false; // 미래 날짜 → UPCOMING으로
    // 완료됐지만 오늘 완료가 아닌 일반 항목 → 오늘 탭에서 제외 (월간보드/동산이 담당)
    if (i.is_completed && i.completed_at && kstDateOf(i.completed_at) !== today) return false;
    return true;
  });
  const total = visibleItems.length;
  const completedCount = visibleItems.filter(i => isCompletedToday(i, today)).length;

  // UPCOMING: 미완료만
  const upcomingItems = items
    .filter(i => !i.is_recurring && i.event_date && i.event_date > today && i.event_date <= inThirtyDays && !i.is_completed)
    .sort((a, b) => (a.event_date! < b.event_date! ? -1 : 1));

  // 완료된 upcoming 항목도 완료 섹션에 포함
  const completedFromUpcoming = items.filter(i =>
    !i.is_recurring && i.event_date && i.event_date > today && i.event_date <= inThirtyDays && i.is_completed
  );
  const pct = total > 0 ? completedCount / total : 0;
  const month = getCurrentMonth(today);
  const todayLabel = getTodayLabel(today);

  // 100% 완료 시 블룸 오버레이 — 오늘 첫 완료 1회만
  // localStorage를 직접 읽어 effect 실행 순서 의존성 제거
  useEffect(() => {
    if (pct !== 1 || total <= 0) return;
    if (localStorage.getItem(bloomStorageKey) === '1') return;
    if (bloomShownRef.current) return;
    bloomShownRef.current = true;
    localStorage.setItem(bloomStorageKey, '1');
    const timer = setTimeout(() => setShowBloom(true), 400);
    return () => clearTimeout(timer);
  }, [pct, total]); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleComplete(item: Item) {
    const supabase = createClient();
    const next = !isCompletedToday(item, today);

    if (!item.is_recurring) {
      const nowIso = next ? new Date().toISOString() : null;
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_completed: next, completed_at: nowIso } : i)));
      setMonthlyPotState((prev) =>
        prev ? { ...prev, growth_points: Math.max(0, (prev.growth_points ?? 0) + (next ? 1 : -1)) } : prev
      );
      const { error } = await supabase.from('items').update({
        is_completed: next,
        completed_at: nowIso,
        completed_by: next ? userId : null,
      }).eq('id', item.id);
      if (error) {
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_completed: !next, completed_at: item.completed_at } : i)));
        setMonthlyPotState((prev) =>
          prev ? { ...prev, growth_points: Math.max(0, (prev.growth_points ?? 0) + (next ? -1 : 1)) } : prev
        );
        showToast('잠시 후 다시 시도해주세요', 'error');
      }
    } else {
      setItems((prev) => prev.map((i) =>
        i.id === item.id ? { ...i, recurrence_last_done: next ? today : null } : i
      ));
      setMonthlyPotState((prev) =>
        prev ? { ...prev, growth_points: Math.max(0, (prev.growth_points ?? 0) + (next ? 1 : -1)) } : prev
      );
      const { error } = await supabase.from('items').update({
        recurrence_last_done: next ? today : null,
      }).eq('id', item.id);
      if (error) {
        setItems((prev) => prev.map((i) =>
          i.id === item.id ? { ...i, recurrence_last_done: next ? null : today } : i
        ));
        setMonthlyPotState((prev) =>
          prev ? { ...prev, growth_points: Math.max(0, (prev.growth_points ?? 0) + (next ? -1 : 1)) } : prev
        );
        showToast('잠시 후 다시 시도해주세요', 'error');
      }
    }
  }

  function handleUpdated(updated: Item) {
    if (updated.timeframe !== 'daily' && !updated.is_recurring) {
      setItems((prev) => prev.filter((i) => i.id !== updated.id));
    } else {
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    }
  }

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function getMember(uid: string | null) {
    return members.find((m) => m.user_id === uid);
  }

  const completedItems = [...visibleItems.filter(i => isCompletedToday(i, today)), ...completedFromUpcoming];
  const todoItems = visibleItems.filter((i) => !isCompletedToday(i, today));

  return (
    <div className="min-h-screen bg-[#FBF6EE] duip-page-enter">
      <div className="max-w-md mx-auto" style={{ paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 0px))' }}>
        {/* ── 헤더 ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'max(env(safe-area-inset-top), 52px)', paddingLeft: 20, paddingRight: 20, paddingBottom: 12 }}>
          <Link href="/workspaces" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ fontSize: 26, lineHeight: 1 }}>🌿</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#2A1B0E', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {workspaceName}
              </div>
              <div style={{ fontSize: 10.5, color: '#8A7359', marginTop: 2, fontWeight: 600 }}>
                {currentUser.avatar} {currentUser.displayName}
              </div>
            </div>
          </Link>
          <Link
            href={`/workspaces/${workspaceId}/settings`}
            style={{
              width: 34, height: 34, borderRadius: 9999,
              background: '#FFFCF7',
              boxShadow: '0 1px 2px rgba(74,46,22,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B5530" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>
            </svg>
          </Link>
        </div>

        <div style={{ padding: '0 16px' }}>
          {/* ── 알림 권한 유도 배너 (1회성) ── */}
          <PushBanner workspaceId={workspaceId} />

          {/* ── 파트너 없을 때 초대 배너 ── */}
          {members.length === 1 && !bannerDismissed && (
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <a
                href={`/workspaces/${workspaceId}/settings`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'linear-gradient(135deg, rgba(154,124,201,0.15), rgba(199,124,106,0.12))',
                  borderRadius: 18, padding: '12px 48px 12px 14px',
                  textDecoration: 'none',
                  boxShadow: '0 1px 4px rgba(74,46,22,0.06)',
                }}
              >
                <div style={{ fontSize: 26, lineHeight: 1 }}>💌</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#2A1B0E', letterSpacing: '-0.01em' }}>
                    파트너를 초대해보세요
                  </div>
                  <div style={{ fontSize: 11.5, color: '#8A7359', marginTop: 2 }}>
                    함께하면 동산이 더 풍성해져요
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9A7553" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </a>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  localStorage.setItem(`invite_banner_dismissed_${workspaceId}`, '1');
                  setBannerDismissed(true);
                }}
                style={{
                  position: 'absolute', top: 8, right: 10,
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: 4, lineHeight: 1,
                  color: '#B09779', fontSize: 16,
                }}
                aria-label="닫기"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          )}

          {/* ── 화분 미선택 유도 카드 (푸시 실패 시 안전망) ── */}
          {!monthlyPotState?.plant_id && (
            <button
              onClick={() => setShowPlantPicker(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                background: 'linear-gradient(135deg, rgba(242,198,110,0.22), rgba(154,124,201,0.14))',
                borderRadius: 18, padding: '12px 14px', marginBottom: 12,
                border: 'none', cursor: 'pointer', textAlign: 'left',
                boxShadow: '0 1px 4px rgba(74,46,22,0.06)',
              }}
            >
              <div style={{ fontSize: 26, lineHeight: 1 }}>🪴</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#2A1B0E', letterSpacing: '-0.01em' }}>
                  {month}월의 화분이 기다리고 있어요
                </div>
                <div style={{ fontSize: 11.5, color: '#8A7359', marginTop: 2 }}>
                  이번 달 식물 고르기
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9A7553" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          )}

          {/* ── 이번 달 식물 카드 ── */}
          <MonthlyPlantCard
            month={month}
            completedCount={completedCount}
            total={total}
            expanded={plantExpanded}
            onToggle={() => setPlantExpanded((v) => !v)}
            monthlyPot={monthlyPotState}
            onBloom={() => {
              if (!bloomShownRef.current) {
                bloomShownRef.current = true;
                localStorage.setItem(bloomStorageKey, '1');
                setShowBloom(true);
              }
            }}
          />

          {/* ── 날짜 헤더 (탭 → 이번 달) ── */}
          <button
            onClick={() => router.push(`/workspaces/${workspaceId}`)}
            style={{
              marginBottom: 16, padding: '4px 2px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 800, color: '#2A1B0E', letterSpacing: '-0.025em' }}>
              {todayLabel.month} {todayLabel.date}일{' '}
              <span style={{ color: '#9A7553', fontWeight: 700 }}>{todayLabel.day}</span>
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A7359" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          {/* ── 빈 상태 ── */}
          {items.length === 0 ? (
            <EmptyHome onAdd={() => setShowForm(true)} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* 오늘 할 일 */}
              <Bucket label="오늘 할 일" count={todoItems.length}/>
              {todoItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#8A7359', fontSize: 13 }}>
                  모두 완료했어요 🎉
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {todoItems.map((item) => (
                    <Pebble
                      key={item.id}
                      item={item}
                      completed={isCompletedToday(item, today)}
                      serverToday={today}
                      onToggle={(e) => { e.stopPropagation(); toggleComplete(item); }}
                      onClick={() => setEditingItem(item)}
                      members={members}
                    />
                  ))}
                </div>
              )}

              {/* UPCOMING */}
              {upcomingItems.length > 0 && (
                <>
                  <Bucket label="다가오는 일정" count={upcomingItems.length}/>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {upcomingItems.map((item) => (
                      <Pebble
                        key={item.id}
                        item={item}
                        completed={isCompletedToday(item, today)}
                        serverToday={today}
                        onToggle={(e) => { e.stopPropagation(); setConfirmItem(item); }}
                        onClick={() => setEditingItem(item)}
                        members={members}
                        showDateBadge
                      />
                    ))}
                  </div>
                </>
              )}

              {/* 완료된 항목 */}
              {completedItems.length > 0 && (
                <>
                  <Bucket label="완료된 항목" count={completedItems.length}/>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {completedItems.map((item) => (
                      <Pebble
                        key={item.id}
                        item={item}
                        completed={isCompletedToday(item, today)}
                        serverToday={today}
                        onToggle={(e) => { e.stopPropagation(); toggleComplete(item); }}
                        onClick={() => setEditingItem(item)}
                        members={members}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── FAB ── */}
        <button
          onClick={() => setShowForm(true)}
          style={{
            position: 'fixed', right: 'max(18px, calc(50% - 206px))', bottom: 'calc(96px + env(safe-area-inset-bottom, 0px))', zIndex: 40,
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
      </div>

      {/* ── 추가 시트 ── */}
      {showForm && (
        <TodayAddSheet
          workspaceId={workspaceId}
          userId={userId}
          members={members}
          onClose={() => setShowForm(false)}
          onAdded={(item) => setItems((prev) => [item, ...prev])}
        />
      )}

      {/* ── 편집 모달 ── */}
      {editingItem && (
        <ItemEditModal
          item={{
            ...editingItem,
            is_recurring: editingItem.is_recurring ?? false,
            recurrence_rule: editingItem.recurrence_rule ?? null,
            event_date: editingItem.event_date ?? null,
          }}
          members={members}
          onClose={() => setEditingItem(null)}
          onUpdated={(updated) => { handleUpdated(updated as Item); setEditingItem(null); }}
          onDeleted={editingItem.created_by === userId ? handleDeleted : undefined}
        />
      )}

      {/* ── 완료 확인 팝업 ── */}
      {confirmItem && (
        <div
          className="fixed inset-0 z-[60] flex items-end"
          style={{ background: 'rgba(42,27,14,0.45)' }}
          onClick={() => setConfirmItem(null)}
        >
          <div
            className="w-full max-w-md mx-auto"
            style={{ background: '#FBF6EE', borderRadius: '28px 28px 0 0', padding: '24px 20px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D9C8AC', margin: '0 auto 20px' }}/>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#2A1B0E', letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>
              완료하시겠습니까?
            </p>
            <p style={{ fontSize: 13, color: '#8A7359', marginBottom: 24, lineHeight: 1.5, textAlign: 'center' }}>
              &ldquo;{confirmItem.title}&rdquo;을 완료 처리하면<br/>완료된 항목으로 이동합니다.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmItem(null)}
                style={{
                  flex: 1, height: 50, borderRadius: 9999, border: 'none',
                  background: '#F4E8D6', color: '#9B7B52',
                  fontSize: 14, fontWeight: 800, cursor: 'pointer',
                }}
              >
                취소
              </button>
              <button
                onClick={() => { toggleComplete(confirmItem); setConfirmItem(null); }}
                style={{
                  flex: 2, height: 50, borderRadius: 9999, border: 'none',
                  background: '#5C3A1F', color: '#FBF6EE',
                  fontSize: 14, fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(74,46,22,0.22)',
                }}
              >
                완료하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 보호수 선택 (연간) ── */}
      {showTreePicker && (
        <TreePickerSheet
          workspaceId={workspaceId}
          currentYear={currentYear}
          onDone={handleTreeDone}
          onSkip={() => setShowTreePicker(false)}
        />
      )}

      {/* ── 화분+식물 선택 (월간) ── */}
      {showPlantPicker && !showTreePicker && (
        <PlantPickerSheet
          workspaceId={workspaceId}
          year={currentYear}
          month={currentMonth}
          onDone={handlePlantDone}
          onSkip={() => setShowPlantPicker(false)}
        />
      )}

      {/* ── 블룸 오버레이 ── */}
      {showBloom && (
        <BloomOverlay
          onClose={() => setShowBloom(false)}
          onGardenClick={() => {
            setShowBloom(false);
            router.push(`/workspaces/${workspaceId}/garden`);
          }}
        />
      )}

    </div>
  );
}

// ── 오늘 추가 시트 ────────────────────────────────────────────────
function TodayAddSheet({
  workspaceId, userId, members, onClose, onAdded,
}: {
  workspaceId: string;
  userId: string;
  members: Member[];
  onClose: () => void;
  onAdded: (item: Item) => void;
}) {
  const { showToast } = useToast();
  const { dragProps, sheetStyle } = useDragSheet(onClose);
  const composingRef = useRef(false);
  const [type, setType] = useState<ItemType>('TODO');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ownerUserId, setOwnerUserId] = useState<string>(userId);
  const [isShared, setIsShared] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<null | 'date' | 'recurring'>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | null>(null);
  const [eventDate, setEventDate] = useState('');
  const [loading, setLoading] = useState(false);

  function pickMode(mode: 'date' | 'recurring') {
    if (scheduleMode === mode) { setScheduleMode(null); return; }
    setScheduleMode(mode);
    if (mode === 'date') { setIsRecurring(false); setRecurrenceRule(null); }
    else { setEventDate(''); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (composingRef.current || !title.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const todayDate = kstToday();
    const useDate = scheduleMode === 'date' ? eventDate : '';
    const timeframe = useDate && useDate > todayDate ? 'oneshot' : 'daily';
    const { data, error } = await supabase.from('items').insert({
      workspace_id: workspaceId,
      created_by: userId,
      owner_user_id: isShared ? null : ownerUserId,
      is_shared: isShared,
      title: title.trim(),
      description: description.trim() || null,
      type,
      timeframe,
      is_recurring: scheduleMode === 'recurring' && isRecurring,
      recurrence_rule: scheduleMode === 'recurring' && isRecurring ? recurrenceRule : null,
      event_date: useDate || null,
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
        style={{
          ...sheetStyle,
          background: '#FBF6EE', borderRadius: '28px 28px 0 0',
          padding: '0 16px 0',
          maxHeight: '92svh', overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 드래그 핸들 — 터치 드래그 영역 */}
        <div {...dragProps} style={{ ...dragProps.style, display: 'flex', justifyContent: 'center', padding: '12px 0 16px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D9C8AC' }}/>
        </div>

        <p style={{ fontSize: 11, fontWeight: 800, color: '#9A7553', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
          새 항목 추가
        </p>

        {/* 타입 선택 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
          {TYPE_OPTIONS.map(({ value, label }) => {
            const on = type === value;
            const color = TYPE_COLOR[value];
            const tint = TYPE_TINT[value];
            return (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                style={{
                  height: 76, borderRadius: 16, border: 'none',
                  background: on ? '#5C3A1F' : '#FFFCF7',
                  boxShadow: on
                    ? '0 8px 24px rgba(74,46,22,0.22)'
                    : '0 1px 2px rgba(74,46,22,0.05)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 9999,
                  background: on ? '#FBF6EE' : tint,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <TypeIcon type={value} size={14} color={on ? '#5C3A1F' : color}/>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: on ? '#FBF6EE' : '#2A1B0E', letterSpacing: '-0.01em' }}>
                  {label}
                </div>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* 제목 */}
          <div style={{ background: '#FFFCF7', borderRadius: 16, padding: '12px 16px', boxShadow: '0 1px 2px rgba(74,46,22,0.05)' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#8A7359', letterSpacing: '0.06em', marginBottom: 4 }}>제목</div>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onCompositionStart={() => { composingRef.current = true; }}
              onCompositionEnd={(e) => { composingRef.current = false; setTitle((e.target as HTMLInputElement).value); }}
              placeholder="무엇을 함께 할까요?"
              autoFocus
              style={{
                display: 'block', width: '100%',
                background: 'none', border: 'none', outline: 'none', padding: 0,
                fontSize: 16, fontWeight: 700, color: '#2A1B0E',
                letterSpacing: '-0.01em',
              }}
            />
          </div>

          {/* 메모 */}
          <div style={{ background: '#FFFCF7', borderRadius: 16, padding: '12px 16px', boxShadow: '0 1px 2px rgba(74,46,22,0.05)' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#8A7359', letterSpacing: '0.06em', marginBottom: 4 }}>메모</div>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="메모를 적어볼까요"
              style={{
                display: 'block', width: '100%',
                background: 'none', border: 'none', outline: 'none', padding: 0,
                fontSize: 16, color: '#5C3A1F',
                letterSpacing: '-0.01em',
              }}
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
                style={{
                  display: 'block', width: '100%',
                  background: 'none', border: 'none', outline: 'none', padding: 0,
                  fontSize: 14, fontWeight: 700, color: '#2A1B0E', cursor: 'pointer',
                  letterSpacing: '-0.01em',
                }}
              >
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>{m.avatar} {m.display_name}</option>
                ))}
                <option value="__shared__">👥 둘이 같이</option>
              </select>
            </div>
          )}

          {/* 날짜 / 반복 토글 */}
          <div style={{ background: '#FFFCF7', borderRadius: 16, padding: '12px 16px', boxShadow: '0 1px 2px rgba(74,46,22,0.05)' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['date', 'recurring'] as const).map((mode) => {
                const on = scheduleMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => pickMode(mode)}
                    style={{
                      flex: 1, height: 34, borderRadius: 9999, border: 'none',
                      background: on ? '#5C3A1F' : '#F4E8D6',
                      color: on ? '#FBF6EE' : '#9B7B52',
                      fontSize: 12, fontWeight: 800, cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {mode === 'date' ? '날짜 선택' : '반복 설정'}
                  </button>
                );
              })}
            </div>

            {scheduleMode === 'date' && (
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <DateInput
                  value={eventDate}
                  onChange={setEventDate}
                  inputStyle={{ fontSize: 14, fontWeight: 700, color: '#2A1B0E', letterSpacing: '-0.01em' }}
                />
                {eventDate && (
                  <button
                    type="button"
                    onClick={() => setEventDate('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C8B89A', fontSize: 13, padding: 0, lineHeight: 1, flexShrink: 0 }}
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {scheduleMode === 'recurring' && (
              <div style={{ marginTop: 12 }}>
                <RecurrenceEditor
                  isRecurring={isRecurring}
                  rule={recurrenceRule}
                  onChange={(recurring, rule) => { setIsRecurring(recurring); setRecurrenceRule(rule); }}
                />
              </div>
            )}
          </div>

          {/* 제출 — sticky로 시트 하단에 항상 노출 */}
          <div style={{
            position: 'sticky', bottom: 0,
            background: '#FBF6EE',
            paddingTop: 8,
            paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
          }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'block', width: '100%',
                height: 52, borderRadius: 9999, border: 'none',
                background: '#5C3A1F', color: '#FBF6EE',
                fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em',
                cursor: 'pointer', opacity: loading ? 0.55 : 1,
                boxShadow: '0 8px 24px rgba(74,46,22,0.22)',
              }}
            >
              {loading ? '추가 중...' : '추가하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
