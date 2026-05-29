const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, saveUser } = require('../utils/economyManager');

const ANIMAL_VALUES = {
    Rabbit: 8, Chicken: 6, Duck: 7, Pig: 10, Sheep: 9,
    Fox: 25, Deer: 30, Owl: 28, Otter: 35,
    Wolf: 75, Eagle: 80, Panther: 90,
    Dragon: 200, Phoenix: 250,
    'Celestial Fox': 600, Leviathan: 800,
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sell')
        .setDescription('Sell animals from your zoo for coins.')
        .addStringOption(opt => opt
            .setName('animal')
            .setDescription('Animal name to sell, or "all" to sell everything')
            .setRequired(true)
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const user = getUser(userId);
        const input = interaction.options.getString('animal').toLowerCase();
        const animals = user.animals || {};

        if (!Object.keys(animals).length) {
            return interaction.reply({ content: 'You have no animals to sell.', ephemeral: true });
        }

        let earned = 0;
        let soldDesc = '';

        if (input === 'all') {
            for (const [name, count] of Object.entries(animals)) {
                const val = (ANIMAL_VALUES[name] || 5) * count;
                earned += val;
                soldDesc += `${name} ×${count} — ${val} coins\n`;
            }
            user.animals = {};
        } else {
            const match = Object.keys(animals).find(n => n.toLowerCase() === input);
            if (!match) {
                return interaction.reply({ content: `You don't have any **${input}** in your zoo.`, ephemeral: true });
            }
            const count = animals[match];
            earned = (ANIMAL_VALUES[match] || 5) * count;
            soldDesc = `${match} ×${count} — ${earned} coins`;
            delete user.animals[match];
        }

        user.coins = (user.coins || 0) + earned;
        saveUser(userId, user);

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(soldDesc.trim())
            .addFields(
                { name: 'Total Earned', value: `+${earned} coins`, inline: true },
                { name: 'Balance', value: user.coins.toLocaleString(), inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
