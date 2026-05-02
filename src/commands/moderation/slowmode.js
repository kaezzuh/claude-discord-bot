import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set channel slowmode (seconds between messages)')
    .addIntegerOption((opt) =>
      opt
        .setName('seconds')
        .setDescription('Slowmode delay in seconds (0 to disable, max 21600)')
        .setMinValue(0)
        .setMaxValue(21600)
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction) {
    const seconds = interaction.options.getInteger('seconds');
    const channel = interaction.channel;

    if (channel.type !== ChannelType.GuildText) {
      await interaction.reply({ content: 'Slowmode only works on text channels.', ephemeral: true });
      return;
    }

    await channel.setRateLimitPerUser(seconds);
    await interaction.reply(
      seconds === 0 ? 'Slowmode disabled.' : `Slowmode set to **${seconds}s**.`,
    );
  },
};
