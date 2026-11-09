import {
  TILE, MAP_W, MAP_H, WORLD_W, WORLD_H, WATER, GRASS, PATH, SAND,
  CHAPTERS, DIFFICULTIES, MAIL_NAMES, UPGRADES,
  createRun, beginRun, placePlayer, carriedLetters, deliveredCount,
  collectNearby, tryDeliver, currentTarget, portalReady, damageRun,
  completeChapter, applyUpgrade, moveSpeed, dashCooldownMax, isBlocked,
  formatTime,
} from "./core.js";
import { ATLAS_WIDTH, ATLAS_HEIGHT, FRAMES, PALETTE } from "./art.js";
import { AudioEngine } from "./audio.js";
import { loadProgress, saveProgress, recordRun } from "./storage.js";

const $ = (id) => document.getElementById(id);
const canvas = $("game");
const ctx = canvas.getContext("2d");
const wrap = $("canvas-wrap");
const storage = (() => { try { return window.localStorage; } catch { return null; } })();
const progress = loadProgress(storage);
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let reducedMotion = progress.reducedMotion || motionQuery.matches;
let run = createRun(progress.difficulty);
let visualTime = 0;
let last = performance.now();
let uiAccumulator = 0;
let toastTimer = 0;
let helpWasPlaying = false;
const input = { up: false, down: false, left: false, right: false };
const audio = new AudioEngine();
audio.enabled = progress.sound;

const atlas = new Image();
atlas.src = "sprites/world-atlas.png";
atlas.decoding = "async";

const ui = {
  hearts: $("hearts"), mail: $("mail-count"), score: $("score"), chapter: $("chapter-count"),
  routeState: $("route-state"), routeName: $("route-name"), routeProgress: $("route-progress"),
  deliveryList: $("delivery-list"), compass: $("compass-hint"), totalDelivered: $("total-delivered"),
  elapsed: $("elapsed"), dash: $("dash-state"), chips: $("upgrade-chips"), best: $("best-score"),
  wins: $("wins"), difficulty: $("difficulty"), difficultyHint: $("difficulty-hint"),
  intro: $("intro-card"), toast: $("toast"), announcer: $("announcer"), note: $("postmaster-note"),
  pauseButton: $("pause-button"), soundButton: $("sound-button"), soundLabel: $("sound-label"),
  motionButton: $("motion-button"), windowTitle: $("window-title"),
};

const dialogs = {
  help: $("help-dialog"),
  pause: $("pause-dialog"),
  upgrade: $("upgrade-dialog"),
  result: $("result-dialog"),
};

function heartSvg(full) {
  const fill = full ? PALETTE.coral2 : PALETTE.paperSoft;
  return `<svg class="heart" viewBox="0 0 8 8" aria-hidden="true" shape-rendering="crispEdges"><path fill="${PALETTE.ink}" d="M1 0h2v1h2V0h2v1h1v3h-1v1h-1v1h-1v1h-1v1H4V7H3V6H2V5H1V4H0V1h1z"/><path fill="${fill}" d="M1 1h2v1h2V1h2v3H6v1H5v1H4v1H3V6H2V5H1V4H0V2h1z"/></svg>`;
}

function announce(text) {
  ui.announcer.textContent = text;
}

function toast(text, announceToo = true) {
  ui.toast.textContent = text;
  ui.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { ui.toast.hidden = true; }, 2200);
  if (announceToo) announce(text);
}

function stateLabel() {
  return { ready: "待出发", playing: "投递中", paused: "已暂停", upgrade: "选择护符", won: "已送达", lost: "灯熄了" }[run.state];
}

function syncSettings() {
  ui.soundButton.setAttribute("aria-pressed", String(progress.sound));
  ui.soundLabel.textContent = progress.sound ? "声音 开" : "声音 关";
  $("sound-waves").style.display = progress.sound ? "" : "none";
  ui.motionButton.setAttribute("aria-pressed", String(!reducedMotion));
  ui.motionButton.textContent = reducedMotion ? "动效 关" : "动效 开";
  ui.difficulty.value = run.state === "ready" ? progress.difficulty : run.difficulty;
  const adjustable = ["ready", "won", "lost"].includes(run.state);
  ui.difficulty.disabled = !adjustable;
  ui.difficultyHint.textContent = adjustable ? "新一局开始前可调整。" : "本局进行中，结束后可调整。";
}

