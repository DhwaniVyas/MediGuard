import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Proxy endpoint for NewsAPI
app.get('/api/news', async (req, res) => {
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
        ...(q ? { q } : {})
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch news from API',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
