// /api/scrape.js (versão final com depuração detalhada)

const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL do imóvel é obrigatória.' });
        }

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const html = response.data;
        const $ = cheerio.load(html);

        // Depuração detalhada para cada item
        const title = $('.title h1').text()?.trim() || 'Título não encontrado';
        console.log(`[LOG] Título: ${title}`);

        const location = $('.title p').text()?.trim() || 'Localização não encontrada';
        console.log(`[LOG] Localização: ${location}`);

        const price = $('.price h2').text()?.trim() || 'Preço não encontrado';
        console.log(`[LOG] Preço: ${price}`);

        const description = $('.description p').text()?.trim() || 'Descrição não encontrada';
        console.log(`[LOG] Descrição: ${description.substring(0, 50)}...`);

        const features = [];
        $('.features .feature-item').each((i, el) => {
            const featureText = $(el).find('span').last().text()?.trim();
            if(featureText) features.push(featureText);
        });
        console.log(`[LOG] Features: ${features.join(', ')}`);

        const characteristics = [];
        $('.characteristics ul li').each((i, el) => {
            const charText = $(el).text()?.trim();
            if(charText) characteristics.push(charText);
        });
        console.log(`[LOG] Características: ${characteristics.join(', ')}`);
        
        const propertyData = {
          title,
          location,
          price,
          description,
          mainFeatures: features,
          allFeatures: characteristics
        };
        
        return res.status(200).json(propertyData);

    } catch (error) {
        // Log detalhado do erro no servidor
        console.error('[ERRO NO SERVIDOR]', {
            message: error.message,
            stack: error.stack,
        });
        
        // Resposta de erro em JSON para a interface
        return res.status(500).json({ 
            error: 'Falha crítica no servidor durante o scraping.', 
            details: error.message 
        });
    }
};