function syncHud() {
  ui.hearts.innerHTML = Array.from({ length: run.maxHearts }, (_, i) => heartSvg(i < run.hearts)).join("");
  ui.hearts.parentElement.setAttribute("aria-label", `生命值 ${run.hearts}/${run.maxHearts}`);
  ui.mail.textContent = `${deliveredCount(run)}/3`;
  ui.score.textContent = String(run.score).padStart(4, "0");
  ui.chapter.textContent = `${run.chapterIndex + 1}/3`;
  ui.best.textContent = String(progress.bestScore).padStart(4, "0");
  ui.wins.textContent = `${progress.wins} 次`;
  ui.routeState.textContent = stateLabel();
  ui.routeName.textContent = CHAPTERS[run.chapterIndex].name;
  ui.windowTitle.textContent = `── ${CHAPTERS[run.chapterIndex].name} · 投递终端 ──`;
  ui.routeProgress.value = deliveredCount(run);
  ui.totalDelivered.textContent = `${run.totalDelivered} 封`;
  ui.note.textContent = CHAPTERS[run.chapterIndex].note;
  ui.intro.hidden = run.state !== "ready";
  ui.pauseButton.disabled = !["playing", "paused"].includes(run.state);
  ui.pauseButton.textContent = run.state === "paused" ? "继续" : "暂停";

  ui.deliveryList.replaceChildren();
  run.chapter.letters.forEach((letter) => {
    const li = document.createElement("li");
    li.className = letter.delivered ? "is-done" : letter.collected ? "is-carried" : "";
    const dot = document.createElement("span");
    dot.className = "mail-dot";
    dot.style.background = PALETTE[`${letter.color}2`];
    const name = document.createElement("span");
    name.textContent = MAIL_NAMES[letter.color];
    const status = document.createElement("span");
    status.className = "delivery-status";
    status.textContent = letter.delivered ? "已送达" : letter.collected ? "在背包" : "待寻找";
    li.append(dot, name, status);
    ui.deliveryList.append(li);
  });

  ui.chips.replaceChildren();
  if (run.upgrades.length === 0) {
    const hint = document.createElement("span");
    hint.className = "hint";
    hint.textContent = "还没有护符";
    ui.chips.append(hint);
  } else {
    for (const id of run.upgrades) {
      const upgrade = UPGRADES.find((item) => item.id === id);
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = upgrade.name;
      ui.chips.append(chip);
    }
  }
  syncSettings();
  syncLive();
}

function syncLive() {
  ui.elapsed.textContent = formatTime(run.elapsed);
  ui.dash.textContent = run.player.dashCooldown > 0 ? `${run.player.dashCooldown.toFixed(1)}s` : "就绪";
  if (run.state === "ready") {
    ui.compass.textContent = "按下「开始投递」，萤石会指向最近的信。";
    return;
  }
  const target = currentTarget(run);
  const meters = Math.max(1, Math.round(target.distance / TILE));
  if (target.kind === "letter") ui.compass.textContent = `萤石指向一封待取的信 · 约 ${meters} 格`;
  else if (target.kind === "box") ui.compass.textContent = `把${MAIL_NAMES[target.color]}的信送到同色邮箱 · 约 ${meters} 格`;
  else ui.compass.textContent = portalReady(run) ? `邮路门已亮，走进去前往下一站 · 约 ${meters} 格` : "先把三封信都送达。";
}

function closeAllDialogs() {
  for (const dialog of Object.values(dialogs)) if (dialog.open) dialog.close();
}

function startGame() {
  closeAllDialogs();
  const difficulty = ui.difficulty.value || progress.difficulty;
  progress.difficulty = DIFFICULTIES[difficulty] ? difficulty : "normal";
  saveProgress(storage, progress);
  run = beginRun(progress.difficulty);
  audio.unlock();
  audio.effect("ui");
  syncHud();
  toast(`${CHAPTERS[0].name}：找回三封信。`);
  canvas.focus();
}

