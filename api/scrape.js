// /api/scrape.js (versão 3, com headers manuais para CORS)

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

// --- CORREÇÃO DE CORS (TENTATIVA 3 - Manual) ---
// Em vez de usar a biblioteca `cors`, vamos definir os headers manualmente.
// Isso nos dá controle total e pode resolver problemas de configuração na Vercel.
app.use((req, res, next) => {
  // Permite que qualquer domínio acesse este backend. Depois de funcionar,
  // podemos trocar '*' por 'https://lucaassos.github.io'.
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Define os métodos HTTP permitidos na comunicação.
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  // Define os cabeçalhos que o navegador pode enviar na requisição.
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // O navegador envia uma requisição 'OPTIONS' primeiro (preflight check).
  // Se o método da requisição for 'OPTIONS', nós simplesmente respondemos 'OK' (200),
  // o que sinaliza ao navegador que a requisição POST seguinte é permitida.
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  // Se não for uma requisição OPTIONS, continua para a nossa rota normal.
  next();
});

app.use(express.json());

// A rota continua a mesma
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
