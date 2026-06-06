-- supabase/migrations/20260606_fix_invites_rls.sql
-- 초대 링크 RLS 수정 — 신규 유저(워크스페이스 미가입)도 토큰으로 invite 조회 가능하게.
-- Supabase Dashboard > SQL Editor 에서 실행.

-- SELECT: 로그인한 사용자라면 누구나 토큰으로 초대 조회 가능 (가입 전 신규 유저 포함)
drop policy if exists "invites_select" on invites;
create policy "invites_select" on invites for select
  using (auth.uid() is not null);

-- INSERT: 해당 워크스페이스 멤버만 초대 생성 가능
drop policy if exists "invites_insert" on invites;
create policy "invites_insert" on invites for insert
  with check (
    exists (
      select 1 from memberships m
      where m.workspace_id = invites.workspace_id
        and m.user_id = auth.uid()
    )
  );

-- UPDATE: 로그인한 사용자라면 누구나 used_at 업데이트 가능 (합류 완료 처리)
drop policy if exists "invites_update" on invites;
create policy "invites_update" on invites for update
  using (auth.uid() is not null);
