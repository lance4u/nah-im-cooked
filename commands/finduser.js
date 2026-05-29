const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const OWNER_ID = '930885103457009754';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('finduser')
        .setDescription('Find which servers a user shares with the bot. (Owner only)')
        .addStringOption(opt => opt
            .setName('userid')
            .setDescription('The Discord user ID to look up')
            .setRequired(true)
        ),

    async execute(interaction, client) {
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: '❌ Only the bot owner can use this command.', ephemeral: true });
        }

        const userId = interaction.options.getString('userid');
        await interaction.deferReply({ ephemeral: true });

        let targetUser;
        try {
            targetUser = await client.users.fetch(userId);
        } catch {
            return interaction.editReply({ content: '❌ Could not find a user with that ID.' });
        }

        const matchedServers = [];

        for (const guild of client.guilds.cache.values()) {
            try {
                const member = await guild.members.fetch(userId).catch(() => null);
                if (member) {
                    matchedServers.push(`**${guild.name}** — ${guild.memberCount.toLocaleString()} members`);
                }
            } catch {
                // skip guilds where fetch fails
            }
        }

        if (matchedServers.length === 0) {
            return interaction.editReply({
                content: `🔍 **${targetUser.tag}** is not in any server the bot has joined.`
            });
        }

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(`🔍 Servers shared with ${targetUser.tag}`)
            .setThumbnail(targetUser.displayAvatarURL())
            .setDescription(matchedServers.join('\n'))
            .setFooter({ text: `Found in ${matchedServers.length} of ${client.guilds.cache.size} servers` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
