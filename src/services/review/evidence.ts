/**
 * Evidence helpers for review reports
 *
 * @module services/review/evidence
 */

import path from 'path';
import type { EvidenceReference } from '../../types/review';

function toRelativePath(repoPath: string, targetPath: string): string {
  const relative = path.relative(repoPath, targetPath);
  return relative.length > 0 ? relative : '.';
}

export function fileEvidence(
  repoPath: string,
  targetPath: string,
  notes?: string
): EvidenceReference {
  return {
    type: 'file',
    target: toRelativePath(repoPath, targetPath),
    notes,
  };
}

export function pathEvidence(
  repoPath: string,
  targetPath: string,
  notes?: string
): EvidenceReference {
  return {
    type: 'path',
    target: toRelativePath(repoPath, targetPath),
    notes,
  };
}

export function missingEvidence(label: string, notes?: string): EvidenceReference {
  return {
    type: 'missing',
    target: label,
    notes,
  };
}
