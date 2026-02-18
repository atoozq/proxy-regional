const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// EXATAMENTE A MESMA ROTA QUE FUNCIONA NO SEU PC
app.get('/check-regional/:gamepassId', async (req, res) => {
    try {
        const { gamepassId } = req.params;
        console.log(`🔍 Verificando gamepass ${gamepassId}...`);
        
        // AQUI ESTÁ A LÓGICA QUE FUNCIONA!
        const response = await axios.get(`https://economy.roblox.com/v2/assets/${gamepassId}/details`, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });
        
        const data = response.data;
        
        // DETECÇÃO DE PREÇO REGIONAL
        let regionalActive = false;
        
        if (data.PriceInTiers && data.PriceInTiers.length > 0) {
            regionalActive = true;
        }
        
        if (data.SaleLocation && data.SaleLocation.CountryCode === 'BR') {
            regionalActive = true;
        }
        
        console.log(`✅ Gamepass: ${data.Name} | Regional: ${regionalActive}`);
        
        // RETORNA O RESULTADO
        res.json({
            success: true,
            regionalActive: regionalActive,
            name: data.Name,
            price: data.PriceInRobux,
            message: regionalActive ? '⚠️ PREÇO REGIONAL ATIVO' : '✅ Preço normal'
        });
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        res.status(500).json({
            success: false,
            regionalActive: false,
            error: error.message
        });
    }
});

// ROTA RAIZ (para testar se o servidor está online)
app.get('/', (req, res) => {
    res.json({ status: 'Proxy regional rodando!' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
