'use client';

import { useEffect } from 'react';

// iOS Safari는 폰트가 작은 입력창에 포커스하면 자동으로 확대하는데,
// 포커스가 빠져도 배율이 원래대로 안 돌아오는 경우가 있다.
// 포커스 아웃 시 뷰포트 meta를 순간 토글해 강제로 원복시킨다 (확대 자체는 그대로 둠).
export function IosZoomReset() {
  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) return;

    function isTextEntry(el: EventTarget | null): boolean {
      if (!(el instanceof HTMLElement)) return false;
      return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
    }

    function handleFocusOut(e: FocusEvent) {
      if (!isTextEntry(e.target)) return;
      const original = viewport!.getAttribute('content') ?? '';
      viewport!.setAttribute('content', `${original}, maximum-scale=1`);
      setTimeout(() => viewport!.setAttribute('content', original), 100);
    }

    document.addEventListener('focusout', handleFocusOut);
    return () => document.removeEventListener('focusout', handleFocusOut);
  }, []);

  return null;
}
