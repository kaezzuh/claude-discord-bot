import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { xp as xpDb } from '../../lib/db.js';
import { progressInLevel } from '../../lib/xp.js';

function progressBar(percent, slots = 20) {
  const filled = Math.round((percent / 100) * slots);
  return '█'.repeat(filled) + '░'.repeat(slots - filled);
}

export default {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Show your level and XP')
    .addUserOption((opt) =>
      opt.setName('user').setDescription('Look up another member (defaults to you)'),
    )
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser('user') ?? interaction.user;
    const row = xpDb.get.get(interaction.guildId, target.id);

    if (!row) {
      await interaction.reply({
        content: `**${target.username}** hasn't sent any messages yet.`,
        ephemeral: true,
      });
      return;
    }

    const { level, current, needed, percent } = progressInLevel(row.xp);
    const rank = xpDb.rank.get(interaction.guildId, interaction.guildId, target.id).rank;

    const embed = new EmbedBuilder()
      .setTitle(`${target.username}'s Rank`)
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .setColor(0xfee75c)
      .addFields(
        { name: 'Level', value: `**${level}**`, inline: true },
        { name: 'Rank', value: `**#${rank}**`, inline: true },
        { name: 'Total XP', value: `**${row.xp.toLocaleString()}**`, inline: true },
        { name: `Progress (${current} / ${needed})`, value: `\`${progressBar(percent)}\` ${percent}%` },
      );

    await interaction.reply({ embeds: [embed] });
  },
};
