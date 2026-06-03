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
      {children}
      <TabBar workspaceId={workspaceId} />
    </ErrorBoundary>
  );
}
