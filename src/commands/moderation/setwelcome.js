import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { guildSettings } from '../../lib/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setwelcome')
    .setDescription('Configure welcome messages for new members')
    .addChannelOption((opt) =>
      opt
        .setName('channel')
        .setDescription('Channel to post welcomes in')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName('message')
        .setDescription('Welcome text. Use {user} and {server} as placeholders.')
        .setMaxLength(500),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');

    guildSettings.upsert.run(
      interaction.guildId,
      channel.id,
      message ?? null,
      null,
    );

    await interaction.reply({
      content: `Welcome messages will now post in <#${channel.id}>${
        message ? ` with template:\n> ${message}` : ' using the default template.'
      }`,
      ephemeral: true,
    });
  },
};
