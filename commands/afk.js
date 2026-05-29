const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Save your current VC as a permanent AFK channel.'),

    async execute(interaction) {
        const channel = interaction.member.voice.channel;

        if (!channel) {
            return interaction.reply({ content: 'You need to be in a voice channel first.', ephemeral: true });
        }

        fs.writeFileSync('./config/afk.json', JSON.stringify({
            guildId: interaction.guild.id,
            channelId: channel.id
        }, null, 2));

        await interaction.reply({ content: `Permanent AFK VC set to **${channel.name}**.`, ephemeral: true });
    }
};
