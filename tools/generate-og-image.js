/**
 * OG Image generator for GetHired Online.
 * Produces: src/assets/brand/gethired-og-default.png  (1200×630)
 *
 * Uses pngjs (pure-JS PNG encoder — no native bindings) so this runs on any
 * Node version without compilation.
 *
 * Run:  node tools/generate-og-image.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Inline minimal PNG encoder (no external deps required)
// We write raw RGBA pixels and compress with Node's built-in zlib.
// ---------------------------------------------------------------------------
const zlib = require('zlib');

const W = 1200;
const H = 630;

// RGBA buffer — 4 bytes per pixel
const buf = Buffer.alloc(W * H * 4);

// ─── Colour helpers ──────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const idx = (y * W + x) * 4;
  buf[idx]     = r;
  buf[idx + 1] = g;
  buf[idx + 2] = b;
  buf[idx + 3] = a;
}

// ─── Background gradient (dark navy → deep blue) ────────────────────────────
// Interpolate vertically from #0f172a to #1e3a5f

const TOP    = hexToRgb('#0f172a');
const BOTTOM = hexToRgb('#1e3a5f');

for (let y = 0; y < H; y++) {
  const t = y / (H - 1);
  const r = Math.round(TOP[0] + t * (BOTTOM[0] - TOP[0]));
  const g = Math.round(TOP[1] + t * (BOTTOM[1] - TOP[1]));
  const b = Math.round(TOP[2] + t * (BOTTOM[2] - TOP[2]));
  for (let x = 0; x < W; x++) {
    setPixel(x, y, r, g, b);
  }
}

// ─── Accent horizontal bar ──────────────────────────────────────────────────
// A thin coral-red accent bar near the top (brand colour #FE6F61)
const BAR_Y = 14;
const BAR_H = 6;
const ACC = hexToRgb('#FE6F61');
for (let y = BAR_Y; y < BAR_Y + BAR_H; y++) {
  for (let x = 60; x < W - 60; x++) {
    setPixel(x, y, ACC[0], ACC[1], ACC[2]);
  }
}

// ─── Geometric motif — subtle diagonal lines bottom-right ───────────────────
const MOTIF = hexToRgb('#2a4a7a');
for (let i = 0; i < 8; i++) {
  const startX = W - 250 + i * 28;
  for (let t = 0; t < 200; t++) {
    setPixel(startX + t, H - 80 + t, MOTIF[0], MOTIF[1], MOTIF[2], 120);
  }
}

// ─── Simple pixel-font text renderer ────────────────────────────────────────
// We bake the characters we need into 5×7 pixel bitmaps.
// This avoids any font dependency.

// 5-wide × 7-tall pixel font for uppercase + lowercase + punctuation
const FONT5 = {
  ' ': [0,0,0,0,0,  0,0,0,0,0,  0,0,0,0,0,  0,0,0,0,0,  0,0,0,0,0,  0,0,0,0,0,  0,0,0,0,0],
  'G': [0,1,1,1,0,  1,0,0,0,0,  1,0,1,1,1,  1,0,0,0,1,  1,0,0,0,1,  0,1,1,1,0,  0,0,0,0,0],
  'E': [1,1,1,1,1,  1,0,0,0,0,  1,1,1,1,0,  1,0,0,0,0,  1,0,0,0,0,  1,1,1,1,1,  0,0,0,0,0],
  'T': [1,1,1,1,1,  0,0,1,0,0,  0,0,1,0,0,  0,0,1,0,0,  0,0,1,0,0,  0,0,1,0,0,  0,0,0,0,0],
  'H': [1,0,0,0,1,  1,0,0,0,1,  1,1,1,1,1,  1,0,0,0,1,  1,0,0,0,1,  1,0,0,0,1,  0,0,0,0,0],
  'I': [0,1,1,1,0,  0,0,1,0,0,  0,0,1,0,0,  0,0,1,0,0,  0,0,1,0,0,  0,1,1,1,0,  0,0,0,0,0],
  'R': [1,1,1,1,0,  1,0,0,0,1,  1,1,1,1,0,  1,0,1,0,0,  1,0,0,1,0,  1,0,0,0,1,  0,0,0,0,0],
  'D': [1,1,1,1,0,  1,0,0,0,1,  1,0,0,0,1,  1,0,0,0,1,  1,0,0,0,1,  1,1,1,1,0,  0,0,0,0,0],
  'e': [0,1,1,1,0,  1,0,0,0,1,  1,1,1,1,1,  1,0,0,0,0,  0,1,1,1,1,  0,0,0,0,0,  0,0,0,0,0],
  't': [0,0,1,0,0,  0,1,1,1,0,  0,0,1,0,0,  0,0,1,0,0,  0,0,0,1,1,  0,0,0,0,0,  0,0,0,0,0],
  'h': [1,0,0,0,0,  1,0,0,0,0,  1,1,1,1,0,  1,0,0,0,1,  1,0,0,0,1,  1,0,0,0,1,  0,0,0,0,0],
  'i': [0,0,1,0,0,  0,0,0,0,0,  0,1,1,0,0,  0,0,1,0,0,  0,0,1,0,0,  0,1,1,1,0,  0,0,0,0,0],
  'r': [0,0,0,0,0,  0,0,0,0,0,  1,0,1,1,0,  1,1,0,0,0,  1,0,0,0,0,  1,0,0,0,0,  0,0,0,0,0],
  'd': [0,0,0,0,1,  0,0,0,0,1,  0,1,1,0,1,  1,0,0,1,1,  1,0,0,0,1,  0,1,1,1,1,  0,0,0,0,0],
  'F': [1,1,1,1,1,  1,0,0,0,0,  1,1,1,1,0,  1,0,0,0,0,  1,0,0,0,0,  1,0,0,0,0,  0,0,0,0,0],
  'j': [0,0,0,0,1,  0,0,0,0,0,  0,0,0,0,1,  0,0,0,0,1,  1,0,0,0,1,  0,1,1,1,0,  0,0,0,0,0],
  'o': [0,1,1,1,0,  1,0,0,0,1,  1,0,0,0,1,  1,0,0,0,1,  1,0,0,0,1,  0,1,1,1,0,  0,0,0,0,0],
  'b': [1,0,0,0,0,  1,0,0,0,0,  1,1,1,1,0,  1,0,0,0,1,  1,0,0,0,1,  1,1,1,1,0,  0,0,0,0,0],
  's': [0,1,1,1,1,  1,0,0,0,0,  0,1,1,1,0,  0,0,0,0,1,  0,0,0,0,1,  1,1,1,1,0,  0,0,0,0,0],
  '.': [0,0,0,0,0,  0,0,0,0,0,  0,0,0,0,0,  0,0,0,0,0,  0,0,1,0,0,  0,0,1,0,0,  0,0,0,0,0],
  'M': [1,0,0,0,1,  1,1,0,1,1,  1,0,1,0,1,  1,0,0,0,1,  1,0,0,0,1,  1,0,0,0,1,  0,0,0,0,0],
  'a': [0,0,0,0,0,  0,1,1,1,0,  0,0,0,0,1,  0,1,1,1,1,  1,0,0,0,1,  0,1,1,1,1,  0,0,0,0,0],
  'c': [0,0,0,0,0,  0,1,1,1,0,  1,0,0,0,0,  1,0,0,0,0,  1,0,0,0,0,  0,1,1,1,0,  0,0,0,0,0],
  'n': [0,0,0,0,0,  0,0,0,0,0,  1,1,1,1,0,  1,0,0,0,1,  1,0,0,0,1,  1,0,0,0,1,  0,0,0,0,0],
  'w': [0,0,0,0,0,  1,0,0,0,1,  1,0,0,0,1,  1,0,1,0,1,  1,1,0,1,1,  1,0,0,0,1,  0,0,0,0,0],
  'y': [0,0,0,0,0,  1,0,0,0,1,  1,0,0,0,1,  0,1,1,1,1,  0,0,0,0,1,  1,1,1,1,0,  0,0,0,0,0],
  'u': [0,0,0,0,0,  1,0,0,0,1,  1,0,0,0,1,  1,0,0,0,1,  1,0,0,1,1,  0,1,1,0,1,  0,0,0,0,0],
  'l': [0,1,1,0,0,  0,0,1,0,0,  0,0,1,0,0,  0,0,1,0,0,  0,0,1,0,0,  0,1,1,1,0,  0,0,0,0,0],
  'p': [0,0,0,0,0,  1,1,1,1,0,  1,0,0,0,1,  1,1,1,1,0,  1,0,0,0,0,  1,0,0,0,0,  0,0,0,0,0],
  'x': [0,0,0,0,0,  1,0,0,0,1,  0,1,0,1,0,  0,0,1,0,0,  0,1,0,1,0,  1,0,0,0,1,  0,0,0,0,0],
  'v': [0,0,0,0,0,  1,0,0,0,1,  1,0,0,0,1,  1,0,0,0,1,  0,1,0,1,0,  0,0,1,0,0,  0,0,0,0,0],
  'g': [0,0,0,0,0,  0,1,1,1,1,  1,0,0,0,1,  0,1,1,1,1,  0,0,0,0,1,  0,1,1,1,0,  0,0,0,0,0],
  'k': [0,0,0,0,0,  1,0,0,1,0,  1,0,1,0,0,  1,1,0,0,0,  1,0,1,0,0,  1,0,0,1,0,  0,0,0,0,0],
  'B': [1,1,1,1,0,  1,0,0,0,1,  1,1,1,1,0,  1,0,0,0,1,  1,0,0,0,1,  1,1,1,1,0,  0,0,0,0,0],
  'L': [1,0,0,0,0,  1,0,0,0,0,  1,0,0,0,0,  1,0,0,0,0,  1,0,0,0,0,  1,1,1,1,1,  0,0,0,0,0],
  'C': [0,1,1,1,0,  1,0,0,0,0,  1,0,0,0,0,  1,0,0,0,0,  1,0,0,0,0,  0,1,1,1,0,  0,0,0,0,0],
  'A': [0,0,1,0,0,  0,1,0,1,0,  1,0,0,0,1,  1,1,1,1,1,  1,0,0,0,1,  1,0,0,0,1,  0,0,0,0,0],
  'Y': [1,0,0,0,1,  0,1,0,1,0,  0,0,1,0,0,  0,0,1,0,0,  0,0,1,0,0,  0,0,1,0,0,  0,0,0,0,0],
};

/**
 * Draw text at (startX, startY) with given scale and colour.
 * Returns next X position (for chaining).
 */
