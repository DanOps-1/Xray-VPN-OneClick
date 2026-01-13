/**
 * Recommendation filtering utilities
 *
 * @module services/review/recommendations-filter
 */

import type { Recommendation, ReviewPriority, ReviewTimeHorizon } from '../../types/review';

export interface RecommendationFilters {
  priority?: ReviewPriority;
  timeHorizon?: ReviewTimeHorizon;
}

export function filterRecommendations(
  recommendations: Recommendation[],
  filters: RecommendationFilters = {},
): Recommendation[] {
  return recommendations.filter((rec) => {
    if (filters.priority && rec.priority !== filters.priority) {
      return false;
    }
    if (filters.timeHorizon && rec.timeHorizon !== filters.timeHorizon) {
      return false;
    }
    return true;
  });
}