function pauseGame() {
  if (run.state !== "playing") return;
  run.state = "paused";
  syncHud();
  dialogs.pause.showModal();
}

function resumeGame() {
  if (dialogs.pause.open) dialogs.pause.close();
  if (run.state !== "paused") return;
  run.state = "playing";
  syncHud();
  canvas.focus();
}

function finishRun() {
  Object.assign(progress, recordRun(progress, run));
  saveProgress(storage, progress);
  syncHud();
  $("result-title").textContent = run.state === "won" ? "今夜，全部送达" : "灯芯熄灭了";
  $("result-copy").textContent = run.state === "won"
    ? "三座岛重新亮起。每一扇窗都收到了晚安。"
    : "迷雾暂时盖住了路。休息一下，再送一夜。";
  $("result-score").textContent = run.score;
  $("result-mail").textContent = run.totalDelivered;
  $("result-time").textContent = formatTime(run.elapsed);
  $("result-best").textContent = `历史最佳邮票：${progress.bestScore}`;
  audio.effect(run.state === "won" ? "win" : "lose");
  announce($("result-title").textContent);
  dialogs.result.showModal();
}

function openUpgrade() {
  const options = $("upgrade-options");
  options.replaceChildren();
  for (const upgrade of UPGRADES) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button upgrade-option";
    const strong = document.createElement("strong");
    strong.textContent = upgrade.name;
    const span = document.createElement("span");
    span.textContent = upgrade.desc;
    button.append(strong, span);
    button.addEventListener("click", () => {
      applyUpgrade(run, upgrade.id);
      dialogs.upgrade.close();
      audio.effect("portal");
      syncHud();
      toast(`获得${upgrade.name}。抵达${CHAPTERS[run.chapterIndex].name}。`);
      canvas.focus();
    });
    options.append(button);
  }
  dialogs.upgrade.showModal();
}

function enterPortal() {
  if (!portalReady(run) || run.state !== "playing") return;
  audio.effect("portal");
  const result = completeChapter(run);
  syncHud();
  if (result.finished) finishRun();
  else openUpgrade();
}

function interact() {
  if (run.state !== "playing") return;
  const letter = tryDeliver(run);
  if (letter) {
    audio.effect("deliver");
    burst(run.player.x, run.player.y - 8, PALETTE[`${letter.color}1`], 14);
    toast(`${MAIL_NAMES[letter.color]}收到了信。`);
    syncHud();
    if (portalReady(run)) toast("三封信都送达了，邮路门已亮起。");
    return;
  }
  const portal = run.chapter.portal;
  const px = portal.x * TILE + 8;
  const py = portal.y * TILE + 8;
  if (portalReady(run) && Math.hypot(run.player.x - px, run.player.y - py) <= 28) {
    enterPortal();
    return;
  }
  toast(carriedLetters(run).length > 0 ? "靠近同色邮箱再投递。" : "先去找发光的信。", false);
}

function dash() {
  if (run.state !== "playing" || run.player.dashCooldown > 0) return;
  run.player.dashTime = 0.18;
  run.player.dashCooldown = dashCooldownMax(run);
  run.player.invuln = Math.max(run.player.invuln, 0.24);
  audio.effect("dash");
  burst(run.player.x, run.player.y + 4, PALETTE.sea1, 8);
}

function burst(x, y, color, count) {
  if (reducedMotion) return;
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 24 + (i % 4) * 10;
    run.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 12, life: 0.5 + (i % 3) * 0.1, color });
  }
}

function movePlayer(dt) {
  const player = run.player;
  let dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let dy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  const length = Math.hypot(dx, dy);
  player.moving = length > 0;
  if (length > 0) {
    dx /= length;
    dy /= length;
    player.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
  }
  if (player.dashTime > 0 && length === 0) {
    dx = { left: -1, right: 1, up: 0, down: 0 }[player.dir];
    dy = { up: -1, down: 1, left: 0, right: 0 }[player.dir];
  }
  const speed = player.dashTime > 0 ? 210 : moveSpeed(run);
  const nx = player.x + dx * speed * dt;
  const ny = player.y + dy * speed * dt;
  if (!isBlocked(run.chapter, nx, player.y)) player.x = nx;
  if (!isBlocked(run.chapter, player.x, ny)) player.y = ny;
}

