const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('View info about a user.')
        .addUserOption(opt => opt
            .setName('user')
            .setDescription('The user to look up (defaults to you)')
            .setRequired(false)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        const createdAt = `<t:${Math.floor(target.createdTimestamp / 1000)}:D>`;
        const createdAgo = `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`;
        const joinedAt = member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>` : 'N/A';
        const joinedAgo = member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : '';

        const roles = member
            ? member.roles.cache
                .filter(r => r.id !== interaction.guild.id)
                .sort((a, b) => b.position - a.position)
                .map(r => `<@&${r.id}>`)
                .slice(0, 15)
                .join(' ') || 'None'
            : 'N/A';

        const embed = new EmbedBuilder()
            .setColor(member?.displayHexColor || 0x5865F2)
            .setTitle(`${target.tag}`)
            .setThumbnail(target.displayAvatarURL({ size: 256 }))
            .addFields(
                { name: '🪪 User ID', value: target.id, inline: true },
                { name: '🤖 Bot', value: target.bot ? 'Yes' : 'No', inline: true },
                { name: '📅 Account Created', value: `${createdAt}\n${createdAgo}`, inline: false },
                { name: '📥 Joined Server', value: `${joinedAt}${joinedAgo ? `\n${joinedAgo}` : ''}`, inline: false },
                { name: `🎭 Roles (${member?.roles.cache.size - 1 || 0})`, value: roles, inline: false }
            )
            .setImage(target.bannerURL({ size: 512 }) || null)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
