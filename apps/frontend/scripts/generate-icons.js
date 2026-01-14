/**
 * Generate valid PNG icons for the PWA
 * This creates simple blue square icons with a white cross/plus symbol
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { deflateSync } from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CRC32 table
const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buffer.length; i++) {
    crc = crcTable[(crc ^ buffer[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// Simple PNG encoder - creates a basic colored square
function createPNG(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = createChunk('IHDR', ihdrData);

  // IDAT chunk - create raw image data
  const rawData = [];
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const crossSize = Math.floor(Math.min(width, height) * 0.3);
  const crossWidth = Math.max(2, Math.floor(crossSize * 0.25));

  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte for each row
    for (let x = 0; x < width; x++) {
      // Check if pixel is part of the cross
      const inVertical = Math.abs(x - centerX) < crossWidth && Math.abs(y - centerY) < crossSize;
      const inHorizontal = Math.abs(y - centerY) < crossWidth && Math.abs(x - centerX) < crossSize;

      if (inVertical || inHorizontal) {
        // White cross
        rawData.push(255, 255, 255);
      } else {
        // Background color
        rawData.push(r, g, b);
      }
    }
  }

  // Compress using zlib
  const deflated = deflateSync(Buffer.from(rawData));
  const idat = createChunk('IDAT', deflated);

  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Generate icons
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = join(__dirname, '..', 'public');

// Primary blue color (matches the app theme)
const primaryColor = { r: 59, g: 130, b: 246 }; // blue-500

console.log('Generating PWA icons...');

sizes.forEach(size => {
  const filename = `icon-${size}x${size}.png`;
  const filepath = join(publicDir, filename);
  const png = createPNG(size, size, primaryColor.r, primaryColor.g, primaryColor.b);
  writeFileSync(filepath, png);
  console.log(`Created ${filename}`);
});

console.log('Done!');
