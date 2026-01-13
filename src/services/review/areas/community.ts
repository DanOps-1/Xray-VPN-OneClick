/**
 * Community area evaluation
 *
 * @module services/review/areas/community
 */

import { type AreaEvaluation } from '../review-engine';
import type { RepoScanResult } from '../../../utils/repo-scan';
import { fileEvidence, missingEvidence } from '../evidence';

export function evaluateCommunity(scan: RepoScanResult): AreaEvaluation {
  const findings: AreaEvaluation['findings'] = [];
  const recommendations: AreaEvaluation['recommendations'] = [];

  if (!scan.signals.hasMaintainers) {
    recommendations.push({
      areaId: 'community',
      title: 'Document maintainers and support cadence',
      details: 'Provide a MAINTAINERS file or similar guidance on support expectations.',
      priority: 'medium',
      timeHorizon: 'long-term',
      riskIfIgnored: 'Users may not know where to seek support or how active maintenance is.',
      evidence: [missingEvidence('MAINTAINERS.md missing')],
    });
  } else if (scan.files.maintainers) {
    findings.push({
      areaId: 'community',
      title: 'Maintainers guidance present',
      details: 'Maintainers or support expectations are documented.',
      evidence: [fileEvidence(scan.repoPath, scan.files.maintainers)],
    });
  }

  if (!scan.signals.hasRoadmap) {
    recommendations.push({
      areaId: 'community',
      title: 'Publish a lightweight roadmap',
      details: 'Add a ROADMAP file to communicate future direction and release cadence.',
      priority: 'low',
      timeHorizon: 'long-term',
      riskIfIgnored: 'Community members may not know what is planned or prioritized.',
      evidence: [missingEvidence('ROADMAP.md missing')],
    });
  } else if (scan.files.roadmap) {
    findings.push({
      areaId: 'community',
      title: 'Roadmap present',
      details: 'A roadmap exists to communicate future plans.',
      evidence: [fileEvidence(scan.repoPath, scan.files.roadmap)],
    });
  }

  const status = recommendations.length > 0 ? 'needs-improvement' : 'good';

  return {
    areaId: 'community',
    status,
    findings,
    recommendations,
  };
}
