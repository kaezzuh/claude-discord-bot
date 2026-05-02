import { SlashCommandBuilder } from 'discord.js';
import { ask } from '../../lib/claude.js';

const SYSTEM_PROMPT =
  'You are a helpful Discord assistant. Reply in a clear, friendly tone. ' +
  'Keep answers under 1800 characters since Discord has a 2000-char message limit. ' +
  'Use Discord markdown when it helps readability.';

export default {
  data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask Claude a question')
    .addStringOption((opt) =>
      opt.setName('question').setDescription('What do you want to ask?').setRequired(true).setMaxLength(1500),
    ),

  async execute(interaction) {
    const question = interaction.options.getString('question');
    await interaction.deferReply();

    try {
      const answer = await ask(question, { system: SYSTEM_PROMPT });
      const trimmed = answer.length > 1900 ? answer.slice(0, 1900) + '…' : answer;
      await interaction.editReply(trimmed || 'No response from Claude.');
    } catch (error) {
      console.error('/ask error:', error);
      await interaction.editReply('Failed to reach Claude. Check the API key and try again.');
    }
  },
};
