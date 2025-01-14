import React, { useState } from 'react';
import { tokenAnalysisService } from '../services/tokenAnalysisService';

const TokenAnalysis = () => {
    const [symbol, setSymbol] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await tokenAnalysisService.analyzeToken(symbol);
            if (result.success) {
                setAnalysis(result.data.analysis);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('An error occurred during analysis');
        }
        setLoading(false);
    };

    return (
        <div className="token-analysis">
            <div className="input-group">
                <input 
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder="Enter token symbol (e.g., BTC)"
                />
                <button 
                    onClick={handleAnalysis}
                    disabled={loading || !symbol}
                >
                    {loading ? 'Analyzing...' : 'Start Analysis'}
                </button>
            </div>

            {error && <div className="error">{error}</div>}
            
            {analysis && (
                <div className="analysis-result">
                    <pre>{analysis}</pre>
                </div>
            )}
        </div>
    );
};

export default TokenAnalysis; 