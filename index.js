// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { DisTube } = require('distube');

// Caminho do FFmpeg no Windows (ajuste para o seu ambiente)
const ffmpegPath = process.platform === 'win32' 
    ? 'C:\\ffmpeg\\bin\\ffmpeg.exe' // Caminho absoluto no Windows
    : require('ffmpeg-static').path || '/usr/bin/ffmpeg'; // Para sistemas não Windows (Linux, Docker, etc.)

// Load dotenv variables
require('dotenv').config();

const token = process.env.DISCORD_TOKEN;
const proxy = process.env.PROXY_URL || 'http://45.77.89.0:8080'; // Proxy padrão ou via .env

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection();
client.aliases = new Collection();
client.slashCommands = new Collection();

// Register prefix commands
require('./registers/commands-register')(client);

// Configure DisTube
client.distube = new DisTube(client, {
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: false,
    emitAddListWhenCreatingQueue: false,
    savePreviousSongs: true,
    nsfw: true,
    plugins: [
        new YtDlpPlugin({
            ytDownloadOptions: {
                proxy: proxy, // Adiciona o suporte ao proxy
            },
        }),
    ],
    ffmpeg: { path: ffmpegPath }, // Usa o caminho correto do FFmpeg
});

// Handle DisTube errors (including YouTube restrictions)
client.distube.on('error', async (channel, error) => {
    try {
        console.error(`Erro de DisTube: ${error.message}`);
        await channel.send('Ocorreu um erro ao tentar reproduzir o vídeo. Certifique-se de que o link é válido.');
    } catch (e) {
        console.error(`Erro ao lidar com erro do DisTube: ${e.message}`);
        if (channel) {
            await channel.send('Ocorreu um erro inesperado ao lidar com a reprodução.');
        }
    }
});

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Register the mention command
const mentionCommand = require('./commands/mention'); // Ajuste o caminho, se necessário

client.on('messageCreate', async (message) => {
    const prefix = "'";

    if (message.author.bot || !message.guild) return;

    if (message.mentions.has(client.user)) {
        if (mentionCommand) {
            try {
                await mentionCommand.execute(message, client);
            } catch (e) {
                console.error(e);
                message.channel.send(`Erro ao executar o comando: \`${e.message}\``);
            }
        }
        return;
    }

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const commandTyped = args.shift().toLowerCase();

    const cmd =
        client.commands.get(commandTyped) ||
        client.commands.get(client.aliases.get(commandTyped));

    if (!cmd) return;

    if (cmd.inVoiceChannel && !message.member.voice.channel) {
        return message.channel.send('Você deve estar em um canal de voz!');
    }

    try {
        await cmd.execute(message, client, args);
    } catch (e) {
        console.error(e);
        message.channel.send(`Erro: \`${e.message}\``);
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.slashCommands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        const replyContent = 'There was an error while executing this command!';
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: replyContent, ephemeral: true });
        } else {
            await interaction.reply({ content: replyContent, ephemeral: true });
        }
    }
});

// Log in to Discord with your client's token
client.login(token);