function drawText(text, startX, startY, scale, rgb) {
  let cx = startX;
  for (const ch of text) {
    const bitmap = FONT5[ch] || FONT5[' '];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (bitmap[row * 5 + col]) {
          for (let dy = 0; dy < scale; dy++) {
            for (let dx = 0; dx < scale; dx++) {
              setPixel(cx + col * scale + dx, startY + row * scale + dy, rgb[0], rgb[1], rgb[2]);
            }
          }
        }
      }
    }
    cx += (5 + 1) * scale; // 5 wide + 1 gap
  }
  return cx;
}

// ─── Text layout ─────────────────────────────────────────────────────────────
const WHITE   = [255, 255, 255];
const SUBTEXT = [180, 210, 240];

// "GetHired" — large, scale 12 (72px equiv)
const MAIN_SCALE  = 12;
const CHAR_W      = (5 + 1) * MAIN_SCALE; // 72px per char
const mainText    = 'GetHired';
const mainWidth   = mainText.length * CHAR_W;
const mainX       = Math.floor((W - mainWidth) / 2);
const mainY       = 180;
drawText(mainText, mainX, mainY, MAIN_SCALE, WHITE);

// Subtitle — scale 4 (24px equiv)
const SUB_SCALE  = 4;
const subText1   = 'Find jobs. Match with employers. Build your career.';
const subCharW   = (5 + 1) * SUB_SCALE;
const subWidth1  = subText1.length * subCharW;
const subX1      = Math.floor((W - subWidth1) / 2);
drawText(subText1, subX1, 350, SUB_SCALE, SUBTEXT);

