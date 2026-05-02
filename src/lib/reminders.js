import { reminders as remindersDb } from './db.js';

let intervalId = null;

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

export function stopReminderScheduler() {
  if (intervalId) clearInterval(intervalId);
}

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
