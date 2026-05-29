const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const AFK_FILE = './config/afk_users.json';

function loadAFK() {
    try {
        return JSON.parse(fs.readFileSync(AFK_FILE));
    } catch (err) {
        return {};
    }
}

function saveAFK(data) {
    fs.writeFileSync(AFK_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Set your AFK status globally.')
        .addStringOption(opt =>
            opt.setName('reason')
                .setDescription('Why you are going AFK')
                .setRequired(false)
        ),

    async execute(interaction) {
        const reason = interaction.options.getString('reason') || 'No reason given';
        const userId = interaction.user.id;

        const data = loadAFK();
        data[userId] = {
            reason,
            since: Date.now(),
            username: interaction.user.username
        };
        saveAFK(data);

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`✅ You are now AFK: **${reason}**`)
            .setFooter({ text: 'You will be unmarked AFK when you send a message.' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
