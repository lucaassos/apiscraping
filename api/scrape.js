// /api/scrape.js (versão de diagnóstico para o erro de CORS)

const express = require('express');
const axios = require('axios');
const cheerio =require('cheerio');
const cors = require('cors');

const app = express();

// --- CORREÇÃO DE CORS (TENTATIVA 2) ---
// Temporariamente permitindo requisições de QUALQUER origem para diagnóstico.
// Se isso funcionar, vamos restringir novamente para o seu domínio específico.
app.use(cors());

app.use(express.json());

// A rota continua a mesma
app.post('/', async (req, res) => {
    // Para Vercel, o caminho completo da requisição será /api/scrape,
    // então a rota no Express deve ser '/'.
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
