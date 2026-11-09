export const PALETTE = {
  ink: "#1a1a2e",
  inkSoft: "#3a3a55",
  paper: "#f4f1e8",
  paperSoft: "#e8e2d0",
  sea1: "#bfe3d0",
  sea2: "#6fb7a5",
  sea3: "#3d8078",
  sea4: "#245055",
  gold1: "#ffe6a3",
  gold2: "#f2c14e",
  gold3: "#c98a3a",
  gold4: "#7a5230",
  coral1: "#ffb08a",
  coral2: "#e86a5a",
  coral3: "#b23a48",
  coral4: "#6e2740",
  leaf1: "#d4e39a",
  leaf2: "#94b86a",
  leaf3: "#5a8055",
  leaf4: "#335043",
};

const P = PALETTE;
const rect = (p, x, y, w, h, c) => p.rect(x, y, w, h, P[c] ?? c);

function box(p, x, y, w, h, fill, outline = "ink") {
  rect(p, x, y, w, h, outline);
  rect(p, x + 1, y + 1, w - 2, h - 2, fill);
}

function ellipse(p, cx, cy, rx, ry, color) {
  for (let dy = -ry; dy <= ry; dy += 1) {
    const half = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry))));
    rect(p, cx - half, cy + dy, half * 2 + 1, 1, color);
  }
}

function roof(p, x, y, w, h, light, base, dark) {
  for (let row = 0; row < h; row += 1) {
    const inset = Math.floor(((h - row - 1) * w) / (2 * h));
    rect(p, x + inset, y + row, w - inset * 2, 1, row < 2 ? light : row < h - 2 ? base : dark);
  }
  rect(p, x, y + h - 1, w, 1, "ink");
}

const tile = (base, detail) => (p) => {
  rect(p, 0, 0, 16, 16, base);
  detail(p);
};

