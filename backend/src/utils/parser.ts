/** URL parsing utilities for extracting owner/repo from various GitHub URL formats. */

import { ParsedGitHubUrl } from '../types';

/** Strips protocol, www, github.com prefix, and .git suffix to extract owner + repo. */
export function parseGitHubUrl(url: string): ParsedGitHubUrl {
  let cleanUrl = url.trim();
  
  cleanUrl = cleanUrl.replace(/^(https?:\/\/)?(www\.)?/, '');
  cleanUrl = cleanUrl.replace(/\.git$/, '');
  
  if (cleanUrl.startsWith('github.com/')) {
    cleanUrl = cleanUrl.substring('github.com/'.length);
  }
  
  const parts = cleanUrl.split('/').filter(Boolean);
  
  if (parts.length < 2) {
    throw new Error('Invalid GitHub URL format. Expected format: owner/repo');
  }
  
  return {
    owner: parts[0],
    repo: parts[1]
  };
}

export function validateGitHubUrl(url: string): boolean {
  try {
    const parsed = parseGitHubUrl(url);
    return !!(parsed.owner && parsed.repo);
  } catch {
    return false;
  }
}

export function extractRepoName(url: string): string {
  const parsed = parseGitHubUrl(url);
  return `${parsed.owner}/${parsed.repo}`;
}
