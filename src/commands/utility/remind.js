import { SlashCommandBuilder } from 'discord.js';
import { reminders as remindersDb } from '../../lib/db.js';
import { parseDuration } from '../../lib/reminders.js';

export default {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Set a reminder')
    .addStringOption((opt) =>
      opt
        .setName('when')
        .setDescription('Duration (e.g. 10m, 2h, 1d)')
        .setRequired(true)
        .setMaxLength(20),
    )
    .addStringOption((opt) =>
      opt
        .setName('message')
        .setDescription('What should I remind you about?')
        .setRequired(true)
        .setMaxLength(500),
    ),

  async execute(interaction) {
    const when = interaction.options.getString('when');
    const message = interaction.options.getString('message');
    const ms = parseDuration(when);

    if (!ms || ms < 5_000) {
      await interaction.reply({
        content: 'Invalid duration. Use formats like `10s`, `5m`, `2h`, `1d`. Minimum 5 seconds.',
        ephemeral: true,
      });
      return;
    }

    const fireAt = Date.now() + ms;
    remindersDb.add.run(
      interaction.user.id,
      interaction.channelId,
      interaction.guildId,
      message,
      fireAt,
    );

    await interaction.reply({
      content: `Reminder set — I'll ping you <t:${Math.floor(fireAt / 1000)}:R>: *${message}*`,
      ephemeral: true,
    });
  },
};
