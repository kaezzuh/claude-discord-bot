import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { warnings } from '../../lib/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View all warnings for a member')
    .addUserOption((opt) =>
      opt.setName('user').setDescription('The member to look up').setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const list = warnings.list.all(interaction.guildId, user.id);

    if (list.length === 0) {
      await interaction.reply({ content: `**${user.tag}** has no warnings.`, ephemeral: true });
      return;
    }

    const lines = list
      .slice(0, 15)
      .map((w, i) => {
        const date = new Date(w.created_at).toISOString().split('T')[0];
        return `**${i + 1}.** ${w.reason} — *${date} by <@${w.moderator_id}>*`;
      })
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`Warnings for ${user.tag}`)
      .setDescription(lines)
      .setColor(0xff9500)
      .setThumbnail(user.displayAvatarURL())
      .setFooter({ text: `Total warnings: ${list.length}` });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
