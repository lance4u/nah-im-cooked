const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all available commands.'),

    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .setDescription('Here are all available commands.')
            .addFields(
                {
                    name: '📋 General',
                    value: '`/ping` — Check bot latency\n`/help` — Show this list',
                    inline: false
                },
                {
                    name: '💤 AFK',
                    value: '`/afk [reason]` — Set your global AFK status',
                    inline: false
                },
                {
                    name: '⏰ Reminders',
                    value: '`/remind set` — Set a timed reminder\n`/remind list` — View your reminders\n`/remind clear` — Clear all your reminders',
                    inline: false
                },
                {
                    name: '🎙️ Voice',
                    value: '`/join` — Join a voice channel\n`/leave` — Leave the voice channel\n`/setvc` — Set the 24/7 permanent VC (Admin)\n`/stream` — Update streaming status',
                    inline: false
                }
            )
            .setFooter({ text: 'Unknown AI Bot' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
