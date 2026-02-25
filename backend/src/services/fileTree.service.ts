/**
 * File Tree Service
 *
 * Transforms the flat array returned by GitHub's Git Tree API into a nested
 * FileNode hierarchy suitable for the frontend tree view. Also computes
 * language statistics (by file size) and overall file/directory counts.
 */

import { GitHubTreeItem, FileNode, LanguageStats, FileStats } from '../types';

/** Directories containing generated or vendored code — excluded from all stats. */
const EXCLUDED_PATHS = [
  '.git', 'node_modules', 'dist', 'build', '.next', 'coverage',
  '__pycache__', '.pytest_cache', 'target', 'vendor', '.gradle',
  '.idea', '.vscode', '.settings', 'bin', 'obj',
];

/** Maps file extensions to human-readable language names. */
const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  ts: 'TypeScript', tsx: 'TypeScript',
  js: 'JavaScript', jsx: 'JavaScript', mjs: 'JavaScript', cjs: 'JavaScript',
  py: 'Python', pyw: 'Python',
  java: 'Java', kt: 'Kotlin', kts: 'Kotlin',
  rs: 'Rust',
  go: 'Go',
  rb: 'Ruby', erb: 'Ruby',
  php: 'PHP',
  cs: 'C#', fs: 'F#',
  c: 'C', h: 'C', cpp: 'C++', cc: 'C++', cxx: 'C++', hpp: 'C++',
  swift: 'Swift',
  dart: 'Dart',
  scala: 'Scala',
  lua: 'Lua',
  r: 'R',
  sql: 'SQL',
  html: 'HTML', htm: 'HTML',
  css: 'CSS', scss: 'SCSS', sass: 'SCSS', less: 'Less',
  vue: 'Vue',
  svelte: 'Svelte',
  json: 'JSON',
  yaml: 'YAML', yml: 'YAML',
  xml: 'XML',
  md: 'Markdown', mdx: 'MDX',
  sh: 'Shell', bash: 'Shell', zsh: 'Shell',
  ps1: 'PowerShell',
  toml: 'TOML',
  graphql: 'GraphQL', gql: 'GraphQL',
  proto: 'Protocol Buffers',
  tf: 'Terraform', hcl: 'HCL',
  ex: 'Elixir', exs: 'Elixir',
  erl: 'Erlang',
  hs: 'Haskell',
  clj: 'Clojure', cljs: 'ClojureScript',
  sol: 'Solidity',
};

/** Hex color for each language (used in the frontend pie/bar charts). */
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572a5',
  Java: '#b07219', Kotlin: '#a97bff', Rust: '#dea584',
  Go: '#00add8', Ruby: '#701516', PHP: '#4f5d95',
  'C#': '#178600', 'F#': '#b845fc', C: '#555555', 'C++': '#f34b7d',
  Swift: '#f05138', Dart: '#00b4ab', Scala: '#c22d40',
  HTML: '#e34c26', CSS: '#563d7c', SCSS: '#c6538c',
  Vue: '#41b883', Svelte: '#ff3e00',
  Shell: '#89e051', PowerShell: '#012456',
  Markdown: '#083fa1', JSON: '#a3a3a3', YAML: '#cb171e',
  SQL: '#e38c00', GraphQL: '#e10098',
  Elixir: '#6e4a7e', Haskell: '#5e5086',
  Lua: '#000080', R: '#198ce7',
};

/**
 * Converts the flat GitHub tree into a nested FileNode tree.
 *
 * Two-pass algorithm:
 *  Pass 1 — create a FileNode for each item and store it in a path-keyed map.
 *  Pass 2 — walk the items again; for each non-root item, attach it as a child
 *           of its parent directory node (looked up by trimming the last path segment).
 */
