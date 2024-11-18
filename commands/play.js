const MyCustomExtractor = require('./../myCustomExtractor');
const { Client, Message } = require('discord.js');

module.exports = {
    name: 'play',
    description: 'Toca uma música ou um link indicado',
    aliases: ['p'],
    inVoiceChannel: true,
    execute: async (message, client, args) => {
        const string = args.join(' ');
        if (!string) {
            return message.channel.send('Não dá pra procurar nada desse jeito!');
        }

        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|playlist\?|channel\/|user\/|c\/)?[A-Za-z0-9_-]+/;
        let url;

        console.log(`Procurando por: ${string}`);

        // Verifica se a string é um link do YouTube
        if (string.startsWith('http')) {
            if (!youtubeRegex.test(string)) {
                return message.channel.send('Tá querendo me enganar? Isso não é um link do YouTube!');
            } else {
                url = string;
                message.channel.send(`Coe ${message.author.displayName}, vou tocar esse link`);
                console.log(`Link do YouTube identificado: ${url}`);
            }
        } else {
            try {
                // Caso não seja um link, utiliza o MyCustomExtractor para resolver o nome
                console.log('Tentando resolver o nome com MyCustomExtractor...');
                const teste = new MyCustomExtractor();
                const resolved = await teste.resolve(string);

                if (!resolved || !resolved.url) {
                    return message.channel.send('Achei bosta! Não consegui resolver esse link.');
                }

                url = resolved.url;
                message.channel.send(`Coe ${message.author.displayName}, achei essa aqui ${url}. Serve?`);
                console.log(`Link resolvido: ${url}`);
            } catch (error) {
                console.error('Erro ao resolver o link:', error);
                return message.channel.send('Houve um erro ao tentar resolver esse link. Tente novamente mais tarde.');
            }
        }

        // Verifica se o URL foi resolvido corretamente
        if (!url) {
            return message.channel.send('Não consegui encontrar um link válido para tocar!');
        }

        // Tocar o link
        try {
            console.log(`Tentando tocar o link: ${url}`);
            await client.distube.play(message.member.voice.channel, url, {
                member: message.member,
                textChannel: message.channel,
                message,
            });
        } catch (error) {
            console.error('Erro ao tentar tocar o link:', error);

            // Verifica se o erro é relacionado ao yt-dlp
            if (error.message && error.message.includes('YTDLP_ERROR')) {
                console.error('Erro de yt-dlp detectado: O bot não pode tocar o vídeo devido a uma verificação de login no YouTube.');
                message.channel.send('Parece que houve um problema ao tentar tocar esse vídeo. Talvez seja necessário um login no YouTube para acessar o conteúdo. Tente novamente mais tarde.');
            } else {
                message.channel.send('Houve um erro ao tentar tocar a música. Tente novamente.');
            }

            // Não encerra o bot após erro
            return;
        }

        // Chama o comando save para armazenar o link
        const saveCommand = client.commands.get('save');
        if (saveCommand) {
            console.log('Salvando o link na biblioteca...');
            saveCommand.execute(message, client, [url]);
        }
    },
};
