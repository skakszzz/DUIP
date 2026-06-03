-- Phase 5: 반복일정
-- Supabase Dashboard > SQL Editor 에서 실행

ALTER TABLE items
  ADD COLUMN IF NOT EXISTS is_recurring        BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurrence_rule     JSONB,
  ADD COLUMN IF NOT EXISTS recurrence_last_done DATE;
