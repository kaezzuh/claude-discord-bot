import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

const MAX_MINUTES = 60 * 24 * 7;

export default {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout a member for N minutes')
    .addUserOption((opt) =>
      opt.setName('user').setDescription('The member to mute').setRequired(true),
    )
    .addIntegerOption((opt) =>
      opt
        .setName('minutes')
        .setDescription('Duration in minutes (1-10080)')
        .setMinValue(1)
        .setMaxValue(MAX_MINUTES)
        .setRequired(true),
    )
    .addStringOption((opt) =>
      opt.setName('reason').setDescription('Reason for the timeout').setMaxLength(500),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const minutes = interaction.options.getInteger('minutes');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      await interaction.reply({ content: 'That user is not in this server.', ephemeral: true });
      return;
    }
    if (!member.moderatable) {
      await interaction.reply({ content: 'I cannot timeout that member.', ephemeral: true });
      return;
    }

    await member.timeout(minutes * 60 * 1000, reason);
    await interaction.reply(`Muted **${user.tag}** for ${minutes} minute(s) — ${reason}`);
  },
};
