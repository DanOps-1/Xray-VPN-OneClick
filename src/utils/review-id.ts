/**
 * Review identifiers and timestamps
 *
 * @module utils/review-id
 */

import { randomUUID } from 'crypto';

export function createReviewId(): string {
  return `review_${randomUUID()}`;
}

export function getIsoTimestamp(date: Date = new Date()): string {
  return date.toISOString();
}
