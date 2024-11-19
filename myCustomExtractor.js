const { ExtractorPlugin } = require('distube');
const axios = require('axios');
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

class MyCustomExtractor extends ExtractorPlugin {
    constructor(options) {
        super(options);
        this.apiKey = process.env.YOUTUBE_API_KEY; // Certifique-se de ter sua chave no .env
        console.log('MyCustomExtractor initialized');
    }

    async validate(url) {
        console.log(`Validating URL: ${url}`);
        return (
            url.startsWith('https://') &&
            (url.includes('youtube.com') || url.includes('youtu.be'))
        );
    }

    async extract(url) {
        console.log(`Extracting from URL: ${url}`);
        try {
            const videoId = this.getVideoId(url);
            const info = await this.fetchVideoInfo(videoId);
            return {
                name: info.title,
                url: `https://www.youtube.com/watch?v=${videoId}`,
                thumbnail: info.thumbnail,
                duration: info.duration,
            };
        } catch (error) {
            console.error('Error extracting info:', error);
            throw error;
        }
    }

    async search(query) {
        console.log(`Searching for query: ${query}`);
        try {
            const response = await axios.get(
                `https://www.googleapis.com/youtube/v3/search`,
                {
                    params: {
                        key: this.apiKey,
                        part: 'snippet',
                        q: query,
                        type: 'video',
                        maxResults: 1,
                    },
                }
            );

            const video = response.data.items[0];
            if (video) {
                const videoId = video.id.videoId;
                const info = await this.fetchVideoInfo(videoId);
                return {
                    name: info.title,
                    url: `https://www.youtube.com/watch?v=${videoId}`,
                    thumbnail: info.thumbnail,
                    duration: info.duration,
                };
            }

            return null;
        } catch (error) {
            console.error('Error searching for video:', error);
            throw error;
        }
    }

    async resolve(query) {
        console.log(`Resolving query: ${query}`);
        if (await this.validate(query)) {
            return await this.extract(query);
        }

        return await this.search(query);
    }

    getVideoId(url) {
        const match = url.match(
            /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/
        );
        return match ? match[1] : null;
    }

    async fetchVideoInfo(videoId) {
        try {
            const response = await axios.get(
                `https://www.googleapis.com/youtube/v3/videos`,
                {
                    params: {
                        key: this.apiKey,
                        part: 'snippet,contentDetails',
                        id: videoId,
                    },
                }
            );

            const video = response.data.items[0];
            if (video) {
                const duration = this.parseDuration(
                    video.contentDetails.duration
                );
                return {
                    title: video.snippet.title,
                    thumbnail: video.snippet.thumbnails.default.url,
                    duration: duration,
                };
            }

            throw new Error('Video not found');
        } catch (error) {
            console.error('Error fetching video info:', error);
            throw error;
        }
    }

    parseDuration(duration) {
        const match = duration.match(
            /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
        );
        const hours = parseInt(match[1] || '0', 10);
        const minutes = parseInt(match[2] || '0', 10);
        const seconds = parseInt(match[3] || '0', 10);
        return hours * 3600 + minutes * 60 + seconds;
    }
}

module.exports = MyCustomExtractor;
