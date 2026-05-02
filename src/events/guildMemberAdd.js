import { EmbedBuilder, Events } from 'discord.js';
import { guildSettings } from '../lib/db.js';

export default {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const settings = guildSettings.get.get(member.guild.id);
    if (!settings?.welcome_channel_id) return;

    const channel = await member.client.channels.fetch(settings.welcome_channel_id).catch(() => null);
    if (!channel) return;

    const template = settings.welcome_message ?? 'Welcome {user} to **{server}**! 🎉';
    const message = template
      .replace(/\{user\}/g, `<@${member.id}>`)
      .replace(/\{server\}/g, member.guild.name);

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setDescription(message)
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .setFooter({ text: `Member #${member.guild.memberCount}` });

    await channel.send({ embeds: [embed] });
  },
};
