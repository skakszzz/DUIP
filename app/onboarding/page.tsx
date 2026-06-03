'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Onboarding } from '@/components/onboarding';

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const params = useSearchParams();
  const workspaceId = params.get('w') ?? '';

  const [ready, setReady] = useState(false);
  const [myName, setMyName] = useState('');
  const [inviteToken, setInviteToken] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }

      const { data: mem } = await supabase
        .from('memberships')
        .select('display_name')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();

      // 초대 토큰 생성 (이미 있으면 재사용)
      const { data: inv } = await supabase
        .from('invites')
        .select('token')
        .eq('workspace_id', workspaceId)
        .maybeSingle();

      let token = inv?.token ?? '';
      if (!token) {
        const { data: newInv } = await supabase
          .from('invites')
          .insert({ workspace_id: workspaceId, created_by: user.id })
          .select('token')
          .single();
        token = newInv?.token ?? '';
      }

      setMyName(mem?.display_name ?? '');
      setInviteToken(token);
      setReady(true);
    }
    if (workspaceId) load();
  }, [workspaceId, router]);

  if (!ready) return null;

  async function handlePickSeed(plantId: string) {
    const supabase = createClient();
    const now = new Date();
    await supabase.from('monthly_pots').upsert(
      { workspace_id: workspaceId, year: now.getFullYear(), month: now.getMonth() + 1, plant_id: plantId },
      { onConflict: 'workspace_id,year,month' }
    );
  }

  function handleInvite() {
    const url = `${location.origin}/join/${inviteToken}`;
    if (navigator.share) {
      navigator.share({ title: '두잎에 초대합니다', url });
    } else {
      navigator.clipboard.writeText(url).then(() => alert('초대 링크가 복사됐어요!'));
    }
  }

  return (
    <Onboarding
      myName={myName}
      inviteCode={inviteToken.slice(0, 8).toUpperCase()}
      month={new Date().getMonth() + 1}
      onInvite={handleInvite}
      onPickSeed={handlePickSeed}
      onDone={() => router.replace(`/workspaces/${workspaceId}/today`)}
    />
  );
}