function updateEnemies(dt) {
  const scale = DIFFICULTIES[run.difficulty].enemySpeed;
  for (const enemy of run.chapter.enemies) {
    enemy.phase += dt * enemy.speed * scale;
    enemy.x = enemy.cx + Math.cos(enemy.phase) * enemy.radius;
    enemy.y = enemy.cy + Math.sin(enemy.phase * 0.8) * enemy.radius * 0.6;
    if (Math.hypot(run.player.x - enemy.x, run.player.y - enemy.y) < 12) {
      if (damageRun(run)) {
        audio.effect("hurt");
        burst(run.player.x, run.player.y, PALETTE.coral2, 10);
        toast("迷雾碰到灯芯了。", false);
        announce(`灯芯剩余 ${run.hearts}`);
        const angle = Math.atan2(run.player.y - enemy.y, run.player.x - enemy.x);
        const kx = run.player.x + Math.cos(angle) * 10;
        const ky = run.player.y + Math.sin(angle) * 10;
        if (!isBlocked(run.chapter, kx, ky)) { run.player.x = kx; run.player.y = ky; }
        syncHud();
        if (run.state === "lost") { finishRun(); return; }
      }
    }
  }
}

function update(dt) {
  run.elapsed += dt;
  const player = run.player;
  player.dashTime = Math.max(0, player.dashTime - dt);
  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  player.invuln = Math.max(0, player.invuln - dt);
  run.shake = Math.max(0, run.shake - dt);
  movePlayer(dt);
  updateEnemies(dt);
  if (run.state !== "playing") return;

  const picked = collectNearby(run);
  for (const letter of picked) {
    audio.effect("pickup");
    burst(letter.x * TILE + 8, letter.y * TILE + 8, PALETTE.gold1, 10);
    toast(`拾到了寄给${MAIL_NAMES[letter.color]}的信。`);
    syncHud();
  }

  const portal = run.chapter.portal;
  if (portalReady(run) && Math.hypot(player.x - (portal.x * TILE + 8), player.y - (portal.y * TILE + 8)) <= 14) {
    enterPortal();
    return;
  }

  for (let i = run.particles.length - 1; i >= 0; i -= 1) {
    const particle = run.particles[i];
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 40 * dt;
    if (particle.life <= 0) run.particles.splice(i, 1);
  }
  audio.music(run.elapsed, run.state === "playing");
}

function frameName(name) {
  return FRAMES[name];
}

