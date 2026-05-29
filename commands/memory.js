const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const memoryManager = require('../utils/memoryManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('memory')
        .setDescription('View or clear what the bot remembers about you.')
        .addSubcommand(sub => sub
            .setName('view')
            .setDescription('See what the bot remembers about you')
        )
        .addSubcommand(sub => sub
            .setName('clear')
            .setDescription('Clear everything the bot remembers about you')
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        if (sub === 'view') {
            const memory = memoryManager.getMemory(userId);

            if (!memory.facts || memory.facts.length === 0) {
                return interaction.reply({
                    content: 'Nothing stored yet. Chat with me and I\'ll start learning about you.',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setColor(0x2b2d31)
                .setAuthor({ name: 'Memory', iconURL: interaction.user.displayAvatarURL() })
                .setDescription(memory.facts.map((f, i) => `${i + 1}. ${f}`).join('\n'))
                .setFooter({ text: 'Run /memory clear to wipe this.' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });

        } else if (sub === 'clear') {
            memoryManager.clearMemory(userId);
            await interaction.reply({ content: 'Memory cleared. Fresh start.', ephemeral: true });
        }
    }
};
