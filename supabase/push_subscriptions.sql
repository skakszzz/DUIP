-- push_subscriptions 테이블 생성
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  endpoint    text NOT NULL,
  p256dh      text NOT NULL,
  auth        text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, workspace_id)
);

-- RLS 정책
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 구독만 관리" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- 크론 발송용 서비스롤이 읽을 수 있도록 (API Route는 service_role 키 사용)
CREATE POLICY "service_role 읽기" ON push_subscriptions
  FOR SELECT USING (true);
