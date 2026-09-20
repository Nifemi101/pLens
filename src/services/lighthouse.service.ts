import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const AUDIT_TIMEOUT_MS = 45_000;

export async function runLighthouseAudit(url: string) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'] });

  try {
    const resultPromise = lighthouse(url, {
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Lighthouse audit timed out')), AUDIT_TIMEOUT_MS);
    });

    const runnerResult = await Promise.race([resultPromise, timeoutPromise]);

    if (!runnerResult?.lhr) {
      throw new Error('Lighthouse returned no result');
    }

    return runnerResult.lhr;
  } finally {
    try {
      await chrome.kill();
    } catch (killError) {
      console.error('Chrome cleanup failed (non-fatal):', killError);
    }
  }
}
