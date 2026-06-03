import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// 두잎 아이콘: 브라운 배경 + 두 잎
function buildSvg(s) {
  const r = s * 0.234; // 모서리 반경 (32px 기준 7.5)

  // 비율로 좌표 계산 (32 기준 설계를 s 기준으로 스케일)
  const scale = s / 32;
  const sc = (v) => v * scale;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <radialGradient id="bg" cx="40%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#5C3A1F"/>
      <stop offset="100%" stop-color="#3A1E0A"/>
    </radialGradient>
    <radialGradient id="leafL" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#C0DC9C"/>
      <stop offset="100%" stop-color="#7A9E5C"/>
    </radialGradient>
    <radialGradient id="leafR" cx="65%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#D4EAB0"/>
      <stop offset="100%" stop-color="#92B86A"/>
    </radialGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${sc(0.6)}" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- 배경 -->
  <rect width="${s}" height="${s}" rx="${r}" ry="${r}" fill="url(#bg)"/>

  <!-- 은은한 내부 광택 -->
  <ellipse cx="${sc(13)}" cy="${sc(10)}" rx="${sc(9)}" ry="${sc(7)}"
           fill="white" opacity="0.04"/>

  <!-- 줄기 -->
  <line x1="${sc(16)}" y1="${sc(27)}" x2="${sc(16)}" y2="${sc(19)}"
        stroke="#C8A87A" stroke-width="${sc(1.6)}" stroke-linecap="round"/>

  <!-- 왼쪽 잎 -->
  <path d="M${sc(16)} ${sc(20)} C${sc(12)} ${sc(16)} ${sc(6)} ${sc(11)} ${sc(9)} ${sc(6)} C${sc(13)} ${sc(8)} ${sc(16)} ${sc(14)} ${sc(16)} ${sc(20)}Z"
        fill="url(#leafL)" filter="url(#glow)"/>
  <!-- 왼쪽 잎 결 -->
  <path d="M${sc(16)} ${sc(19)} C${sc(13)} ${sc(15)} ${sc(10)} ${sc(11)} ${sc(9)} ${sc(7)}"
        stroke="#5A8040" stroke-width="${sc(0.75)}" stroke-linecap="round" fill="none" opacity="0.55"/>

  <!-- 오른쪽 잎 -->
  <path d="M${sc(16)} ${sc(20)} C${sc(20)} ${sc(16)} ${sc(26)} ${sc(11)} ${sc(23)} ${sc(6)} C${sc(19)} ${sc(8)} ${sc(16)} ${sc(14)} ${sc(16)} ${sc(20)}Z"
        fill="url(#leafR)" filter="url(#glow)"/>
  <!-- 오른쪽 잎 결 -->
  <path d="M${sc(16)} ${sc(19)} C${sc(19)} ${sc(15)} ${sc(22)} ${sc(11)} ${sc(23)} ${sc(7)}"
        stroke="#6A9848" stroke-width="${sc(0.75)}" stroke-linecap="round" fill="none" opacity="0.55"/>
</svg>`;
}

async function generate(size) {
  const svg = buildSvg(size);
  const outPath = join(publicDir, `icon-${size}.png`);
  await sharp(Buffer.from(svg)).png({ quality: 100 }).toFile(outPath);
  console.log(`✓ icon-${size}.png`);
}

await generate(192);
await generate(512);
console.log('Done!');
