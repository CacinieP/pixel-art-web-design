import test from "node:test";
import assert from "node:assert/strict";
import {
  createChapter, createRun, beginRun, placePlayer, reachable, collectNearby,
  tryDeliver, carriedLetters, deliveredCount, portalReady, completeChapter,
  applyUpgrade, damageRun, currentTarget, TILE, CHAPTERS,
} from "../src/core.js";
import { loadProgress, saveProgress, recordRun, DEFAULT_PROGRESS } from "../src/storage.js";

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, String(value)),
  };
}

test("every chapter is reachable from spawn to all objectives", () => {
  for (let i = 0; i < CHAPTERS.length; i += 1) {
    const chapter = createChapter(i);
    for (const target of [...chapter.letters, ...chapter.boxes, chapter.portal]) {
      assert.ok(reachable(chapter, chapter.spawn, target), `chapter ${i} cannot reach ${target.x},${target.y}`);
    }
  }
});

test("pickup and delivery advance the chapter objective", () => {
  const run = beginRun("normal");
  const letter = run.chapter.letters[0];
  run.player.x = letter.x * TILE + 8;
  run.player.y = letter.y * TILE + 8;
  const picked = collectNearby(run);
  assert.equal(picked.length, 1);
  assert.equal(carriedLetters(run).length, 1);
  assert.equal(tryDeliver(run), null);
  const box = run.chapter.boxes.find((item) => item.color === letter.color);
  run.player.x = box.x * TILE + 8;
  run.player.y = box.y * TILE + 8;
  assert.equal(tryDeliver(run).color, letter.color);
  assert.equal(deliveredCount(run), 1);
  assert.equal(run.totalDelivered, 1);
  assert.ok(run.score > 0);
});

test("portal opens only after all letters are delivered", () => {
  const run = beginRun();
  assert.equal(portalReady(run), false);
  for (const letter of run.chapter.letters) {
    letter.collected = true;
    letter.delivered = true;
  }
  assert.equal(portalReady(run), true);
  assert.equal(currentTarget(run).kind, "portal");
});

test("chapter completion offers upgrades and final win", () => {
  const run = beginRun();
  assert.deepEqual(completeChapter(run), { finished: false });
  assert.equal(run.state, "upgrade");
  assert.ok(applyUpgrade(run, "lantern"));
  assert.equal(run.chapterIndex, 1);
  assert.equal(run.maxHearts, 4);
  assert.equal(run.state, "playing");
  run.chapterIndex = 2;
  assert.deepEqual(completeChapter(run), { finished: true });
  assert.equal(run.state, "won");
});

test("damage respects invulnerability and produces a loss", () => {
  const run = beginRun("brave");
  run.player.invuln = 0;
  assert.equal(damageRun(run), true);
  assert.equal(run.hearts, 1);
  assert.equal(damageRun(run), false);
  run.player.invuln = 0;
  assert.equal(damageRun(run), true);
  assert.equal(run.state, "lost");
});

test("progress storage validates malformed data and records runs", () => {
  const storage = memoryStorage();
  assert.deepEqual(loadProgress(storage), DEFAULT_PROGRESS);
  storage.setItem("lantern-post-v1", "{bad json");
  assert.deepEqual(loadProgress(storage), DEFAULT_PROGRESS);
  storage.setItem("lantern-post-v1", JSON.stringify({ bestScore: -5, difficulty: "wild", sound: "yes" }));
  const loaded = loadProgress(storage);
  assert.equal(loaded.bestScore, 0);
  assert.equal(loaded.difficulty, "normal");
  assert.equal(loaded.sound, true);
  const run = beginRun();
  run.score = 500;
  run.state = "won";
  const next = recordRun({ ...DEFAULT_PROGRESS, bestScore: 100 }, run);
  assert.equal(next.bestScore, 500);
  assert.equal(next.wins, 1);
  assert.equal(next.runs, 1);
  assert.ok(saveProgress(storage, next));
  assert.equal(loadProgress(storage).bestScore, 500);
});

test("createRun keeps ready state and valid difficulty", () => {
  const run = createRun("wild");
  assert.equal(run.difficulty, "normal");
  assert.equal(run.state, "ready");
  placePlayer(run);
  assert.ok(run.player.x > 0);
});