const sprites = [
  { name: "grass0", w: 16, h: 16, paint: tile("leaf3", (p) => { rect(p, 3, 4, 2, 1, "leaf2"); rect(p, 11, 9, 2, 1, "leaf4"); rect(p, 7, 13, 1, 1, "leaf2"); }) },
  { name: "grass1", w: 16, h: 16, paint: tile("leaf3", (p) => { rect(p, 2, 10, 1, 2, "leaf4"); rect(p, 8, 3, 2, 1, "leaf2"); rect(p, 13, 12, 1, 1, "leaf1"); rect(p, 5, 7, 1, 1, "leaf4"); }) },
  { name: "grass2", w: 16, h: 16, paint: tile("leaf3", (p) => { rect(p, 4, 2, 1, 1, "leaf2"); rect(p, 12, 5, 2, 1, "leaf4"); rect(p, 3, 12, 2, 1, "leaf2"); rect(p, 10, 14, 1, 1, "leaf4"); }) },
  { name: "path0", w: 16, h: 16, paint: tile("gold3", (p) => { rect(p, 2, 3, 3, 2, "gold4"); rect(p, 10, 8, 3, 2, "gold2"); rect(p, 6, 12, 2, 1, "gold4"); }) },
  { name: "path1", w: 16, h: 16, paint: tile("gold3", (p) => { rect(p, 8, 2, 3, 2, "gold4"); rect(p, 3, 9, 2, 2, "gold2"); rect(p, 12, 13, 2, 1, "gold4"); }) },
  { name: "path2", w: 16, h: 16, paint: tile("gold3", (p) => { rect(p, 5, 5, 2, 2, "gold2"); rect(p, 11, 11, 3, 2, "gold4"); rect(p, 2, 13, 1, 1, "gold4"); }) },
  { name: "water0", w: 16, h: 16, paint: tile("sea4", (p) => { rect(p, 2, 4, 4, 1, "sea3"); rect(p, 9, 10, 4, 1, "sea3"); rect(p, 12, 3, 2, 1, "sea2"); }) },
  { name: "water1", w: 16, h: 16, paint: tile("sea4", (p) => { rect(p, 4, 8, 4, 1, "sea3"); rect(p, 10, 2, 3, 1, "sea3"); rect(p, 2, 13, 2, 1, "sea2"); }) },
  { name: "water2", w: 16, h: 16, paint: tile("sea4", (p) => { rect(p, 1, 11, 3, 1, "sea3"); rect(p, 7, 5, 4, 1, "sea3"); rect(p, 13, 12, 2, 1, "sea2"); }) },
  { name: "sand0", w: 16, h: 16, paint: tile("paperSoft", (p) => { rect(p, 3, 5, 2, 1, "gold3"); rect(p, 10, 11, 3, 1, "gold3"); rect(p, 12, 3, 1, 1, "gold2"); }) },
  { name: "sand1", w: 16, h: 16, paint: tile("paperSoft", (p) => { rect(p, 6, 3, 2, 1, "gold3"); rect(p, 2, 12, 2, 1, "gold2"); rect(p, 11, 8, 2, 1, "gold3"); }) },
  { name: "bridge", w: 16, h: 16, paint: (p) => { rect(p, 0, 0, 16, 16, "gold4"); for (let y = 1; y < 16; y += 4) rect(p, 1, y, 14, 2, "gold3"); rect(p, 0, 0, 1, 16, "ink"); rect(p, 15, 0, 1, 16, "ink"); } },
  { name: "flowerCoral", w: 16, h: 16, paint: (p) => { rect(p, 7, 9, 1, 5, "leaf4"); rect(p, 5, 5, 5, 4, "coral2"); rect(p, 6, 4, 3, 6, "coral2"); rect(p, 7, 6, 2, 2, "gold1"); } },
  { name: "flowerGold", w: 16, h: 16, paint: (p) => { rect(p, 7, 9, 1, 5, "leaf4"); rect(p, 5, 5, 5, 4, "gold2"); rect(p, 6, 4, 3, 6, "gold2"); rect(p, 7, 6, 2, 2, "coral3"); } },
  { name: "flowerSea", w: 16, h: 16, paint: (p) => { rect(p, 7, 9, 1, 5, "leaf4"); rect(p, 5, 5, 5, 4, "sea2"); rect(p, 6, 4, 3, 6, "sea2"); rect(p, 7, 6, 2, 2, "gold1"); } },
  { name: "mushroom", w: 16, h: 16, paint: (p) => { rect(p, 7, 9, 3, 5, "paperSoft"); rect(p, 4, 5, 9, 4, "coral3"); rect(p, 5, 4, 7, 2, "coral2"); rect(p, 6, 6, 2, 1, "paper"); rect(p, 10, 5, 1, 1, "paper"); } },
  { name: "rock", w: 16, h: 16, paint: (p) => { ellipse(p, 8, 10, 5, 3, "inkSoft"); rect(p, 5, 7, 5, 2, "paperSoft"); rect(p, 4, 9, 3, 1, "ink"); } },
  { name: "tuft", w: 16, h: 16, paint: (p) => { rect(p, 4, 10, 1, 4, "leaf2"); rect(p, 6, 8, 1, 6, "leaf2"); rect(p, 8, 11, 1, 3, "leaf4"); rect(p, 10, 9, 1, 5, "leaf2"); } },
  { name: "lily", w: 16, h: 16, paint: (p) => { ellipse(p, 8, 9, 5, 3, "leaf3"); rect(p, 8, 6, 1, 3, "sea4"); rect(p, 5, 7, 3, 1, "leaf2"); rect(p, 10, 10, 2, 1, "leaf4"); } },
  { name: "fence", w: 16, h: 16, paint: (p) => { rect(p, 1, 6, 14, 2, "gold3"); rect(p, 1, 11, 14, 2, "gold3"); rect(p, 2, 3, 3, 12, "gold4"); rect(p, 11, 3, 3, 12, "gold4"); rect(p, 2, 3, 3, 1, "gold2"); rect(p, 11, 3, 3, 1, "gold2"); } },
  { name: "lamp", w: 16, h: 32, paint: (p) => { rect(p, 7, 12, 2, 18, "ink"); rect(p, 5, 30, 6, 2, "inkSoft"); box(p, 4, 4, 8, 9, "gold1"); rect(p, 5, 5, 2, 3, "paper"); rect(p, 3, 2, 10, 2, "ink"); rect(p, 6, 0, 4, 2, "coral3"); } },
  { name: "tree0", w: 32, h: 40, paint: (p) => { rect(p, 13, 24, 6, 14, "gold4"); rect(p, 14, 24, 2, 14, "gold3"); rect(p, 12, 38, 8, 2, "ink"); ellipse(p, 16, 16, 14, 14, "leaf4"); ellipse(p, 15, 15, 12, 12, "leaf3"); ellipse(p, 11, 10, 7, 6, "leaf2"); rect(p, 7, 7, 4, 2, "leaf1"); rect(p, 18, 20, 6, 3, "leaf4"); rect(p, 22, 12, 3, 2, "leaf2"); } },
  { name: "tree1", w: 32, h: 40, paint: (p) => { rect(p, 14, 28, 4, 10, "gold4"); rect(p, 13, 38, 6, 2, "ink"); for (let i = 0; i < 4; i += 1) { const y = 4 + i * 7; const w = 10 + i * 6; rect(p, 16 - w / 2, y, w, 8, "leaf4"); rect(p, 16 - w / 2 + 2, y + 1, w - 4, 5, "leaf3"); rect(p, 16 - w / 2 + 3, y + 1, Math.max(2, w / 3), 2, "leaf2"); } rect(p, 15, 1, 2, 4, "leaf2"); } },
  { name: "houseCoral", w: 48, h: 40, paint: (p) => paintHouse(p, "coral1", "coral2", "coral3") },
  { name: "houseGold", w: 48, h: 40, paint: (p) => paintHouse(p, "gold1", "gold2", "gold3") },
  { name: "houseLeaf", w: 48, h: 40, paint: (p) => paintHouse(p, "leaf1", "leaf2", "leaf3") },
  { name: "lighthouse", w: 32, h: 64, paint: (p) => { rect(p, 6, 60, 20, 4, "ink"); rect(p, 9, 20, 14, 40, "paperSoft"); rect(p, 9, 20, 4, 40, "paper"); for (let y = 26; y < 58; y += 12) rect(p, 9, y, 14, 5, "coral2"); rect(p, 20, 20, 3, 40, "paperSoft"); box(p, 7, 10, 18, 12, "gold1"); rect(p, 9, 12, 4, 6, "paper"); rect(p, 5, 7, 22, 3, "ink"); roof(p, 8, 0, 16, 8, "coral1", "coral2", "coral3"); rect(p, 14, 44, 4, 8, "ink"); rect(p, 15, 45, 2, 3, "gold2"); } },
  { name: "mailboxCoral", w: 16, h: 20, paint: (p) => paintMailbox(p, "coral2", "coral3") },
  { name: "mailboxGold", w: 16, h: 20, paint: (p) => paintMailbox(p, "gold2", "gold3") },
  { name: "mailboxLeaf", w: 16, h: 20, paint: (p) => paintMailbox(p, "leaf2", "leaf3") },
  { name: "letterCoral", w: 16, h: 16, paint: (p) => paintLetter(p, "coral2") },
  { name: "letterGold", w: 16, h: 16, paint: (p) => paintLetter(p, "gold2") },
  { name: "letterLeaf", w: 16, h: 16, paint: (p) => paintLetter(p, "leaf2") },
  { name: "portal0", w: 24, h: 32, paint: (p) => paintPortal(p, false) },
  { name: "portal1", w: 24, h: 32, paint: (p) => paintPortal(p, true) },
  { name: "playerDown0", w: 16, h: 24, paint: (p) => paintPlayer(p, "down", 0) },
  { name: "playerDown1", w: 16, h: 24, paint: (p) => paintPlayer(p, "down", 1) },
  { name: "playerUp0", w: 16, h: 24, paint: (p) => paintPlayer(p, "up", 0) },
  { name: "playerUp1", w: 16, h: 24, paint: (p) => paintPlayer(p, "up", 1) },
  { name: "playerLeft0", w: 16, h: 24, paint: (p) => paintPlayer(p, "left", 0) },
  { name: "playerLeft1", w: 16, h: 24, paint: (p) => paintPlayer(p, "left", 1) },
  { name: "playerRight0", w: 16, h: 24, paint: (p) => paintPlayer(p, "right", 0) },
  { name: "playerRight1", w: 16, h: 24, paint: (p) => paintPlayer(p, "right", 1) },
  { name: "playerIdle0", w: 16, h: 24, paint: (p) => paintPlayer(p, "down", 0) },
  { name: "playerIdle1", w: 16, h: 24, paint: (p) => paintPlayer(p, "down", 2) },
  { name: "slime0", w: 16, h: 16, paint: (p) => paintSlime(p, 0) },
  { name: "slime1", w: 16, h: 16, paint: (p) => paintSlime(p, 1) },
];

