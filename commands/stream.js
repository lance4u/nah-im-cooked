const {
  SlashCommandBuilder,
  ActivityType
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('stream')
      .setDescription('Change streaming status')
      .addStringOption(option =>
          option
              .setName('text')
              .setDescription('Streaming text')
              .setRequired(true)
      ),

  async execute(interaction, client) {

      const text =
          interaction.options.getString('text');

      client.user.setPresence({
          activities: [{
              name: text,
              type: ActivityType.Streaming,
              url: 'https://twitch.tv/unknown'
          }],
          status: 'online'
      });

      await interaction.reply(
          `📺 Streaming status updated to: ${text}`
      );
  }
}