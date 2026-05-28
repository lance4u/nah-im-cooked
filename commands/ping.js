const {
  SlashCommandBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Check bot ping'),

  async execute(interaction, client) {

      await interaction.reply(
          `🏓 Pong: ${client.ws.ping}ms`
      );
  }
};