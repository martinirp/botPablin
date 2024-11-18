// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();
const { exec } = require('child_process'); // Para executar comandos
const path = require('path'); // Para manipulação de caminhos de arquivos
const { google } = require('googleapis'); // API do YouTube

class MyCustomExtractor extends ExtractorPlugin {
    constructor(options) {
        super(options);
        this.youtube = google.youtube('v3'); // Instancia a API do YouTube
        this.API_KEY = process.env.API_KEY; // Sua chave de API do YouTube do .env
        console.log('MyCustomExtractor initialized');
    }

    // Caminho para o arquivo cookies.txt (se necessário)
    getCookiesPath() {
        return path.join(__dirname, '..', 'data', 'cookies.txt');
    }

    // Função de extração de vídeo usando yt-dlp via linha de comando
    async extract(url) {
        console.log(`Extracting from URL: ${url}`);
        try {
            // Passando o username e a password diretamente usando as variáveis de ambiente
            const options = {
                username: process.env.EMAIL,  // Seu email do YouTube do .env
                password: process.env.SENHA,  // Sua senha do YouTube do .env
            };

            // Comando para extrair as informações do vídeo com yt-dlp
            const command = `yt-dlp --username ${process.env.EMAIL} --password ${process.env.SENHA} --print-json ${url}`;
            
            // Executa o comando yt-dlp e obtém as informações em JSON
            const result = await new Promise((resolve, reject) => {
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        reject(`exec error: ${error}`);
                        return;
                    }
                    if (stderr) {
                        reject(`stderr: ${stderr}`);
                        return;
                    }
                    resolve(stdout); // resultado do yt-dlp em formato JSON
                });
            });

            // Faz o parse do resultado em JSON
            const video = JSON.parse(result);

            if (!video) {
                throw new Error('Video not found');
            }

            return {
                name: video.title,
                url: video.url,
                thumbnail: video.thumbnail,
                duration: video.duration,
            };
        } catch (error) {
            console.error('Error extracting info:', error);
            throw error;
        }
    }

    // Função de pesquisa usando a API do YouTube
    async search(query) {
        console.log(`Searching for query: ${query}`);
        try {
            const res = await this.youtube.search.list({
                part: 'snippet',
                q: query,
                type: 'video',
                maxResults: 1,
                key: this.API_KEY, // Chave de API do .env
            });

            const video = res.data.items[0];

            return video
                ? {
                    name: video.snippet.title,
                    url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
                    thumbnail: video.snippet.thumbnails.default.url,
                    duration: null, // A duração pode ser obtida adicionalmente
                }
                : null;
        } catch (error) {
            console.error('Error searching for video:', error);
            throw error;
        }
    }

    // Resolve a consulta, tentando extrair como URL ou buscar por string
    async resolve(query) {
        console.log(`Resolving query: ${query}`);
        // Primeiro tenta extrair como URL
        if (await this.validate(query)) {
            return await this.extract(query);
        }

        // Caso não seja uma URL, tenta buscar por string
        return await this.search(query);
    }
}

module.exports = MyCustomExtractor;
