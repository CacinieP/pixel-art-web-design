export const TILE = 16;
export const MAP_W = 40;
export const MAP_H = 28;
export const WORLD_W = MAP_W * TILE;
export const WORLD_H = MAP_H * TILE;

export const WATER = 0;
export const GRASS = 1;
export const PATH = 2;
export const SAND = 3;

export const MAIL_COLORS = ["coral", "gold", "leaf"];
export const MAIL_NAMES = { coral: "珊瑚窗", gold: "琥珀窗", leaf: "苔叶窗" };

export const DIFFICULTIES = {
  cozy: { label: "悠闲", hearts: 5, enemySpeed: 0.72, scoreScale: 0.8 },
  normal: { label: "标准", hearts: 3, enemySpeed: 1, scoreScale: 1 },
  brave: { label: "勇敢", hearts: 2, enemySpeed: 1.28, scoreScale: 1.35 },
};

export const CHAPTERS = [
  { name: "苔光庭院", note: "第一夜，风很轻。先学会听萤石说话。", enemies: 2 },
  { name: "潮汐码头", note: "潮水涨了，迷雾团也醒了。冲刺留到关键时刻。", enemies: 3 },
  { name: "星落灯塔", note: "最后一座岛。把光送到最高的窗。", enemies: 4 },
];

export const UPGRADES = [
  { id: "boots", name: "轻羽靴", desc: "移动速度 +18%", icon: "boot" },
  { id: "lantern", name: "琥珀灯", desc: "灯芯上限 +1，并恢复 1 点", icon: "lamp" },
  { id: "charm", name: "萤石坠", desc: "拾取范围 +10，冲刺恢复更快", icon: "charm" },
];

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const key = (x, y) => `${x},${y}`;

export function createChapter(index) {
  const rand = mulberry32(1234 + index * 999);
  const tiles = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(WATER));
  for (let y = 0; y < MAP_H; y += 1) {
    for (let x = 0; x < MAP_W; x += 1) {
      const dx = (x - 19.5) / 18.2;
      const dy = (y - 13.5) / 12.2;
      const d = dx * dx + dy * dy;
      if (d <= 1) tiles[y][x] = d > 0.84 ? SAND : GRASS;
    }
  }

  const carve = (x0, y0, x1, y1) => {
    let x = x0;
    let y = y0;
    while (x !== x1 || y !== y1) {
      if (tiles[y]?.[x] !== WATER && tiles[y]?.[x] !== undefined) tiles[y][x] = PATH;
      if (x !== x1) x += Math.sign(x1 - x);
      else if (y !== y1) y += Math.sign(y1 - y);
    }
    if (tiles[y]?.[x] !== WATER && tiles[y]?.[x] !== undefined) tiles[y][x] = PATH;
  };

  carve(5, 14, 35, 14);
  carve(20, 5, 20, 23);

  const houses = [
    { x: 7, y: 6, color: "coral" },
    { x: 27, y: 6, color: "gold" },
    { x: 8, y: 19, color: "leaf" },
  ];
  const boxes = houses.map((house) => ({ x: house.x + 2, y: house.y + 3, color: house.color }));
  for (const box of boxes) carve(20, 14, box.x, box.y);

  const letterSets = [
    [{ x: 5, y: 13 }, { x: 21, y: 5 }, { x: 32, y: 19 }],
    [{ x: 6, y: 17 }, { x: 24, y: 6 }, { x: 33, y: 12 }],
    [{ x: 7, y: 11 }, { x: 18, y: 22 }, { x: 31, y: 17 }],
  ];
  const letters = letterSets[index].map((pos, i) => ({ ...pos, color: MAIL_COLORS[i], collected: false, delivered: false }));
  const spawn = { x: 20, y: 18 };
  const portal = { x: 35, y: 14 };

  const protectedTiles = new Set();
  const protect = (x, y, r = 1) => {
    for (let dy = -r; dy <= r; dy += 1) for (let dx = -r; dx <= r; dx += 1) protectedTiles.add(key(x + dx, y + dy));
  };
  for (let y = 0; y < MAP_H; y += 1) for (let x = 0; x < MAP_W; x += 1) if (tiles[y][x] === PATH) protect(x, y, 1);
  for (const house of houses) for (let dy = -1; dy <= 3; dy += 1) for (let dx = -1; dx <= 4; dx += 1) protectedTiles.add(key(house.x + dx, house.y + dy));
  for (const point of [...letters, ...boxes, spawn, portal]) protect(point.x, point.y, 2);

  const solid = new Set();
  for (const house of houses) for (let dy = 0; dy < 2; dy += 1) for (let dx = 0; dx < 3; dx += 1) solid.add(key(house.x + dx, house.y + dy));

  const decor = [];
  const trees = [];
  for (let y = 1; y < MAP_H - 1; y += 1) {
    for (let x = 1; x < MAP_W - 1; x += 1) {
      if (tiles[y][x] !== GRASS || protectedTiles.has(key(x, y))) continue;
      const roll = rand();
      if (roll < 0.1) {
        trees.push({ x, y, variant: rand() < 0.5 ? 0 : 1 });
        solid.add(key(x, y));
      } else if (roll < 0.2) {
        const kinds = ["flowerCoral", "flowerGold", "flowerSea", "mushroom", "tuft", "rock"];
        decor.push({ x, y, kind: kinds[Math.floor(rand() * kinds.length)] });
      }
    }
  }
  for (let x = 12; x <= 16; x += 2) decor.push({ x, y: 12, kind: "fence" });
  decor.push({ x: 18, y: 16, kind: "lamp" }, { x: 23, y: 12, kind: "lamp" });
  if (index === 2) {
    trees.push({ x: 20, y: 3, variant: 2 });
    solid.add(key(20, 3));
    solid.add(key(21, 3));
  }

  const enemySpawns = [
    [{ x: 14, y: 10 }, { x: 27, y: 18 }],
    [{ x: 13, y: 9 }, { x: 28, y: 18 }, { x: 24, y: 21 }],
    [{ x: 12, y: 10 }, { x: 28, y: 9 }, { x: 26, y: 20 }, { x: 16, y: 21 }],
  ][index];
  const enemies = enemySpawns.map((pos, i) => ({
    cx: pos.x * TILE + 8,
    cy: pos.y * TILE + 8,
    x: pos.x * TILE + 8,
    y: pos.y * TILE + 8,
    radius: (2 + (i % 2)) * TILE,
    phase: rand() * Math.PI * 2,
    speed: 0.7 + rand() * 0.4,
  }));

  return { index, tiles, houses, boxes, letters, spawn, portal, trees, decor, solid, enemies };
}

