import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Add or remove a role from a member')
    .addStringOption((opt) =>
      opt
        .setName('action')
        .setDescription('Add or remove')
        .addChoices({ name: 'add', value: 'add' }, { name: 'remove', value: 'remove' })
        .setRequired(true),
    )
    .addUserOption((opt) =>
      opt.setName('user').setDescription('The member to modify').setRequired(true),
    )
    .addRoleOption((opt) =>
      opt.setName('role').setDescription('The role to add or remove').setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false),

  async execute(interaction) {
    const action = interaction.options.getString('action');
    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      await interaction.reply({ content: 'That user is not in this server.', ephemeral: true });
      return;
    }

    const botMember = await interaction.guild.members.fetchMe();
    if (role.position >= botMember.roles.highest.position) {
      await interaction.reply({
        content: 'I cannot manage that role — it is at or above my highest role.',
        ephemeral: true,
      });
      return;
    }

    if (action === 'add') {
      await member.roles.add(role);
      await interaction.reply(`Added **${role.name}** to **${user.tag}**`);
    } else {
      await member.roles.remove(role);
      await interaction.reply(`Removed **${role.name}** from **${user.tag}**`);
    }
  },
};
