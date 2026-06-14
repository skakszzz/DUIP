'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';

interface ToastItem { id: string; message: string; type: 'normal' | 'error'; }
interface ToastCtx { showToast: (message: string, type?: 'normal' | 'error') => void; }

const ToastContext = createContext<ToastCtx>({ showToast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const activeMessages = useRef<Set<string>>(new Set());

  const showToast = useCallback((message: string, type: 'normal' | 'error' = 'normal') => {
    if (activeMessages.current.has(message)) return;
    activeMessages.current.add(message);
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      activeMessages.current.delete(message);
    }, 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          left: 0, right: 0,
          zIndex: 300,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          pointerEvents: 'none',
        }}
      >
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              padding: '10px 20px', borderRadius: 9999,
              background: t.type === 'error' ? '#C77C6A' : '#5C3A1F',
              color: '#FBF6EE', fontSize: 13, fontWeight: 700,
              boxShadow: '0 4px 16px rgba(74,46,22,0.25)',
              letterSpacing: '-0.01em',
              animation: 'toastIn 0.25s ease',
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
