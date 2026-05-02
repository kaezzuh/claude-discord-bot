import { reminders as remindersDb } from './db.js';

let intervalId = null;

/**
 * Start the reminder scheduler. Polls the database every 15 seconds and fires
 * any reminders whose `fire_at` timestamp has passed.
 *
 * Reminders are stored in SQLite, so they survive bot restarts cleanly — when
 * the bot boots, due reminders that were missed during downtime fire on the
 * first tick.
 *
 * @param {import('discord.js').Client} client
 */
export function startReminderScheduler(client) {
  const tick = async () => {
    const due = remindersDb.due.all(Date.now());
    for (const reminder of due) {
      try {
        const channel = await client.channels.fetch(reminder.channel_id);
        await channel.send(`<@${reminder.user_id}> Reminder: ${reminder.message}`);
      } catch (err) {
        console.warn(`Failed to deliver reminder ${reminder.id}:`, err.message);
      } finally {
        remindersDb.remove.run(reminder.id);
      }
    }
  };

  tick();
  intervalId = setInterval(tick, 15_000);
}

/** Stop the scheduler. Called from the SIGINT/SIGTERM shutdown handler. */
export function stopReminderScheduler() {
  if (intervalId) clearInterval(intervalId);
}

/**
 * Parse human-friendly duration strings into milliseconds.
 * Accepts: `10s`, `5m`, `2h`, `1d`, `30 minutes`, `2 hours`, etc.
 * @returns {number|null} duration in ms, or null if input is unparseable
 */
export function parseDuration(input) {
  const match = input.trim().match(/^(\d+)\s*(s|m|h|d|sec|min|hour|day|seconds?|minutes?|hours?|days?)$/i);
  if (!match) return null;
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  if (unit.startsWith('s')) return value * 1000;
  if (unit.startsWith('m') && !unit.startsWith('mo')) return value * 60_000;
  if (unit.startsWith('h')) return value * 3_600_000;
  if (unit.startsWith('d')) return value * 86_400_000;
  return null;
}
