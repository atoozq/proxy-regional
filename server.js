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
        
        // TENTA PRIMEIRO A API DE GAMEPASS
        try {
            const response = await axios.get(`https://games.roblox.com/v1/game-passes/${gamepassId}/details`, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json',
                    'Referer': 'https://www.roblox.com/',
                    'Origin': 'https://www.roblox.com'
                }
            });
            
            const data = response.data;
            
            let regionalActive = false;
            if (data.priceInTiers && data.priceInTiers.length > 0) {
                regionalActive = true;
            }
            if (data.saleLocation && data.saleLocation.countryCode === 'BR') {
                regionalActive = true;
            }
            
            console.log(`✅ Gamepass: ${data.name} | Regional: ${regionalActive}`);
            
            return res.json({
                success: true,
                regionalActive: regionalActive,
                name: data.name,
                price: data.priceInRobux,
                message: regionalActive ? '⚠️ PREÇO REGIONAL ATIVO' : '✅ Preço normal'
            });
            
        } catch (gamepassError) {
            console.log('⚠️ API de gamepass falhou, tentando API de assets...');
            
            // SE FALHAR, TENTA A API DE ASSETS (que sempre funcionou)
            const fallbackResponse = await axios.get(`https://economy.roblox.com/v2/assets/${gamepassId}/details`, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                }
            });
            
            const fallbackData = fallbackResponse.data;
            
            // DETECÇÃO NA API DE FALLBACK
            let regionalActive = false;
            if (fallbackData.PriceInTiers && fallbackData.PriceInTiers.length > 0) {
                regionalActive = true;
            }
            if (fallbackData.SaleLocation && fallbackData.SaleLocation.CountryCode === 'BR') {
                regionalActive = true;
            }
            
            console.log(`✅ Fallback: ${fallbackData.Name} | Regional: ${regionalActive}`);
            
            return res.json({
                success: true,
                regionalActive: regionalActive,
                name: fallbackData.Name,
                price: fallbackData.PriceInRobux,
                message: regionalActive ? '⚠️ PREÇO REGIONAL ATIVO' : '✅ Preço normal'
            });
        }
        
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
