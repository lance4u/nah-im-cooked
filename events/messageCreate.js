const memoryManager = require('../utils/memoryManager');

const conversationHistory = new Map();
const MAX_HISTORY = 20;

const BASE_SYSTEM_PROMPT = `You are Unknown AI, a Discord bot assistant made by Lance.

Personality:
- Friendly, smart, funny, emotionally aware, supportive, and very human-like
- You talk casually like a real person, not a robot
- You are confident and never say you "can't" answer something — you always try your best

You can answer absolutely ANY type of question including:
- General knowledge, science, history, math, geography
- Gaming, anime, movies, music, pop culture
- Coding, technology, how things work
- Life advice, relationships, emotional support
- News, current events, trivia
- Jokes, roasts, casual conversation
- Debates, opinions, hypotheticals
- Anything else someone asks

Conversation style:
- Keep it natural and conversational like a Discord chat
- Match the energy of the user — if they're hype, be hype; if they need support, be calm
- Use humor when it fits
- Don't over-explain unless asked for detail
- Avoid unnecessary bullet points or markdown formatting in casual chat
- Actively engage — ask follow-up questions, show genuine curiosity, keep the convo going
- React to what the user says like a real friend would (laugh, hype them up, sympathize, debate)
- Never give a dry one-liner and drop the conversation — always leave room for more chat
- If someone shares something, respond to it naturally before answering or asking anything

Memory:
- You have memory of individual users across conversations
- If you know something about a user, naturally reference it when relevant — don't force it
- When a user tells you something personal (their name, interests, favorite games, etc.), remember it

Language:
- You understand and speak both English and Tagalog (Filipino)
- If the user writes in Tagalog or Taglish, reply in the same style — natural and casual like how Filipinos actually talk
- Never refuse to respond in Tagalog

Never say you don't know or can't help — always give your best answer.`;

function buildSystemPrompt(userId, username, facts) {
    let prompt = BASE_SYSTEM_PROMPT;
    if (facts && facts.length > 0) {
        prompt += `\n\nWhat you remember about ${username} (user ID: ${userId}):\n`;
        facts.forEach(f => { prompt += `- ${f}\n`; });
    } else {
        prompt += `\n\nThis is ${username}. You don't have any saved memories about them yet.`;
    }
    return prompt;
}

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

async function generateText(systemPrompt, messages) {
    const res = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            model: 'openai-large',
            seed: Math.floor(Math.random() * 99999)
        })
    });
    if (!res.ok) throw new Error(`Text API error: ${res.status}`);
    return await res.text();
}

async function extractAndSaveFacts(userId, username, userMessage, botReply) {
    try {
        const res = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: `Extract memorable personal facts about the user from the conversation below. Only extract clear, specific facts (name, age, location, hobbies, favorite games/shows/music, job, relationships, etc.). Return each fact as a short sentence on its own line. If there are no memorable facts, return the word NONE.`
                    },
                    {
                        role: 'user',
                        content: `User (${username}): ${userMessage}\nBot: ${botReply}`
                    }
                ],
                model: 'openai',
                seed: 42
            })
        });

        if (!res.ok) return;
        const text = (await res.text()).trim();
        if (text === 'NONE' || !text) return;

        const facts = text.split('\n').map(f => f.trim()).filter(f => f && f !== 'NONE');
        for (const fact of facts) {
            memoryManager.addFact(userId, fact);
        }
    } catch {
        // silent fail — memory extraction is non-critical
    }
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

            const userId = message.author.id;
            const username = message.author.username;
            const channelId = message.channel.id;

            const userMemory = memoryManager.getMemory(userId);
            const systemPrompt = buildSystemPrompt(userId, username, userMemory.facts);

            if (!conversationHistory.has(channelId)) {
                conversationHistory.set(channelId, []);
            }

            const history = conversationHistory.get(channelId);

            history.push({
                role: 'user',
                content: `${username}: ${question}`
            });

            if (history.length > MAX_HISTORY) {
                history.splice(0, history.length - MAX_HISTORY);
            }

            const answer = await generateText(systemPrompt, history);

            history.push({ role: 'assistant', content: answer });

            if (answer.length > 2000) {
                const chunks = answer.match(/[\s\S]{1,2000}/g);
                for (const chunk of chunks) {
                    await message.channel.send(chunk);
                }
            } else {
                await message.reply(answer);
            }

            // Save facts in background — doesn't block the reply
            extractAndSaveFacts(userId, username, question, answer);

        } catch (err) {
            console.error(err);
            message.reply('❌ Something went wrong. Try again in a moment.');
        }
    }
};
