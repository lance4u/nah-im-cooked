const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

const AFK_FILE = './config/afk_users.json';

function loadAFK() {
    try {
        return JSON.parse(fs.readFileSync(AFK_FILE));
    } catch (err) {
        return {};
    }
}

function saveAFK(data) {
    fs.writeFileSync(AFK_FILE, JSON.stringify(data, null, 2));
}

function formatDuration(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h ago`;
    if (h > 0) return `${h}h ${m % 60}m ago`;
    if (m > 0) return `${m}m ${s % 60}s ago`;
    return `${s}s ago`;
}

module.exports = {
    name: 'messageCreate',

    async execute(message) {
        if (message.author.bot) return;

        const data = loadAFK();
        const userId = message.author.id;
        let changed = false;

        if (data[userId]) {
            const { reason, since } = data[userId];
            const elapsed = formatDuration(Date.now() - since);

            delete data[userId];
            changed = true;

            const embed = new EmbedBuilder()
                .setColor(0x2b2d31)
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setDescription(`👋 Welcome back! You were AFK for **${elapsed}** (Reason: ${reason})`)
                .setTimestamp();

            try {
                await message.reply({ embeds: [embed] });
            } catch (err) {
                // ignore if reply fails
            }
        }

        const mentioned = message.mentions.users.filter(u => !u.bot && u.id !== userId && data[u.id]);

        for (const [, user] of mentioned) {
            const { reason, since } = data[user.id];
            const elapsed = formatDuration(Date.now() - since);

            const embed = new EmbedBuilder()
                .setColor(0x2b2d31)
                .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
                .setDescription(`💤 **${user.username}** is AFK: **${reason}** — ${elapsed}`)
                .setTimestamp();

            try {
                await message.reply({ embeds: [embed] });
            } catch (err) {
                // ignore if reply fails
            }
        }

        if (changed) saveAFK(data);
    }
};
