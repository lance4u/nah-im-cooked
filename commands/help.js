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
                    name: 'General',
                    value: '`/ping` — Latency check\n`/stats` — Bot statistics\n`/help` — Command list\n`/memory` — View or clear your memory\n`/remind` — Reminder system',
                    inline: false
                },
                {
                    name: 'Server',
                    value: '`/server` — Server invite link\n`/invite` — Bot invite link\n`/userinfo` — View user info',
                    inline: false
                },
                {
                    name: 'Voice',
                    value: '`/join` — Join voice channel\n`/leave` — Leave voice channel\n`/afk` — Set permanent AFK VC\n`/setvc` — Set voice channel\n`/stream` — Start stream',
                    inline: false
                }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
