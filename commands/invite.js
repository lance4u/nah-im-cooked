const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Get the link to invite the bot to your server.'),

    async execute(interaction, client) {
        const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setAuthor({ name: `Invite ${client.user.username}`, iconURL: client.user.displayAvatarURL() })
            .setDescription(`[Click here to invite](${inviteUrl})`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
