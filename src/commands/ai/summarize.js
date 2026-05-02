import { SlashCommandBuilder } from 'discord.js';
import { ask } from '../../lib/claude.js';

const SYSTEM_PROMPT =
  'You summarize Discord chat logs. Be concise. Capture the main topics, ' +
  'decisions, questions raised, and any action items. Use bullet points. ' +
  'Reference users by their display name. Stay under 1800 characters.';

export default {
  data: new SlashCommandBuilder()
    .setName('summarize')
    .setDescription('Summarize the last N messages in this channel')
    .addIntegerOption((opt) =>
      opt
        .setName('count')
        .setDescription('How many messages to summarize (5-100)')
        .setMinValue(5)
        .setMaxValue(100)
        .setRequired(true),
    ),

  async execute(interaction) {
    const count = interaction.options.getInteger('count');
    await interaction.deferReply();

    try {
      const fetched = await interaction.channel.messages.fetch({ limit: count });
      const messages = Array.from(fetched.values())
        .reverse()
        .filter((m) => m.content && !m.author.bot)
        .map((m) => `${m.member?.displayName ?? m.author.username}: ${m.content}`)
        .join('\n');

      if (!messages) {
        await interaction.editReply('No human messages found to summarize.');
        return;
      }

      const summary = await ask(`Summarize this conversation:\n\n${messages}`, {
        system: SYSTEM_PROMPT,
        maxTokens: 800,
      });

      const trimmed = summary.length > 1900 ? summary.slice(0, 1900) + '…' : summary;
      await interaction.editReply(`**Summary of last ${count} messages:**\n\n${trimmed}`);
    } catch (error) {
      console.error('/summarize error:', error);
      await interaction.editReply('Failed to summarize. Check permissions and API key.');
    }
  },
};
