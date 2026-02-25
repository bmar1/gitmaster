/**
 * Architecture Service
 *
 * Builds a visual graph representation of the repository's architecture.
 * The output drives the interactive system map on the frontend (ReactFlow).
 *
 * Graph construction strategy:
 *  1. Create a root node for files at the repo root.
 *  2. Create module nodes for each top-level directory + their immediate subdirectories.
 *  3. Mark entry point files as "entry" nodes and high-file-count dirs as hotspots.
 *  4. Create external dependency group nodes (one per package manager ecosystem).
 *  5. Add config file nodes for root-level configuration files.
 *  6. Connect everything with edges forming a hierarchy.
 */

import {
  GitHubTreeItem,
  DependencyManifest,
  ProjectInsight,
  ArchitectureGraph,
  ArchitectureNode,
  ArchitectureEdge,
  LanguageStats,
} from '../types';

/** Maps file extensions to language names for node language tagging. */
const EXTENSION_LANG: Record<string, string> = {
  ts: 'TypeScript', tsx: 'TypeScript', js: 'JavaScript', jsx: 'JavaScript',
  py: 'Python', java: 'Java', kt: 'Kotlin', rs: 'Rust', go: 'Go',
  rb: 'Ruby', php: 'PHP', cs: 'C#', cpp: 'C++', c: 'C', swift: 'Swift',
  vue: 'Vue', svelte: 'Svelte', html: 'HTML', css: 'CSS', scss: 'SCSS',
};

/**
 * Constructs the full architecture graph from raw repository data.
 *
 * @param tree     - Flat list of all blobs and trees from the GitHub API
 * @param manifests - Parsed dependency manifests (npm, maven, etc.)
 * @param insights  - Project analysis results (frameworks, entry points, config files)
 * @param _languages - Language statistics (reserved for future heatmap coloring)
 */
