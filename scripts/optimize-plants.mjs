// 워크플로우: PNG를 public/plants/**/stage*.png 에 넣고 → npm run plants:build
// 동작: 768px / quality 82 WebP 변환 후 원본 PNG 삭제, 이어서 manifest 재생성
import sharp from 'sharp';
import { readdir, stat, unlink } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const plantsDir = join(root, 'public', 'plants');

async function walk(dir) {
  const results = [];
  for (const name of await readdir(dir)) {
    const full = join(dir, name);
    const s = await stat(full);
    if (s.isDirectory()) results.push(...(await walk(full)));
    else if (/stage\d+\.png$/i.test(name)) results.push(full);
  }
  return results;
}

const pngFiles = await walk(plantsDir);
if (pngFiles.length === 0) {
  console.log('변환할 PNG 파일이 없습니다.');
} else {
  for (const src of pngFiles) {
    const dest = src.replace(/\.png$/i, '.webp');
    await sharp(src).resize({ width: 768, withoutEnlargement: true }).webp({ quality: 82 }).toFile(dest);
    await unlink(src);
    console.log('✓', dest.replace(root, ''));
  }
  console.log(`총 ${pngFiles.length}개 변환 완료`);
}

// manifest 재생성
const result = spawnSync('node', ['scripts/gen-plant-manifest.mjs'], { cwd: root, stdio: 'inherit', shell: true });
if (result.status !== 0) process.exit(result.status ?? 1);
