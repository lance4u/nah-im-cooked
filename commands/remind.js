const {
  SlashCommandBuilder
} = require('discord.js');

const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('remind')
      .setDescription('Set a reminder')

      .addStringOption(option =>
          option
              .setName('time')
              .setDescription('Time in minutes')
              .setRequired(true)
      )

      .addStringOption(option =>
          option
              .setName('text')
              .setDescription('Reminder text')
              .setRequired(true)
      ),

  async execute(interaction) {

      const time =
          interaction.options.getString('time');

      const text =
          interaction.options.getString('text');

      const reminders =
          JSON.parse(
              fs.readFileSync(
                  './config/reminders.json'
              )
          );

      reminders.push({
          userId: interaction.user.id,
          text,
          time
      });

      fs.writeFileSync(
          './config/reminders.json',
          JSON.stringify(reminders, null, 2)
      );

      interaction.reply(
          `⏰ Reminder saved: ${text}`
      );

      setTimeout(async () => {

          await interaction.followUp(
              `<@${interaction.user.id}> Reminder: ${text}`
          );

      }, Number(time) * 60000);
  }
};