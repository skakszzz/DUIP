// components/floating-sheet.tsx
// 바텀시트 공용 래퍼 — plant-picker-sheet의 완성형 패턴을 표준으로 추출.
// portal(body)로 .duip-page-enter transform stacking context 탈출 + 탭바(z-50) 위 z-index
// + 하단 safe-area 패딩 + flex-column 내부 스크롤(minHeight:0). 모든 시트가 이걸 껍데기로 쓴다.
'use client';

import { createPortal } from 'react-dom';
import { useDragSheet } from '@/lib/use-drag-sheet';

interface FloatingSheetProps {
  onClose: () => void;
  children: React.ReactNode;
  /** 뒷배경 스크림 */
  scrim?: string;
  maxWidth?: number;
  maxHeight?: string;
  /** 탭바(z-50)보다 커야 함 */
  z?: number;
  background?: string;
  /** 시트 좌우 패딩 */
  padX?: number;
  /** safe-area 위에 더할 하단 패딩 */
  padBottom?: number;
  /** 핸들 + 드래그-투-클로즈 사용 */
  draggable?: boolean;
  /** 핸들 줄 우측 액션 (예: '나중에') */
  headerRight?: React.ReactNode;
  /** 스크롤 밖 고정 푸터 */
  footer?: React.ReactNode;
  /** children을 스크롤 바디로 감쌀지 (false면 호출부가 내부 스크롤 관리) */
  bodyScroll?: boolean;
}

export default function FloatingSheet({
  onClose,
  children,
  scrim = 'rgba(42,27,14,0.45)',
  maxWidth = 448,
  maxHeight = '92dvh',
  z = 60,
  background = '#FBF6EE',
  padX = 16,
  padBottom = 20,
  draggable = true,
  headerRight,
  footer,
  bodyScroll = true,
}: FloatingSheetProps) {
  const { dragProps, sheetStyle } = useDragSheet(onClose);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: z, display: 'flex', alignItems: 'flex-end', background: scrim }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...(draggable ? sheetStyle : null),
          width: '100%', maxWidth, margin: '0 auto',
          background, borderRadius: '28px 28px 0 0',
          padding: `0 ${padX}px calc(${padBottom}px + env(safe-area-inset-bottom, 0px))`,
          maxHeight, display: 'flex', flexDirection: 'column',
        }}
      >
        {/* 핸들 + (옵션) 우측 액션 — 드래그 영역 */}
        <div
          {...(draggable ? dragProps : {})}
          style={{
            ...(draggable ? dragProps.style : null),
            position: 'relative', display: 'flex', alignItems: 'center',
            padding: '12px 0 12px', flexShrink: 0,
          }}
        >
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D9C8AC' }} />
          </div>
          {headerRight && (
            <div style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }}>
              {headerRight}
            </div>
          )}
        </div>

        {bodyScroll ? (
          <div
            style={{
              flex: 1, minHeight: 0, overflowY: 'auto',
              overscrollBehavior: 'contain', touchAction: 'pan-y', WebkitOverflowScrolling: 'touch',
            }}
          >
            {children}
          </div>
        ) : (
          children
        )}

        {footer && <div style={{ flexShrink: 0 }}>{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
