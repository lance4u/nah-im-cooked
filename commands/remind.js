const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const REMINDERS_FILE = './config/reminders.json';

function loadReminders() {
    try {
        const data = JSON.parse(fs.readFileSync(REMINDERS_FILE));
        return Array.isArray(data) ? data : [];
    } catch (err) {
        return [];
    }
}

function saveReminders(data) {
    fs.writeFileSync(REMINDERS_FILE, JSON.stringify(data, null, 2));
}

function parseDuration(str) {
    const match = str && str.match(/^(\d+)(s|m|h|d)$/i);
    if (!match) return null;
    const map = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return parseInt(match[1]) * map[match[2].toLowerCase()];
}

function formatDuration(str) {
    const match = str && str.match(/^(\d+)(s|m|h|d)$/i);
    if (!match) return str;
    const labels = { s: 'second(s)', m: 'minute(s)', h: 'hour(s)', d: 'day(s)' };
    return `${match[1]} ${labels[match[2].toLowerCase()]}`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Manage your reminders.')
        .addSubcommand(sub => sub
            .setName('set')
            .setDescription('Set a timed reminder.')
            .addStringOption(opt => opt
                .setName('time')
                .setDescription('When to remind you (e.g. 10m, 2h, 1d)')
                .setRequired(true)
            )
            .addStringOption(opt => opt
                .setName('reason')
                .setDescription('What to remind you about')
                .setRequired(true)
            )
        )
        .addSubcommand(sub => sub
            .setName('list')
            .setDescription('View your active reminders.')
        )
        .addSubcommand(sub => sub
            .setName('clear')
            .setDescription('Clear all your reminders.')
        ),

    async execute(interaction, client) {
        const sub = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        if (sub === 'set') {
            const timeStr = interaction.options.getString('time');
            const reason = interaction.options.getString('reason');
            const ms = parseDuration(timeStr);

            if (!ms) {
                return interaction.reply({
                    content: '❌ Invalid time format. Use: `10s`, `5m`, `2h`, `1d`',
                    ephemeral: true
                });
            }

            const id = `${userId}-${Date.now()}`;
            const fireAt = Date.now() + ms;
            const channelId = interaction.channelId;

            const data = loadReminders();
            data.push({ id, userId, channelId, reason, fireAt, timeStr });
            saveReminders(data);

            const embed = new EmbedBuilder()
                .setColor(0x2b2d31)
                .setAuthor({ name: 'Reminder Set', iconURL: interaction.user.displayAvatarURL() })
                .addFields(
                    { name: 'Reason', value: reason, inline: true },
                    { name: 'In', value: formatDuration(timeStr), inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            setTimeout(async () => {
                try {
                    const channel = await client.channels.fetch(channelId);
                    await channel.send(`⏰ <@${userId}> Reminder: **${reason}**`);
                } catch (err) {
                    console.error('[Reminder] Failed to send:', err.message);
                }
                const updated = loadReminders();
                saveReminders(updated.filter(r => r.id !== id));
            }, ms);

        } else if (sub === 'list') {
            const data = loadReminders();
            const mine = data.filter(r => r.userId === userId);

            if (!mine.length) {
                return interaction.reply({ content: '📭 You have no active reminders.', ephemeral: true });
            }

            const desc = mine.map((r, i) => {
                const msLeft = Math.max(0, r.fireAt - Date.now());
                const m = Math.floor(msLeft / 60000);
                const h = Math.floor(m / 60);
                const d = Math.floor(h / 24);
                const left = d > 0 ? `${d}d left` : h > 0 ? `${h}h left` : `${m}m left`;
                return `${i + 1}. **${r.reason}** — ${left}`;
            }).join('\n');

            const embed = new EmbedBuilder()
                .setColor(0x2b2d31)
                .setAuthor({ name: 'Your Reminders', iconURL: interaction.user.displayAvatarURL() })
                .setDescription(desc)
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });

        } else if (sub === 'clear') {
            const data = loadReminders();
            saveReminders(data.filter(r => r.userId !== userId));
            await interaction.reply({ content: '🗑️ All your reminders have been cleared.', ephemeral: true });
        }
    }
};
