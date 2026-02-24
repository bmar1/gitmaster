import { Router, Request, Response } from 'express';
import { AnalysisRequest, AnalysisResult } from '../types';
import { parseGitHubUrl, validateGitHubUrl } from '../utils/parser';
import { getRepositoryInfo, getFileTree } from '../services/github.service';
import { buildFileTree } from '../services/fileTree.service';
import { extractDependencies, getCriticalDependencies } from '../services/dependency.service';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { url } = req.body as AnalysisRequest;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_URL',
          message: 'Repository URL is required'
        }
      });
    }
    
    if (!validateGitHubUrl(url)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_URL',
          message: 'Invalid GitHub URL format. Expected: https://github.com/owner/repo'
        }
      });
    }
    
    const { owner, repo } = parseGitHubUrl(url);
    
    const repositoryInfo = await getRepositoryInfo(owner, repo);
    
    const githubTree = await getFileTree(owner, repo, repositoryInfo.defaultBranch);
    
    const fileTree = buildFileTree(githubTree);
    
    const dependencies = await extractDependencies(owner, repo);
    
    const criticalDeps = getCriticalDependencies(dependencies);
    const frameworks = criticalDeps.length > 0 
      ? `Uses ${criticalDeps.join(', ')}` 
      : 'No major frameworks detected';
    
    const summary = `${repositoryInfo.description || 'No description available'}. ${frameworks}. This is a ${repositoryInfo.language || 'multi-language'} project with ${githubTree.length} files.`;
    
    const result: AnalysisResult = {
      repository: repositoryInfo,
      fileTree,
      dependencies,
      summary,
      analyzedAt: new Date().toISOString()
    };
    
    return res.status(200).json({
      success: true,
      data: result
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
        message: error.message || 'Failed to analyze repository'
      }
    });
  }
});

export default router;
