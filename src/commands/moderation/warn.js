import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { warnings } from '../../lib/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Issue a warning to a member')
    .addUserOption((opt) =>
      opt.setName('user').setDescription('The member to warn').setRequired(true),
    )
    .addStringOption((opt) =>
      opt.setName('reason').setDescription('Reason for the warning').setRequired(true).setMaxLength(500),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    if (user.bot) {
      await interaction.reply({ content: 'Cannot warn bots.', ephemeral: true });
      return;
    }

    warnings.add.run(interaction.guildId, user.id, interaction.user.id, reason, Date.now());
    const total = warnings.count.get(interaction.guildId, user.id).count;

    await interaction.reply(
      `Warned **${user.tag}** — ${reason}\nThis is warning **#${total}** for this user.`,
    );
  },
};
