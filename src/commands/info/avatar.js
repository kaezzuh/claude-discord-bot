import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Show a member\'s avatar in full size')
    .addUserOption((opt) =>
      opt.setName('user').setDescription('The member (defaults to you)'),
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user') ?? interaction.user;
    const url = target.displayAvatarURL({ size: 1024, extension: 'png' });

    const embed = new EmbedBuilder()
      .setTitle(`${target.username}'s avatar`)
      .setImage(url)
      .setColor(0x5865f2)
      .setURL(url);

    await interaction.reply({ embeds: [embed] });
  },
};
