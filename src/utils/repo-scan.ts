/**
 * Repository scanning helpers (read-only)
 *
 * @module utils/repo-scan
 */

import { readdir, readFile, stat } from 'fs/promises';
import path from 'path';

export interface RepoScanResult {
  repoPath: string;
  files: {
    readme?: string;
    license?: string;
    contributing?: string;
    codeOfConduct?: string;
    security?: string;
    changelog?: string;
    packageJson?: string;
    pullRequestTemplate?: string;
    maintainers?: string;
    roadmap?: string;
  };
  content: {
    readme?: string;
    license?: string;
    contributing?: string;
    codeOfConduct?: string;
    security?: string;
    changelog?: string;
  };
  directories: {
    docs?: string;
    tests?: string;
    examples?: string;
    github?: string;
    workflows?: string;
    issueTemplates?: string;
  };
  signals: {
    hasReadme: boolean;
    hasLicense: boolean;
    hasContributing: boolean;
    hasCodeOfConduct: boolean;
    hasSecurityPolicy: boolean;
    hasChangelog: boolean;
    hasTests: boolean;
    hasDocs: boolean;
    hasExamples: boolean;
    hasGithubActions: boolean;
    hasIssueTemplates: boolean;
    hasPullRequestTemplate: boolean;
    hasMaintainers: boolean;
    hasRoadmap: boolean;
  };
}

const SEARCH_DIRS = ['.', '.github', 'docs'];

function normalizeName(name: string): string {
  return name.toLowerCase();
}

async function safeReadDir(dirPath: string): Promise<string[]> {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    return entries.map((entry) => entry.name);
  } catch {
    return [];
  }
}

async function safeStat(targetPath: string): Promise<ReturnType<typeof stat> | null> {
  try {
    return await stat(targetPath);
  } catch {
    return null;
  }
}

async function safeReadFile(targetPath: string): Promise<string | undefined> {
  try {
    return await readFile(targetPath, 'utf-8');
  } catch {
    return undefined;
  }
}

async function findFileInDirs(repoPath: string, names: string[]): Promise<string | undefined> {
  const normalized = names.map(normalizeName);

  for (const dir of SEARCH_DIRS) {
    const searchDir = path.join(repoPath, dir);
    const entries = await safeReadDir(searchDir);

    for (const entry of entries) {
      if (normalized.includes(normalizeName(entry))) {
        return path.join(searchDir, entry);
      }
    }
  }

  return undefined;
}

async function directoryExists(repoPath: string, dirName: string): Promise<string | undefined> {
  const target = path.join(repoPath, dirName);
  const info = await safeStat(target);
  if (info && info.isDirectory()) {
    return target;
  }
  return undefined;
}

async function hasAnyFiles(dirPath: string, extensions: string[]): Promise<boolean> {
  const entries = await safeReadDir(dirPath);
  const normalized = extensions.map(normalizeName);
  return entries.some((entry) => normalized.some((ext) => normalizeName(entry).endsWith(ext)));
}

async function findPullRequestTemplate(repoPath: string): Promise<string | undefined> {
  const candidates = ['PULL_REQUEST_TEMPLATE.md', 'pull_request_template.md'];

  for (const dir of ['.', '.github', 'docs']) {
    const searchDir = path.join(repoPath, dir);
    const entries = await safeReadDir(searchDir);
    for (const entry of entries) {
      if (candidates.includes(entry)) {
        return path.join(searchDir, entry);
      }
    }
  }

  return undefined;
}

export async function scanRepository(repoPath: string): Promise<RepoScanResult> {
  const resolvedRepoPath = path.resolve(repoPath);
  const repoInfo = await safeStat(resolvedRepoPath);
  if (!repoInfo || !repoInfo.isDirectory()) {
    throw new Error(`Repository path is not a directory: ${resolvedRepoPath}`);
  }

  const readmePath = await findFileInDirs(resolvedRepoPath, ['README.md', 'README']);
  const licensePath = await findFileInDirs(resolvedRepoPath, ['LICENSE', 'LICENSE.md', 'COPYING']);
  const contributingPath = await findFileInDirs(resolvedRepoPath, [
    'CONTRIBUTING.md',
    'CONTRIBUTING',
  ]);
  const codeOfConductPath = await findFileInDirs(resolvedRepoPath, [
    'CODE_OF_CONDUCT.md',
    'CODE_OF_CONDUCT',
  ]);
  const securityPath = await findFileInDirs(resolvedRepoPath, ['SECURITY.md']);
  const changelogPath = await findFileInDirs(resolvedRepoPath, ['CHANGELOG.md', 'CHANGELOG']);
  const packageJsonPath = await findFileInDirs(resolvedRepoPath, ['package.json']);
  const maintainersPath = await findFileInDirs(resolvedRepoPath, ['MAINTAINERS.md', 'MAINTAINERS']);
  const roadmapPath = await findFileInDirs(resolvedRepoPath, ['ROADMAP.md', 'ROADMAP']);

  const docsDir = await directoryExists(resolvedRepoPath, 'docs');
  const testsDir =
    (await directoryExists(resolvedRepoPath, 'tests')) ||
    (await directoryExists(resolvedRepoPath, '__tests__'));
  const examplesDir = await directoryExists(resolvedRepoPath, 'examples');
  const githubDir = await directoryExists(resolvedRepoPath, '.github');
  const workflowsDir = githubDir ? await directoryExists(githubDir, 'workflows') : undefined;
  const issueTemplatesDir = githubDir
    ? await directoryExists(githubDir, 'ISSUE_TEMPLATE')
    : undefined;
  const pullRequestTemplate = await findPullRequestTemplate(resolvedRepoPath);

  const hasGithubActions = workflowsDir
    ? await hasAnyFiles(workflowsDir, ['.yml', '.yaml'])
    : false;

  const content = {
    readme: readmePath ? await safeReadFile(readmePath) : undefined,
    license: licensePath ? await safeReadFile(licensePath) : undefined,
    contributing: contributingPath ? await safeReadFile(contributingPath) : undefined,
    codeOfConduct: codeOfConductPath ? await safeReadFile(codeOfConductPath) : undefined,
    security: securityPath ? await safeReadFile(securityPath) : undefined,
    changelog: changelogPath ? await safeReadFile(changelogPath) : undefined,
  };

  return {
    repoPath: resolvedRepoPath,
    files: {
      readme: readmePath,
      license: licensePath,
      contributing: contributingPath,
      codeOfConduct: codeOfConductPath,
      security: securityPath,
      changelog: changelogPath,
      packageJson: packageJsonPath,
      pullRequestTemplate,
      maintainers: maintainersPath,
      roadmap: roadmapPath,
    },
    content,
    directories: {
      docs: docsDir,
      tests: testsDir,
      examples: examplesDir,
      github: githubDir,
      workflows: workflowsDir,
      issueTemplates: issueTemplatesDir,
    },
    signals: {
      hasReadme: Boolean(readmePath),
      hasLicense: Boolean(licensePath),
      hasContributing: Boolean(contributingPath),
      hasCodeOfConduct: Boolean(codeOfConductPath),
      hasSecurityPolicy: Boolean(securityPath),
      hasChangelog: Boolean(changelogPath),
      hasTests: Boolean(testsDir),
      hasDocs: Boolean(docsDir),
      hasExamples: Boolean(examplesDir),
      hasGithubActions: Boolean(hasGithubActions),
      hasIssueTemplates: Boolean(issueTemplatesDir),
      hasPullRequestTemplate: Boolean(pullRequestTemplate),
      hasMaintainers: Boolean(maintainersPath),
      hasRoadmap: Boolean(roadmapPath),
    },
  };
}
