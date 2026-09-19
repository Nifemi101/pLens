import express from 'express';
import cors from 'cors';
import analysisRoutes from './routes/analysis.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:3001' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', analysisRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});