export function tileAt(chapter, px, py) {
  const x = Math.floor(px / TILE);
  const y = Math.floor(py / TILE);
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return WATER;
  return chapter.tiles[y][x];
}

export function isBlocked(chapter, px, py, radius = 5) {
  for (const [ox, oy] of [[-radius, -radius], [radius, -radius], [-radius, radius], [radius, radius]]) {
    const x = Math.floor((px + ox) / TILE);
    const y = Math.floor((py + oy) / TILE);
    if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return true;
    if (chapter.tiles[y][x] === WATER) return true;
    if (chapter.solid.has(key(x, y))) return true;
  }
  return false;
}

export function createRun(difficulty = "normal") {
  const config = DIFFICULTIES[difficulty] ?? DIFFICULTIES.normal;
  return {
    state: "ready",
    difficulty: DIFFICULTIES[difficulty] ? difficulty : "normal",
    chapterIndex: 0,
    chapter: createChapter(0),
    hearts: config.hearts,
    maxHearts: config.hearts,
    score: 0,
    totalDelivered: 0,
    elapsed: 0,
    upgrades: [],
    player: { x: 0, y: 0, dir: "down", moving: false, dashTime: 0, dashCooldown: 0, invuln: 0 },
    particles: [],
    shake: 0,
  };
}

export function placePlayer(run) {
  run.player.x = run.chapter.spawn.x * TILE + 8;
  run.player.y = run.chapter.spawn.y * TILE + 8;
  run.player.dir = "down";
  run.player.moving = false;
  run.player.dashTime = 0;
  run.player.dashCooldown = 0;
  run.player.invuln = 1;
}

export function beginRun(difficulty = "normal") {
  const run = createRun(difficulty);
  run.state = "playing";
  placePlayer(run);
  return run;
}

export function carriedLetters(run) {
  return run.chapter.letters.filter((letter) => letter.collected && !letter.delivered);
}

export function deliveredCount(run) {
  return run.chapter.letters.filter((letter) => letter.delivered).length;
}

export function pickupRadius(run) {
  return 13 + (run.upgrades.includes("charm") ? 10 : 0);
}

export function moveSpeed(run) {
  return 72 * (run.upgrades.includes("boots") ? 1.18 : 1);
}

