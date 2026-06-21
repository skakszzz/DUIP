import { Suspense } from 'react';
import TabBar from '@/components/tab-bar';
import ErrorBoundary from '@/components/error-boundary';

interface Props {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceLayout({ children, params }: Props) {
  const { workspaceId } = await params;
  return (
    <ErrorBoundary>
      <Suspense fallback={<div style={{ minHeight: '100svh', background: '#FBF6EE' }} />}>
        <div style={{ paddingBottom: 'var(--tabbar-h)', minHeight: '100lvh' }}>
          {children}
        </div>
      </Suspense>
      <TabBar workspaceId={workspaceId} />
    </ErrorBoundary>
  );
}
