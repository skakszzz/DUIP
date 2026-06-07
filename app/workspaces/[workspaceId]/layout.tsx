import { Suspense } from 'react';
import TabBar from '@/components/tab-bar';
import ErrorBoundary from '@/components/error-boundary';

interface Props {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}

function TabSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', background: '#F5EFE6' }}>
      <div style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* 헤더 */}
        <div style={{ height: 28, width: '55%', borderRadius: 12, background: '#E8DDD0', animation: 'pulse 1.4s ease-in-out infinite' }}/>
        <div style={{ height: 18, width: '35%', borderRadius: 8, background: '#E8DDD0', animation: 'pulse 1.4s ease-in-out infinite' }}/>
        {/* 카드 */}
        <div style={{ marginTop: 12, height: 160, borderRadius: 24, background: '#FFFCF7', boxShadow: '0 2px 8px rgba(74,46,22,0.06)' }}/>
        {[80, 64, 72].map((h, i) => (
          <div key={i} style={{ height: h, borderRadius: 18, background: '#FFFCF7', boxShadow: '0 1px 4px rgba(74,46,22,0.05)' }}/>
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>
    </div>
  );
}

export default async function WorkspaceLayout({ children, params }: Props) {
  const { workspaceId } = await params;
  return (
    <ErrorBoundary>
      <Suspense fallback={<TabSkeleton />}>
        {children}
      </Suspense>
      <TabBar workspaceId={workspaceId} />
    </ErrorBoundary>
  );
}
