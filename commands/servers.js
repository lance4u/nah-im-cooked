const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const OWNER_ID = '1109119905712103424';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('servers')
        .setDescription('See all servers the bot has joined. (Owner only)'),

    async execute(interaction, client) {
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: '❌ Only the bot owner can use this command.', ephemeral: true });
        }

        const guilds = client.guilds.cache.sort((a, b) => b.memberCount - a.memberCount);
        const total = guilds.size;
        const totalMembers = guilds.reduce((acc, g) => acc + g.memberCount, 0);

        const chunks = [];
        let current = '';
        let i = 1;

        for (const guild of guilds.values()) {
            const line = `\`${i++}.\` **${guild.name}** — ${guild.memberCount.toLocaleString()} members\n`;
            if ((current + line).length > 3800) {
                chunks.push(current);
                current = line;
            } else {
                current += line;
            }
        }
        if (current) chunks.push(current);

        const embeds = chunks.map((chunk, idx) => {
            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setDescription(chunk)
                .setTimestamp();

            if (idx === 0) {
                embed.setTitle(`🌐 Servers (${total} total • ${totalMembers.toLocaleString()} users)`);
            }

            return embed;
        });

        await interaction.reply({ embeds: embeds.slice(0, 10), ephemeral: true });
    }
};