function paintHouse(p, light, base, dark) {
  rect(p, 4, 16, 40, 22, "ink");
  rect(p, 5, 17, 38, 20, "paperSoft");
  rect(p, 5, 17, 6, 20, "paper");
  rect(p, 37, 17, 6, 20, "gold3");
  roof(p, 0, 2, 48, 16, light, base, dark);
  rect(p, 34, 0, 6, 10, "inkSoft");
  rect(p, 35, 0, 4, 2, "ink");
  box(p, 20, 24, 9, 14, "gold4");
  rect(p, 27, 31, 1, 2, "gold2");
  box(p, 8, 22, 8, 8, "gold1");
  rect(p, 11, 22, 1, 8, "ink");
  rect(p, 8, 25, 8, 1, "ink");
  box(p, 33, 22, 8, 8, "gold1");
  rect(p, 36, 22, 1, 8, "ink");
  rect(p, 33, 25, 8, 1, "ink");
  rect(p, 4, 38, 40, 2, "ink");
}

function paintMailbox(p, base, dark) {
  rect(p, 7, 10, 2, 10, "ink");
  rect(p, 5, 18, 6, 2, "inkSoft");
  box(p, 2, 3, 12, 8, base);
  rect(p, 3, 4, 10, 2, "paperSoft");
  rect(p, 3, 8, 10, 2, dark);
  rect(p, 12, 0, 2, 6, "ink");
  rect(p, 13, 0, 3, 3, base);
  rect(p, 5, 6, 6, 1, "ink");
}

