/**
 * Documentation area evaluation
 *
 * @module services/review/areas/documentation
 */

import { type AreaEvaluation } from '../review-engine';
import type { RepoScanResult } from '../../../utils/repo-scan';
import { fileEvidence, missingEvidence, pathEvidence } from '../evidence';

function hasKeyword(content: string | undefined, keyword: string): boolean {
  if (!content) {
    return false;
  }
  return content.toLowerCase().includes(keyword.toLowerCase());
}

export function evaluateDocumentation(scan: RepoScanResult): AreaEvaluation {
  const findings: AreaEvaluation['findings'] = [];
  const recommendations: AreaEvaluation['recommendations'] = [];

  if (!scan.files.readme) {
    findings.push({
      areaId: 'documentation',
      title: 'README not found',
      details: 'The repository does not include a README file at the root or docs directories.',
      evidence: [missingEvidence('README.md missing')],
    });
    recommendations.push({
      areaId: 'documentation',
      title: 'Add a README with install and usage guidance',
      details: 'Provide a primary README with installation steps, usage examples, and scope.',
      priority: 'high',
      timeHorizon: 'quick',
      riskIfIgnored: 'Users and contributors will struggle to understand how to use the project.',
      evidence: [missingEvidence('README.md missing')],
    });
  } else {
    findings.push({
      areaId: 'documentation',
      title: 'README present',
      details: 'A README file is present and can be used as the primary entry point.',
      evidence: [fileEvidence(scan.repoPath, scan.files.readme)],
    });

    const hasInstall = hasKeyword(scan.content.readme, 'install');
    const hasUsage = hasKeyword(scan.content.readme, 'usage');
    const hasContributing = hasKeyword(scan.content.readme, 'contributing') || hasKeyword(scan.content.readme, 'contribute');

    if (!hasInstall || !hasUsage) {
      const missingParts = [!hasInstall ? 'installation' : null, !hasUsage ? 'usage' : null]
        .filter((part): part is string => Boolean(part))
        .join(' and ');
      findings.push({
        areaId: 'documentation',
        title: 'README missing key sections',
        details: `README lacks clear ${missingParts} guidance.`,
        evidence: [fileEvidence(scan.repoPath, scan.files.readme)],
      });
      recommendations.push({
        areaId: 'documentation',
        title: 'Expand README with installation and usage sections',
        details: 'Add concise installation steps and usage examples so new users can start quickly.',
        priority: 'medium',
        timeHorizon: 'quick',
        riskIfIgnored: 'Adoption and onboarding will remain slow and support load will increase.',
        evidence: [fileEvidence(scan.repoPath, scan.files.readme)],
      });
    }

    if (!hasContributing) {
      recommendations.push({
        areaId: 'documentation',
        title: 'Link to contribution guidance from README',
        details: 'Add a brief contribution section or link to CONTRIBUTING.md for new contributors.',
        priority: 'low',
        timeHorizon: 'quick',
        riskIfIgnored: 'Potential contributors may not find the right onboarding materials.',
        evidence: [fileEvidence(scan.repoPath, scan.files.readme)],
      });
    }
  }

  if (!scan.directories.docs) {
    recommendations.push({
      areaId: 'documentation',
      title: 'Add a dedicated docs directory',
      details: 'Move detailed guides into a docs/ directory for discoverability and maintenance.',
      priority: 'low',
      timeHorizon: 'long-term',
      riskIfIgnored: 'Long-form documentation will be harder to maintain as the project grows.',
      evidence: [missingEvidence('docs/ directory missing')],
    });
  } else {
    findings.push({
      areaId: 'documentation',
      title: 'Docs directory present',
      details: 'Supporting documentation exists in docs/.',
      evidence: [pathEvidence(scan.repoPath, scan.directories.docs)],
    });
  }

  const status = !scan.files.readme ? 'missing' : recommendations.length > 0 ? 'needs-improvement' : 'good';

  return {
    areaId: 'documentation',
    status,
    findings,
    recommendations,
  };
}
