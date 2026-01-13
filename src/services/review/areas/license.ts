/**
 * License area evaluation
 *
 * @module services/review/areas/license
 */

import { type AreaEvaluation } from '../review-engine';
import type { RepoScanResult } from '../../../utils/repo-scan';
import { fileEvidence, missingEvidence } from '../evidence';

function detectLicenseType(content: string | undefined): string | undefined {
  if (!content) {
    return undefined;
  }

  const text = content.toLowerCase();

  if (text.includes('mit license')) {
    return 'MIT';
  }
  if (text.includes('apache license') && text.includes('version 2')) {
    return 'Apache-2.0';
  }
  if (text.includes('gnu general public license') && text.includes('version 3')) {
    return 'GPL-3.0';
  }
  if (text.includes('gnu general public license') && text.includes('version 2')) {
    return 'GPL-2.0';
  }
  if (text.includes('mozilla public license')) {
    return 'MPL-2.0';
  }

  return undefined;
}

export function evaluateLicense(scan: RepoScanResult): AreaEvaluation {
  const findings: AreaEvaluation['findings'] = [];
  const recommendations: AreaEvaluation['recommendations'] = [];

  if (!scan.files.license) {
    findings.push({
      areaId: 'license',
      title: 'License file missing',
      details: 'A license file is required to clarify usage rights for the project.',
      evidence: [missingEvidence('LICENSE missing')],
    });
    recommendations.push({
      areaId: 'license',
      title: 'Add an explicit license file',
      details: 'Include a LICENSE file that matches the intended distribution terms.',
      priority: 'high',
      timeHorizon: 'quick',
      riskIfIgnored: 'Users and contributors may avoid the project due to legal uncertainty.',
      evidence: [missingEvidence('LICENSE missing')],
    });
  } else {
    const licenseType = detectLicenseType(scan.content.license);
    findings.push({
      areaId: 'license',
      title: 'License file present',
      details: licenseType ? `Detected license type: ${licenseType}.` : 'License file present but type not detected.',
      evidence: [fileEvidence(scan.repoPath, scan.files.license)],
    });

    if (!licenseType) {
      recommendations.push({
        areaId: 'license',
        title: 'Clarify license type',
        details: 'Ensure the license text is complete and matches a well-known SPDX identifier.',
        priority: 'medium',
        timeHorizon: 'quick',
        riskIfIgnored: 'Ambiguous licensing can slow adoption and contributions.',
        evidence: [fileEvidence(scan.repoPath, scan.files.license)],
      });
    }
  }

  const status = !scan.files.license ? 'missing' : recommendations.length > 0 ? 'needs-improvement' : 'good';

  return {
    areaId: 'license',
    status,
    findings,
    recommendations,
  };
}
