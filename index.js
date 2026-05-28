require('dotenv').config();

const http = require('http');
const fs = require('fs');

// Health check server required for deployment
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot is running.');
}).listen(8080);

const {
    Client,
    Collection,
    GatewayIntentBits
} = require('discord.js');

const client = new Client({

    intents: [

        GatewayIntentBits.Guilds,

        GatewayIntentBits.GuildMessages,

        GatewayIntentBits.MessageContent,

        GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands =
    new Collection();

const commandFiles =
    fs.readdirSync('./commands')
    .filter(file =>
        file.endsWith('.js')
    );

for (const file of commandFiles) {

    const command =
        require(`./commands/${file}`);

    client.commands.set(
        command.data.name,
        command
    );
}

const eventFiles =
    fs.readdirSync('./events')
    .filter(file =>
        file.endsWith('.js')
    );

for (const file of eventFiles) {

    const event =
        require(`./events/${file}`);

    if (event.once) {

        client.once(
            event.name,

            (...args) =>
                event.execute(
                    ...args,
                    client
                )
        );

    } else {

        client.on(
            event.name,

            (...args) =>
                event.execute(
                    ...args,
                    client
                )
        );
    }
}

client.login(
    process.env.TOKEN
);