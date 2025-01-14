class TokenAnalyzer {
  constructor() {
    this.DEX_SCREENER_API = 'https://api.dexscreener.com/latest/dex';
  }

  async analyzeToken(result) {
    try {
      // Get token trading data
      const response = await fetch(`${this.DEX_SCREENER_API}/tokens/${result.tokenaddress}`);
      const data = await response.json();

      if (!data.pairs || data.pairs.length === 0) {
        throw new Error('No trading pair data found for this token');
      }

      // Extract data from the most active trading pair
      const mainPair = data.pairs[0];
      
      // Construct analysis prompt
      const prompt = `
Analyze the following token trading data:

Token Address: ${result.tokenaddress}
Token Name: ${mainPair.baseToken.name}
Token Symbol: ${mainPair.baseToken.symbol}

Price Data:
- Current Price: $${mainPair.priceUsd}
- 24h Price Change: ${mainPair.priceChange.h24}%
- 24h Volume: $${mainPair.volume.h24}

Liquidity Data:
- Liquidity(USD): $${mainPair.liquidity.usd}
- Main Trading Pair: ${mainPair.baseToken.symbol}/${mainPair.quoteToken.symbol}
- DEX: ${mainPair.dexId}

Please analyze:
1. Token price trends and volatility
2. Liquidity adequacy
3. Trading volume health
4. Potential risk signals
5. Overall market performance assessment
6. Technical indicator analysis

Provide a ~200-word analysis, followed by a concise bullish or bearish opinion. Be direct and avoid unnecessary words. Use ${result.language} language.
      `;

      return {status: true, prompt: prompt};
    } catch (error) {
      return {status: false, prompt: error.message};
    }
  }
}

export default TokenAnalyzer;
