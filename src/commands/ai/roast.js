import { SlashCommandBuilder } from 'discord.js';
import { ask } from '../../lib/claude.js';

const SYSTEM_PROMPT =
  'You write playful, lighthearted roasts. Keep it short (one or two lines), ' +
  'witty, and friendly — never cruel, never about appearance, race, gender, or anything ' +
  'someone cannot change. Roasts should feel like teasing between friends.';

export default {
  data: new SlashCommandBuilder()
    .setName('roast')
    .setDescription('Generate a playful roast for a member')
    .addUserOption((opt) =>
      opt.setName('user').setDescription('Who to roast').setRequired(true),
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    await interaction.deferReply();

    try {
      const roast = await ask(`Roast a Discord user named "${user.username}".`, {
        system: SYSTEM_PROMPT,
        maxTokens: 200,
      });
      await interaction.editReply(`<@${user.id}> ${roast}`);
    } catch (error) {
      console.error('/roast error:', error);
      await interaction.editReply('Roast failed — even my insults need a working API key.');
    }
  },
};
