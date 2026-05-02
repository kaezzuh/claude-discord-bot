import { SlashCommandBuilder } from 'discord.js';
import { evaluate } from 'mathjs';

export default {
  data: new SlashCommandBuilder()
    .setName('math')
    .setDescription('Evaluate a math expression')
    .addStringOption((opt) =>
      opt
        .setName('expression')
        .setDescription('e.g. 2+2, sqrt(64), sin(pi/4), 5! * 3')
        .setRequired(true)
        .setMaxLength(200),
    ),

  async execute(interaction) {
    const expression = interaction.options.getString('expression');
    try {
      const result = evaluate(expression);
      await interaction.reply(`\`${expression}\` = **${result}**`);
    } catch {
      await interaction.reply({
        content: `Could not evaluate \`${expression}\`. Check the syntax.`,
        ephemeral: true,
      });
    }
  },
};
