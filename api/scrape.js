// /api/scrape.js (versão final, sem código de CORS)

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

// O código de CORS foi completamente removido.
// O arquivo vercel.json agora é o único responsável por gerenciar as permissões.

app.use(express.json());

// A rota para o scraping
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
