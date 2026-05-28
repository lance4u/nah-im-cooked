require('dotenv').config();

const express = require('express');
const fs = require('fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

// ─── Keep-alive web server ────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.status(200).send('Bot is online.');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Keep-alive server running on port ${PORT}`);
});

// ─── Global error handlers ────────────────────────────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
    console.error('[UnhandledRejection]', reason);
});

process.on('uncaughtException', (err) => {
    console.error('[UncaughtException]', err);
});

// ─── Discord client ───────────────────────────────────────────────────────────
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands = new Collection();

// ─── Load commands ────────────────────────────────────────────────────────────
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    console.log(`[Commands] Loaded: ${command.data.name}`);
}

// ─── Load events ──────────────────────────────────────────────────────────────
const eventFiles = fs.readdirSync('./events').filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
    console.log(`[Events] Loaded: ${event.name}`);
}

// ─── Discord login ────────────────────────────────────────────────────────────
if (!process.env.TOKEN) {
    console.error('[Error] TOKEN is missing from environment variables.');
    process.exit(1);
}

client.login(process.env.TOKEN).catch(err => {
    console.error('[Discord] Login failed:', err.message);
    process.exit(1);
});
