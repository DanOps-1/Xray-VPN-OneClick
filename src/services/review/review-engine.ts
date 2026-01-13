/**
 * Review engine orchestration
 *
 * @module services/review/review-engine
 */

import { REVIEW_AREA_LABELS, type ReviewAreaId } from '../../constants/review';
import type { AssessmentArea, Finding, Recommendation, ReviewReport, Summary } from '../../types/review';
import { createReviewId, getIsoTimestamp } from '../../utils/review-id';
import type { RepoScanResult } from '../../utils/repo-scan';
import { runRepoScan } from './repo-scanner';
import { buildSummary } from './summary-builder';
import { evaluateCommunity } from './areas/community';
import { evaluateContribution } from './areas/contribution';
import { evaluateDocumentation } from './areas/documentation';
import { evaluateLicense } from './areas/license';
import { evaluateQuality } from './areas/quality';
import { evaluateSecurity } from './areas/security';

export interface AreaEvaluation {
  areaId: ReviewAreaId;
  status: AssessmentArea['status'];
  findings: Array<Omit<Finding, 'id'>>;
  recommendations: Array<Omit<Recommendation, 'id'>>;
}

function attachIds(areas: AreaEvaluation[]): AssessmentArea[] {
  let findingIndex = 0;
  let recommendationIndex = 0;

  return areas.map((area) => ({
    id: area.areaId,
    name: REVIEW_AREA_LABELS[area.areaId],
    status: area.status,
    findings: area.findings.map((finding) => ({
      ...finding,
      id: `finding_${++findingIndex}`,
    })),
    recommendations: area.recommendations.map((rec) => ({
      ...rec,
      id: `rec_${++recommendationIndex}`,
    })),
  }));
}

function evaluateAreas(scan: RepoScanResult): AreaEvaluation[] {
  return [
    evaluateDocumentation(scan),
    evaluateLicense(scan),
    evaluateContribution(scan),
    evaluateQuality(scan),
    evaluateCommunity(scan),
    evaluateSecurity(scan),
  ];
}

export async function generateReviewReport(repoPath: string): Promise<ReviewReport> {
  const scan = await runRepoScan(repoPath);
  const evaluated = evaluateAreas(scan);
  const areas = attachIds(evaluated);
  const recommendations = areas.flatMap((area) => area.recommendations);
  const summary: Summary = buildSummary(areas, recommendations);

  return {
    id: createReviewId(),
    repoPath: scan.repoPath,
    generatedAt: getIsoTimestamp(),
    summary,
    areas,
    recommendations,
  };
}
