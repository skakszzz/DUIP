-- 아이템 타입 4종 → 3종 마이그레이션
-- PLACE(장소) · IDEA(아이디어) 를 ETC(기타)로 통합
--
-- 실행 방법:
--   1) Supabase 대시보드 > SQL Editor에서 이 파일 내용 붙여넣고 실행
--   2) 또는: npx supabase db push (로컬 Supabase CLI 설정 시)

UPDATE items
SET type = 'ETC'
WHERE type IN ('PLACE', 'IDEA');
