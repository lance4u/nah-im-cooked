const {
  SlashCommandBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('help')
      .setDescription('Show all commands'),

  async execute(interaction) {

      await interaction.reply(`
📘 Commands

/ping
/help
/join
/afk
/leave
/stream
/remind
/setvc
      `);
  }
};