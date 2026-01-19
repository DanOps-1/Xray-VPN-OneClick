/**
 * Repository review command
 *
 * @module commands/review
 */

import type { Command } from 'commander';
import logger from '../utils/logger';
import { ExitCode, getExitCodeForError, gracefulExit } from '../constants/exit-codes';
import { REVIEW_FORMATS } from '../constants/review';
import type { OutputFormat } from '../types/review';
import { generateReviewReport } from '../services/review/review-engine';
import { renderReportJson, renderReportMarkdown } from '../services/review/report-renderer';
import { writeReportOutputs } from '../utils/report-output';

interface ReviewCommandOptions {
  repo: string;
  format?: string;
  out?: string;
  jsonOut?: string;
  summary?: boolean;
  recommendations?: boolean;
}

function parseFormats(value?: string): OutputFormat[] {
  if (!value) {
    return [...REVIEW_FORMATS];
  }

  const normalized = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean) as OutputFormat[];

  const unique = Array.from(new Set(normalized));
  const invalid = unique.filter((format) => !REVIEW_FORMATS.includes(format));

  if (invalid.length > 0) {
    throw new Error(`Invalid format(s): ${invalid.join(', ')}`);
  }

  return unique;
}

export function registerReviewCommand(program: Command): void {
  program
    .command('review')
    .description('Generate an open-source review report for a local repository')
    .requiredOption('--repo <path>', 'Repository path to review')
    .option('--format <formats>', 'Output formats (markdown,json)', 'markdown,json')
    .option('--out <path>', 'Markdown output path')
    .option('--json-out <path>', 'JSON output path')
    .option('--summary', 'Render summary only')
    .option('--recommendations', 'Render recommendations only')
    .action(async (options: ReviewCommandOptions) => {
      try {
        if (options.summary && options.recommendations) {
          throw new Error('Only one of --summary or --recommendations can be used.');
        }

        let formats = parseFormats(options.format);

        if (options.out && !formats.includes('markdown')) {
          formats = [...formats, 'markdown'];
        }
        if (options.jsonOut && !formats.includes('json')) {
          formats = [...formats, 'json'];
        }

        const report = await generateReviewReport(options.repo);
        const renderOptions = {
          summaryOnly: Boolean(options.summary),
          recommendationsOnly: Boolean(options.recommendations),
        };

        const markdown = formats.includes('markdown')
          ? renderReportMarkdown(report, renderOptions)
          : undefined;
        const json = formats.includes('json') ? renderReportJson(report, renderOptions) : undefined;

        await writeReportOutputs({
          markdown,
          json,
          markdownPath: options.out,
          jsonPath: options.jsonOut,
        });

        logger.success('Review report generated successfully.');
      } catch (error) {
        const err = error as Error;
        logger.error(`Review failed: ${err.message}`);
        await gracefulExit(getExitCodeForError(err) || ExitCode.GENERAL_ERROR);
      }
    });
}
