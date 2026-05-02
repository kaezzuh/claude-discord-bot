import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Show information about a member')
    .addUserOption((opt) =>
      opt.setName('user').setDescription('The member to look up (defaults to you)'),
    )
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser('user') ?? interaction.user;
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    const embed = new EmbedBuilder()
      .setTitle(target.tag)
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .setColor(member?.displayHexColor || 0x5865f2)
      .addFields(
        { name: 'Account created', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true },
        ...(member
          ? [
              { name: 'Joined server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
              {
                name: `Roles (${member.roles.cache.size - 1})`,
                value:
                  member.roles.cache
                    .filter((r) => r.id !== interaction.guild.id)
                    .sort((a, b) => b.position - a.position)
                    .map((r) => `<@&${r.id}>`)
                    .slice(0, 15)
                    .join(' ') || 'None',
              },
            ]
          : []),
      )
      .setFooter({ text: `User ID: ${target.id}` });

    await interaction.reply({ embeds: [embed] });
  },
};
