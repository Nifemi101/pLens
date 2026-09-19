import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { analyzeController } from '../controllers/analysis.controller.js';

const router = Router();

const analyzeLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 5,
    message: { error: 'Too many analyses. Please wait a moment and try again.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/analyze', analyzeLimiter, analyzeController);

export default router;