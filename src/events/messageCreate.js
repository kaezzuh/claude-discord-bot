import { Events } from 'discord.js';
import { awardXp } from '../lib/xp.js';
import { guildSettings } from '../lib/db.js';

const SPAM_WINDOW_MS = 10_000;
const SPAM_LIMIT = 5;
const SPAM_MUTE_MS = 5 * 60_000;

const recentMessages = new Map();

function detectSpam(message) {
  const key = `${message.guildId}:${message.author.id}`;
  const now = Date.now();
  const history = recentMessages.get(key) ?? [];
  const fresh = history.filter((m) => now - m.at < SPAM_WINDOW_MS);
  fresh.push({ at: now, content: message.content });
  recentMessages.set(key, fresh);

  if (fresh.length < SPAM_LIMIT) return false;
  const counts = {};
  for (const m of fresh) counts[m.content] = (counts[m.content] ?? 0) + 1;
  return Object.values(counts).some((c) => c >= SPAM_LIMIT);
}

export default {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot || !message.guildId) return;

    if (detectSpam(message)) {
      try {
        const member = message.member;
        if (member?.moderatable) {
          await member.timeout(SPAM_MUTE_MS, 'Auto-muted for spam (5 identical messages in 10s)');
          await message.channel.send(
            `🚫 <@${member.id}> auto-muted for 5 minutes (anti-spam).`,
          );
        }
      } catch (err) {
        console.warn('Anti-spam mute failed:', err.message);
      }
      return;
    }

    const newLevel = awardXp(message.guildId, message.author.id);
    if (newLevel != null) {
      const settings = guildSettings.get.get(message.guildId);
      const channelId = settings?.levelup_channel_id ?? message.channelId;
      try {
        const channel = await message.client.channels.fetch(channelId);
        await channel.send(`🎉 <@${message.author.id}> leveled up to **Level ${newLevel}**!`);
      } catch (err) {
        console.warn('Level-up announce failed:', err.message);
      }
    }
  },
};
