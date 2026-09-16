import type { Request, Response } from 'express';
import { validateUrl } from '../utils/validate-url.js';

export async function analyzeController(req: Request, res: Response) {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'url is required' });
  }

  const result = await validateUrl(url);

  if (!result.valid) {
    return res.status(400).json({ error: result.reason });
  }

  return res.status(200).json({ status: 'url accepted', url });
}