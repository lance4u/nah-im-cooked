const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Get the invite link to our Discord server.'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setAuthor({ name: 'Join Our Server' })
            .addFields({ name: 'Invite', value: 'https://discord.gg/auJab2mRYD' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
