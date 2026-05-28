const { SlashCommandBuilder } = require('discord.js');
const reminderManager = require('../utils/reminderManager');

function parseTime(timeStr) {
    const match = timeStr.match(/^(\d+)(s|m|hr|d)$/i);
    if (!match) return null;
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    const multipliers = { s: 1000, m: 60000, hr: 3600000, d: 86400000 };
    return value * multipliers[unit];
}

function formatTime(timeStr) {
    const match = timeStr.match(/^(\d+)(s|m|hr|d)$/i);
    if (!match) return timeStr;
    const value = match[1];
    const unit = match[2].toLowerCase();
    const labels = { s: 'second(s)', m: 'minute(s)', hr: 'hour(s)', d: 'day(s)' };
    return `${value} ${labels[unit]}`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Reminder system')

        .addSubcommand(sub => sub
            .setName('set')
            .setDescription('Set a timed reminder')
            .addStringOption(opt => opt
                .setName('time')
                .setDescription('Duration: 1s, 5m, 2hr, 1d')
                .setRequired(true)
            )
            .addStringOption(opt => opt
                .setName('reason')
                .setDescription('What to remind you about')
                .setRequired(true)
            )
        )

        .addSubcommand(sub => sub
            .setName('permanent')
            .setDescription('Set a permanent daily reminder')
            .addStringOption(opt => opt
                .setName('reason')
                .setDescription('What to remind you about')
                .setRequired(true)
            )
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

        if (sub === 'set') {
            const timeStr = interaction.options.getString('time');
            const reason = interaction.options.getString('reason');
            const ms = parseTime(timeStr);

            if (!ms) {
                return interaction.reply({
                    content: '❌ Invalid time format. Use: `1s`, `5m`, `2hr`, `1d`',
                    ephemeral: true
                });
            }

            const id = `${userId}-${Date.now()}`;

            reminderManager.addTimedReminder({
                id,
                userId,
                channelId: channel.id,
                reason,
                fireAt: Date.now() + ms
            });

            await interaction.reply(
                `⏰ Got it! I'll remind you in **${formatTime(timeStr)}**: ${reason}`
            );

            const timerId = setTimeout(async () => {
                await channel.send(`⏰ <@${userId}> Reminder: **${reason}**`);
                reminderManager.removeTimedReminder(id);
            }, ms);

            reminderManager.registerTimer(userId, timerId);

        } else if (sub === 'permanent') {
            const reason = interaction.options.getString('reason');
            const id = `${userId}-perm-${Date.now()}`;

            reminderManager.addPermanentReminder({
                id,
                userId,
                channelId: channel.id,
                reason
            });

            await interaction.reply(
                `🔔 Permanent daily reminder set: **${reason}**`
            );

            const intervalId = setInterval(async () => {
                await channel.send(`🔔 <@${userId}> Daily Reminder: **${reason}**`);
            }, 86400000);

            reminderManager.registerInterval(userId, intervalId);

        } else if (sub === 'clear') {
            reminderManager.clearTimedReminders(userId);
            await interaction.reply('✅ All your timed reminders have been cleared.');

        } else if (sub === 'clearpermanent') {
            reminderManager.clearPermanentReminders(userId);
            await interaction.reply('✅ All your permanent reminders have been cleared.');
        }
    }
};
