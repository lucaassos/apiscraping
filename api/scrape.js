// /api/scrape.js (versão 6, com cors() e um manipulador OPTIONS explícito)

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors'); // Vamos usar a biblioteca novamente

const app = express();

// 1. Configuração do CORS para ser o mais permissivo possível para diagnóstico.
//    Isso diz "qualquer um pode me acessar".
app.use(cors());

// 2. Manipulador explícito para a requisição de preflight (OPTIONS).
//    Isso força uma resposta "OK" (200) para o pedido de permissão do navegador.
app.options('*', cors());

// 3. Habilita o parsing de JSON para as requisições POST.
app.use(express.json());

// A rota principal para o scraping
app.post('/', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL do imóvel é obrigatória.' });
    }

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const html = response.data;
        const $ = cheerio.load(html);

        const title = $('.title h1').text().trim();
        const location = $('.title p').text().trim();
        const price = $('.price h2').text().trim();
        const description = $('.description p').text().trim();
        const features = [];
        $('.features .feature-item').each((i, el) => {
            const featureText = $(el).find('span').last().text().trim();
            if(featureText) features.push(featureText);
        });
        const characteristics = [];
        $('.characteristics ul li').each((i, el) => {
            const charText = $(el).text().trim();
            if(charText) characteristics.push(charText);
        });
        
        const propertyData = {
          title,
          location,
          price,
          description,
          mainFeatures: features,
          allFeatures: characteristics
        };

        res.json(propertyData);

    } catch (error) {
        console.error('Erro ao fazer scraping:', error.message);
        res.status(500).json({ error: 'Falha ao extrair dados do imóvel.' });
    }
});

module.exports = app;
