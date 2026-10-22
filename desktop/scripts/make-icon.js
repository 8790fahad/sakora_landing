const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const size = 256;
const raw = Buffer.alloc((size * 4 + 1) * size);

for (let y = 0; y < size; y++) {
  const row = y * (size * 4 + 1);
  raw[row] = 0;
  for (let x = 0; x < size; x++) {
    const i = row + 1 + x * 4;
    const dx = (x + 0.5) / size - 0.5;
    const dy = (y + 0.5) / size - 0.5;
    const outside = Math.max(Math.abs(dx), Math.abs(dy)) > 0.42;
    raw[i] = outside ? 0 : 13;
    raw[i + 1] = outside ? 0 : 148;
    raw[i + 2] = outside ? 0 : 136;
    raw[i + 3] = outside ? 0 : 255;
  }
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c;
}

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(size, 0);
ihdr.writeUInt32BE(size, 4);
ihdr[8] = 8;
ihdr[9] = 6;

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(raw)),
  chunk("IEND", Buffer.alloc(0)),
]);

const target = path.join(__dirname, "..", "icon.png");
fs.writeFileSync(target, png);
console.log(`Wrote ${target} (${png.length} bytes)`);
