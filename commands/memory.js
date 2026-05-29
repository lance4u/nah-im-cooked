const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const memoryManager = require('../utils/memoryManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('memory')
        .setDescription('View or clear what the bot remembers about you')

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
                    content: '🧠 I don\'t remember anything about you yet. Chat with me and I\'ll start learning!',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('🧠 What I Remember About You')
                .setDescription(memory.facts.map((f, i) => `${i + 1}. ${f}`).join('\n'))
                .setFooter({ text: 'Use /memory clear to wipe this.' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });

        } else if (sub === 'clear') {
            memoryManager.clearMemory(userId);

            await interaction.reply({
                content: '🗑️ Done! I\'ve forgotten everything about you. Fresh start!',
                ephemeral: true
            });
        }
    }
};