export function dashCooldownMax(run) {
  return run.upgrades.includes("charm") ? 1.1 : 1.6;
}

export function collectNearby(run) {
  const picked = [];
  const radius = pickupRadius(run);
  for (const letter of run.chapter.letters) {
    if (letter.collected) continue;
    const lx = letter.x * TILE + 8;
    const ly = letter.y * TILE + 8;
    if (Math.hypot(run.player.x - lx, run.player.y - ly) <= radius) {
      letter.collected = true;
      run.score += Math.round(25 * DIFFICULTIES[run.difficulty].scoreScale);
      picked.push(letter);
    }
  }
  return picked;
}

export function nearestBox(run, color) {
  return run.chapter.boxes.find((box) => box.color === color);
}

export function tryDeliver(run) {
  const carried = carriedLetters(run);
  for (const letter of carried) {
    const box = nearestBox(run, letter.color);
    const bx = box.x * TILE + 8;
    const by = box.y * TILE + 8;
    if (Math.hypot(run.player.x - bx, run.player.y - by) <= 24) {
      letter.delivered = true;
      run.totalDelivered += 1;
      run.score += Math.round(100 * DIFFICULTIES[run.difficulty].scoreScale);
      return letter;
    }
  }
  return null;
}

export function currentTarget(run) {
  const carried = carriedLetters(run);
  if (carried.length > 0) {
    let best = null;
    for (const letter of carried) {
      const box = nearestBox(run, letter.color);
      const point = { x: box.x * TILE + 8, y: box.y * TILE + 8, kind: "box", color: box.color };
      const distance = Math.hypot(run.player.x - point.x, run.player.y - point.y);
      if (!best || distance < best.distance) best = { ...point, distance };
    }
    return best;
  }
  const remaining = run.chapter.letters.filter((letter) => !letter.collected);
  if (remaining.length > 0) {
    let best = null;
    for (const letter of remaining) {
      const point = { x: letter.x * TILE + 8, y: letter.y * TILE + 8, kind: "letter", color: letter.color };
      const distance = Math.hypot(run.player.x - point.x, run.player.y - point.y);
      if (!best || distance < best.distance) best = { ...point, distance };
    }
    return best;
  }
  const portal = run.chapter.portal;
  return { x: portal.x * TILE + 8, y: portal.y * TILE + 8, kind: "portal", distance: Math.hypot(run.player.x - (portal.x * TILE + 8), run.player.y - (portal.y * TILE + 8)) };
}

export function portalReady(run) {
  return deliveredCount(run) === run.chapter.letters.length;
}

export function damageRun(run) {
  if (run.player.invuln > 0 || run.state !== "playing") return false;
  run.hearts -= 1;
  run.player.invuln = 1.6;
  run.shake = 0.25;
  if (run.hearts <= 0) {
    run.hearts = 0;
    run.state = "lost";
  }
  return true;
}

export function completeChapter(run) {
  run.score += Math.round(200 * DIFFICULTIES[run.difficulty].scoreScale);
  if (run.chapterIndex >= CHAPTERS.length - 1) {
    run.score += run.hearts * 50;
    run.state = "won";
    return { finished: true };
  }
  run.state = "upgrade";
  return { finished: false };
}

export function applyUpgrade(run, id) {
  if (!UPGRADES.some((upgrade) => upgrade.id === id)) return false;
  if (!run.upgrades.includes(id)) run.upgrades.push(id);
  if (id === "lantern") {
    run.maxHearts += 1;
    run.hearts = Math.min(run.maxHearts, run.hearts + 1);
  }
  run.chapterIndex += 1;
  run.chapter = createChapter(run.chapterIndex);
  run.hearts = Math.min(run.maxHearts, run.hearts + 1);
  run.state = "playing";
  placePlayer(run);
  return true;
}

export function formatTime(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function reachable(chapter, from, to) {
  const start = key(from.x, from.y);
  const goal = key(to.x, to.y);
  const seen = new Set([start]);
  const queue = [from];
  while (queue.length > 0) {
    const point = queue.shift();
    if (key(point.x, point.y) === goal) return true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const x = point.x + dx;
      const y = point.y + dy;
      const id = key(x, y);
      if (seen.has(id) || x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) continue;
      if (chapter.tiles[y][x] === WATER || chapter.solid.has(id)) continue;
      seen.add(id);
      queue.push({ x, y });
    }
  }
  return false;
}