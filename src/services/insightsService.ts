import { buildLocalInsights, type getRangeStats } from '../lib/wellbeing';

export type InsightPeriod = 'week' | 'month';
export type InsightCard = { title: string; body: string; tone: 'sage' | 'clay' | 'sand' };

// Replace this provider with the connected model service when Ovara's AI layer is ready.
// Until then, it produces grounded, deterministic observations from the user's own records.
export interface InsightsProvider {
  generate(stats: ReturnType<typeof getRangeStats>, period: InsightPeriod): InsightCard[];
}

export const mockInsightsProvider: InsightsProvider = {
  generate(stats, period) {
    return buildLocalInsights(stats, period);
  },
};

export function getPersonalisedInsights(stats: ReturnType<typeof getRangeStats>, period: InsightPeriod) {
  return mockInsightsProvider.generate(stats, period);
}
