const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot latency and API speed.'),

    async execute(interaction, client) {
        try {
            const message = await interaction.reply({
                content: '🏓 Pinging...',
                fetchReply: true
            });

            const botPing = message.createdTimestamp - interaction.createdTimestamp;
            const apiPing = client.ws.ping;

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('🏓 Pong!')
                .setDescription('Bot response statistics.')
                .addFields(
                    { name: '📡 Bot Latency', value: `\`${botPing}ms\``, inline: true },
                    { name: '🌐 API Latency', value: `\`${apiPing}ms\``, inline: true }
                )
                .setFooter({ text: `${client.user.username} • Online & Ready` })
                .setTimestamp();

            await interaction.editReply({ content: null, embeds: [embed] });

        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ content: '❌ An error occurred while checking ping.' });
            } else {
                await interaction.reply({ content: '❌ An error occurred while checking ping.', ephemeral: true });
            }
        }
    }
};
