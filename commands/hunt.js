const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, saveUser } = require('../utils/economyManager');

const ANIMALS = [
    { name: 'Rabbit',       rarity: 'Common',    value: 8,   weight: 18 },
    { name: 'Chicken',      rarity: 'Common',    value: 6,   weight: 18 },
    { name: 'Duck',         rarity: 'Common',    value: 7,   weight: 16 },
    { name: 'Pig',          rarity: 'Common',    value: 10,  weight: 14 },
    { name: 'Sheep',        rarity: 'Common',    value: 9,   weight: 12 },
    { name: 'Fox',          rarity: 'Uncommon',  value: 25,  weight: 8  },
    { name: 'Deer',         rarity: 'Uncommon',  value: 30,  weight: 7  },
    { name: 'Owl',          rarity: 'Uncommon',  value: 28,  weight: 6  },
    { name: 'Otter',        rarity: 'Uncommon',  value: 35,  weight: 5  },
    { name: 'Wolf',         rarity: 'Rare',      value: 75,  weight: 4  },
    { name: 'Eagle',        rarity: 'Rare',      value: 80,  weight: 3  },
    { name: 'Panther',      rarity: 'Rare',      value: 90,  weight: 2  },
    { name: 'Dragon',       rarity: 'Epic',      value: 200, weight: 1  },
    { name: 'Phoenix',      rarity: 'Epic',      value: 250, weight: 0.7 },
    { name: 'Celestial Fox',rarity: 'Legendary', value: 600, weight: 0.2 },
    { name: 'Leviathan',    rarity: 'Legendary', value: 800, weight: 0.1 },
];

const RARITY_COLORS = {
    Common: 0x95a5a6,
    Uncommon: 0x2ecc71,
    Rare: 0x3498db,
    Epic: 0x9b59b6,
    Legendary: 0xf1c40f,
};

const HUNT_COOLDOWN = 30 * 1000;

function roll() {
    const total = ANIMALS.reduce((s, a) => s + a.weight, 0);
    let rand = Math.random() * total;
    for (const animal of ANIMALS) {
        rand -= animal.weight;
        if (rand <= 0) return animal;
    }
    return ANIMALS[0];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hunt')
        .setDescription('Hunt for animals and earn coins.'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const user = getUser(userId);
        const now = Date.now();

        if (user.lastHunt && now - user.lastHunt < HUNT_COOLDOWN) {
            const remaining = Math.ceil((HUNT_COOLDOWN - (now - user.lastHunt)) / 1000);
            return interaction.reply({ content: `You need to wait **${remaining}s** before hunting again.`, ephemeral: true });
        }

        const animal = roll();
        const coins = animal.value + Math.floor(Math.random() * 10);

        user.coins += coins;
        user.lastHunt = now;
        if (!user.animals) user.animals = {};
        user.animals[animal.name] = (user.animals[animal.name] || 0) + 1;
        saveUser(userId, user);

        const embed = new EmbedBuilder()
            .setColor(RARITY_COLORS[animal.rarity])
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`You caught a **${animal.name}**!`)
            .addFields(
                { name: 'Rarity', value: animal.rarity, inline: true },
                { name: 'Coins Earned', value: `+${coins}`, inline: true },
                { name: 'Balance', value: `${user.coins.toLocaleString()}`, inline: true }
            )
            .setFooter({ text: 'Cooldown: 30s' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
