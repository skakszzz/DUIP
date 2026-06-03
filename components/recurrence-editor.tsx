'use client';

import type { RecurrenceRule } from '@/lib/types';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

interface Props {
  isRecurring: boolean;
  rule: RecurrenceRule | null;
  onChange: (isRecurring: boolean, rule: RecurrenceRule | null) => void;
}

export function RecurrenceEditor({ isRecurring, rule, onChange }: Props) {
  const pattern  = rule?.pattern  ?? 'daily';
  const weekdays = rule?.weekdays ?? [1, 2, 3, 4, 5];
  const monthDay = rule?.monthDay ?? new Date().getDate();

  function emit(p: RecurrenceRule['pattern'], wd: number[], md: number) {
    const r: RecurrenceRule =
      p === 'daily'  ? { pattern: 'daily' } :
      p === 'weekly' ? { pattern: 'weekly', weekdays: wd } :
                       { pattern: 'monthly', monthDay: md };
    onChange(true, r);
  }

  return (
    <div style={{ borderTop: '1px solid #E8D5B8', paddingTop: 14 }}>
      {/* 반복 토글 행 */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: isRecurring ? 14 : 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#9B7B52" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          <span style={{ fontSize: 13, color: '#5C3A1F', fontWeight: 600 }}>반복</span>
        </div>
        <button
          type="button"
          onClick={() => onChange(!isRecurring, !isRecurring ? { pattern: 'daily' } : null)}
          style={{
            width: 44, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
            background: isRecurring ? '#5C3A1F' : '#E8D5B8',
            position: 'relative', transition: 'background 0.2s', flexShrink: 0,
          }}
        >
          <div style={{
            position: 'absolute', top: 3,
            left: isRecurring ? 21 : 3,
            width: 20, height: 20, borderRadius: 10,
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
            transition: 'left 0.2s',
          }}/>
        </button>
      </div>

      {isRecurring && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* 패턴 선택 */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => emit(p, weekdays, monthDay)}
                style={{
                  flex: 1, padding: '7px 0', borderRadius: 10, border: 'none',
                  cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  background: pattern === p ? '#5C3A1F' : '#F4E8D6',
                  color: pattern === p ? '#FBF6EE' : '#9B7B52',
                  transition: 'all 0.15s',
                }}
              >
                {p === 'daily' ? '매일' : p === 'weekly' ? '매주' : '매월'}
              </button>
            ))}
          </div>

          {/* 요일 선택 (매주) */}
          {pattern === 'weekly' && (
            <div style={{ display: 'flex', gap: 4 }}>
              {WEEKDAY_LABELS.map((label, i) => {
                const on = weekdays.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const next = on
                        ? weekdays.filter(d => d !== i)
                        : [...weekdays, i].sort((a, b) => a - b);
                      emit('weekly', next, monthDay);
                    }}
                    style={{
                      flex: 1, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 700,
                      background: on ? '#5C3A1F' : '#F4E8D6',
                      color: on ? '#FBF6EE' : '#9B7B52',
                      transition: 'all 0.15s',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* 날짜 선택 (매월) */}
          {pattern === 'monthly' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#9B7B52', flexShrink: 0 }}>매월</span>
              <select
                value={monthDay}
                onChange={(e) => emit('monthly', weekdays, +e.target.value)}
                className="flex-1 rounded-xl border border-[#E8D5B8] bg-white px-3 py-2 text-[#5C3A1F] text-sm focus:outline-none"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}일</option>
                ))}
              </select>
              <span style={{ fontSize: 13, color: '#9B7B52', flexShrink: 0 }}>반복</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
