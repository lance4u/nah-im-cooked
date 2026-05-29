const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, saveUser } = require('../utils/economyManager');

const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;
const BASE_REWARD = 200;
const STREAK_BONUS = 25;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily coins.'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const user = getUser(userId);
        const now = Date.now();

        if (user.lastDaily && now - user.lastDaily < DAILY_COOLDOWN) {
            const next = user.lastDaily + DAILY_COOLDOWN;
            return interaction.reply({
                content: `You already claimed today. Come back <t:${Math.floor(next / 1000)}:R>.`,
                ephemeral: true
            });
        }

        const withinStreak = user.lastDaily && now - user.lastDaily < DAILY_COOLDOWN * 2;
        user.streak = withinStreak ? (user.streak || 0) + 1 : 1;
        const reward = BASE_REWARD + (user.streak - 1) * STREAK_BONUS;

        user.coins = (user.coins || 0) + reward;
        user.lastDaily = now;
        saveUser(userId, user);

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`Daily reward claimed.`)
            .addFields(
                { name: 'Reward', value: `+${reward} coins`, inline: true },
                { name: 'Streak', value: `${user.streak} day${user.streak > 1 ? 's' : ''}`, inline: true },
                { name: 'Balance', value: user.coins.toLocaleString(), inline: true }
            )
            .setFooter({ text: 'Come back tomorrow for more. Streak adds +25 per day.' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
