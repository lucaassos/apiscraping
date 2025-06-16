// /api/scrape.js (versão final, tudo-em-um, sem vercel.json)

const axios = require('axios');
const cheerio = require('cheerio');

// Esta é a função principal que a Vercel irá rodar.
module.exports = async (req, res) => {
    // Adicionamos um log no início absoluto da função para garantir que ela seja chamada.
    console.log(`[LOG] Função /api/scrape foi invocada. Método: ${req.method}`);

    // --- Configuração de CORS diretamente na função ---
    // Isso garante que a Vercel envie os cabeçalhos corretos na resposta.
    res.setHeader('Access-Control-Allow-Origin', 'https://lucaassos.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Se o navegador enviar o "pedido de permissão" (OPTIONS), respondemos OK e paramos aqui.
    if (req.method === 'OPTIONS') {
        console.log('[LOG] Requisição OPTIONS recebida. Respondendo com status 200.');
        return res.status(200).end();
    }
    
    // --- Lógica de Scraping ---
    try {
        // Garantimos que a requisição é do tipo POST para a lógica principal
        if (req.method !== 'POST') {
            console.log(`[AVISO] Método ${req.method} não é POST. Ignorando.`);
            return res.status(405).json({ error: 'Método não permitido. Use POST.' });
        }

        const { url } = req.body;
        console.log(`[LOG] Iniciando scraping para a URL: ${url}`);

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
        
        console.log('[LOG] Scraping concluído com sucesso.');
        return res.status(200).json(propertyData);

    } catch (error) {
        console.error('[ERRO] Falha durante o scraping:', error.message);
        return res.status(500).json({ 
            error: 'Falha no servidor durante o scraping.', 
            details: error.message 
        });
    }
};
