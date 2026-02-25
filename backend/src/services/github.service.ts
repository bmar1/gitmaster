import { Octokit } from 'octokit';
import { RepositoryInfo, GitHubTreeItem } from '../types';

const token = process.env.GITHUB_TOKEN || undefined;

const octokit = new Octokit(token ? { auth: token } : {});

export function isAuthenticated(): boolean {
  return !!token;
}

export async function getRateLimit(): Promise<{ remaining: number; limit: number }> {
  try {
    const { data } = await octokit.rest.rateLimit.get();
    return { remaining: data.rate.remaining, limit: data.rate.limit };
  } catch {
    return { remaining: 0, limit: 60 };
  }
}

export async function getRepositoryInfo(owner: string, repo: string): Promise<RepositoryInfo> {
  try {
    const { data } = await octokit.rest.repos.get({ owner, repo });

    return {
      owner: data.owner.login,
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      language: data.language,
      topics: data.topics || [],
      url: data.html_url,
      homepage: data.homepage || null,
      defaultBranch: data.default_branch,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      size: data.size,
      license: data.license?.spdx_id || null,
    };
  } catch (error: any) {
    if (error.status === 404) throw new Error('Repository not found');
    if (error.status === 403) throw new Error('Rate limit exceeded. Please try again later.');
    throw new Error(`Failed to fetch repository: ${error.message}`);
  }
}

export async function getFileTree(owner: string, repo: string, branch: string): Promise<GitHubTreeItem[]> {
  try {
    const { data } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: 'true',
    });

    return data.tree as GitHubTreeItem[];
  } catch (error: any) {
    if (error.status === 404) throw new Error('Repository or branch not found');
    throw new Error(`Failed to fetch file tree: ${error.message}`);
  }
}

export async function getFileContent(owner: string, repo: string, path: string): Promise<string> {
  try {
    const { data } = await octokit.rest.repos.getContent({ owner, repo, path });

    if ('content' in data && typeof data.content === 'string') {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }

    throw new Error('File content not available');
  } catch (error: any) {
    if (error.status === 404) throw new Error(`File not found: ${path}`);
    throw new Error(`Failed to fetch file content: ${error.message}`);
  }
}

/**
 * Batch-fetch multiple file contents in a single GraphQL request.
 * Falls back to individual REST calls if GraphQL fails.
 * Saves (N-1) API calls per analysis.
 */
export async function batchGetFileContents(
  owner: string,
  repo: string,
  branch: string,
  paths: string[],
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  if (paths.length === 0) return results;

  try {
    const aliases = paths.map((p, i) => {
      const safeAlias = `f${i}`;
      const expr = `${branch}:${p}`;
      return `${safeAlias}: object(expression: ${JSON.stringify(expr)}) { ... on Blob { text } }`;
    });

    const query = `query($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        ${aliases.join('\n        ')}
      }
    }`;

    const response: any = await octokit.graphql(query, { owner, name: repo });
    const repoData = response.repository;

    paths.forEach((p, i) => {
      const alias = `f${i}`;
      const blob = repoData[alias];
      if (blob?.text) {
        results.set(p, blob.text);
      }
    });

    return results;
  } catch {
    // GraphQL unavailable or failed — fall back to individual REST calls
    const fetches = await Promise.allSettled(
      paths.map(async (p) => {
        const content = await getFileContent(owner, repo, p);
        return { path: p, content };
      })
    );

    for (const r of fetches) {
      if (r.status === 'fulfilled') {
        results.set(r.value.path, r.value.content);
      }
    }

    return results;
  }
}
