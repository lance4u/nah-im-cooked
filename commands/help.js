const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all available commands.'),

    async execute(interaction, client) {
        try {
            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('📘 Help Menu')
                .setDescription('Here are all available bot commands.')
                .addFields(
                    {
                        name: '⚡ General Commands',
                        value: '</ping:0> - Check bot latency\n</help:0> - Show help menu\n</remind:0> - Set reminders',
                        inline: false
                    },
                    {
                        name: '🎧 Voice Commands',
                        value: '</join:0> - Join voice channel\n</leave:0> - Leave voice channel\n</afk:0> - Stay AFK in VC\n</stream:0> - Start VC stream\n</setvc:0> - Set voice channel',
                        inline: false
                    }
                )
                .setFooter({ text: `${client.user.username} • Experimental Bot` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to load help menu.',
                ephemeral: true
            });
        }
    }
};
