const { ActivityType } = require('discord.js');

const fs = require('fs');

const {
    joinVoiceChannel
} = require('@discordjs/voice');

module.exports = {
    name: 'ready',
    once: true,

    async execute(client) {

        console.log(
            `${client.user.tag} is online.`
        );

        client.user.setPresence({
            activities: [{
                name: 'Streaming in Unknown',
                type: ActivityType.Streaming,
                url: 'https://twitch.tv/unknown'
            }],
            status: 'online'
        });

        const afkData =
            JSON.parse(
                fs.readFileSync(
                    './config/afk.json'
                )
            );

        if (
            afkData.guildId &&
            afkData.channelId
        ) {

            try {

                const guild =
                    await client.guilds.fetch(
                        afkData.guildId
                    );

                const channel =
                    await guild.channels.fetch(
                        afkData.channelId
                    );

                joinVoiceChannel({
                    channelId: channel.id,
                    guildId: guild.id,
                    adapterCreator:
                        guild.voiceAdapterCreator
                });

                console.log(
                    'Rejoined permanent VC.'
                );

            } catch (err) {

                console.error(err);
            }
        }
    }
};