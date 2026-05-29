const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency and API speed.'),

    async execute(interaction, client) {
        const message = await interaction.reply({ content: 'Checking...', fetchReply: true });
        const botPing = message.createdTimestamp - interaction.createdTimestamp;
        const apiPing = client.ws.ping;

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setAuthor({ name: 'Latency', iconURL: client.user.displayAvatarURL() })
            .addFields(
                { name: 'Bot', value: `\`${botPing}ms\``, inline: true },
                { name: 'API', value: `\`${apiPing}ms\``, inline: true }
            )
            .setTimestamp();

        await interaction.editReply({ content: null, embeds: [embed] });
    }
};
