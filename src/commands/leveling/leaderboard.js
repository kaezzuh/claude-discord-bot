import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { xp as xpDb } from '../../lib/db.js';
import { levelFromXp } from '../../lib/xp.js';

const MEDALS = ['🥇', '🥈', '🥉'];

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the top 10 members by XP')
    .setDMPermission(false),

  async execute(interaction) {
    const top = xpDb.leaderboard.all(interaction.guildId, 10);

    if (top.length === 0) {
      await interaction.reply({ content: 'No XP data yet — start chatting!', ephemeral: true });
      return;
    }

    const lines = top
      .map((r, i) => {
        const medal = MEDALS[i] ?? `**${i + 1}.**`;
        const level = levelFromXp(r.xp);
        return `${medal} <@${r.user_id}> — Level **${level}** (${r.xp.toLocaleString()} XP)`;
      })
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`🏆 ${interaction.guild.name} Leaderboard`)
      .setDescription(lines)
      .setColor(0xfee75c);

    await interaction.reply({ embeds: [embed] });
  },
};
