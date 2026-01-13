/**
 * Quality area evaluation
 *
 * @module services/review/areas/quality
 */

import { type AreaEvaluation } from '../review-engine';
import type { RepoScanResult } from '../../../utils/repo-scan';
import { fileEvidence, missingEvidence, pathEvidence } from '../evidence';

export function evaluateQuality(scan: RepoScanResult): AreaEvaluation {
  const findings: AreaEvaluation['findings'] = [];
  const recommendations: AreaEvaluation['recommendations'] = [];

  if (!scan.signals.hasTests) {
    findings.push({
      areaId: 'quality',
      title: 'Tests not detected',
      details: 'No tests directory found in the repository.',
      evidence: [missingEvidence('tests/ directory missing')],
    });
    recommendations.push({
      areaId: 'quality',
      title: 'Add automated tests',
      details: 'Introduce unit or integration tests to validate key workflows.',
      priority: 'high',
      timeHorizon: 'long-term',
      riskIfIgnored: 'Regression risk increases and changes become harder to validate.',
      evidence: [missingEvidence('tests/ directory missing')],
    });
  } else if (scan.directories.tests) {
    findings.push({
      areaId: 'quality',
      title: 'Tests directory present',
      details: 'Automated tests are present in the repository.',
      evidence: [pathEvidence(scan.repoPath, scan.directories.tests)],
    });
  }

  if (!scan.signals.hasGithubActions) {
    recommendations.push({
      areaId: 'quality',
      title: 'Add CI workflows',
      details: 'Set up continuous integration to run tests and lint checks.',
      priority: 'medium',
      timeHorizon: 'long-term',
      riskIfIgnored: 'Quality checks will be inconsistent across contributions.',
      evidence: [missingEvidence('.github/workflows missing')],
    });
  } else if (scan.directories.workflows) {
    findings.push({
      areaId: 'quality',
      title: 'CI workflows detected',
      details: 'GitHub Actions workflows are configured.',
      evidence: [pathEvidence(scan.repoPath, scan.directories.workflows)],
    });
  }

  if (!scan.files.changelog) {
    recommendations.push({
      areaId: 'quality',
      title: 'Maintain a changelog',
      details: 'Add a CHANGELOG file to track releases and major changes.',
      priority: 'low',
      timeHorizon: 'long-term',
      riskIfIgnored: 'Users will struggle to track changes between releases.',
      evidence: [missingEvidence('CHANGELOG.md missing')],
    });
  } else {
    findings.push({
      areaId: 'quality',
      title: 'Changelog present',
      details: 'Changelog exists for release tracking.',
      evidence: [fileEvidence(scan.repoPath, scan.files.changelog)],
    });
  }

  const status = recommendations.length > 0 ? 'needs-improvement' : 'good';

  return {
    areaId: 'quality',
    status,
    findings,
    recommendations,
  };
}
