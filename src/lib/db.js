import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(here, '../../data/bot.db');
mkdirSync(dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_warnings_guild_user ON warnings(guild_id, user_id);

  CREATE TABLE IF NOT EXISTS xp (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    xp INTEGER NOT NULL DEFAULT 0,
    last_message_at INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (guild_id, user_id)
  );
  CREATE INDEX IF NOT EXISTS idx_xp_leaderboard ON xp(guild_id, xp DESC);

  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    guild_id TEXT,
    message TEXT NOT NULL,
    fire_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_reminders_fire_at ON reminders(fire_at);

  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY,
    welcome_channel_id TEXT,
    welcome_message TEXT,
    levelup_channel_id TEXT
  );
`);

export const warnings = {
  add: db.prepare(
    'INSERT INTO warnings (guild_id, user_id, moderator_id, reason, created_at) VALUES (?, ?, ?, ?, ?)',
  ),
  list: db.prepare(
    'SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC',
  ),
  count: db.prepare(
    'SELECT COUNT(*) as count FROM warnings WHERE guild_id = ? AND user_id = ?',
  ),
  clear: db.prepare('DELETE FROM warnings WHERE guild_id = ? AND user_id = ?'),
};

export const xp = {
  get: db.prepare('SELECT * FROM xp WHERE guild_id = ? AND user_id = ?'),
  upsert: db.prepare(`
    INSERT INTO xp (guild_id, user_id, xp, last_message_at) VALUES (?, ?, ?, ?)
    ON CONFLICT(guild_id, user_id) DO UPDATE SET
      xp = xp + excluded.xp,
      last_message_at = excluded.last_message_at
  `),
  leaderboard: db.prepare(
    'SELECT user_id, xp FROM xp WHERE guild_id = ? ORDER BY xp DESC LIMIT ?',
  ),
  rank: db.prepare(`
    SELECT COUNT(*) + 1 AS rank FROM xp
    WHERE guild_id = ? AND xp > (SELECT xp FROM xp WHERE guild_id = ? AND user_id = ?)
  `),
};

export const reminders = {
  add: db.prepare(
    'INSERT INTO reminders (user_id, channel_id, guild_id, message, fire_at) VALUES (?, ?, ?, ?, ?)',
  ),
  due: db.prepare('SELECT * FROM reminders WHERE fire_at <= ?'),
  remove: db.prepare('DELETE FROM reminders WHERE id = ?'),
  forUser: db.prepare(
    'SELECT * FROM reminders WHERE user_id = ? ORDER BY fire_at ASC LIMIT 25',
  ),
};

export const guildSettings = {
  get: db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?'),
  upsert: db.prepare(`
    INSERT INTO guild_settings (guild_id, welcome_channel_id, welcome_message, levelup_channel_id)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(guild_id) DO UPDATE SET
      welcome_channel_id = COALESCE(excluded.welcome_channel_id, welcome_channel_id),
      welcome_message = COALESCE(excluded.welcome_message, welcome_message),
      levelup_channel_id = COALESCE(excluded.levelup_channel_id, levelup_channel_id)
  `),
};