function drawSprite(name, x, y, flip = false) {
  const frame = frameName(name);
  if (!frame) return;
  const dx = Math.round(x);
  const dy = Math.round(y);
  if (flip) {
    ctx.save();
    ctx.translate(dx + frame.w, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(atlas, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);
    ctx.restore();
  } else {
    ctx.drawImage(atlas, frame.x, frame.y, frame.w, frame.h, dx, dy, frame.w, frame.h);
  }
}

function pixelRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function render() {
  if (!ctx) return;
  const viewW = canvas.width;
  const viewH = canvas.height;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = PALETTE.sea4;
  ctx.fillRect(0, 0, viewW, viewH);
  if (!atlas.complete || atlas.naturalWidth === 0) return;

  const player = run.player;
  const camX = Math.max(0, Math.min(WORLD_W - viewW, Math.round(player.x - viewW / 2)));
  const camY = Math.max(0, Math.min(WORLD_H - viewH, Math.round(player.y - viewH / 2)));
  const shakeX = run.shake > 0 && !reducedMotion ? Math.round(Math.sin(visualTime * 70) * 2) : 0;
  const shakeY = run.shake > 0 && !reducedMotion ? Math.round(Math.cos(visualTime * 63) * 2) : 0;
  ctx.save();
  ctx.translate(-camX + shakeX, -camY + shakeY);

  const waterFrame = reducedMotion ? 0 : Math.floor(visualTime * 4) % 3;
  const x0 = Math.max(0, Math.floor(camX / TILE) - 1);
  const y0 = Math.max(0, Math.floor(camY / TILE) - 1);
  const x1 = Math.min(MAP_W - 1, Math.ceil((camX + viewW) / TILE) + 1);
  const y1 = Math.min(MAP_H - 1, Math.ceil((camY + viewH) / TILE) + 1);
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const tile = run.chapter.tiles[y][x];
      const variant = (x * 7 + y * 13) % 3;
      let name = `water${waterFrame}`;
      if (tile === GRASS) name = `grass${variant}`;
      else if (tile === PATH) name = `path${variant}`;
      else if (tile === SAND) name = `sand${variant % 2}`;
      drawSprite(name, x * TILE, y * TILE);
      if (tile === WATER && (x * 11 + y * 7) % 29 === 0) drawSprite("lily", x * TILE, y * TILE);
    }
  }

  for (const item of run.chapter.decor) {
    if (item.kind === "fence" || item.kind === "lamp") continue;
    drawSprite(item.kind, item.x * TILE, item.y * TILE);
  }

  const drawables = [];
  for (const tree of run.chapter.trees) {
    if (tree.variant === 2) drawables.push({ y: tree.y * TILE + 16, draw: () => drawSprite("lighthouse", tree.x * TILE + 8 - 16, tree.y * TILE + 16 - 64) });
    else drawables.push({ y: tree.y * TILE + 16, draw: () => drawSprite(`tree${tree.variant}`, tree.x * TILE + 8 - 16, tree.y * TILE + 16 - 40) });
  }
  for (const house of run.chapter.houses) {
    drawables.push({ y: house.y * TILE + 32, draw: () => drawSprite(`house${house.color[0].toUpperCase()}${house.color.slice(1)}`, house.x * TILE, house.y * TILE - 8) });
  }
  for (const item of run.chapter.decor) {
    if (item.kind === "fence") drawables.push({ y: item.y * TILE + 16, draw: () => drawSprite("fence", item.x * TILE, item.y * TILE) });
    if (item.kind === "lamp") drawables.push({ y: item.y * TILE + 16, draw: () => drawSprite("lamp", item.x * TILE, item.y * TILE - 16) });
  }
  for (const box of run.chapter.boxes) {
    const hasMail = carriedLetters(run).some((letter) => letter.color === box.color);
    drawables.push({
      y: box.y * TILE + 16,
      draw: () => {
        drawSprite(`mailbox${box.color[0].toUpperCase()}${box.color.slice(1)}`, box.x * TILE, box.y * TILE - 4);
        if (hasMail) pixelRect(box.x * TILE + 6, box.y * TILE - 12, 4, 4, PALETTE.gold1);
      },
    });
  }
  run.chapter.letters.forEach((letter, i) => {
    if (letter.collected) return;
    const bob = reducedMotion ? 0 : Math.round(Math.sin(visualTime * 3 + i) * 2);
    drawables.push({ y: letter.y * TILE + 16, draw: () => {
      pixelRect(letter.x * TILE + 4, letter.y * TILE + 13, 8, 2, PALETTE.leaf4);
      drawSprite(`letter${letter.color[0].toUpperCase()}${letter.color.slice(1)}`, letter.x * TILE, letter.y * TILE + bob);
    } });
  });
  const portal = run.chapter.portal;
  const active = portalReady(run);
  const portalFrame = active && !reducedMotion ? Math.floor(visualTime * 4) % 2 : active ? 1 : 0;
  drawables.push({ y: portal.y * TILE + 16, draw: () => drawSprite(`portal${portalFrame}`, portal.x * TILE + 8 - 12, portal.y * TILE + 16 - 32) });
  for (const enemy of run.chapter.enemies) {
    const slimeFrame = reducedMotion ? 0 : Math.floor(visualTime * 4) % 2;
    drawables.push({ y: enemy.y + 6, draw: () => {
      pixelRect(enemy.x - 5, enemy.y + 6, 10, 2, PALETTE.leaf4);
      drawSprite(`slime${slimeFrame}`, enemy.x - 8, enemy.y - 10);
    } });
  }
  drawables.push({
    y: player.y + 8,
    draw: () => {
      pixelRect(player.x - 5, player.y + 6, 10, 2, PALETTE.leaf4);
      const blinkHidden = player.invuln > 0 && !reducedMotion && Math.floor(visualTime * 4) % 2 === 0;
      if (blinkHidden) return;
      let name;
      if (!player.moving && player.dashTime <= 0) name = `playerIdle${reducedMotion ? 0 : Math.floor(visualTime * 1.5) % 2}`;
      else name = `player${player.dir[0].toUpperCase()}${player.dir.slice(1)}${reducedMotion ? 0 : Math.floor(visualTime * 8) % 2}`;
      drawSprite(name, player.x - 8, player.y - 18);
    },
  });
  drawables.sort((a, b) => a.y - b.y);
  for (const drawable of drawables) drawable.draw();

  const target = currentTarget(run);
  if (run.state !== "ready" && target) {
    const bob = reducedMotion ? 0 : Math.floor(visualTime * 3) % 2;
    pixelRect(target.x - 1, target.y - 28 - bob, 2, 6, PALETTE.gold2);
    pixelRect(target.x - 3, target.y - 24 - bob, 6, 2, PALETTE.gold2);
    pixelRect(target.x - 1, target.y - 22 - bob, 2, 2, PALETTE.gold1);
  }

  for (const particle of run.particles) pixelRect(particle.x, particle.y, 2, 2, particle.color);

  if (!reducedMotion) {
    for (let i = 0; i < 26; i += 1) {
      const fx = ((i * 137 + Math.floor(visualTime * 6) * (i % 3 + 1)) % WORLD_W);
      const fy = ((i * 89 + Math.floor(visualTime * 4)) % WORLD_H);
      if (Math.floor(visualTime * 2 + i) % 3 !== 0) pixelRect(fx, fy, 1, 1, PALETTE.gold1);
    }
  }
  ctx.restore();

  if (target && run.state !== "ready") {
    const sx = target.x - camX;
    const sy = target.y - camY;
    if (sx < 8 || sy < 8 || sx > viewW - 8 || sy > viewH - 8) {
      const cx = Math.max(10, Math.min(viewW - 10, sx));
      const cy = Math.max(10, Math.min(viewH - 10, sy));
      const angle = Math.atan2(sy - cy, sx - cx);
      const dx = Math.round(Math.cos(angle));
      const dy = Math.round(Math.sin(angle));
      pixelRect(cx - 3, cy - 3, 6, 6, PALETTE.ink);
      pixelRect(cx - 2 + dx * 3, cy - 2 + dy * 3, 4, 4, PALETTE.gold2);
      pixelRect(cx - 1, cy - 1, 2, 2, PALETTE.gold1);
    }
  }
}

