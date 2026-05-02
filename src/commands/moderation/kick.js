import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption((opt) =>
      opt.setName('user').setDescription('The member to kick').setRequired(true),
    )
    .addStringOption((opt) =>
      opt.setName('reason').setDescription('Reason for the kick').setMaxLength(500),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      await interaction.reply({ content: 'That user is not in this server.', ephemeral: true });
      return;
    }
    if (!member.kickable) {
      await interaction.reply({ content: 'I cannot kick that member (role hierarchy or permissions).', ephemeral: true });
      return;
    }

    await member.kick(reason);
    await interaction.reply(`Kicked **${user.tag}** — ${reason}`);
  },
};
