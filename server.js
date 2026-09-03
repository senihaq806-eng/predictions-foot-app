const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const API_KEY = process.env.FOOTBALL_API_KEY || '562f5526b38a4166d9f433bf70853cb7';
const API_URL = 'https://v3.football.api-sports.io';

const apiFootball = axios.create({
  baseURL: API_URL,
  headers: {
    'x-apisports-key': API_KEY
  }
});

app.get('/api/matches', async (req, res) => {
  try {
    const response = await apiFootball.get('/fixtures', {
      params: { live: 'all' }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/predict/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const response = await apiFootball.get('/predictions', {
      params: { fixture: fixtureId }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
