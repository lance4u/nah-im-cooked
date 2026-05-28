const {
  SlashCommandBuilder
} = require('discord.js');

const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('afk')
      .setDescription('Enable permanent VC mode'),

  async execute(interaction) {

      const channel =
          interaction.member.voice.channel;

      if (!channel) {
          return interaction.reply(
              '❌ Join a VC first.'
          );
      }

      fs.writeFileSync(
          './config/afk.json',

          JSON.stringify({
              guildId: interaction.guild.id,
              channelId: channel.id
          }, null, 2)
      );

      interaction.reply(
          `✅ Permanent AFK VC saved: ${channel.id}`
      );
  }
};