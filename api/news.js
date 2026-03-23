import axios from 'axios';

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const apiKey = process.env.VITE_NEWS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'News API Key missing on server' });
    }

    const { q } = req.query;

    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        category: 'health',
        language: 'en',
        pageSize: 12,
        apiKey: apiKey,
        ...(q ? { q } : {}),
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Serverless function error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch news from API',
      details: error.message,
    });
  }
}
