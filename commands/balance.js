const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('../utils/economyManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your coin balance.')
        .addUserOption(opt => opt
            .setName('user')
            .setDescription('Check another user\'s balance')
            .setRequired(false)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;
        const user = getUser(target.id);
        const animalCount = Object.values(user.animals || {}).reduce((s, c) => s + c, 0);

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setAuthor({ name: target.tag, iconURL: target.displayAvatarURL() })
            .addFields(
                { name: 'Coins', value: (user.coins || 0).toLocaleString(), inline: true },
                { name: 'Animals', value: `${animalCount}`, inline: true },
                { name: 'Streak', value: `${user.streak || 0} day(s)`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
