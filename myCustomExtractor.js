// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();
const ytDlp = require('yt-dlp'); // ou a ferramenta que você estiver usando
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

    async extract(url) {
        console.log(`Extracting from URL: ${url}`);
        try {
            // Passando o username e a password diretamente usando as variáveis de ambiente
            const options = {
                username: process.env.EMAIL,  // Seu email do YouTube do .env
                password: process.env.SENHA,  // Sua senha do YouTube do .env
            };

            const res = await ytDlp.getInfo(url, options);
            const video = res;

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

    // Função de pesquisa pode ser ajustada da mesma maneira
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
