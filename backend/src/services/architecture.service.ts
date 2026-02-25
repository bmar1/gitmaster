import {
  GitHubTreeItem,
  DependencyManifest,
  ProjectInsight,
  ArchitectureGraph,
  ArchitectureNode,
  ArchitectureEdge,
  LanguageStats,
} from '../types';

const EXTENSION_LANG: Record<string, string> = {
  ts: 'TypeScript', tsx: 'TypeScript', js: 'JavaScript', jsx: 'JavaScript',
  py: 'Python', java: 'Java', kt: 'Kotlin', rs: 'Rust', go: 'Go',
  rb: 'Ruby', php: 'PHP', cs: 'C#', cpp: 'C++', c: 'C', swift: 'Swift',
  vue: 'Vue', svelte: 'Svelte', html: 'HTML', css: 'CSS', scss: 'SCSS',
};

export function buildArchitectureGraph(
  tree: GitHubTreeItem[],
  manifests: DependencyManifest[],
  insights: ProjectInsight,
  languages: LanguageStats[],
): ArchitectureGraph {
  const nodes: ArchitectureNode[] = [];
  const edges: ArchitectureEdge[] = [];

  const files = tree.filter(t => t.type === 'blob');
  const dirs = tree.filter(t => t.type === 'tree');

  const topDirs = dirs.filter(d => !d.path.includes('/'));

  const avgFileCount = files.length / Math.max(topDirs.length, 1);
  const hotspotThreshold = avgFileCount * 1.5;

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

  for (const dir of topDirs) {
    const dirPath = dir.path;
    const childFiles = files.filter(f => f.path.startsWith(dirPath + '/'));
    const childDirs = dirs.filter(d => d.path.startsWith(dirPath + '/'));

    const dirLanguages = getLanguagesForFiles(childFiles);
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

      const parentDir = ep.split('/').slice(0, -1).join('/');
      const parentNode = nodes.find(n => n.id === parentDir);
      if (parentNode) {
        edges.push({ source: parentDir, target: ep, label: 'entry' });
      } else {
        edges.push({ source: 'root', target: ep, label: 'entry' });
      }
    }
  }

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