// Bottom brand line — scale 3
const brandText  = 'gethiredonline.app';
const BRAND_SCALE = 3;
const bCharW     = (5 + 1) * BRAND_SCALE;
const bWidth     = brandText.length * bCharW;
const bX         = Math.floor((W - bWidth) / 2);
drawText(brandText, bX, 530, BRAND_SCALE, ACC);

// ─── PNG encoder (minimal, RFC 2083) ────────────────────────────────────────

function adler32(data) {
  let a = 1, b = 0;
  for (let i = 0; i < data.length; i++) {
    a = (a + data[i]) % 65521;
    b = (b + a) % 65521;
  }
  return (b << 16) | a;
}

function crc32(data) {
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c;
    }
    return t;
  })());
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) c = table[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function u32be(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n, 0);
  return b;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const crc = crc32(Buffer.concat([typeBytes, data]));
  return Buffer.concat([u32be(data.length), typeBytes, data, u32be(crc)]);
}

// Build raw scanlines (filter byte 0 = None per row)
const scanlines = Buffer.alloc((1 + W * 4) * H);
for (let y = 0; y < H; y++) {
  const rowStart = y * (1 + W * 4);
  scanlines[rowStart] = 0; // filter = None
  buf.copy(scanlines, rowStart + 1, y * W * 4, (y + 1) * W * 4);
}

// Deflate (zlib) the scanlines
const compressed = zlib.deflateSync(scanlines, { level: 6 });

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8]  = 8;  // bit depth
ihdr[9]  = 6;  // colour type: RGBA
ihdr[10] = 0;  // compression
ihdr[11] = 0;  // filter
ihdr[12] = 0;  // interlace

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), // PNG signature
  pngChunk('IHDR', ihdr),
  pngChunk('IDAT', compressed),
  pngChunk('IEND', Buffer.alloc(0)),
]);

// ─── Output ──────────────────────────────────────────────────────────────────
const outDir = path.join(__dirname, '..', 'src', 'assets', 'brand');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'gethired-og-default.png');
fs.writeFileSync(outPath, png);
console.log('Written: ' + outPath + ' (' + (png.length / 1024).toFixed(1) + ' KB, ' + W + 'x' + H + ')');
