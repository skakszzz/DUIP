import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { sendPushToSubs } from '@/lib/push-send';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 발송은 service role로 하되, 대상은 인증된 본인 구독만
  const admin = createAdminClient();
  const { data: subs, error } = await admin
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = await sendPushToSubs(admin, subs ?? [], {
    title: '🔔 두잎 테스트 알림',
    body: '알림이 정상적으로 도착했어요!',
    tag: `test-${Date.now()}`,
  });

  return NextResponse.json(result);
}
