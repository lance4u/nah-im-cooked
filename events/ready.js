const { ActivityType } = require('discord.js');
const fs = require('fs');
const { joinVoiceChannel } = require('@discordjs/voice');

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

function parseDuration(str) {
    const match = str && str.match(/^(\d+)(s|m|hr|d)$/);
    if (!match) return 86400000;
    const map = { s: 1000, m: 60000, hr: 3600000, d: 86400000 };
    return parseInt(match[1]) * map[match[2]];
}

async function restoreReminders(client) {
    const data = loadReminders();
    let changed = false;

    // Restore timed reminders
    for (const reminder of [...data.timed]) {
        const msLeft = reminder.fireAt - Date.now();

        if (msLeft <= 0) {
            // Already overdue — fire immediately then remove
            try {
                const channel = await client.channels.fetch(reminder.channelId);
                await channel.send(`⏰ <@${reminder.userId}> Reminder: **${reminder.reason}**`);
            } catch (err) {
                console.error('[Reminder] Failed to send overdue reminder:', err.message);
            }
            data.timed = data.timed.filter(r => r.id !== reminder.id);
            changed = true;
        } else {
            // Fire after remaining time
            setTimeout(async () => {
                try {
                    const channel = await client.channels.fetch(reminder.channelId);
                    await channel.send(`⏰ <@${reminder.userId}> Reminder: **${reminder.reason}**`);
                } catch (err) {
                    console.error('[Reminder] Failed to send timed reminder:', err.message);
                }
                const updated = loadReminders();
                updated.timed = updated.timed.filter(r => r.id !== reminder.id);
                saveReminders(updated);
            }, msLeft);

            console.log(`[Reminders] Restored timed: "${reminder.reason}" in ${Math.round(msLeft / 60000)}m`);
        }
    }

    // Restore permanent reminders
    for (const reminder of data.permanent) {
        const ms = parseDuration(reminder.intervalStr);

        setInterval(async () => {
            try {
                const channel = await client.channels.fetch(reminder.channelId);
                await channel.send(`🔔 <@${reminder.userId}> Reminder: **${reminder.reason}**`);
            } catch (err) {
                console.error('[Reminder] Failed to send permanent reminder:', err.message);
            }
        }, ms);

        console.log(`[Reminders] Restored permanent: "${reminder.reason}" every ${reminder.intervalStr}`);
    }

    if (changed) saveReminders(data);

    const total = data.timed.length + data.permanent.length;
    if (total > 0) console.log(`[Reminders] ${total} reminder(s) restored.`);
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

        // Restore reminders after restart
        await restoreReminders(client);

        // Rejoin AFK voice channel if set
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
                console.log('[AFK] Rejoined permanent VC.');
            }
        } catch (err) {
            console.error('[AFK] Could not rejoin VC:', err.message);
        }
    }
};
