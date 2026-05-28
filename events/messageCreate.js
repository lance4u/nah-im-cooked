const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey:
        process.env.OPENAI_API_KEY
});

module.exports = {
    name: 'messageCreate',

    async execute(message, client) {

        if (message.author.bot) return;

        if (
            !message.mentions.has(
                client.user
            )
        ) return;

        const question =
            message.content
                .replace(
                    `<@${client.user.id}>`,
                    ''
                )
                .trim();

        if (!question) {

            return message.reply(
                'Ask me something.'
            );
        }

        try {

            await message.channel
                .sendTyping();

            const response =
                await openai.chat.completions.create({

                model: 'gpt-4o-mini',

                messages: [
                    {
                        role: 'system',

                        content: `
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
`
                    },

                    {
                        role: 'user',
                        content: question
                    }
                ]
            });

            const answer =
                response.choices[0]
                    .message.content;

            message.reply(answer);

        } catch (err) {

            console.error(err);

            message.reply(
                '❌ AI failed to respond.'
            );
        }
    }
};