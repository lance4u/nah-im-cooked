const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('../utils/economyManager');

const RARITY_ORDER = ['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'];

const ANIMAL_RARITY = {
    Rabbit: 'Common', Chicken: 'Common', Duck: 'Common', Pig: 'Common', Sheep: 'Common',
    Fox: 'Uncommon', Deer: 'Uncommon', Owl: 'Uncommon', Otter: 'Uncommon',
    Wolf: 'Rare', Eagle: 'Rare', Panther: 'Rare',
    Dragon: 'Epic', Phoenix: 'Epic',
    'Celestial Fox': 'Legendary', Leviathan: 'Legendary',
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('zoo')
        .setDescription('View your collected animals.')
        .addUserOption(opt => opt
            .setName('user')
            .setDescription('View another user\'s zoo')
            .setRequired(false)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;
        const user = getUser(target.id);
        const animals = user.animals || {};

        if (!Object.keys(animals).length) {
            return interaction.reply({
                content: target.id === interaction.user.id
                    ? 'Your zoo is empty. Use `/hunt` to catch some animals!'
                    : `${target.username}'s zoo is empty.`,
                ephemeral: true
            });
        }

        const grouped = {};
        for (const [name, count] of Object.entries(animals)) {
            const rarity = ANIMAL_RARITY[name] || 'Common';
            if (!grouped[rarity]) grouped[rarity] = [];
            grouped[rarity].push(`${name} ×${count}`);
        }

        const total = Object.values(animals).reduce((s, c) => s + c, 0);
        let desc = '';
        for (const rarity of RARITY_ORDER) {
            if (grouped[rarity]) {
                desc += `**${rarity}**\n${grouped[rarity].join(' · ')}\n\n`;
            }
        }

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setAuthor({ name: `${target.username}'s Zoo`, iconURL: target.displayAvatarURL() })
            .setDescription(desc.trim())
            .setFooter({ text: `${total} total animals` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
