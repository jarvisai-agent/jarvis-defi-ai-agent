import axios from 'axios';

class TokenAnalysisService {
    constructor() {
        this.baseUrl = 'https://api.coingecko.com/api/v3';
        this.apiKey = 'CG-uU7js3FhpTcY1huVkmJnYUsf';
        this.STORAGE_KEY = 'coingecko_coins_list';
    }

    // Read token list from localStorage
    getLocalCoinsList() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.log('Local coin list not found, will fetch from API');
            return null;
        }
    }

    // Save token list to localStorage
    saveCoinsList(coins) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(coins));
            console.log('Coin list saved locally');
        } catch (error) {
            console.error('Failed to save coin list:', error);
        }
    }

    // Get token list (prefer local cache)
    async getCoinsList() {
        try {
            // Try reading from local cache first
            let coins = this.getLocalCoinsList();
            
            // If local cache is empty, fetch from API
            if (!coins) {
                const response = await axios.get(`${this.baseUrl}/coins/list`, {
                    headers: {
                        'x-cg-demo-api-key': this.apiKey
                    }
                });
                coins = response.data;
                // Save to local cache
                this.saveCoinsList(coins);
            }
            
            return coins;
        } catch (error) {
            console.error('Failed to get token list:', error);
            throw error;
        }
    }

    // Add a method to get top coins information
    async getTopCoins() {
        try {
            const response = await axios.get(`${this.baseUrl}/coins/markets`, {
                headers: {
                    'x-cg-demo-api-key': this.apiKey
                },
                params: {
                    vs_currency: 'usd',
                    order: 'market_cap_desc',
                    per_page: 250,  // Get top 250 coins
                    page: 1
                }
            });
            // Save to localStorage
            localStorage.setItem('top_coins', JSON.stringify(response.data));
            return response.data;
        } catch (error) {
            console.error('Failed to get top coins:', error);
            // Try getting from local cache
            const cached = localStorage.getItem('top_coins');
            return cached ? JSON.parse(cached) : [];
        }
    }

    // Optimized findCoinId method
    async findCoinId(symbol) {
        const coinsList = await this.getCoinsList();
        const topCoins = await this.getTopCoins();
        
        // Create a map for top coins
        const topCoinsMap = new Map(
            topCoins.map(coin => [coin.symbol.toLowerCase(), coin.id])
        );
        
        // If exact match found in top coins, return immediately
        const topCoinId = topCoinsMap.get(symbol.toLowerCase());
        if (topCoinId) {
            return topCoinId;
        }
        
        // Otherwise, search in full list
        const matchedCoins = coinsList.filter(coin => 
            coin.symbol.toLowerCase() === symbol.toLowerCase()
        );
        
        if (matchedCoins.length === 0) {
            throw new Error(`Token not found: ${symbol}`);
        }
        
        // If there's only one match, return immediately
        if (matchedCoins.length === 1) {
            return matchedCoins[0].id;
        }
        
        // Priority order for multiple matches
        const priorityOrder = matchedCoins.sort((a, b) => {
            // 1. Check if names are exactly matched (e.g., "Bitcoin" is preferred over "Bitcoin Cat")
            const aExactName = a.name.toLowerCase() === symbol.toLowerCase();
            const bExactName = b.name.toLowerCase() === symbol.toLowerCase();
            if (aExactName && !bExactName) return -1;
            if (!aExactName && bExactName) return 1;
            
            // 2. Check for common suspicious suffixes
            const suspiciousSuffixes = ['cat', 'dog', 'baby', 'moon', 'safe', 'inu'];
            const aHasSuspiciousSuffix = suspiciousSuffixes.some(suffix => 
                a.id.toLowerCase().includes(suffix)
            );
            const bHasSuspiciousSuffix = suspiciousSuffixes.some(suffix => 
                b.id.toLowerCase().includes(suffix)
            );
            if (!aHasSuspiciousSuffix && bHasSuspiciousSuffix) return -1;
            if (aHasSuspiciousSuffix && !bHasSuspiciousSuffix) return 1;
            
            // 3. Prefer shorter ID (usually original coin)
            return a.id.length - b.id.length;
        });
        
        return priorityOrder[0].id;
    }

    // Get 4-hour K-line data
    async get4HourKlines(symbol) {
        try {
            const response = await axios.get(`${this.baseUrl}/coins/${symbol.toLowerCase()}/ohlc`, {
                headers: {
                    'x-cg-demo-api-key': this.apiKey
                },
                params: {
                    vs_currency: 'usd',
                    days: 14
                }
            });
            
            return response.data.map(kline => ({
                openTime: kline[0],
                open: kline[1],
                high: kline[2],
                low: kline[3],
                close: kline[4],
            }));
        } catch (error) {
            console.error('Failed to get K-line data:', error);
            throw error;
        }
    }

    // Calculate RSI
    calculateRSI(klineData, period = 14) {
        const changes = [];
        for (let i = 1; i < klineData.length; i++) {
            changes.push(klineData[i].close - klineData[i - 1].close);
        }

        let gains = changes.map(change => change > 0 ? change : 0);
        let losses = changes.map(change => change < 0 ? -change : 0);

        let avgGain = gains.slice(0, period).reduce((a, b) => a + b) / period;
        let avgLoss = losses.slice(0, period).reduce((a, b) => a + b) / period;

        const rsiValues = [];
        let rs = avgGain / avgLoss;
        rsiValues.push(100 - (100 / (1 + rs)));

        for (let i = period; i < changes.length; i++) {
            avgGain = (avgGain * (period - 1) + gains[i]) / period;
            avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
            rs = avgGain / avgLoss;
            rsiValues.push(100 - (100 / (1 + rs)));
        }

        return rsiValues;
    }

    // Calculate MACD
    calculateMACD(klineData, shortPeriod = 12, longPeriod = 26, signalPeriod = 9) {
        const closes = klineData.map(k => k.close);
        
        // Calculate EMA
        const calculateEMA = (data, period) => {
            const k = 2 / (period + 1);
            let ema = [data[0]];
            for (let i = 1; i < data.length; i++) {
                ema.push(data[i] * k + ema[i - 1] * (1 - k));
            }
            return ema;
        };

        const shortEMA = calculateEMA(closes, shortPeriod);
        const longEMA = calculateEMA(closes, longPeriod);
        
        // Calculate MACD line
        const macdLine = shortEMA.map((short, i) => short - longEMA[i]);
        
        // Calculate signal line
        const signalLine = calculateEMA(macdLine, signalPeriod);
        
        // Calculate histogram
        const histogram = macdLine.map((macd, i) => macd - signalLine[i]);

        return {
            macdLine,
            signalLine,
            histogram
        };
    }

    // Modify formatDataForAnalysis method to include technical analysis
    formatDataForAnalysis(klineData, language) {
        const rsi = this.calculateRSI(klineData);
        const macd = this.calculateMACD(klineData);
        const currentRSI = rsi[rsi.length - 1].toFixed(2);
        const currentMACD = {
            macd: macd.macdLine[macd.macdLine.length - 1].toFixed(4),
            signal: macd.signalLine[macd.signalLine.length - 1].toFixed(4),
            histogram: macd.histogram[macd.histogram.length - 1].toFixed(4)
        };

        return `
        Analysis based on 4-hour K-line data:
        
        Latest Price: ${klineData[klineData.length - 1].close}
        24h High: ${Math.max(...klineData.slice(-6).map(k => k.high))}
        24h Low: ${Math.min(...klineData.slice(-6).map(k => k.low))}
        
        Technical Indicators:
        RSI(14): ${currentRSI}
        MACD: ${currentMACD.macd}
        MACD Signal: ${currentMACD.signal}
        MACD Histogram: ${currentMACD.histogram}
        
        Technical Analysis:
        RSI Analysis: ${this.analyzeRSI(currentRSI)}
        MACD Analysis: ${this.analyzeMACDCrossover(currentMACD)}
        
        Please analyze and provide the following information:
        1. Major resistance levels
        2. Recommended entry price
        3. Take profit targets
        4. Stop loss levels
        5. Brief market analysis
        
        Please list these data concisely and provide brief reasoning. Language: ${language}
        `;
    }

    // Analyze RSI value
    analyzeRSI(rsi) {
        if (rsi > 70) {
            return "Overbought zone, potential pullback risk";
        } else if (rsi < 30) {
            return "Oversold zone, potential bounce opportunity";
        } else if (rsi > 50) {
            return "Bullish zone";
        } else {
            return "Bearish zone";
        }
    }

    // Analyze MACD crossover
    analyzeMACDCrossover(macd) {
        if (macd.histogram > 0 && macd.histogram > macd.histogram) {
            return "MACD golden cross, uptrend strengthening";
        } else if (macd.histogram < 0 && macd.histogram < macd.histogram) {
            return "MACD death cross, downtrend strengthening";
        } else if (macd.histogram > 0) {
            return "MACD in bullish territory";
        } else {
            return "MACD in bearish territory";
        }
    }

    // Main analysis function
    async analyzeToken(tokenSymbol) {
        try {
            // Use findCoinId method to get accurate coin ID
            const coinId = await this.findCoinId(tokenSymbol.tokenname);
            if (!coinId) {
                throw new Error('Token not found');
            }

            const klineData = await this.get4HourKlines(coinId);
            return {
                success: true,
                data: {
                    klineData,
                    prompt: this.formatDataForAnalysis(klineData, tokenSymbol.language)
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export const tokenAnalysisService = new TokenAnalysisService(); 