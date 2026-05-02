import { SlashCommandBuilder } from 'discord.js';
import { ask } from '../../lib/claude.js';

const SYSTEM_PROMPT =
  'You compress long text into one or two punchy sentences. ' +
  'Capture the core message; cut everything else. No preamble.';

export default {
  data: new SlashCommandBuilder()
    .setName('tldr')
    .setDescription('Compress long text into one or two sentences')
    .addStringOption((opt) =>
      opt.setName('text').setDescription('The text to compress').setRequired(true).setMaxLength(1500),
    ),

  async execute(interaction) {
    const text = interaction.options.getString('text');
    await interaction.deferReply();

    try {
      const tldr = await ask(text, { system: SYSTEM_PROMPT, maxTokens: 200 });
      await interaction.editReply(`**TL;DR:** ${tldr}`);
    } catch (error) {
      console.error('/tldr error:', error);
      await interaction.editReply('TL;DR failed. Try again later.');
    }
  },
};
