const {
  SlashCommandBuilder
} = require('discord.js');

const {
  getVoiceConnection
} = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('leave')
      .setDescription('Leave VC'),

  async execute(interaction) {

      const connection =
          getVoiceConnection(interaction.guild.id);

      if (connection) {

          connection.destroy();

          interaction.reply(
              '👋 Left the voice channel.'
          );

      } else {

          interaction.reply(
              '❌ I am not in a VC.'
          );
      }
  }
};