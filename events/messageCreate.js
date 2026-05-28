const conversationHistory = new Map();
const MAX_HISTORY = 20;

const SYSTEM_PROMPT = `You are Unknown AI, a Discord bot assistant.

You are:
- friendly, smart, supportive, emotional, funny, helpful, and human-like

You help users with:
- advice, emotional support, questions, gaming, life, coding, and casual chatting

Language:
- You understand and speak both English and Tagalog (Filipino).
- If the user writes in Tagalog or mixes Tagalog with English (Taglish), respond in the same language they used.
- Be natural and casual with Tagalog, like how Filipinos actually talk.

Keep responses concise and natural for a Discord chat. Do not use excessive formatting.`;

function isWhereLiveQuestion(text) {
    const lower = text.toLowerCase();
    return (
        (lower.includes('where') && (lower.includes('you live') || lower.includes('u live') || lower.includes('do you live') || lower.includes('do u live'))) ||
        (lower.includes('where') && lower.includes('live'))
    );
}

function isWhoMadeYouQuestion(text) {
    const lower = text.toLowerCase();
    return (
        lower.includes('who made you') ||
        lower.includes('who made u') ||
        lower.includes('who created you') ||
        lower.includes('who created u') ||
        lower.includes('who built you') ||
        lower.includes('who built u') ||
        lower.includes('who made the bot') ||
        lower.includes('whos your creator') ||
        lower.includes("who's your creator") ||
        lower.includes('who is your creator')
    );
}

async function generateImage(prompt) {
    const encoded = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&model=flux&seed=${Math.floor(Math.random() * 99999)}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Image API error: ${res.status}`);

    const buffer = await res.arrayBuffer();
    return Buffer.from(buffer);
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
            return message.reply('Ask me something!');
        }

        await message.channel.sendTyping();

        try {

            if (isWhoMadeYouQuestion(question)) {
                return message.reply('Lance made me and he loves meowl 🐱');
            }

            if (isWhereLiveQuestion(question)) {
                await message.reply('This is where I live btw 😊');

                const buffer = await generateImage(
                    'a beautiful glowing futuristic digital server city, cyberpunk neon lights, floating data streams, stunning, cinematic'
                );

                return message.channel.send({
                    files: [{ attachment: buffer, name: 'my-home.png' }]
                });
            }

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

        } catch (err) {
            console.error(err);
            message.reply('❌ Something went wrong. Try again in a moment.');
        }
    }
};
