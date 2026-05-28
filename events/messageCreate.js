const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const conversationHistory = new Map();
const MAX_HISTORY = 20;

const SYSTEM_PROMPT = `
You are Unknown AI.

You are:
- friendly
- smart
- supportive
- emotional
- funny
- helpful
- human-like

You help users with:
- advice
- emotional support
- questions
- gaming
- life
- coding
- casual chatting
`;

module.exports = {
    name: 'messageCreate',

    async execute(message, client) {

        if (message.author.bot) return;

        if (!message.mentions.has(client.user)) return;

        const question = message.content
            .replace(`<@${client.user.id}>`, '')
            .trim();

        if (!question) {
            return message.reply('Ask me something.');
        }

        const channelId = message.channel.id;

        if (!conversationHistory.has(channelId)) {
            conversationHistory.set(channelId, []);
        }

        const history = conversationHistory.get(channelId);

        history.push({ role: 'user', content: `${message.author.username}: ${question}` });

        if (history.length > MAX_HISTORY) {
            history.splice(0, history.length - MAX_HISTORY);
        }

        try {

            await message.channel.sendTyping();

            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...history
                ]
            });

            const answer = response.choices[0].message.content;

            history.push({ role: 'assistant', content: answer });

            message.reply(answer);

        } catch (err) {

            console.error(err);

            message.reply('❌ AI failed to respond.');
        }
    }
};
