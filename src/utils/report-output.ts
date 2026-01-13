/**
 * Report output writer
 *
 * @module utils/report-output
 */

import { writeFile } from 'fs/promises';

export interface ReportOutputPayload {
  markdown?: string;
  json?: string;
  markdownPath?: string;
  jsonPath?: string;
}

export async function writeReportOutputs(payload: ReportOutputPayload): Promise<void> {
  const stdoutChunks: string[] = [];

  if (payload.markdown) {
    if (payload.markdownPath) {
      await writeFile(payload.markdownPath, payload.markdown, 'utf-8');
    } else {
      stdoutChunks.push(payload.markdown);
    }
  }

  if (payload.json) {
    if (payload.jsonPath) {
      await writeFile(payload.jsonPath, payload.json, 'utf-8');
    } else {
      stdoutChunks.push(payload.json);
    }
  }

  if (stdoutChunks.length > 0) {
    process.stdout.write(stdoutChunks.join('\n\n'));
    process.stdout.write('\n');
  }
}
