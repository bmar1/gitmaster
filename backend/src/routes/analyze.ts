/**
 * Analyze Route
 *
 * POST /api/analyze       — Accepts a GitHub repo URL and runs the full analysis pipeline.
 * GET  /api/analyze/status — Returns auth status and current GitHub API rate limit.
 */

import { Router, Request, Response } from 'express';
import { AnalysisRequest } from '../types';
import { parseGitHubUrl, validateGitHubUrl } from '../utils/parser';
import { getRepositoryInfo, getFileTree, isAuthenticated, getRateLimit } from '../services/github.service';
import { buildFileTree, computeLanguageStats, computeFileStats } from '../services/fileTree.service';
import { extractAllDependencies } from '../services/dependency.service';
import { analyzeProject, generateSummary } from '../services/analyzer.service';
import { buildArchitectureGraph } from '../services/architecture.service';

const router = Router();

/**
 * Main analysis endpoint.
 *
 * Pipeline:
 *  1. Validate + parse the GitHub URL
 *  2. Fetch repo metadata and full file tree (2 API calls)
 *  3. In parallel: build the nested file tree, compute language stats,
 *     compute file stats, and extract all dependencies
 *  4. Run the project analyzer and architecture graph builder
 *  5. Generate a human-readable summary
 *  6. Return the combined result
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { url } = req.body as AnalysisRequest;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_URL', message: 'Repository URL is required' },
      });
    }

    if (!validateGitHubUrl(url)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_URL', message: 'Invalid GitHub URL format. Expected: https://github.com/owner/repo' },
      });
    }

    const { owner, repo } = parseGitHubUrl(url);

    const repositoryInfo = await getRepositoryInfo(owner, repo);
    const branch = repositoryInfo.defaultBranch;
    const githubTree = await getFileTree(owner, repo, branch);

    // These four operations are independent — run them concurrently
    const [fileTree, languages, fileStats, dependencies] = await Promise.all([
      Promise.resolve(buildFileTree(githubTree)),
      Promise.resolve(computeLanguageStats(githubTree)),
      Promise.resolve(computeFileStats(githubTree)),
      extractAllDependencies(owner, repo, githubTree, branch),
    ]);

    const insights = analyzeProject(githubTree, dependencies.manifests);
    const architecture = buildArchitectureGraph(githubTree, dependencies.manifests, insights, languages);

    const summary = generateSummary(
      repositoryInfo.description,
      repositoryInfo.language,
      insights,
      fileStats.totalFiles,
      dependencies.totalCount,
      languages,
    );

    return res.status(200).json({
      success: true,
      data: {
        repository: repositoryInfo,
        fileTree,
        fileStats,
        languages,
        dependencies,
        insights,
        architecture,
        summary,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Analysis error:', error);

    const statusCode = error.message.includes('not found') ? 404
                     : error.message.includes('Rate limit') ? 429
                     : 500;

    return res.status(statusCode).json({
      success: false,
      error: {
        code: 'ANALYSIS_FAILED',
        message: error.message || 'Failed to analyze repository',
      },
    });
  }
});

/** Lightweight status check — lets the frontend display auth and rate limit info. */
router.get('/status', async (_req: Request, res: Response) => {
  const rateLimit = await getRateLimit();
  res.json({
    success: true,
    data: {
      authenticated: isAuthenticated(),
      rateLimit,
    },
  });
});

export default router;
