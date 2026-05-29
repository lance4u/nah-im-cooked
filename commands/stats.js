const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function formatUptime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`;
    if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('View bot stats — uptime, servers, and users.'),

    async execute(interaction, client) {
        const guilds = client.guilds.cache.size;
        const users = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
        const uptime = formatUptime(client.uptime);
        const ping = client.ws.ping;

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('📊 Bot Stats')
            .addFields(
                { name: '⏱️ Uptime', value: uptime, inline: true },
                { name: '🏓 Ping', value: `${ping}ms`, inline: true },
                { name: '🌐 Servers', value: `${guilds}`, inline: true },
                { name: '👥 Total Users', value: `${users.toLocaleString()}`, inline: true },
                { name: '📦 Discord.js', value: require('discord.js').version, inline: true },
                { name: '🟩 Node.js', value: process.version, inline: true }
            )
            .setFooter({ text: `${client.user.username} • Made by Lance` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
