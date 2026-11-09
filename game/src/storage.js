import { DIFFICULTIES } from "./core.js";

const KEY = "lantern-post-v1";

export const DEFAULT_PROGRESS = {
  bestScore: 0,
  wins: 0,
  runs: 0,
  sound: true,
  difficulty: "normal",
  reducedMotion: false,
};

export function loadProgress(storage) {
  try {
    const raw = storage?.getItem(KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const data = JSON.parse(raw);
    return {
      bestScore: Number.isFinite(data.bestScore) ? Math.max(0, Math.floor(data.bestScore)) : 0,
      wins: Number.isFinite(data.wins) ? Math.max(0, Math.floor(data.wins)) : 0,
      runs: Number.isFinite(data.runs) ? Math.max(0, Math.floor(data.runs)) : 0,
      sound: typeof data.sound === "boolean" ? data.sound : true,
      difficulty: DIFFICULTIES[data.difficulty] ? data.difficulty : "normal",
      reducedMotion: typeof data.reducedMotion === "boolean" ? data.reducedMotion : false,
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(storage, progress) {
  try {
    storage?.setItem(KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export function recordRun(progress, run) {
  const next = {
    ...progress,
    runs: progress.runs + 1,
    wins: progress.wins + (run.state === "won" ? 1 : 0),
    bestScore: Math.max(progress.bestScore, run.score),
  };
  return next;
}