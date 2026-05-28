const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require('discord.js');

const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('setvc')
      .setDescription('Set permanent VC manually')

      .addStringOption(option =>
          option
              .setName('vcid')
              .setDescription('Voice Channel ID')
              .setRequired(true)
      )

      .setDefaultMemberPermissions(
          PermissionFlagsBits.Administrator
      ),

  async execute(interaction) {

      const vcid =
          interaction.options.getString('vcid');

      fs.writeFileSync(
          './config/afk.json',

          JSON.stringify({
              guildId: interaction.guild.id,
              channelId: vcid
          }, null, 2)
      );

      interaction.reply(
          `✅ VC ID saved: ${vcid}`
      );
  }
};