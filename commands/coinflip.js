const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, saveUser } = require('../utils/economyManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Bet coins on a coin flip.')
        .addIntegerOption(opt => opt
            .setName('amount')
            .setDescription('Amount of coins to bet')
            .setRequired(true)
            .setMinValue(1)
        )
        .addStringOption(opt => opt
            .setName('side')
            .setDescription('Heads or tails')
            .setRequired(true)
            .addChoices(
                { name: 'Heads', value: 'heads' },
                { name: 'Tails', value: 'tails' }
            )
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const user = getUser(userId);
        const amount = interaction.options.getInteger('amount');
        const choice = interaction.options.getString('side');

        if ((user.coins || 0) < amount) {
            return interaction.reply({ content: `You only have **${user.coins || 0}** coins.`, ephemeral: true });
        }

        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        const won = choice === result;

        user.coins = (user.coins || 0) + (won ? amount : -amount);
        saveUser(userId, user);

        const embed = new EmbedBuilder()
            .setColor(won ? 0x2ecc71 : 0xe74c3c)
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(won ? `The coin landed on **${result}**. You won!` : `The coin landed on **${result}**. You lost.`)
            .addFields(
                { name: won ? 'Won' : 'Lost', value: `${amount} coins`, inline: true },
                { name: 'Balance', value: user.coins.toLocaleString(), inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