function resize() {
  if (!ctx) return;
  const rect = wrap.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width / 2));
  const height = Math.max(1, Math.floor(rect.height / 2));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width * 2}px`;
    canvas.style.height = `${height * 2}px`;
    ctx.imageSmoothingEnabled = false;
  }
}

function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!reducedMotion && run.state !== "paused") visualTime += dt;
  if (run.state === "playing") update(dt);
  uiAccumulator += dt;
  if (uiAccumulator >= 0.2) {
    uiAccumulator = 0;
    syncLive();
  }
  render();
  requestAnimationFrame(loop);
}

function setDirection(dir, value) {
  input[dir] = value;
}

function anyDialogOpen() {
  return Object.values(dialogs).some((dialog) => dialog.open);
}

window.addEventListener("keydown", (event) => {
  if (event.target instanceof HTMLElement && event.target.matches("select, input, textarea")) return;
  if (anyDialogOpen()) return;
  const key = event.key.toLowerCase();
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) event.preventDefault();
  if (key === "w" || key === "arrowup") setDirection("up", true);
  if (key === "s" || key === "arrowdown") setDirection("down", true);
  if (key === "a" || key === "arrowleft") setDirection("left", true);
  if (key === "d" || key === "arrowright") setDirection("right", true);
  if (key === "shift" && !event.repeat) dash();
  if ((key === "e" || key === " ") && !event.repeat) interact();
  if (key === "p" && !event.repeat) run.state === "playing" ? pauseGame() : resumeGame();
  if (key === "escape" && run.state === "playing") pauseGame();
  if (key === "enter" && run.state === "ready") startGame();
});

window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  if (key === "w" || key === "arrowup") setDirection("up", false);
  if (key === "s" || key === "arrowdown") setDirection("down", false);
  if (key === "a" || key === "arrowleft") setDirection("left", false);
  if (key === "d" || key === "arrowright") setDirection("right", false);
});

window.addEventListener("blur", () => { if (run.state === "playing" && !anyDialogOpen()) pauseGame(); });
document.addEventListener("visibilitychange", () => { if (document.hidden && run.state === "playing" && !anyDialogOpen()) pauseGame(); });
motionQuery.addEventListener("change", (event) => {
  reducedMotion = event.matches || progress.reducedMotion;
  syncSettings();
});

$("start-button").addEventListener("click", startGame);
$("restart-button").addEventListener("click", startGame);
$("pause-restart").addEventListener("click", startGame);
$("result-restart").addEventListener("click", startGame);
ui.pauseButton.addEventListener("click", () => run.state === "paused" ? resumeGame() : pauseGame());
$("resume-button").addEventListener("click", resumeGame);
dialogs.pause.addEventListener("close", () => { if (run.state === "paused") resumeGame(); });
dialogs.pause.addEventListener("cancel", (event) => { event.preventDefault(); resumeGame(); });
dialogs.upgrade.addEventListener("cancel", (event) => event.preventDefault());
dialogs.result.addEventListener("cancel", (event) => event.preventDefault());

$("help-button").addEventListener("click", () => {
  helpWasPlaying = run.state === "playing";
  if (helpWasPlaying) run.state = "paused";
  dialogs.help.showModal();
});
$("help-close").addEventListener("click", () => dialogs.help.close());
dialogs.help.addEventListener("close", () => {
  if (helpWasPlaying && run.state === "paused") {
    run.state = "playing";
    syncHud();
    canvas.focus();
  }
  helpWasPlaying = false;
});

ui.soundButton.addEventListener("click", () => {
  progress.sound = !progress.sound;
  audio.setEnabled(progress.sound);
  saveProgress(storage, progress);
  syncSettings();
  if (progress.sound) audio.effect("ui");
});

ui.motionButton.addEventListener("click", () => {
  reducedMotion = !reducedMotion;
  progress.reducedMotion = reducedMotion;
  saveProgress(storage, progress);
  syncSettings();
});

ui.difficulty.addEventListener("change", () => {
  progress.difficulty = ui.difficulty.value;
  saveProgress(storage, progress);
  if (run.state === "ready") {
    run = createRun(progress.difficulty);
    placePlayer(run);
    run.state = "ready";
    syncHud();
  }
});

for (const button of document.querySelectorAll(".dpad button")) {
  const dir = button.dataset.dir;
  const press = (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    setDirection(dir, true);
  };
  const release = () => setDirection(dir, false);
  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
}
$("touch-dash").addEventListener("click", dash);
$("touch-action").addEventListener("click", interact);
canvas.addEventListener("pointerdown", () => canvas.focus());
for (const el of [canvas, ...document.querySelectorAll(".dpad button, .touch-actions button")]) {
  el.addEventListener("contextmenu", (event) => event.preventDefault());
}

if ("IntersectionObserver" in window) {
  new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.intersectionRatio < 0.1 && run.state === "playing" && !anyDialogOpen()) pauseGame();
    }
  }, { threshold: [0, 0.1] }).observe(wrap);
}

new ResizeObserver(resize).observe(wrap);
resize();
placePlayer(run);
run.state = "ready";
syncHud();
requestAnimationFrame(loop);