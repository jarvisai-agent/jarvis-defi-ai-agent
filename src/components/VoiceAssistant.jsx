import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import './VoiceAssistant.css';
import ParticlesBackground from './ParticlesBackground';
// import { AgentManager } from '../agents/AgentManager';
import CoinForm from './CoinForm';
import { OPENAI_CONFIG } from '../config';
import { tokenAnalysisService } from '../services/tokenAnalysisService';
import TokenAnalyzer from '../agents/TokenAnalyzer';

const TypewriterText = React.memo(({ text, messageId }) => {
  const [displayText, setDisplayText] = useState('');
  const hasAnimated = useRef(false);
  
  useEffect(() => {
    hasAnimated.current = false;
    
    if (hasAnimated.current) {
      setDisplayText(text);
      return;
    }

    let index = 0;
    setDisplayText('');
    
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
        hasAnimated.current = true;
      }
    }, 30);
    
    return () => clearInterval(interval);
  }, [text, messageId]);
  
  return displayText;
});

const VoiceAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Jarvis-DefAi initialized... Welcome to terminal. Enter command to begin interaction.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showCoinForm, setShowCoinForm] = useState(false);
  const messagesEndRef = useRef(null);
  
  const agentManagerRef = useRef(null);

  const [isTyping, setIsTyping] = useState(false);
  const [currentText, setCurrentText] = useState('');

  // Add chat history state
  const [chatHistory, setChatHistory] = useState([
    {
      role: "system",
      content: `You are Astra, an advanced AI assistant. 
      - Respond in a concise, terminal-like style
      - Remember user information and context from previous messages
      - Use technical language when appropriate
      - Keep track of user preferences and personal details
      - Maintain conversation continuity
      - When users mention token names or contract addresses, analyze them
      - Recognize patterns like "$tokenName", "tokenName:contractAddress", or plain contract addresses
      - For token queries, use the format: !analyze{tokenName,contractAddress}`
    }
  ]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // agentManagerRef.current = new AgentManager(
    //   (msg) => setMessages(prev => [...prev, { role: 'assistant', content: msg }])
    // );
  }, []);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const chatWithAI = async (userInput) => {
    try {
      const updatedHistory = [...chatHistory, { role: "user", content: userInput }];
      const limitedHistory = updatedHistory.slice(-10);
      
      const response = await fetch(`${OPENAI_CONFIG.baseURL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: limitedHistory,
          temperature: 0.7,
          max_tokens: 1000,
          presence_penalty: 0.6,
          frequency_penalty: 0.3
        })
      });

      const data = await response.json();
      const assistantResponse = data.choices[0].message.content;

      setChatHistory([...limitedHistory, { role: "assistant", content: assistantResponse }]);
      return assistantResponse;
    } catch (error) {
      console.error('AI Response Error:', error);
      return "Error: Connection failed. Please try again later.";
    }
  };

  const checkIsAnalyzing = async (message) => {
    // Create new conversation context to avoid influence from history
    const analysisPrompt = `You are a cryptocurrency analysis assistant. Please carefully analyze if the user's input contains any cryptocurrency-related analysis requests:

1. Situations to identify include:
- Common cryptocurrency symbols (e.g., BTC, ETH, USDT, etc.)
- Currency names with @ or $ symbols
- Contract addresses (length > 30 characters, starting with 0x or ending with pump)
- Queries containing keywords like "coin", "price", "trend", "analysis"
- Any mentions of specific cryptocurrency names or analysis requests

2. Response format requirements:
- If only tokenaddress exists: {tokenname:null,tokenaddress:tokenaddress,language:language}
- If both tokenname and tokenaddress exist: {tokenname:tokenname,tokenaddress:tokenaddress,language:language}
- If only tokenname exists: {tokenname:tokenname,tokenaddress:null,language:language}
- If neither exists: return null

Input message is: ${message}
Please strictly return in JSON format or null, without any additional content.`;
    
    // Create independent conversation context
    const analysisContext = [
      {
        role: "system",
        content: "You are a token analysis assistant that only responds in JSON format or null."
      },
      {
        role: "user",
        content: analysisPrompt
      }
    ];

    try {
      const response = await fetch(`${OPENAI_CONFIG.baseURL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: analysisContext,  // Using independent conversation context
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      console.log('AI original response:', aiResponse);
      
      try {
        if (typeof aiResponse === 'object') {
          return aiResponse;
        }
        
        if (typeof aiResponse === 'string') {
          // Clean up the string
          let jsonStr = aiResponse.replace(/```json\s*|\s*```/g, '').trim();
          jsonStr = jsonStr.replace(/^[^{]*({.*})[^}]*$/, '$1');
          
          // Ensure property names and string values have quotes
          jsonStr = jsonStr
            // Handle property names first
            .replace(/([{,]\s*)(\w+):/g, '$1"$2":')
            // Then handle string values
            .replace(/:(\w+)(,|})/g, ':"$1"$2')
            // Special handling for null values to avoid adding quotes
            .replace(/"null"/g, 'null');
          
          console.log('Cleaned JSON string:', jsonStr);
          
          return JSON.parse(jsonStr);
        }
        
        return null;
      } catch (error) {
        console.error('Detailed error parsing AI response:', error);
        console.error('Content attempted to parse:', aiResponse);
        return null;
      }
    } catch (error) {
      console.error('Detailed error parsing AI response:', error);
      return null;
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    console.log(userMessage);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputValue('');
    setIsTyping(true);

    try {
      // First attempt token analysis
     let result = null;
     for(let i = 0; i < 3; i++) {
       result = await checkIsAnalyzing(userMessage);
       if(result !== null) break;
       console.log(`Attempt ${i+1} analysis failed, retrying...`);
     }
     console.log(result);
     
     if(result){
      setIsAnalyzing(true);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Analyzing token data, please wait...',
        messageId: 'analyzing'
      }]);
      if(result.tokenaddress){
        console.log(result.tokenaddress);
        const analyzer = new TokenAnalyzer();
        const tokenAnalysis = await analyzer.analyzeToken(result);
        console.log('Token address analysis result:');
        console.log(tokenAnalysis);
        console.log('Token address analysis result-----------------');
        if(tokenAnalysis.status){
          const res = await chatWithAI(tokenAnalysis.prompt);
          console.log(res);
          setMessages(prev => [...prev, { role: 'assistant', content: res }]);
          }
      }else if(result.tokenname){// Token analysis
        console.log(result.tokenname);
        
        const tokenAnalysis = await tokenAnalysisService.analyzeToken(result);
        console.log('Token name analysis result:');
        
        console.log(tokenAnalysis);
        console.log('Token name analysis result-----------------');
        if(tokenAnalysis.success){
        const res = await chatWithAI(tokenAnalysis.data.prompt);
        setMessages(prev => [...prev, { role: 'assistant', content: res }]);
        }
      }
     }else{
      // If not a token query, continue normal conversation
      const response = await chatWithAI(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
     }

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error: Connection failed. Please try again later.' 
      }]);
    } finally {
      setIsTyping(false);
      setIsAnalyzing(false);
    }
  };

  const executeCommand = useCallback((command) => {
    if (command.toLowerCase() === 'clear' || command.toLowerCase() === 'cls') {
      // Reset conversation history to initial state
      setChatHistory([
        {
          role: "system",
          content: `You are Astra, an advanced AI assistant. 
          - Respond in a concise, terminal-like style
          - Remember user information and context from previous messages
          - Use technical language when appropriate
          - Keep track of user preferences and personal details
          - Maintain conversation continuity`
        }
      ]);
      setMessages([
        { role: 'assistant', content: 'Astra-agent initialized... Welcome to terminal. Enter command to begin interaction.' }
      ]);
      return null;
    }
    if (!agentManagerRef.current) return null;
    return agentManagerRef.current.handleCommand(command);
  }, []);

  const handleCoinFormSubmit = async (formData) => {
    if (agentManagerRef.current?.coinAgent) {
      const response = await agentManagerRef.current.coinAgent.createCoin(formData);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setShowCoinForm(false);
    }
  };

  return (
    <div className="voice-assistant">
      <ParticlesBackground />
      
      <motion.div 
        className="container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="messages-container">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              {message.role === 'assistant' ? (
                <>
                  <TypewriterText 
                    text={message.content} 
                    messageId={message.messageId || index}
                  />
                  {isAnalyzing && message.messageId === 'analyzing' && (
                    <div className="loading-dots">
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </div>
                  )}
                </>
              ) : (
                message.content
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {showCoinForm ? (
          <CoinForm onSubmit={handleCoinFormSubmit} />
        ) : (
          <form onSubmit={handleSendMessage} className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter command..."
              className="chat-input"
              autoFocus
            />
            <button type="submit" className="send-button">
              Execute
            </button>
          </form>
        )}
        
        <div className="signature">Astra Terminal v1.0.0</div>
      </motion.div>
    </div>
  );
};

export default VoiceAssistant; 