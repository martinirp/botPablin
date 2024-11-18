const { ExtractorPlugin } = require('distube');
const { google } = require('googleapis');
const path = require('path');

class MyCustomExtractor extends ExtractorPlugin {
    constructor(options) {
        super(options);
        this.youtube = google.youtube('v3'); // Instancia a API do YouTube
        this.API_KEY = 'AIzaSyC2LtwuJWKtZLMEiVlhEaFSGcxYGYNHuoA'; // Substitua pela sua chave de API
        console.log('MyCustomExtractor initialized');
    }

    // Caminho para o arquivo cookies.txt
    getCookiesPath() {
        return path.join(__dirname, '..', 'data', 'cookies.txt');
    }

    async validate(url) {
        console.log(`Validating URL: ${url}`);
        return (
            url.startsWith('https://') ||
            url.includes('youtube.com') ||
            url.includes('youtu.be')
        );
    }

    async extract(url) {
        console.log(`Extracting from URL: ${url}`);
        try {
            // Aqui usamos a API do YouTube para pegar as informações do vídeo
            const videoId = new URL(url).searchParams.get('v'); // Obtém o ID do vídeo da URL
            const res = await this.youtube.videos.list({
                part: 'snippet,contentDetails', // Obtém as informações do vídeo
                id: videoId,
                key: this.API_KEY,
            });
            const video = res.data.items[0];

            if (!video) {
                throw new Error('Video not found');
            }

            return {
                name: video.snippet.title,
                url: video.snippet.url, // URL do vídeo
                thumbnail: video.snippet.thumbnails.default.url,
                duration: video.contentDetails.duration, // Duração do vídeo
            };
        } catch (error) {
            console.error('Error extracting info:', error);
            throw error;
        }
    }

    async search(query) {
        console.log(`Searching for query: ${query}`);
        try {
            const res = await this.youtube.search.list({
                part: 'snippet',
                q: query,
                type: 'video',
                maxResults: 1,
                key: this.API_KEY,
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
