const MyCustomExtractor = require('./../myCustomExtractor');
const { Client, Message } = require('discord.js');

// Caminho para o arquivo links.txt
const path = require('path');
const filePath = path.join(__dirname, '..', 'data', 'links.txt');

// Função para salvar o link no arquivo
function saveLink(link) {
    const fs = require('fs');
    try {
        // Verifica se o arquivo existe
        if (!fs.existsSync(filePath)) {
            // Se não existir, cria um arquivo vazio
            console.log('Arquivo links.txt não encontrado, criando um novo.');
            fs.writeFileSync(filePath, '', 'utf8');
        }
        // Adiciona o link ao arquivo
        fs.appendFileSync(filePath, link + '\n', 'utf8');
        console.log(`Link adicionado ao arquivo TXT: ${link}`);
    } catch (error) {
        console.error(`Erro ao salvar link: ${error}`);
    }
}

module.exports = {
    name: 'play',
    description: 'Toca uma música ou um link indicado',
    aliases: ['p'],
    inVoiceChannel: true,
    execute: async (message, client, args) => {
        const string = args.join(' ');
        console.log(`Comando 'play' recebido com argumento: ${string}`);

        if (!string) {
            return message.channel.send('Não dá pra procurar nada desse jeito!');
        }

        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|playlist\?|channel\/|user\/|c\/)?[A-Za-z0-9_-]+/;
        let url;

        // Verifica se a string é um link do YouTube
        if (string.startsWith('http')) {
            console.log(`Verificando se é um link do YouTube: ${string}`);
            if (!youtubeRegex.test(string)) {
                return message.channel.send('Tá querendo me enganar? Isso não é um link do YouTube!');
            } else {
                url = string;
                console.log(`Link do YouTube válido: ${url}`);
                message.channel.send(`Coe ${message.author.displayName}, vou tocar esse link`);
            }
        } else {
            // Caso não seja um link, utiliza o MyCustomExtractor para resolver o nome
            console.log(`Resolvendo a música com MyCustomExtractor: ${string}`);
            const teste = new MyCustomExtractor();
            const resolved = await teste.resolve(string);

            if (!resolved || !resolved.url) {
                console.log('Nenhuma URL resolvida, retornando erro');
                return message.channel.send('Achei bosta!');
            }

            url = resolved.url;
            console.log(`URL resolvida: ${url}`);
            message.channel.send(`Coe ${message.author.displayName}, achei essa aqui ${url}. Serve?`);
        }

        // Tocar o link
        console.log(`Iniciando a reprodução da música no canal de voz: ${url}`);
        client.distube.play(message.member.voice.channel, url, {
            member: message.member,
            textChannel: message.channel,
            message,
        });

        // Chamar o comando save para armazenar o link
        const saveCommand = client.commands.get('save');
        if (saveCommand) {
            console.log(`Chamando o comando 'save' para salvar o link: ${url}`);
            saveCommand.execute(message, client, [url]);
        }
    },
};
vish