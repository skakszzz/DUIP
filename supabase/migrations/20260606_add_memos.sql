-- supabase/migrations/20260606_add_memos.sql
-- 메모 탭 — 둘이 공유하는 블록형 메모(글/체크리스트/그림 혼합).
-- Supabase Dashboard > SQL Editor 에서 실행.

create table if not exists memos (
  id          uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title       text not null default '',
  tint        text not null default 'paper',     -- butter | mint | peach | lavender | paper
  blocks      jsonb not null default '[]'::jsonb, -- 순서 있는 블록 배열 (아래 형태 참고)
  created_by  uuid not null,
  updated_by  uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists memos_workspace_idx on memos (workspace_id, updated_at desc);

-- blocks JSON 형태(참고):
--  { "id":"b1", "kind":"text",  "text":"...", "author":"<uid>" }
--  { "id":"b2", "kind":"check", "author":"<uid>",
--    "items":[ { "id":"i1", "text":"...", "done":true, "author":"<uid>" } ] }
--  { "id":"b3", "kind":"draw",  "author":"<uid>", "w":320, "h":220,
--    "strokes":[ { "color":"#C77C6A", "width":3, "points":[[0.1,0.2],[0.12,0.24]] } ] }
--  (draw.points 는 0~1 정규화 좌표 — 어떤 크기로도 렌더 가능)

-- ── RLS: 워크스페이스 멤버만 읽기/쓰기 ──────────────────────────────
alter table memos enable row level security;

drop policy if exists "memos_select" on memos;
create policy "memos_select" on memos for select
  using (exists (
    select 1 from memberships m
    where m.workspace_id = memos.workspace_id and m.user_id = auth.uid()
  ));

drop policy if exists "memos_insert" on memos;
create policy "memos_insert" on memos for insert
  with check (exists (
    select 1 from memberships m
    where m.workspace_id = memos.workspace_id and m.user_id = auth.uid()
  ));

drop policy if exists "memos_update" on memos;
create policy "memos_update" on memos for update
  using (exists (
    select 1 from memberships m
    where m.workspace_id = memos.workspace_id and m.user_id = auth.uid()
  ));

drop policy if exists "memos_delete" on memos;
create policy "memos_delete" on memos for delete
  using (exists (
    select 1 from memberships m
    where m.workspace_id = memos.workspace_id and m.user_id = auth.uid()
  ));

-- updated_at 자동 갱신
create or replace function memos_touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists memos_touch on memos;
create trigger memos_touch before update on memos
  for each row execute function memos_touch_updated_at();
