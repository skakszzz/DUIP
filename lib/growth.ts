export const STAGE_NEED = [0, 1, 3, 6, 10] as const;
export function stageFromPoints(pts: number): 1 | 2 | 3 | 4 | 5 {
  return (Math.min(5, STAGE_NEED.filter((n) => pts >= n).length) || 1) as 1 | 2 | 3 | 4 | 5;
}
