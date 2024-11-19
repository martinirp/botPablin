// Requer o dotenv para carregar variáveis do arquivo .env
require('dotenv').config();
const axios = require('axios');

// Obtém o proxy da variável de ambiente
const proxy = process.env.PROXY_URL || 'http://127.0.0.1:8080'; // Proxy padrão caso a variável não seja encontrada

// URL para testar
const url = 'http://www.google.com';

// Faz a requisição HTTP passando pelo proxy
axios.get(url, { 
  proxy: {
    host: new URL(proxy).hostname,  // Obtém o hostname do proxy
    port: new URL(proxy).port       // Obtém a porta do proxy
  }
})
  .then(response => {
    console.log('Conexão bem-sucedida:', response.status);
  })
  .catch(error => {
    console.error('Erro ao conectar ao proxy:', error.message);
  });
