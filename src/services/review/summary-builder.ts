/**
 * Summary builder for review reports
 *
 * @module services/review/summary-builder
 */

import type { AssessmentArea, Recommendation, Summary } from '../../types/review';

export function buildSummary(areas: AssessmentArea[], recommendations: Recommendation[]): Summary {
  const highPriority = recommendations.filter((rec) => rec.priority === 'high');
  const quickWins = recommendations.filter((rec) => rec.timeHorizon === 'quick');

  const headline =
    highPriority.length > 0
      ? 'High priority improvements are needed.'
      : 'No high priority risks detected.';

  const riskNotes = highPriority.slice(0, 3).map((rec) => rec.riskIfIgnored);
  if (riskNotes.length === 0 && recommendations.length > 0) {
    riskNotes.push(recommendations[0].riskIfIgnored);
  }

  return {
    headline,
    highPriorityCount: highPriority.length,
    quickWinsCount: quickWins.length,
    riskNotes,
  };
}
