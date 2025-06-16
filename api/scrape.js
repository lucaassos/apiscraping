// /api/scrape.js (versão de depuração)

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(express.json());

app.post('/', async (req, res) => {
    const { url } = req.body;
    console.log(`[LOG] Iniciando scraping para a URL: ${url}`);

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
        console.log('[LOG] HTML da página baixado com sucesso.');

        const $ = cheerio.load(html);
        console.log('[LOG] Cheerio carregado com o HTML.');

        const title = $('.title h1').text().trim();
        console.log(`[LOG] Título extraído: "${title}"`);

        const location = $('.title p').text().trim();
        console.log(`[LOG] Localização extraída: "${location}"`);

        const price = $('.price h2').text().trim();
        console.log(`[LOG] Preço extraído: "${price}"`);
        
        const description = $('.description p').text().trim();
        console.log(`[LOG] Descrição extraída: "${description.substring(0, 50)}..."`);
        
        const features = [];
        $('.features .feature-item').each((i, el) => {
            const featureText = $(el).find('span').last().text().trim();
            if(featureText) features.push(featureText);
        });
        console.log(`[LOG] Features principais extraídas: ${features.join(', ')}`);

        const characteristics = [];
        $('.characteristics ul li').each((i, el) => {
            const charText = $(el).text().trim();
            if(charText) characteristics.push(charText);
        });
        console.log(`[LOG] Características gerais extraídas: ${characteristics.join(', ')}`);
        
        const propertyData = {
          title,
          location,
          price,
          description,
          mainFeatures: features,
          allFeatures: characteristics
        };
        
        console.log('[LOG] Scraping concluído com sucesso. Enviando dados.');
        return res.status(200).json(propertyData);

    } catch (error) {
        // Agora, retornamos um erro em JSON, que a interface consegue entender.
        console.error('[ERRO] Ocorreu uma falha durante o scraping:', error);
        return res.status(500).json({ 
            error: 'Falha no servidor durante o scraping.', 
            details: error.message 
        });
    }
});

module.exports = app;
