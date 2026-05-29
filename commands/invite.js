const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Get the link to invite the bot to your server.'),

    async execute(interaction, client) {
        const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(`📨 Invite ${client.user.username}!`)
            .setDescription('Click the link below to add me to your server!')
            .addFields({ name: '🔗 Invite Link', value: `[Click here to invite](${inviteUrl})` })
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter({ text: 'Thanks for using the bot!' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
