/**
 * Review constants and enums
 *
 * @module constants/review
 */

import type {
  AssessmentStatus,
  OutputFormat,
  ReviewPriority,
  ReviewTimeHorizon,
} from '../types/review';

export const REVIEW_PRIORITIES: readonly ReviewPriority[] = ['high', 'medium', 'low'];
export const REVIEW_TIME_HORIZONS: readonly ReviewTimeHorizon[] = ['quick', 'long-term'];
export const REVIEW_STATUSES: readonly AssessmentStatus[] = [
  'good',
  'needs-improvement',
  'missing',
];
export const REVIEW_FORMATS: readonly OutputFormat[] = ['markdown', 'json'];

export const REVIEW_AREA_IDS = [
  'documentation',
  'license',
  'contribution',
  'quality',
  'community',
  'security',
] as const;
export type ReviewAreaId = (typeof REVIEW_AREA_IDS)[number];

export const REVIEW_AREA_LABELS: Record<ReviewAreaId, string> = {
  documentation: 'Documentation',
  license: 'License',
  contribution: 'Contribution',
  quality: 'Quality',
  community: 'Community',
  security: 'Security',
};
