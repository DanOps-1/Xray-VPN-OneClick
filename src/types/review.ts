/**
 * Review report domain types
 *
 * @module types/review
 */

export type ReviewPriority = 'high' | 'medium' | 'low';
export type ReviewTimeHorizon = 'quick' | 'long-term';
export type AssessmentStatus = 'good' | 'needs-improvement' | 'missing';
export type EvidenceType = 'file' | 'path' | 'missing';
export type OutputFormat = 'markdown' | 'json';

export interface EvidenceReference {
  type: EvidenceType;
  target: string;
  notes?: string;
}

export interface Finding {
  id: string;
  areaId: string;
  title: string;
  details: string;
  evidence: EvidenceReference[];
}

export interface Recommendation {
  id: string;
  areaId: string;
  title: string;
  details: string;
  priority: ReviewPriority;
  timeHorizon: ReviewTimeHorizon;
  riskIfIgnored: string;
  evidence: EvidenceReference[];
}

export interface AssessmentArea {
  id: string;
  name: string;
  status: AssessmentStatus;
  findings: Finding[];
  recommendations: Recommendation[];
}

export interface Summary {
  headline: string;
  highPriorityCount: number;
  quickWinsCount: number;
  riskNotes: string[];
}

export interface ReviewReport {
  id: string;
  repoPath: string;
  generatedAt: string;
  summary: Summary;
  areas: AssessmentArea[];
  recommendations: Recommendation[];
}

export interface ReviewOptions {
  repoPath: string;
  outputFormats: OutputFormat[];
  markdownPath?: string;
  jsonPath?: string;
  summaryOnly?: boolean;
  recommendationsOnly?: boolean;
}
