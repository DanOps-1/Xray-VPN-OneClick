/**
 * Security area evaluation
 *
 * @module services/review/areas/security
 */

import { type AreaEvaluation } from '../review-engine';
import type { RepoScanResult } from '../../../utils/repo-scan';
import { fileEvidence, missingEvidence } from '../evidence';

export function evaluateSecurity(scan: RepoScanResult): AreaEvaluation {
  const findings: AreaEvaluation['findings'] = [];
  const recommendations: AreaEvaluation['recommendations'] = [];

  if (!scan.files.security) {
    findings.push({
      areaId: 'security',
      title: 'Security policy missing',
      details: 'No SECURITY.md file was found for reporting vulnerabilities.',
      evidence: [missingEvidence('SECURITY.md missing')],
    });
    recommendations.push({
      areaId: 'security',
      title: 'Add a security policy',
      details: 'Document how to report vulnerabilities and response expectations.',
      priority: 'high',
      timeHorizon: 'quick',
      riskIfIgnored: 'Security issues may be reported publicly without guidance.',
      evidence: [missingEvidence('SECURITY.md missing')],
    });
  } else {
    findings.push({
      areaId: 'security',
      title: 'Security policy present',
      details: 'A SECURITY.md file exists for vulnerability reporting.',
      evidence: [fileEvidence(scan.repoPath, scan.files.security)],
    });

    const securityText = scan.content.security?.toLowerCase() ?? '';
    const hasContact = securityText.includes('email') || securityText.includes('contact');
    const hasReport = securityText.includes('report') || securityText.includes('vulnerability');

    if (!hasContact || !hasReport) {
      recommendations.push({
        areaId: 'security',
        title: 'Clarify disclosure instructions',
        details: 'Add contact details and reporting steps to the security policy.',
        priority: 'medium',
        timeHorizon: 'quick',
        riskIfIgnored: 'Reporters may not know how to disclose issues safely.',
        evidence: [fileEvidence(scan.repoPath, scan.files.security)],
      });
    }
  }

  const status = !scan.files.security
    ? 'missing'
    : recommendations.length > 0
      ? 'needs-improvement'
      : 'good';

  return {
    areaId: 'security',
    status,
    findings,
    recommendations,
  };
}
