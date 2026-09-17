import express from 'express';
import analysisRoutes from './routes/analysis.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', analysisRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});