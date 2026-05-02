import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

const SECTIONS = {
  AI: [
    '`/ask` — Ask Claude a question',
    '`/summarize` — Summarize the last N messages',
    '`/translate` — Translate text into any language',
    '`/tldr` — Compress long text into one sentence',
    '`/roast` — Generate a playful roast',
  ],
  Moderation: [
    '`/kick`, `/ban`, `/mute` — Remove or timeout members',
    '`/warn`, `/warnings` — Persistent warning system',
    '`/clear` — Bulk delete messages',
    '`/slowmode` — Set channel slowmode',
    '`/role` — Add or remove roles',
    '`/setwelcome` — Configure welcome messages',
  ],
  Info: [
    '`/serverinfo` — Server overview',
    '`/userinfo` — Member details',
    '`/avatar` — Show a user\'s avatar',
  ],
  Fun: [
    '`/8ball` — Ask the magic 8-ball',
    '`/coinflip` — Flip a coin',
    '`/poll` — Create a button-based poll',
  ],
  Utility: [
    '`/remind` — Set a reminder (persistent)',
    '`/color` — Preview a hex color',
    '`/weather` — Current weather for any city',
    '`/math` — Evaluate math expressions',
  ],
  Leveling: [
    '`/rank` — Your level and XP',
    '`/leaderboard` — Top 10 members',
  ],
};

export default {
  data: new SlashCommandBuilder().setName('help').setDescription('Show all bot commands'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🤖 Discord AI Bot — Command Reference')
      .setColor(0x5865f2)
      .setDescription('Slash commands across 6 categories. AI features powered by Claude.')
      .addFields(
        ...Object.entries(SECTIONS).map(([name, items]) => ({
          name: `__${name}__`,
          value: items.join('\n'),
        })),
      )
      .setFooter({ text: 'XP is awarded automatically as you chat. Anti-spam is enabled.' });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
