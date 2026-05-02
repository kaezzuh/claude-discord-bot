import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';

const MAX_OPTIONS = 5;

export default {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll with up to 5 options')
    .addStringOption((opt) =>
      opt.setName('question').setDescription('The poll question').setRequired(true).setMaxLength(200),
    )
    .addStringOption((opt) =>
      opt
        .setName('options')
        .setDescription('Comma-separated options (e.g. "yes, no, maybe")')
        .setRequired(true)
        .setMaxLength(500),
    ),

  async execute(interaction) {
    const question = interaction.options.getString('question');
    const options = interaction.options
      .getString('options')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)
      .slice(0, MAX_OPTIONS);

    if (options.length < 2) {
      await interaction.reply({ content: 'Provide at least 2 options.', ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`📊 ${question}`)
      .setDescription(options.map((o, i) => `**${i + 1}.** ${o} — \`0 votes\``).join('\n'))
      .setColor(0x5865f2)
      .setFooter({ text: `Poll by ${interaction.user.tag}` });

    const row = new ActionRowBuilder().addComponents(
      ...options.map((o, i) =>
        new ButtonBuilder()
          .setCustomId(`poll:${i}`)
          .setLabel(`${i + 1}`)
          .setStyle(ButtonStyle.Primary),
      ),
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },

  // Vote handler — invoked by interactionCreate event
  async handleVote(interaction) {
    const choice = parseInt(interaction.customId.split(':')[1], 10);
    const message = interaction.message;
    const embed = message.embeds[0];
    if (!embed) return;

    // Track votes per user via a Map keyed by message id (in-memory)
    const votes = pollVotes.get(message.id) ?? new Map();
    votes.set(interaction.user.id, choice);
    pollVotes.set(message.id, votes);

    // Tally
    const tally = new Array(5).fill(0);
    for (const v of votes.values()) tally[v]++;

    // Rebuild description from existing options
    const lines = embed.description.split('\n');
    const updated = lines.map((line, i) => {
      const match = line.match(/^\*\*\d+\.\*\* (.+?) — `\d+ votes?`$/);
      if (!match) return line;
      const count = tally[i] ?? 0;
      return `**${i + 1}.** ${match[1]} — \`${count} vote${count === 1 ? '' : 's'}\``;
    });

    const updatedEmbed = EmbedBuilder.from(embed).setDescription(updated.join('\n'));
    await interaction.update({ embeds: [updatedEmbed] });
  },
};

const pollVotes = new Map();
