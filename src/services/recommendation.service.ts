import type { ResourceBreakdown } from './resource.service.js';

export interface Recommendation {
  severity: 'warning' | 'info';
  title: string;
  description: string;
}

const LARGE_IMAGE_BYTES = 500_000;
const HIGH_JS_BYTES = 1_000_000;
const HIGH_THIRD_PARTY_REQUESTS = 10;

function formatKB(bytes: number): string {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export function generateRecommendations(breakdown: ResourceBreakdown): Recommendation[] {
  const recommendations: Recommendation[] = [];

  for (const resource of breakdown.largestResources) {
    if (resource.resourceType === 'Image' && resource.transferSize > LARGE_IMAGE_BYTES) {
      recommendations.push({
        severity: 'warning',
        title: 'Large image detected',
        description: `${resource.url} is approximately ${formatKB(resource.transferSize)}. Large images can significantly increase load time, especially on mobile connections. Consider compressing it or serving WebP/AVIF.`,
      });
    }
  }

  const scriptCategory = breakdown.byCategory.find((c) => c.type === 'script');
  if (scriptCategory && scriptCategory.transferSize > HIGH_JS_BYTES) {
    recommendations.push({
      severity: 'warning',
      title: 'High JavaScript payload',
      description: `This page loads ${formatKB(scriptCategory.transferSize)} of JavaScript. Consider code splitting or removing unused dependencies.`,
    });
  }

  const thirdPartyCategory = breakdown.byCategory.find((c) => c.type === 'third-party');
  if (thirdPartyCategory && thirdPartyCategory.requestCount > HIGH_THIRD_PARTY_REQUESTS) {
    recommendations.push({
      severity: 'info',
      title: 'Many third-party requests',
      description: `This page makes ${thirdPartyCategory.requestCount} third-party requests. Consider reviewing which third-party scripts are actually necessary.`,
    });
  }

  return recommendations;
}