const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('View a user\'s full-size avatar.')
        .addUserOption(opt => opt
            .setName('user')
            .setDescription('The user to get the avatar of (defaults to you)')
            .setRequired(false)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        const globalAvatar = target.displayAvatarURL({ size: 4096, extension: 'png' });
        const serverAvatar = member?.avatarURL({ size: 4096, extension: 'png' });

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setAuthor({ name: target.tag })
            .setImage(serverAvatar || globalAvatar)
            .setTimestamp();

        const links = [`[Global](${globalAvatar})`];
        if (serverAvatar) links.push(`[Server](${serverAvatar})`);

        embed.setDescription(links.join(' · '));

        await interaction.reply({ embeds: [embed] });
    }
};
