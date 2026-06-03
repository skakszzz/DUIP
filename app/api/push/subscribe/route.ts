import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { subscription, workspaceId } = await req.json();
  if (!subscription?.endpoint) return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });

  await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      workspace_id: workspaceId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys?.p256dh,
      auth: subscription.keys?.auth,
    },
    { onConflict: 'user_id,workspace_id' }
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { workspaceId } = await req.json();
  await supabase.from('push_subscriptions').delete()
    .eq('user_id', user.id)
    .eq('workspace_id', workspaceId);

  return NextResponse.json({ ok: true });
}
