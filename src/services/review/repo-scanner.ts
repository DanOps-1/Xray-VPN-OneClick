/**
 * Repository scanning service
 *
 * @module services/review/repo-scanner
 */

import { access, constants as fsConstants } from 'fs/promises';
import { scanRepository, type RepoScanResult } from '../../utils/repo-scan';

export async function runRepoScan(repoPath: string): Promise<RepoScanResult> {
  await access(repoPath, fsConstants.R_OK);
  return scanRepository(repoPath);
}
