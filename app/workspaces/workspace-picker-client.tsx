'use client';

import { useRouter } from 'next/navigation';
import { WorkspacePicker, type Garden } from '@/components/workspace-picker';

interface Props {
  gardens: Garden[];
  userName: string;
  seasonLabel: string;
}

export default function WorkspacePickerClient({ gardens, userName, seasonLabel }: Props) {
  const router = useRouter();
  return (
    <WorkspacePicker
      gardens={gardens}
      userName={userName}
      seasonLabel={seasonLabel}
      maxGardens={3}
      onOpen={(id) => router.push(`/workspaces/${id}/today`)}
      onNew={() => router.push('/workspaces/new')}
      onSettings={() => router.push('/settings')}
    />
  );
}
