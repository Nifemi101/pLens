import type { Request, Response } from 'express';
import { validateUrl } from '../utils/validate-url.js';
import { runLighthouseAudit } from '../services/lighthouse.service.js';

export async function analyzeController(req: Request, res: Response) {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'url is required' });
  }

  const validation = await validateUrl(url);

  if (!validation.valid) {
    return res.status(400).json({ error: validation.reason });
  }

  try {
    const lhr = await runLighthouseAudit(url);
    const score = lhr.categories.performance.score;

    return res.status(200).json({
      url: lhr.finalDisplayedUrl,
      score: score !== null ? Math.round(score * 100) : null,
    });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message === 'Lighthouse audit timed out') {
      return res.status(408).json({ error: 'Analysis timed out' });
    }

    return res.status(500).json({ error: 'Unable to analyze this website' });
  }
}