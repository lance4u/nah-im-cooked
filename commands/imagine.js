const { SlashCommandBuilder } = require('discord.js');

async function generateImage(prompt) {
    const encoded = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&model=flux&seed=${Math.floor(Math.random() * 99999)}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Image API error: ${res.status}`);

    const buffer = await res.arrayBuffer();
    return Buffer.from(buffer);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('imagine')
        .setDescription('Generate an AI image')
        .addStringOption(opt => opt
            .setName('prompt')
            .setDescription('Describe the image you want')
            .setRequired(true)
        ),

    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');

        await interaction.reply(`🎨 Generating image of **${prompt}**...`);

        try {
            const buffer = await generateImage(prompt);

            await interaction.editReply({
                content: `🖼️ Here's your image for: **${prompt}**`,
                files: [{
                    attachment: buffer,
                    name: 'generated.png'
                }]
            });

        } catch (err) {
            console.error(err);
            await interaction.editReply('❌ Failed to generate image. Try again.');
        }
    }
};
