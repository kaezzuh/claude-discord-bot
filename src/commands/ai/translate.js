import { SlashCommandBuilder } from 'discord.js';
import { ask } from '../../lib/claude.js';

const SYSTEM_PROMPT =
  'You are a precise translator. Output ONLY the translated text — no preamble, ' +
  'no explanations, no quotation marks. Preserve formatting and tone.';

export default {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate text into another language')
    .addStringOption((opt) =>
      opt.setName('text').setDescription('The text to translate').setRequired(true).setMaxLength(1500),
    )
    .addStringOption((opt) =>
      opt
        .setName('language')
        .setDescription('Target language (e.g. Spanish, Japanese, Dutch)')
        .setRequired(true)
        .setMaxLength(40),
    ),

  async execute(interaction) {
    const text = interaction.options.getString('text');
    const language = interaction.options.getString('language');
    await interaction.deferReply();

    try {
      const translated = await ask(`Translate the following into ${language}:\n\n${text}`, {
        system: SYSTEM_PROMPT,
        maxTokens: 1024,
      });
      await interaction.editReply(`**${language}:**\n${translated}`);
    } catch (error) {
      console.error('/translate error:', error);
      await interaction.editReply('Translation failed. Try again later.');
    }
  },
};