function paintLetter(p, seal) {
  rect(p, 2, 4, 12, 9, "ink");
  rect(p, 3, 5, 10, 7, "paper");
  rect(p, 3, 5, 10, 1, "paperSoft");
  rect(p, 3, 5, 1, 1, seal);
  rect(p, 12, 5, 1, 1, seal);
  rect(p, 4, 6, 1, 1, seal);
  rect(p, 11, 6, 1, 1, seal);
  rect(p, 5, 7, 1, 1, seal);
  rect(p, 10, 7, 1, 1, seal);
  rect(p, 6, 8, 4, 2, seal);
  rect(p, 1, 1, 2, 2, "gold1");
  rect(p, 13, 1, 1, 1, "gold1");
}

function paintPortal(p, active) {
  const glow = active ? "gold1" : "inkSoft";
  const inner = active ? "gold2" : "sea4";
  rect(p, 2, 6, 20, 26, "ink");
  rect(p, 4, 8, 16, 24, "sea3");
  rect(p, 6, 10, 12, 22, inner);
  rect(p, 8, 12, 8, 20, glow);
  rect(p, 0, 4, 24, 4, "ink");
  rect(p, 2, 2, 20, 3, "sea2");
  rect(p, 4, 0, 16, 2, "sea1");
  rect(p, 0, 30, 24, 2, "ink");
  if (active) {
    rect(p, 10, 16, 4, 2, "paper");
    rect(p, 11, 14, 2, 6, "paper");
    rect(p, 3, 12, 1, 3, "gold1");
    rect(p, 20, 18, 1, 3, "gold1");
  }
}

