import { buildLocalInsights } from '../lib/wellbeing';
import type { InsightCard, Preferences, RangeStats } from '../lib/wellbeing';

export type InsightPeriod = 'week' | 'month';
export type { InsightCard };

// Replace this provider with the connected model service when Ovara's AI layer is ready.
// Until then it produces deterministic observations from the user's own records.
export interface InsightsProvider {
  generate(stats: RangeStats, period: InsightPeriod, preferences: Preferences): InsightCard[];
}

export const mockInsightsProvider: InsightsProvider = {
  generate(stats, period, preferences) {
    return buildLocalInsights(stats, period, preferences);
  },
};

export function getPersonalisedInsights(stats: RangeStats, period: InsightPeriod, preferences: Preferences) {
  return mockInsightsProvider.generate(stats, period, preferences);
}
