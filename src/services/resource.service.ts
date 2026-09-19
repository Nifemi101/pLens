export interface ResourceBreakdown {
  totalTransferSize: number;
  totalRequestCount: number;
  byCategory: { type: string; requestCount: number; transferSize: number }[];
  largestResources: { url: string; resourceType: string; transferSize: number }[];
}

// Using `any` for the lhr param deliberately, Lighthouse's own type exports
// aren't worth chasing down right now given everything else we've debugged today.
export function extractResourceBreakdown(lhr: any): ResourceBreakdown {
  const summaryItems = lhr.audits['resource-summary']?.details?.items ?? [];
  const networkItems = lhr.audits['network-requests']?.details?.items ?? [];

  const totalRow = summaryItems.find((item: any) => item.resourceType === 'total');

  const byCategory = summaryItems
    .filter((item: any) => item.resourceType !== 'total')
    .map((item: any) => ({
      type: item.resourceType,
      requestCount: item.requestCount,
      transferSize: item.transferSize,
    }));

  const largestResources = [...networkItems]
    .sort((a: any, b: any) => b.transferSize - a.transferSize)
    .slice(0, 10)
    .map((item: any) => ({
      url: item.url,
      resourceType: item.resourceType,
      transferSize: item.transferSize,
    }));

  return {
    totalTransferSize: totalRow?.transferSize ?? 0,
    totalRequestCount: totalRow?.requestCount ?? 0,
    byCategory,
    largestResources,
  };
}