const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const size = 1024;
const radius = 220;
const mark = [
  `M250 190 Q250 150 290 150 H734 Q774 150 790 190 L818 260
   Q826 282 808 300 Q788 320 764 302 Q740 326 714 302 Q690 326 664 302
   Q640 326 614 302 Q590 326 564 302 Q540 326 514 302 Q490 326 464 302
   Q440 326 414 302 Q390 326 364 302 Q340 326 314 302 Q288 326 266 302
   Q244 284 252 260 Z`,
  `M306 372 Q306 344 334 344 H652 Q736 344 736 426 Q736 494 668 520
   L454 602 Q426 612 426 634 Q426 656 454 656 H680 Q710 656 710 686
   V716 Q710 744 680 744 H370 Q286 744 286 660 Q286 592 358 564
   L574 482 Q602 470 602 448 Q602 426 574 426 H334 Q306 426 306 398 Z`,
];

function tokenize(d) {
  return d.match(/[A-Za-z]|-?\d*\.?\d+/g).map((token) => (/[A-Za-z]/.test(token) ? token : Number(token)));
}

function toPolygon(d) {
  const tokens = tokenize(d);
  const points = [];
  let i = 0;
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;

  function add(x, y) {
    points.push([x, y]);
    cx = x;
    cy = y;
  }

  while (i < tokens.length) {
    const command = tokens[i++];
    if (command === "M") {
      cx = tokens[i++];
      cy = tokens[i++];
      sx = cx;
      sy = cy;
      points.push([cx, cy]);
    } else if (command === "L") {
      add(tokens[i++], tokens[i++]);
    } else if (command === "H") {
      add(tokens[i++], cy);
    } else if (command === "V") {
      add(cx, tokens[i++]);
    } else if (command === "Q") {
      const x0 = cx;
      const y0 = cy;
      const x1 = tokens[i++];
      const y1 = tokens[i++];
      const x2 = tokens[i++];
      const y2 = tokens[i++];
      for (let step = 1; step <= 16; step++) {
        const t = step / 16;
        const u = 1 - t;
        points.push([
          u * u * x0 + 2 * u * t * x1 + t * t * x2,
          u * u * y0 + 2 * u * t * y1 + t * t * y2,
        ]);
      }
      cx = x2;
      cy = y2;
    } else if (command === "Z" || command === "z") {
      add(sx, sy);
    }
  }
  return points;
}

function fillPolygon(points, paint) {
  let minY = size;
  let maxY = 0;
  for (const [, y] of points) {
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  minY = Math.max(0, Math.floor(minY));
  maxY = Math.min(size - 1, Math.ceil(maxY));
  for (let y = minY; y <= maxY; y++) {
    const scan = y + 0.5;
    const crossings = [];
    for (let index = 0; index < points.length - 1; index++) {
      const [x1, y1] = points[index];
      const [x2, y2] = points[index + 1];
      if ((y1 <= scan && y2 > scan) || (y2 <= scan && y1 > scan)) {
        crossings.push(x1 + ((scan - y1) / (y2 - y1)) * (x2 - x1));
      }
    }
    crossings.sort((a, b) => a - b);
    for (let k = 0; k + 1 < crossings.length; k += 2) {
      const start = Math.max(0, Math.ceil(crossings[k]));
      const end = Math.min(size - 1, Math.floor(crossings[k + 1]));
      for (let x = start; x <= end; x++) paint(x, y);
    }
  }
}

function insideRoundedRect(x, y) {
  const px = x + 0.5;
  const py = y + 0.5;
  let cx = px;
  let cy = py;
  if (px < radius && py < radius) {
    cx = radius;
    cy = radius;
  } else if (px > size - radius && py < radius) {
    cx = size - radius;
    cy = radius;
  } else if (px < radius && py > size - radius) {
    cx = radius;
    cy = size - radius;
  } else if (px > size - radius && py > size - radius) {
    cx = size - radius;
    cy = size - radius;
  } else {
    return true;
  }
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= radius * radius;
}

const mask = new Uint8Array(size * size);
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    if (insideRoundedRect(x, y)) mask[y * size + x] = 1;
  }
}
for (const d of mark) {
  fillPolygon(toPolygon(d), (x, y) => {
    if (mask[y * size + x]) mask[y * size + x] = 2;
  });
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

function png(width, raw) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(width, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function raster(target, { opaque = false } = {}) {
  const raw = Buffer.alloc((target * 4 + 1) * target);
  const scale = size / target;
  for (let y = 0; y < target; y++) {
    raw[y * (target * 4 + 1)] = 0;
    for (let x = 0; x < target; x++) {
      let teal = 0;
      let white = 0;
      let total = 0;
      const x0 = Math.floor(x * scale);
      const x1 = Math.floor((x + 1) * scale);
      const y0 = Math.floor(y * scale);
      const y1 = Math.floor((y + 1) * scale);
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          total++;
          const value = mask[yy * size + xx];
          if (value === 1) teal++;
          else if (value === 2) white++;
        }
      }
      const covered = teal + white;
      const mix = covered ? white / covered : 0;
      const alpha = opaque ? 255 : Math.round((covered / total) * 255);
      const i = y * (target * 4 + 1) + 1 + x * 4;
      raw[i] = Math.round(13 * (1 - mix) + 255 * mix);
      raw[i + 1] = Math.round(148 * (1 - mix) + 255 * mix);
      raw[i + 2] = Math.round(136 * (1 - mix) + 255 * mix);
      raw[i + 3] = alpha;
    }
  }
  return png(target, raw);
}

function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = Buffer.alloc(16 * images.length);
  let offset = 6 + entries.length;
  const parts = [header, entries];
  images.forEach((image, index) => {
    const at = index * 16;
    entries[at] = image.size === 256 ? 0 : image.size;
    entries[at + 1] = image.size === 256 ? 0 : image.size;
    entries.writeUInt16LE(1, at + 4);
    entries.writeUInt16LE(32, at + 6);
    entries.writeUInt32LE(image.png.length, at + 8);
    entries.writeUInt32LE(offset, at + 12);
    offset += image.png.length;
    parts.push(image.png);
  });
  return Buffer.concat(parts);
}

const publicDir = path.join(__dirname, "..", "public");
const sizes = [16, 32, 48];
const images = sizes.map((iconSize) => ({ size: iconSize, png: raster(iconSize) }));
fs.writeFileSync(path.join(publicDir, "favicon.ico"), ico(images));
fs.writeFileSync(path.join(publicDir, "favicon-32.png"), images[1].png);
fs.writeFileSync(path.join(publicDir, "apple-touch-icon.png"), raster(180, { opaque: true }));
console.log("Wrote favicon.ico, favicon-32.png, and apple-touch-icon.png");
