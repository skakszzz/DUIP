'use client';

import { Component, ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{
        minHeight: '100svh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#FBF6EE', padding: '0 24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🪴</div>
        <p style={{ fontSize: 18, fontWeight: 800, color: '#2A1B0E', letterSpacing: '-0.02em', marginBottom: 8 }}>
          잠깐 쉬어가요
        </p>
        <p style={{ fontSize: 13, color: '#8A7359', lineHeight: 1.5, marginBottom: 28 }}>
          화면을 불러오는 중 문제가 생겼어요.<br/>새로고침해 주세요.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            height: 48, padding: '0 32px', borderRadius: 9999, border: 'none',
            background: '#5C3A1F', color: '#FBF6EE',
            fontSize: 14, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(74,46,22,0.22)',
          }}
        >
          새로고침
        </button>
      </div>
    );
  }
}
