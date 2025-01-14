// Get environment variables, prioritize runtime variables
const getEnvVar = (key) => {
  // In development environment, use process.env directly
  if (process.env.NODE_ENV === 'development') {
    return process.env[key];
  }
  
  // In production, use window.env, fallback to process.env if not available
  if (window.env && window.env[key]) {
    return window.env[key];
  }
  return process.env[key];
};

// Get configuration using function instead of exporting object directly
const getConfig = () => {
  try {
    // Check required environment variables
    const baseURL = getEnvVar('REACT_APP_OPENAI_BASE_URL');
    const apiKey = getEnvVar('REACT_APP_OPENAI_API_KEY');

    if (!baseURL || !apiKey) {
      console.error('Missing required environment variables');
      // Use default values or throw error
      return {
        baseURL: 'https://api.deepseek.com',
        apiKey: 'sk-f062cc7274d84777b9a7581c7b5dd51e'
      };
    }

    return {
      baseURL,
      apiKey
    };
  } catch (error) {
    console.error('Failed to load configuration:', error);
    // Use default values
    return {
      baseURL: 'https://api.deepseek.com',
      apiKey: 'sk-f062cc7274d84777b9a7581c7b5dd51e'
    };
  }
};

// OpenAI configuration
export const OPENAI_CONFIG = getConfig();

// Additional configurations can be added... 