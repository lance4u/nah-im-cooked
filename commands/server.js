const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Get the invite link to our Discord server.'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('📨 Join Our Server!')
            .setDescription('Click the link below to join our Discord community!')
            .addFields({ name: '🔗 Invite Link', value: 'https://discord.gg/auJab2mRYD' })
            .setFooter({ text: 'See you there!' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
