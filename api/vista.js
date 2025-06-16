// /api/vista.js

const axios = require('axios');

// Função auxiliar para extrair o código do imóvel do URL do site
function extractPropertyCode(url) {
    try {
        const pathSegments = new URL(url).pathname.split('/');
        const lastSegment = pathSegments.pop() || pathSegments.pop();
        const code = lastSegment.split('-').pop();
        if (!/^\d+$/.test(code)) throw new Error("Código numérico não encontrado.");
        return code;
    } catch (e) {
        throw new Error("O URL do imóvel fornecido não parece ser válido.");
    }
}

// A função principal que a Vercel irá executar
module.exports = async (req, res) => {
    // --- Configuração de CORS ---
    res.setHeader('Access-Control-Allow-Origin', 'https://lucaassos.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // --- Lógica Principal ---
    try {
        const { url } = req.body;
        const propertyCode = extractPropertyCode(url);

        // --- SUBSTITUA COM OS SEUS DADOS REAIS DO VISTA ---
        const VISTA_HOST = "https://santailh-rest.vistahost.com.br"; // Coloque o seu host aqui
        const VISTA_API_KEY = "5b5965415c1387e7424b527718991a0c";     // Coloque a sua chave de API aqui
        // ----------------------------------------------------

        const vistaApiEndpoint = `${VISTA_HOST}/imoveis/detalhes?key=${VISTA_API_KEY}&imovel=${propertyCode}&showall=1`;
        
        console.log(`[BACKEND] Chamando a API do Vista: ${vistaApiEndpoint}`);
        
        const apiResponse = await axios.get(vistaApiEndpoint);
        const apiData = apiResponse.data;

        if (!apiData) {
            throw new Error("A resposta da API do Vista está vazia.");
        }

        // Mapeia os dados da API para um formato consistente
        const propertyData = {
            title: apiData.Titulo || "Título não disponível",
            location: `${apiData.Bairro}, ${apiData.Cidade}, ${apiData.UF}`,
            price: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(apiData.ValorVenda || 0),
            description: apiData.DescricaoWeb || "Descrição não disponível.",
            mainFeatures: [
                apiData.AreaTotal ? `${apiData.AreaTotal}m²` : '',
                apiData.Dormitorios ? `${apiData.Dormitorios} Quarto(s)` : '',
                apiData.Suites ? `${apiData.Suites} Suíte(s)` : '',
                apiData.Vagas ? `${apiData.Vagas} Vaga(s)` : ''
            ].filter(Boolean),
            allFeatures: apiData.Caracteristicas || []
        };
        
        return res.status(200).json(propertyData);

    } catch (error) {
        console.error("[BACKEND ERROR]", error.response ? error.response.data : error.message);
        return res.status(500).json({ error: "Falha ao buscar dados da API do Vista." });
    }
};
