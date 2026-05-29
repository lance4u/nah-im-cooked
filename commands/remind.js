const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const remindersFile = './config/reminders.json';

function loadReminders() {
    try {
        const data = JSON.parse(fs.readFileSync(remindersFile));
        if (Array.isArray(data)) return { timed: [], permanent: [] };
        return data;
    } catch {
        return { timed: [], permanent: [] };
    }
}

function saveReminders(data) {
    fs.writeFileSync(remindersFile, JSON.stringify(data, null, 2));
}

function parseDuration(duration) {
    const match = duration.match(/^(\d+)(s|m|hr|d)$/);
    if (!match) return null;
    const value = parseInt(match[1]);
    const unit = match[2];
    const map = { s: 1000, m: 60000, hr: 3600000, d: 86400000 };
    return value * map[unit];
}

function formatDuration(duration) {
    const match = duration.match(/^(\d+)(s|m|hr|d)$/);
    if (!match) return duration;
    const labels = { s: 'second(s)', m: 'minute(s)', hr: 'hour(s)', d: 'day(s)' };
    return `${match[1]} ${labels[match[2]]}`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Reminder system')
        .addSubcommand(sub => sub
            .setName('set')
            .setDescription('Set a one-time reminder')
            .addStringOption(opt => opt.setName('time').setDescription('Duration: 1s, 5m, 2hr, 1d').setRequired(true))
            .addStringOption(opt => opt.setName('reason').setDescription('What to remind you about').setRequired(true))
        )
        .addSubcommand(sub => sub
            .setName('permanent')
            .setDescription('Set a repeating permanent reminder')
            .addStringOption(opt => opt.setName('time').setDescription('Repeat every: 1s, 5m, 2hr, 1d').setRequired(true))
            .addStringOption(opt => opt.setName('reason').setDescription('What to remind you about').setRequired(true))
        )
        .addSubcommand(sub => sub
            .setName('list')
            .setDescription('View all your active reminders')
        )
        .addSubcommand(sub => sub
            .setName('clear')
            .setDescription('Clear all your timed reminders')
        )
        .addSubcommand(sub => sub
            .setName('clearpermanent')
            .setDescription('Clear all your permanent reminders')
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const channel = interaction.channel;
        const data = loadReminders();

        if (sub === 'set') {
            const timeStr = interaction.options.getString('time');
            const reason = interaction.options.getString('reason');
            const ms = parseDuration(timeStr);

            if (!ms) return interaction.reply({ content: 'Invalid format. Use: `1s`, `5m`, `2hr`, `1d`', ephemeral: true });

            const id = `${userId}-${Date.now()}`;
            data.timed.push({ id, userId, channelId: channel.id, reason, fireAt: Date.now() + ms });
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
                await channel.send(`<@${userId}> Reminder: **${reason}**`);
                const updated = loadReminders();
                updated.timed = updated.timed.filter(r => r.id !== id);
                saveReminders(updated);
            }, ms);

        } else if (sub === 'permanent') {
            const timeStr = interaction.options.getString('time');
            const reason = interaction.options.getString('reason');
            const ms = parseDuration(timeStr);

            if (!ms) return interaction.reply({ content: 'Invalid format. Use: `1s`, `5m`, `2hr`, `1d`', ephemeral: true });

            const id = `${userId}-perm-${Date.now()}`;
            data.permanent.push({ id, userId, channelId: channel.id, reason, intervalStr: timeStr });
            saveReminders(data);

            const embed = new EmbedBuilder()
                .setColor(0x2b2d31)
                .setAuthor({ name: 'Permanent Reminder Set', iconURL: interaction.user.displayAvatarURL() })
                .addFields(
                    { name: 'Reason', value: reason, inline: true },
                    { name: 'Every', value: formatDuration(timeStr), inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            setInterval(async () => {
                await channel.send(`<@${userId}> Reminder: **${reason}**`);
            }, ms);

        } else if (sub === 'list') {
            const timed = data.timed.filter(r => r.userId === userId);
            const permanent = data.permanent.filter(r => r.userId === userId);

            if (!timed.length && !permanent.length) {
                return interaction.reply({ content: 'You have no active reminders.', ephemeral: true });
            }

            let desc = '';
            if (timed.length) {
                desc += '**Timed**\n';
                timed.forEach((r, i) => {
                    const msLeft = Math.max(0, r.fireAt - Date.now());
                    const mins = Math.floor(msLeft / 60000);
                    const hrs = Math.floor(mins / 60);
                    const days = Math.floor(hrs / 24);
                    const left = days > 0 ? `${days}d left` : hrs > 0 ? `${hrs}h left` : `${mins}m left`;
                    desc += `${i + 1}. **${r.reason}** — ${left}\n`;
                });
                desc += '\n';
            }
            if (permanent.length) {
                desc += '**Permanent**\n';
                permanent.forEach((r, i) => {
                    desc += `${i + 1}. **${r.reason}** — every ${formatDuration(r.intervalStr || '1d')}\n`;
                });
            }

            const embed = new EmbedBuilder()
                .setColor(0x2b2d31)
                .setAuthor({ name: 'Your Reminders', iconURL: interaction.user.displayAvatarURL() })
                .setDescription(desc)
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });

        } else if (sub === 'clear') {
            data.timed = data.timed.filter(r => r.userId !== userId);
            saveReminders(data);
            await interaction.reply({ content: 'Timed reminders cleared.', ephemeral: true });

        } else if (sub === 'clearpermanent') {
            data.permanent = data.permanent.filter(r => r.userId !== userId);
            saveReminders(data);
            await interaction.reply({ content: 'Permanent reminders cleared.', ephemeral: true });
        }
    }
};
