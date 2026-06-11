import sharp from 'sharp';
import { readdir, unlink } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function convertDir(dir, width, quality) {
  const files = await readdir(dir);
  const pngs = files.filter((f) => f.toLowerCase().endsWith('.png'));
  for (const f of pngs) {
    const src  = join(dir, f);
    const dest = join(dir, f.replace(/\.png$/i, '.webp'));
    await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(dest);
    await unlink(src);
    console.log('✓', dest.replace(root, ''));
  }
  return pngs.length;
}

const potsCount  = await convertDir(join(root, 'public', 'pots'),  512, 82);
const treesCount = await convertDir(join(root, 'public', 'trees'), 1024, 85);
console.log(`pots ${potsCount}개, trees ${treesCount}개 변환 완료`);
