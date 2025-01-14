import React, { useState } from 'react';

const CoinForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: 'JARVIS',
    ticker: 'JARVIS',
    description: 'by in $JARVIS',
    avatar: 'C:\\Users\\TUF\\Downloads\\jarvis.jpg',
    telegram: '',
    website: '',
    twitter: 'https://x.com/jarvisai_agent'
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id.replace('coin', '').toLowerCase()]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-2xl font-bold text-center mb-8 text-gray-800">Create New Token</h3>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="coinName" className="block text-sm font-medium text-gray-700">
            Token Name *
          </label>
          <input
            type="text"
            id="coinName"
            required
            placeholder="Enter token name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="coinTicker" className="block text-sm font-medium text-gray-700">
            Ticker *
          </label>
          <input
            type="text"
            id="coinTicker"
            required
            placeholder="Enter token symbol"
            value={formData.ticker}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="coinDescription" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="coinDescription"
            placeholder="Token description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="coinAvatar" className="block text-sm font-medium text-gray-700">
            Avatar URL *
          </label>
          <input
            type="text"
            id="coinAvatar"
            required
            placeholder="Enter avatar URL"
            value={formData.avatar}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="coinTelegram" className="block text-sm font-medium text-gray-700">
            Telegram Link
          </label>
          <input
            type="text"
            id="coinTelegram"
            placeholder="Enter Telegram link"
            value={formData.telegram}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="coinWebsite" className="block text-sm font-medium text-gray-700">
            Website Link
          </label>
          <input
            type="text"
            id="coinWebsite"
            placeholder="Enter website link"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="coinTwitter" className="block text-sm font-medium text-gray-700">
            Twitter Link
          </label>
          <input
            type="text"
            id="coinTwitter"
            placeholder="Enter Twitter link"
            value={formData.twitter}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
      >
        Create Token
      </button>
    </form>
  );
};

export default CoinForm; 