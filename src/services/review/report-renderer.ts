/**
 * Report renderer for review outputs
 *
 * @module services/review/report-renderer
 */

import type { AssessmentArea, Recommendation, ReviewReport } from '../../types/review';

export interface RenderOptions {
  summaryOnly?: boolean;
  recommendationsOnly?: boolean;
}

function renderEvidence(evidence: { type: string; target: string; notes?: string }[]): string {
  if (!evidence.length) {
    return '';
  }
  const items = evidence
    .map((item) => `- ${item.type}: ${item.target}${item.notes ? ` (${item.notes})` : ''}`)
    .join('\n');
  return `\n\nEvidence:\n${items}`;
}

function renderRecommendationsList(recommendations: Recommendation[]): string {
  if (recommendations.length === 0) {
    return 'No recommendations found.';
  }

  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const sorted = [...recommendations].sort((a, b) => {
    const left = priorityOrder[a.priority] ?? 99;
    const right = priorityOrder[b.priority] ?? 99;
    return left - right;
  });

  return sorted
    .map((rec) => {
      const header = `- [${rec.priority.toUpperCase()} | ${rec.timeHorizon}] ${rec.title}`;
      const details = `  ${rec.details}`;
      const risk = `  Risk if ignored: ${rec.riskIfIgnored}`;
      const evidence = renderEvidence(rec.evidence)
        .split('\n')
        .map((line) => `  ${line}`)
        .join('\n');
      return [header, details, risk, evidence].filter(Boolean).join('\n');
    })
    .join('\n');
}

function renderArea(area: AssessmentArea): string {
  const findings = area.findings.length
    ? area.findings
        .map((finding) => {
          const header = `- ${finding.title}`;
          const details = `  ${finding.details}`;
          const evidence = renderEvidence(finding.evidence)
            .split('\n')
            .map((line) => `  ${line}`)
            .join('\n');
          return [header, details, evidence].filter(Boolean).join('\n');
        })
        .join('\n')
    : 'No findings.';

  const recommendations = renderRecommendationsList(area.recommendations);

  return [
    `### ${area.name}`,
    `Status: ${area.status}`,
    '',
    'Findings:',
    findings,
    '',
    'Recommendations:',
    recommendations,
  ].join('\n');
}

export function renderReportMarkdown(report: ReviewReport, options: RenderOptions = {}): string {
  if (options.summaryOnly) {
    return renderSummaryMarkdown(report);
  }

  if (options.recommendationsOnly) {
    return renderRecommendationsMarkdown(report.recommendations);
  }

  const header = [
    '# Open Source Review Report',
    '',
    `Repository: ${report.repoPath}`,
    `Generated: ${report.generatedAt}`,
    '',
  ].join('\n');

  const summary = renderSummaryMarkdown(report);
  const contributorRecommendations = report.recommendations.filter(
    (rec) => rec.areaId === 'contribution'
  );
  const contributorSection = contributorRecommendations.length
    ? ['## Contributor Guidance', renderRecommendationsList(contributorRecommendations)].join('\n')
    : '';
  const recommendations = renderRecommendationsMarkdown(report.recommendations);
  const areas = report.areas.map(renderArea).join('\n\n');

  return [header, summary, '', contributorSection, '', recommendations, '', '## Areas', areas]
    .filter((section) => section.trim().length > 0)
    .join('\n');
}

export function renderSummaryMarkdown(report: ReviewReport): string {
  const risks = report.summary.riskNotes.length
    ? report.summary.riskNotes.map((note) => `- ${note}`).join('\n')
    : 'No critical risks noted.';

  return [
    '## Summary',
    `Headline: ${report.summary.headline}`,
    `High priority recommendations: ${report.summary.highPriorityCount}`,
    `Quick wins: ${report.summary.quickWinsCount}`,
    'Risk notes:',
    risks,
  ].join('\n');
}

export function renderRecommendationsMarkdown(recommendations: Recommendation[]): string {
  return ['## Recommendations', renderRecommendationsList(recommendations)].join('\n');
}

export function renderReportJson(report: ReviewReport, options: RenderOptions = {}): string {
  if (options.summaryOnly) {
    return JSON.stringify(report.summary, null, 2);
  }

  if (options.recommendationsOnly) {
    return JSON.stringify(report.recommendations, null, 2);
  }

  return JSON.stringify(report, null, 2);
}
