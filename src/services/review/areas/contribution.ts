/**
 * Contribution area evaluation
 *
 * @module services/review/areas/contribution
 */

import { type AreaEvaluation } from '../review-engine';
import type { RepoScanResult } from '../../../utils/repo-scan';
import { fileEvidence, missingEvidence, pathEvidence } from '../evidence';

export function evaluateContribution(scan: RepoScanResult): AreaEvaluation {
  const findings: AreaEvaluation['findings'] = [];
  const recommendations: AreaEvaluation['recommendations'] = [];

  if (!scan.files.contributing) {
    findings.push({
      areaId: 'contribution',
      title: 'CONTRIBUTING guide missing',
      details: 'No contribution guide found for new contributors.',
      evidence: [missingEvidence('CONTRIBUTING.md missing')],
    });
    recommendations.push({
      areaId: 'contribution',
      title: 'Add a contribution guide',
      details: 'Document contribution workflow, coding standards, and review expectations.',
      priority: 'high',
      timeHorizon: 'quick',
      riskIfIgnored: 'Contributors may abandon PRs due to unclear expectations.',
      evidence: [missingEvidence('CONTRIBUTING.md missing')],
    });
  } else {
    findings.push({
      areaId: 'contribution',
      title: 'Contribution guide present',
      details: 'A CONTRIBUTING file exists for contributors.',
      evidence: [fileEvidence(scan.repoPath, scan.files.contributing)],
    });
  }

  if (!scan.files.codeOfConduct) {
    recommendations.push({
      areaId: 'contribution',
      title: 'Add a code of conduct',
      details: 'Include a CODE_OF_CONDUCT file to set community expectations.',
      priority: 'medium',
      timeHorizon: 'quick',
      riskIfIgnored: 'Lack of conduct guidance can hinder community trust.',
      evidence: [missingEvidence('CODE_OF_CONDUCT.md missing')],
    });
  } else {
    findings.push({
      areaId: 'contribution',
      title: 'Code of conduct present',
      details: 'A code of conduct is available for community guidelines.',
      evidence: [fileEvidence(scan.repoPath, scan.files.codeOfConduct)],
    });
  }

  if (!scan.directories.issueTemplates) {
    recommendations.push({
      areaId: 'contribution',
      title: 'Provide issue templates',
      details: 'Add GitHub issue templates to standardize bug reports and feature requests.',
      priority: 'low',
      timeHorizon: 'long-term',
      riskIfIgnored: 'Issues may lack critical details and slow triage.',
      evidence: [missingEvidence('.github/ISSUE_TEMPLATE missing')],
    });
  } else {
    findings.push({
      areaId: 'contribution',
      title: 'Issue templates available',
      details: 'Issue templates are configured in the repository.',
      evidence: [pathEvidence(scan.repoPath, scan.directories.issueTemplates)],
    });
  }

  if (!scan.files.pullRequestTemplate) {
    recommendations.push({
      areaId: 'contribution',
      title: 'Add a pull request template',
      details: 'Provide a PR template to guide contributors through required context and testing.',
      priority: 'low',
      timeHorizon: 'long-term',
      riskIfIgnored: 'Pull requests may omit critical context or validation steps.',
      evidence: [missingEvidence('Pull request template missing')],
    });
  } else {
    findings.push({
      areaId: 'contribution',
      title: 'Pull request template present',
      details: 'A pull request template is available for contributors.',
      evidence: [fileEvidence(scan.repoPath, scan.files.pullRequestTemplate)],
    });
  }

  const status =
    !scan.files.contributing && !scan.files.codeOfConduct
      ? 'missing'
      : recommendations.length > 0
        ? 'needs-improvement'
        : 'good';

  return {
    areaId: 'contribution',
    status,
    findings,
    recommendations,
  };
}