export function buildArchitectureGraph(
  tree: GitHubTreeItem[],
  manifests: DependencyManifest[],
  insights: ProjectInsight,
  _languages: LanguageStats[],
): ArchitectureGraph {
  const nodes: ArchitectureNode[] = [];
  const edges: ArchitectureEdge[] = [];

  const files = tree.filter(t => t.type === 'blob');
  const dirs = tree.filter(t => t.type === 'tree');

  const topDirs = dirs.filter(d => !d.path.includes('/'));

  // Directories with significantly more files than average are flagged as hotspots
  const avgFileCount = files.length / Math.max(topDirs.length, 1);
  const hotspotThreshold = avgFileCount * 1.5;

  // Root node represents files at the repository root (README, config, etc.)
  const rootFiles = files.filter(f => !f.path.includes('/'));
  nodes.push({
    id: 'root',
    label: 'Root',
    type: 'root',
    fileCount: rootFiles.length,
    totalSize: rootFiles.reduce((s, f) => s + (f.size || 0), 0),
    languages: getLanguagesForFiles(rootFiles),
    frameworks: [],
    isHotspot: false,
  });

  // --- Top-level directory nodes ---
  for (const dir of topDirs) {
    const dirPath = dir.path;
    const childFiles = files.filter(f => f.path.startsWith(dirPath + '/'));
    const childDirs = dirs.filter(d => d.path.startsWith(dirPath + '/'));

    const dirLanguages = getLanguagesForFiles(childFiles);

    // Associate frameworks with directories based on conventional naming
    // (e.g. "frontend" dir gets frontend frameworks, "backend" dir gets backend ones)
    const dirFrameworks = insights.frameworks
      .filter(fw => {
        if (fw.detectedFrom.includes(dirPath)) return true;
        const isModuleDir = ['frontend', 'client', 'web', 'app', 'backend', 'server', 'api'].includes(dirPath);
        if (isModuleDir) {
          if (['frontend', 'client', 'web'].includes(dirPath) && fw.category === 'frontend') return true;
          if (['backend', 'server', 'api'].includes(dirPath) && fw.category === 'backend') return true;
        }
        return false;
      })
      .map(fw => fw.name);

    const isEntry = insights.entryPoints.some(ep => ep.startsWith(dirPath + '/') || ep === dirPath);
    const isHotspot = childFiles.length > hotspotThreshold;

    nodes.push({
      id: dirPath,
      label: dirPath,
      type: isEntry ? 'entry' : 'module',
      fileCount: childFiles.length,
      totalSize: childFiles.reduce((s, f) => s + (f.size || 0), 0),
      languages: dirLanguages,
      frameworks: dirFrameworks,
      isHotspot,
    });

    edges.push({ source: 'root', target: dirPath });

    // Depth-2 subdirectories (e.g. src/components, src/services)
    const importantSubdirs = childDirs.filter(d => {
      const parts = d.path.split('/');
      return parts.length === 2;
    });

    for (const subdir of importantSubdirs) {
      const subFiles = files.filter(f => f.path.startsWith(subdir.path + '/'));
      if (subFiles.length < 2) continue;

      const subLangs = getLanguagesForFiles(subFiles);
      const subIsHotspot = subFiles.length > hotspotThreshold;

      nodes.push({
        id: subdir.path,
        label: subdir.path.split('/').pop() || subdir.path,
        type: 'module',
        fileCount: subFiles.length,
        totalSize: subFiles.reduce((s, f) => s + (f.size || 0), 0),
        languages: subLangs,
        frameworks: [],
        isHotspot: subIsHotspot,
      });

      edges.push({ source: dirPath, target: subdir.path });
    }
  }

  // --- Entry point file nodes ---
  // If an entry point wasn't already represented by a directory node, add it as a file node
  for (const ep of insights.entryPoints) {
    const existingNode = nodes.find(n => n.id === ep);
    if (!existingNode) {
      const file = files.find(f => f.path === ep);
      const ext = ep.split('.').pop() || '';
      nodes.push({
        id: ep,
        label: ep.split('/').pop() || ep,
        type: 'entry',
        fileCount: 1,
        totalSize: file?.size || 0,
        languages: EXTENSION_LANG[ext] ? [EXTENSION_LANG[ext]] : [],
        frameworks: [],
        isHotspot: false,
      });

      // Attach to nearest parent directory node, or root if none exists
      const parentDir = ep.split('/').slice(0, -1).join('/');
      const parentNode = nodes.find(n => n.id === parentDir);
      if (parentNode) {
        edges.push({ source: parentDir, target: ep, label: 'entry' });
      } else {
        edges.push({ source: 'root', target: ep, label: 'entry' });
      }
    }
  }

  // --- External dependency group nodes ---
  // Groups manifests by type (npm, maven, etc.) so each ecosystem is one node
  const manifestGroups = new Map<string, DependencyManifest[]>();
  for (const m of manifests) {
    const group = manifestGroups.get(m.type) || [];
    group.push(m);
    manifestGroups.set(m.type, group);
  }

  for (const [type, group] of manifestGroups) {
    const totalDeps = group.reduce((s, m) => s + m.totalCount, 0);
    const nodeId = `ext-${type}`;

    nodes.push({
      id: nodeId,
      label: `${type} deps (${totalDeps})`,
      type: 'external',
      fileCount: totalDeps,
      totalSize: 0,
      languages: [],
      frameworks: [],
      isHotspot: false,
    });

    // Connect each manifest's parent directory to the external dep node
    for (const m of group) {
      const dir = m.path.split('/').slice(0, -1).join('/') || 'root';
      const sourceNode = nodes.find(n => n.id === dir);
      if (sourceNode) {
        edges.push({ source: dir, target: nodeId, label: `${m.totalCount} packages` });
      } else {
        edges.push({ source: 'root', target: nodeId, label: `${m.totalCount} packages` });
      }
    }
  }

  // --- Root-level config file nodes (up to 5) ---
  for (const confFile of insights.configFiles.slice(0, 5)) {
    if (confFile.includes('/')) continue;
    const existingNode = nodes.find(n => n.id === confFile);
    if (!existingNode) {
      nodes.push({
        id: confFile,
        label: confFile,
        type: 'config',
        fileCount: 1,
        totalSize: 0,
        languages: [],
        frameworks: [],
        isHotspot: false,
      });
      edges.push({ source: 'root', target: confFile });
    }
  }

  return { nodes, edges };
}

/** Tallies file extensions within a set of files and returns the top 3 languages. */
function getLanguagesForFiles(files: GitHubTreeItem[]): string[] {
  const langCount = new Map<string, number>();
  for (const f of files) {
    const ext = f.path.split('.').pop()?.toLowerCase() || '';
    const lang = EXTENSION_LANG[ext];
    if (lang) {
      langCount.set(lang, (langCount.get(lang) || 0) + 1);
    }
  }
  return Array.from(langCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([lang]) => lang);
}
