const conversationHistory = new Map();
const MAX_HISTORY = 20;

const SYSTEM_PROMPT = `You are Unknown AI, a Discord bot assistant.

You are:
- friendly, smart, supportive, emotional, funny, helpful, and human-like

You help users with:
- advice, emotional support, questions, gaming, life, coding, and casual chatting

Keep responses concise and natural for a Discord chat. Do not use excessive formatting.`;

const IMAGE_KEYWORDS = [
    'generate image', 'create image', 'make image', 'draw image',
    'generate a picture', 'create a picture', 'make a picture',
    'generate pic', 'create pic', 'draw me', 'generate me',
    'make me a', 'create me a', 'draw a', 'generate a photo',
    'make an image', 'create an image'
];

function isImageRequest(text) {
    const lower = text.toLowerCase();
    return IMAGE_KEYWORDS.some(kw => lower.includes(kw));
}

function extractImagePrompt(text) {
    const lower = text.toLowerCase();
    for (const kw of IMAGE_KEYWORDS) {
        const idx = lower.indexOf(kw);
        if (idx !== -1) {
            const after = text.slice(idx + kw.length).trim();
            return after || text;
        }
    }
    return text;
}

async function generateImage(prompt) {
    const encoded = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&model=flux&seed=${Math.floor(Math.random() * 99999)}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Image API error: ${res.status}`);

    const buffer = await res.arrayBuffer();
    return { buffer: Buffer.from(buffer), url };
}

async function generateText(messages) {
    const res = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...messages
            ],
            model: 'openai-large',
            seed: Math.floor(Math.random() * 99999)
        })
    });

    if (!res.ok) throw new Error(`Text API error: ${res.status}`);
    return await res.text();
}

module.exports = {
    name: 'messageCreate',

    async execute(message, client) {

        if (message.author.bot) return;
        if (!message.mentions.has(client.user)) return;

        const question = message.content
            .replace(`<@${client.user.id}>`, '')
            .trim();

        if (!question) {
            return message.reply('Ask me something or say "generate image of a cat" to make an image!');
        }

        await message.channel.sendTyping();

        try {
            if (isImageRequest(question)) {
                const prompt = extractImagePrompt(question) || question;

                await message.reply(`🎨 Generating image of **${prompt}**...`);

                const { buffer } = await generateImage(prompt);

                await message.channel.send({
                    content: `🖼️ <@${message.author.id}> Here's your image:`,
                    files: [{
                        attachment: buffer,
                        name: 'generated.png'
                    }]
                });

            } else {
                const channelId = message.channel.id;

                if (!conversationHistory.has(channelId)) {
                    conversationHistory.set(channelId, []);
                }

                const history = conversationHistory.get(channelId);

                history.push({
                    role: 'user',
                    content: `${message.author.username}: ${question}`
                });

                if (history.length > MAX_HISTORY) {
                    history.splice(0, history.length - MAX_HISTORY);
                }

                const answer = await generateText(history);

                history.push({ role: 'assistant', content: answer });

                if (answer.length > 2000) {
                    const chunks = answer.match(/[\s\S]{1,2000}/g);
                    for (const chunk of chunks) {
                        await message.channel.send(chunk);
                    }
                } else {
                    await message.reply(answer);
                }
            }

        } catch (err) {
            console.error(err);
            message.reply('❌ Something went wrong. Try again in a moment.');
        }
    }
};
