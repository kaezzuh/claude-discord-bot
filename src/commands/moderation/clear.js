import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Bulk delete messages in this channel')
    .addIntegerOption((opt) =>
      opt
        .setName('count')
        .setDescription('Number of messages to delete (1-100)')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true),
    )
    .addUserOption((opt) =>
      opt.setName('user').setDescription('Only delete messages from this user'),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction) {
    const count = interaction.options.getInteger('count');
    const user = interaction.options.getUser('user');
    await interaction.deferReply({ ephemeral: true });

    const fetched = await interaction.channel.messages.fetch({ limit: 100 });
    const filtered = user
      ? Array.from(fetched.values()).filter((m) => m.author.id === user.id).slice(0, count)
      : Array.from(fetched.values()).slice(0, count);

    if (filtered.length === 0) {
      await interaction.editReply('No matching messages found.');
      return;
    }

    const deleted = await interaction.channel.bulkDelete(filtered, true);
    await interaction.editReply(
      `Deleted ${deleted.size} message(s)${user ? ` from ${user.tag}` : ''}. ` +
        `(Messages older than 14 days cannot be bulk-deleted.)`,
    );
  },
};
