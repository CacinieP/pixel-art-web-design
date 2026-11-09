import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ATLAS_WIDTH, ATLAS_HEIGHT, paintAtlas, paintPostmaster } from "../src/art.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

class PixelBuffer {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = Buffer.alloc(width * height * 4);
  }

  rect(x, y, w, h, color) {
    const hex = color.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const x0 = Math.max(0, Math.floor(x));
    const y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(this.width, Math.floor(x + w));
    const y1 = Math.min(this.height, Math.floor(y + h));
    for (let py = y0; py < y1; py += 1) {
      for (let px = x0; px < x1; px += 1) {
        const i = (py * this.width + px) * 4;
        this.data[i] = r;
        this.data[i + 1] = g;
        this.data[i + 2] = b;
        this.data[i + 3] = 255;
      }
    }
  }

  png() {
    const raw = Buffer.alloc((this.width * 4 + 1) * this.height);
    for (let y = 0; y < this.height; y += 1) {
      raw[y * (this.width * 4 + 1)] = 0;
      this.data.copy(raw, y * (this.width * 4 + 1) + 1, y * this.width * 4, (y + 1) * this.width * 4);
    }
    return Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk("IHDR", (() => {
        const b = Buffer.alloc(13);
        b.writeUInt32BE(this.width, 0);
        b.writeUInt32BE(this.height, 4);
        b[8] = 8;
        b[9] = 6;
        return b;
      })()),
      chunk("IDAT", deflateSync(raw, { level: 9 })),
      chunk("IEND", Buffer.alloc(0)),
    ]);
  }
}

function chunk(type, data) {
  const name = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, crc]);
}

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) {
    c ^= byte;
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (c ^ 0xffffffff) >>> 0;
}

const atlas = new PixelBuffer(ATLAS_WIDTH, ATLAS_HEIGHT);
paintAtlas(atlas);
writeFileSync(join(root, "sprites", "world-atlas.png"), atlas.png());

const portrait = new PixelBuffer(32, 32);
paintPostmaster(portrait);
writeFileSync(join(root, "sprites", "postmaster.png"), portrait.png());

console.log(`Wrote sprites/world-atlas.png (${ATLAS_WIDTH}x${ATLAS_HEIGHT}) and sprites/postmaster.png`);