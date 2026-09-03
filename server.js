const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const API_KEY = '562fb526b30a4166d9f433bf78058cb';
const API_URL = 'https://v3.football.api-sports.io';

const apiFootball = axios.create({
  baseURL: API_URL,
  headers: {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': 'v3.football.api-sports.io'
  }
});

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API Football en ligne !' });
});

// Récupérer les matchs du jour
app.get('/api/matches', async (req, res) => {
  try {
    const response = await apiFootball.get('/fixtures', {
      params: {
        date: new Date().toISOString().split('T')[0],
        status: 'NS'
      }
    });
    res.json(response.data.response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Prédiction pour un match
app.get('/api/predict/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const fixtureRes = await apiFootball.get(`/fixtures?id=${fixtureId}`);
    const fixture = fixtureRes.data.response[0];
    
    if (!fixture) {
      return res.status(404).json({ error: 'Match non trouvé' });
    }
    
    const homeWin = Math.random() * 0.6 + 0.2;
    const awayWin = Math.random() * 0.5 + 0.1;
    const draw = 1 - homeWin - awayWin;
    
    res.json({
      fixtureId,
      homeTeam: fixture.teams.home.name,
      awayTeam: fixture.teams.away.name,
      homeWin: Math.max(0, Math.min(1, homeWin)),
      draw: Math.max(0, Math.min(1, draw)),
      awayWin: Math.max(0, Math.min(1, awayWin)),
      predictedScore: `${Math.round(homeWin * 3 + 1)}-${Math.round(awayWin * 2 + 1)}`,
      confidence: Math.max(homeWin, draw, awayWin)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Football en ligne sur le port ${PORT}`);
});
