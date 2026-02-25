import { Octokit } from 'octokit';
import { RepositoryInfo, GitHubTreeItem } from '../types';

const octokit = new Octokit();

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
