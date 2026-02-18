const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/check-regional/:gamepassId', async (req, res) => {
    try {
        const { gamepassId } = req.params;
        console.log(`🔍 Verificando gamepass ${gamepassId}...`);
        
        // ✅ URL CORRETA PARA GAMEPASS
        const response = await axios.get(`https://games.roblox.com/v1/game-passes/${gamepassId}/details`, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });
        
        const data = response.data;
        
        // DETECÇÃO DE PREÇO REGIONAL
        let regionalActive = false;
        
        if (data.priceInTiers && data.priceInTiers.length > 0) {
            regionalActive = true;
        }
        
        if (data.saleLocation && data.saleLocation.countryCode === 'BR') {
            regionalActive = true;
        }
        
        console.log(`✅ Gamepass: ${data.name} | Regional: ${regionalActive}`);
        
        res.json({
            success: true,
            regionalActive: regionalActive,
            name: data.name,
            price: data.priceInRobux,
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

app.get('/', (req, res) => {
    res.json({ status: 'Proxy regional rodando!' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
