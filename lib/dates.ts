export function kstToday(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
export function kstNow(): Date {
  return new Date(Date.now() + 9 * 60 * 60 * 1000);
}
// timestamptz ISO 문자열의 KST 기준 날짜 'YYYY-MM-DD'
export function kstDateOf(iso: string): string {
  return new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
