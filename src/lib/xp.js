import { xp as xpDb } from './db.js';

export const XP_PER_MESSAGE = 15;
export const XP_COOLDOWN_MS = 60_000;

export function levelFromXp(totalXp) {
  return Math.floor(0.1 * Math.sqrt(totalXp));
}

export function xpForLevel(level) {
  return Math.ceil((level / 0.1) ** 2);
}

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
