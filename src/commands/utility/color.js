import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('color')
    .setDescription('Preview a hex color')
    .addStringOption((opt) =>
      opt
        .setName('hex')
        .setDescription('Hex code (e.g. #5865f2 or 5865f2)')
        .setRequired(true)
        .setMaxLength(7),
    ),

  async execute(interaction) {
    const raw = interaction.options.getString('hex').replace(/^#/, '');
    if (!/^[0-9a-fA-F]{6}$/.test(raw)) {
      await interaction.reply({
        content: 'Invalid hex. Provide 6 hex digits, e.g. `#5865f2`.',
        ephemeral: true,
      });
      return;
    }

    const hex = `#${raw.toLowerCase()}`;
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);

    const embed = new EmbedBuilder()
      .setTitle(hex.toUpperCase())
      .setColor(parseInt(raw, 16))
      .addFields(
        { name: 'RGB', value: `\`rgb(${r}, ${g}, ${b})\``, inline: true },
        { name: 'HEX', value: `\`${hex}\``, inline: true },
      )
      .setImage(`https://singlecolorimage.com/get/${raw}/400x100.png`);

    await interaction.reply({ embeds: [embed] });
  },
};