function paintPlayer(p, dir, frame) {
  const step = frame === 1 ? 1 : 0;
  const blink = frame === 2;
  rect(p, 4, 22, 3, 2, "ink");
  rect(p, 9, 22, 3, 2, "ink");
  if (step) {
    rect(p, 3, 20, 3, 3, "ink");
    rect(p, 10, 21, 3, 2, "ink");
  } else {
    rect(p, 4, 20, 3, 3, "ink");
    rect(p, 9, 20, 3, 3, "ink");
  }
  rect(p, 3, 11, 10, 10, "ink");
  rect(p, 4, 12, 8, 8, "sea3");
  rect(p, 4, 12, 3, 8, "sea2");
  rect(p, 9, 12, 3, 8, "sea4");
  rect(p, 2, 13, 2, 6, "sea3");
  rect(p, 12, 13, 2, 6, "sea3");
  rect(p, 10, 15, 4, 5, "gold3");
  rect(p, 11, 15, 3, 1, "gold2");
  rect(p, 11, 17, 2, 1, "gold1");
  rect(p, 3, 3, 10, 8, "ink");
  if (dir === "up") {
    rect(p, 4, 4, 8, 6, "coral3");
    rect(p, 4, 4, 8, 2, "coral2");
    rect(p, 5, 10, 6, 1, "gold4");
  } else {
    rect(p, 4, 6, 8, 4, "paperSoft");
    rect(p, 4, 6, 2, 4, "gold1");
    if (dir === "down") {
      rect(p, 5, 7, 2, blink ? 1 : 2, "ink");
      rect(p, 9, 7, 2, blink ? 1 : 2, "ink");
    } else if (dir === "left") {
      rect(p, 4, 7, 2, blink ? 1 : 2, "ink");
      rect(p, 3, 8, 1, 1, "paperSoft");
    } else {
      rect(p, 10, 7, 2, blink ? 1 : 2, "ink");
      rect(p, 12, 8, 1, 1, "paperSoft");
    }
    rect(p, 3, 2, 10, 4, "coral3");
    rect(p, 4, 2, 8, 2, "coral2");
    rect(p, 3, 5, 10, 1, "coral4");
    rect(p, dir === "left" ? 1 : 5, 5, dir === "down" ? 8 : 6, 1, "coral2");
    rect(p, 7, 3, 2, 1, "gold2");
  }
}

function paintSlime(p, frame) {
  const squish = frame ? 1 : 0;
  ellipse(p, 8, 10 + squish, 7, 5 - squish, "ink");
  ellipse(p, 8, 9 + squish, 6, 4 - squish, "inkSoft");
  rect(p, 4, 7 + squish, 3, 2, "sea3");
  rect(p, 5, 9 + squish, 2, 2, "coral1");
  rect(p, 10, 9 + squish, 2, 2, "coral1");
  rect(p, 7, 13, 3, 1, "sea4");
}

export function paintPostmaster(p) {
  rect(p, 0, 0, 32, 32, "sea4");
  ellipse(p, 16, 18, 12, 12, "ink");
  ellipse(p, 16, 17, 11, 11, "gold3");
  ellipse(p, 13, 14, 6, 6, "gold2");
  rect(p, 6, 8, 20, 5, "coral3");
  rect(p, 8, 6, 16, 3, "coral2");
  rect(p, 4, 12, 24, 2, "coral4");
  box(p, 7, 16, 8, 7, "paper");
  box(p, 17, 16, 8, 7, "paper");
  rect(p, 10, 18, 3, 3, "ink");
  rect(p, 20, 18, 3, 3, "ink");
  rect(p, 14, 18, 4, 1, "ink");
  rect(p, 14, 23, 4, 3, "gold1");
  rect(p, 15, 26, 2, 1, "gold4");
  rect(p, 8, 27, 16, 3, "sea3");
  rect(p, 10, 27, 4, 3, "sea2");
}

function buildLayout() {
  const frames = {};
  let x = 0;
  let y = 0;
  let rowHeight = 0;
  const width = 512;
  for (const sprite of sprites) {
    if (x + sprite.w > width) {
      x = 0;
      y += rowHeight + 1;
      rowHeight = 0;
    }
    frames[sprite.name] = { x, y, w: sprite.w, h: sprite.h };
    x += sprite.w + 1;
    rowHeight = Math.max(rowHeight, sprite.h);
  }
  return { frames, width, height: y + rowHeight + 1 };
}

const layout = buildLayout();
export const ATLAS_WIDTH = layout.width;
export const ATLAS_HEIGHT = layout.height;
export const FRAMES = layout.frames;

export function paintAtlas(painter) {
  for (const sprite of sprites) {
    const frame = FRAMES[sprite.name];
    const local = { rect: (x, y, w, h, color) => painter.rect(frame.x + x, frame.y + y, w, h, color) };
    sprite.paint(local);
  }
}