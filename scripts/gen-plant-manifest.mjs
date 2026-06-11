// scripts/gen-plant-manifest.mjs — auto-generated. do not run manually; use npm run plants:manifest
// public/plants/<id>/stage2.webp 존재 여부를 스캔해 lib/data/plant-artwork.ts를 생성한다.
import { readdir, access, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const plantsDir = join(root, 'public', 'plants');

const ids = [];
for (const name of await readdir(plantsDir)) {
  const probe = join(plantsDir, name, 'stage2.webp');
  try {
    await access(probe);
    ids.push(name);
  } catch {
    // no webp — skip
  }
}

ids.sort();

const content = `// lib/data/plant-artwork.ts — scripts/gen-plant-manifest.mjs가 자동 생성. 직접 수정 금지.
export const PLANT_ARTWORK = new Set<string>([
${ids.map((id) => `  '${id}',`).join('\n')}
]);
`;

const dest = join(root, 'lib', 'data', 'plant-artwork.ts');
await writeFile(dest, content, 'utf8');
console.log(`plant-artwork.ts 생성 완료: ${ids.length}종 [${ids.join(', ')}]`);
