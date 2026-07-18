import { useState, useRef } from 'react';

const THRESHOLD = 100; // px — 이 이상 내리면 닫힘

export function useDragSheet(onClose: () => void) {
  const [dragY, setDragY] = useState(0);
  const [closing, setClosing] = useState(false);
  const startY = useRef(0);
  const active = useRef(false);

  function onTouchStart(e: React.TouchEvent) {
    startY.current = e.touches[0].clientY;
    active.current = true;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!active.current) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) setDragY(dy); // 아래로만 허용
  }

  function onTouchEnd() {
    active.current = false;
    if (dragY >= THRESHOLD) {
      setClosing(true);
      setDragY(window.innerHeight);
      setTimeout(() => { onClose(); setClosing(false); setDragY(0); }, 260);
    } else {
      setDragY(0);
    }
  }

  // iOS가 터치를 취소하면(시스템 제스처·전화 등) touchend가 안 와서
  // 드래그 상태가 잔류 → 시트가 밀린 채 고정. 닫지 않고 원위치만 복구.
  function onTouchCancel() {
    active.current = false;
    setDragY(0);
  }

  /** 드래그 핸들 영역에 spread할 props */
  const dragProps = {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
    style: {
      touchAction: 'none' as const,
      cursor: 'grab' as const,
      userSelect: 'none' as const,
    } as React.CSSProperties,
  };

  /** 시트 컨테이너에 적용할 style */
  const sheetStyle: React.CSSProperties = {
    transform: `translateY(${dragY}px)`,
    transition: closing
      ? 'transform 0.26s ease-in'
      : dragY === 0
      ? 'transform 0.3s cubic-bezier(0.32,0.72,0,1)'
      : 'none',
    willChange: 'transform',
  };

  return { dragProps, sheetStyle };
}
