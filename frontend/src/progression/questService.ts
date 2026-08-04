import { ACTIVE_QUEST_POOL } from './config';
import type { Quest } from './types';

/**
 * A simple seeded random number generator.
 * Uses a linear congruential generator (LCG).
 */
function seededRandom(seed: number) {
  const m = 0x80000000;
  const a = 1103515245;
  const c = 12345;
  let state = seed;
  return function () {
    state = (a * state + c) % m;
    return state / (m - 1);
  };
}

/**
 * Converts a string to a simple numeric hash to use as a seed.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Generates today's date string in YYYY-MM-DD format based on local time.
 */
export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Deterministically picks 3 quests for a given user on a given date.
 */
export function generateDailyQuests(uid: string, dateStr: string): Quest[] {
  const seed = hashString(`${uid}-${dateStr}`);
  const random = seededRandom(seed);
  
  // Clone the pool so we can pick without replacement
  const pool = [...ACTIVE_QUEST_POOL];
  const selected: Quest[] = [];
  
  // Pick exactly 3
  const count = Math.min(3, pool.length);
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(random() * pool.length);
    selected.push(pool[idx]);
    pool.splice(idx, 1);
  }
  
  return selected;
}
