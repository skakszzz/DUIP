'use client';

import { createPortal } from 'react-dom';

export interface BloomContent {
  plantEmoji?: string;
  stageLabel?: string;
  title?: string;
  body?: string;
}

interface Props {
  content?: BloomContent;
  onClose: () => void;
  onGardenClick?: () => void;
}

const CONFETTI = [
  { x: 28, y: 30, c: '#FBD3BC', r: 4 }, { x: 280, y: 24, c: '#CFE3CB', r: 5 },
  { x: 60, y: 130, c: '#F2C66E', r: 4 }, { x: 270, y: 150, c: '#FBD3BC', r: 5 },
  { x: 40, y: 200, c: '#9A7CC9', r: 3 }, { x: 290, y: 220, c: '#F6E7B8', r: 4 },
  { x: 100, y: 280, c: '#9A7CC9', r: 3 },
];

export default function BloomOverlay({ content, onClose, onGardenClick }: Props) {
  const {
    plantEmoji = '🌸',
    stageLabel,
    title = '꽃이 폈어요 ✿',
    body = '오늘의 모든 할 일을 완료했어요!',
  } = content ?? {};

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[60]" onClick={onClose}>
      {/* 스크림 */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(74,46,22,0.35)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      {/* 축하 카드 */}
      <div
        className="absolute left-4 right-4 max-w-sm mx-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          top: '18%',
          background: 'linear-gradient(160deg, rgba(220,209,232,0.82) 0%, rgba(251,211,188,0.7) 55%, #FFFCF7 100%)',
          borderRadius: 32,
          padding: '28px 22px 24px',
          boxShadow: '0 24px 60px rgba(74,46,22,0.32)',
          overflow: 'hidden',
        }}
      >
        {/* 컨페티 */}
        {CONFETTI.map((d, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', left: d.x, top: d.y,
              width: d.r * 2, height: d.r * 2,
              borderRadius: '50%', background: d.c, opacity: 0.85, pointerEvents: 'none',
            }}
          />
        ))}

        {/* 내용 (갈아끼울 수 있는 영역) */}
        <div className="relative flex flex-col items-center text-center gap-2.5">
          <div className="text-[72px] leading-none">{plantEmoji}</div>
          {stageLabel && (
            <div style={{ fontSize: 10.5, fontWeight: 800, color: '#7B5530', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              {stageLabel}
            </div>
          )}
          <div style={{ fontSize: 26, fontWeight: 800, color: '#2A1B0E', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            {title}
          </div>
          <div style={{ fontSize: 13, color: '#5C3A1F', lineHeight: 1.55 }}>
            {body}
          </div>
          <div className="flex gap-2 mt-2">
            {onGardenClick && (
              <button
                onClick={onGardenClick}
                style={{
                  height: 44, padding: '0 22px', borderRadius: 9999, border: 'none',
                  background: '#5C3A1F', color: '#FBF6EE',
                  fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em', cursor: 'pointer',
                }}
              >
                동산에서 보기
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                height: 44, padding: '0 20px', borderRadius: 9999, border: 'none',
                background: 'rgba(255,253,247,0.9)', color: '#5C3A1F',
                fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', cursor: 'pointer',
              }}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
