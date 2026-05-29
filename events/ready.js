const { ActivityType } = require('discord.js');
const fs = require('fs');
const { joinVoiceChannel } = require('@discordjs/voice');

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

async function restoreReminders(client) {
    const data = loadReminders();
    const remaining = [];

    for (const reminder of data) {
        const msLeft = reminder.fireAt - Date.now();

        if (msLeft <= 0) {
            try {
                const channel = await client.channels.fetch(reminder.channelId);
                await channel.send(`⏰ <@${reminder.userId}> Reminder: **${reminder.reason}**`);
            } catch (err) {
                console.error('[Reminder] Failed to send overdue reminder:', err.message);
            }
        } else {
            remaining.push(reminder);
            setTimeout(async () => {
                try {
                    const channel = await client.channels.fetch(reminder.channelId);
                    await channel.send(`⏰ <@${reminder.userId}> Reminder: **${reminder.reason}**`);
                } catch (err) {
                    console.error('[Reminder] Failed to send reminder:', err.message);
                }
                const updated = loadReminders();
                saveReminders(updated.filter(r => r.id !== reminder.id));
            }, msLeft);

            console.log(`[Reminders] Restored: "${reminder.reason}" in ${Math.round(msLeft / 60000)}m`);
        }
    }

    saveReminders(remaining);
    if (remaining.length > 0) console.log(`[Reminders] ${remaining.length} reminder(s) restored.`);
}

module.exports = {
    name: 'ready',
    once: true,

    async execute(client) {
        console.log(`${client.user.tag} is online.`);

        client.user.setPresence({
            activities: [{
                name: 'Streaming in Unknown',
                type: ActivityType.Streaming,
                url: 'https://twitch.tv/unknown'
            }],
            status: 'online'
        });

        await restoreReminders(client);

        try {
            const afkData = JSON.parse(fs.readFileSync('./config/afk.json'));
            if (afkData.guildId && afkData.channelId) {
                const guild = await client.guilds.fetch(afkData.guildId);
                const channel = await guild.channels.fetch(afkData.channelId);
                joinVoiceChannel({
                    channelId: channel.id,
                    guildId: guild.id,
                    adapterCreator: guild.voiceAdapterCreator
                });
                console.log('[VC] Rejoined permanent voice channel.');
            }
        } catch (err) {
            console.error('[VC] Could not rejoin voice channel:', err.message);
        }
    }
};
