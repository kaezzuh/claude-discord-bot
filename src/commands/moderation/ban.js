import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption((opt) =>
      opt.setName('user').setDescription('The member to ban').setRequired(true),
    )
    .addStringOption((opt) =>
      opt.setName('reason').setDescription('Reason for the ban').setMaxLength(500),
    )
    .addIntegerOption((opt) =>
      opt
        .setName('delete_days')
        .setDescription('Delete this many days of their messages (0-7)')
        .setMinValue(0)
        .setMaxValue(7),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';
    const deleteDays = interaction.options.getInteger('delete_days') ?? 0;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (member && !member.bannable) {
      await interaction.reply({ content: 'I cannot ban that member.', ephemeral: true });
      return;
    }

    await interaction.guild.members.ban(user.id, {
      reason,
      deleteMessageSeconds: deleteDays * 86400,
    });
    await interaction.reply(`Banned **${user.tag}** — ${reason}`);
  },
};