export function buildFileTree(githubTree: GitHubTreeItem[]): FileNode[] {
  const filteredTree = githubTree.filter(item => {
    return !EXCLUDED_PATHS.some(excluded =>
      item.path.startsWith(excluded + '/') || item.path === excluded
    );
  });

  const fileMap = new Map<string, FileNode>();
  const rootNodes: FileNode[] = [];

  // Pass 1: create nodes
  filteredTree.forEach(item => {
    const pathParts = item.path.split('/');
    const name = pathParts[pathParts.length - 1];
    const ext = item.type === 'blob' ? (name.includes('.') ? name.split('.').pop() : undefined) : undefined;

    const node: FileNode = {
      path: item.path,
      name,
      type: item.type === 'blob' ? 'file' : 'directory',
      size: item.size,
      extension: ext,
      children: item.type === 'tree' ? [] : undefined,
    };

    fileMap.set(item.path, node);
  });

  // Pass 2: link children to parents
  filteredTree.forEach(item => {
    const node = fileMap.get(item.path);
    if (!node) return;

    const pathParts = item.path.split('/');
    if (pathParts.length === 1) {
      rootNodes.push(node);
    } else {
      const parentPath = pathParts.slice(0, -1).join('/');
      const parentNode = fileMap.get(parentPath);
      if (parentNode && parentNode.children) {
        parentNode.children.push(node);
      }
    }
  });

  return rootNodes;
}

/**
 * Computes language distribution stats based on file size.
 * Percentage is calculated as (language bytes / total code bytes) * 100,
 * rounded to one decimal place. Results sorted by size descending.
 */
export function computeLanguageStats(githubTree: GitHubTreeItem[]): LanguageStats[] {
  const langMap = new Map<string, { fileCount: number; totalSize: number }>();
  let totalSizeAll = 0;

  for (const item of githubTree) {
    if (item.type !== 'blob') continue;
    if (EXCLUDED_PATHS.some(ex => item.path.startsWith(ex + '/') || item.path === ex)) continue;

    const name = item.path.split('/').pop() || '';
    const ext = name.includes('.') ? name.split('.').pop()?.toLowerCase() : undefined;
    if (!ext) continue;

    const language = EXTENSION_TO_LANGUAGE[ext];
    if (!language) continue;

    const size = item.size || 0;
    totalSizeAll += size;

    const existing = langMap.get(language) || { fileCount: 0, totalSize: 0 };
    existing.fileCount++;
    existing.totalSize += size;
    langMap.set(language, existing);
  }

  if (totalSizeAll === 0) totalSizeAll = 1;

  const stats: LanguageStats[] = [];
  for (const [name, data] of langMap) {
    stats.push({
      name,
      fileCount: data.fileCount,
      totalSize: data.totalSize,
      percentage: Math.round((data.totalSize / totalSizeAll) * 1000) / 10,
      color: LANGUAGE_COLORS[name] || '#888888',
    });
  }

  return stats.sort((a, b) => b.totalSize - a.totalSize);
}

/**
 * Computes aggregate file statistics: total files, directories, combined size,
 * average file size, and the 10 largest files (useful for identifying bloat).
 */
export function computeFileStats(githubTree: GitHubTreeItem[]): FileStats {
  let totalFiles = 0;
  let totalDirectories = 0;
  let totalSize = 0;
  const fileSizes: { path: string; size: number }[] = [];

  for (const item of githubTree) {
    if (EXCLUDED_PATHS.some(ex => item.path.startsWith(ex + '/') || item.path === ex)) continue;

    if (item.type === 'blob') {
      totalFiles++;
      const size = item.size || 0;
      totalSize += size;
      fileSizes.push({ path: item.path, size });
    } else {
      totalDirectories++;
    }
  }

  fileSizes.sort((a, b) => b.size - a.size);

  return {
    totalFiles,
    totalDirectories,
    totalSize,
    avgFileSize: totalFiles > 0 ? Math.round(totalSize / totalFiles) : 0,
    largestFiles: fileSizes.slice(0, 10),
  };
}
