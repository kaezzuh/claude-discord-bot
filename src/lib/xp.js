import { xp as xpDb } from './db.js';

/** XP awarded per qualifying message. */
export const XP_PER_MESSAGE = 15;

/** Minimum gap between awards for the same user, to prevent spam-farming XP. */
export const XP_COOLDOWN_MS = 60_000;

/**
 * Level curve: level grows as the square root of total XP, scaled by 0.1.
 * e.g. 100 XP → level 1, 400 XP → level 2, 900 XP → level 3.
 */
export function levelFromXp(totalXp) {
  return Math.floor(0.1 * Math.sqrt(totalXp));
}

/** Inverse of {@link levelFromXp} — total XP required to reach a level. */
export function xpForLevel(level) {
  return Math.ceil((level / 0.1) ** 2);
}

/**
 * Returns progress within the current level for displaying a progress bar.
 * @returns {{level: number, current: number, needed: number, percent: number}}
 */
export function progressInLevel(totalXp) {
  const level = levelFromXp(totalXp);
  const current = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return {
    level,
    current: totalXp - current,
    needed: next - current,
    percent: Math.floor(((totalXp - current) / (next - current)) * 100),
  };
}

/**
 * Award XP to a user if they're past the cooldown window.
 * @returns {number|null} The new level if the user just leveled up, otherwise null.
 */
export function awardXp(guildId, userId) {
  const row = xpDb.get.get(guildId, userId);
  const now = Date.now();

  if (row && now - row.last_message_at < XP_COOLDOWN_MS) {
    return null;
  }

  const previousXp = row?.xp ?? 0;
  const previousLevel = levelFromXp(previousXp);
  xpDb.upsert.run(guildId, userId, XP_PER_MESSAGE, now);
  const newLevel = levelFromXp(previousXp + XP_PER_MESSAGE);

  return newLevel > previousLevel ? newLevel : null;
}
