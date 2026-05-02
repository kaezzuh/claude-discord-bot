import { SlashCommandBuilder } from 'discord.js';

const RESPONSES = [
  'It is certain.',
  'Without a doubt.',
  'Yes — definitely.',
  'You may rely on it.',
  'Most likely.',
  'Outlook good.',
  'Signs point to yes.',
  'Reply hazy, try again.',
  'Ask again later.',
  'Better not tell you now.',
  'Cannot predict now.',
  'Concentrate and ask again.',
  'Don\'t count on it.',
  'My reply is no.',
  'My sources say no.',
  'Outlook not so good.',
  'Very doubtful.',
];

export default {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the magic 8-ball a yes/no question')
    .addStringOption((opt) =>
      opt.setName('question').setDescription('Your question').setRequired(true).setMaxLength(200),
    ),

  async execute(interaction) {
    const question = interaction.options.getString('question');
    const answer = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
    await interaction.reply(`🎱 **${question}**\n> ${answer}`);
  },
};
