import { DependencyInfo, DependencyManifest, ManifestType, GitHubTreeItem } from '../types';
import { getFileContent } from './github.service';

const MANIFEST_PATTERNS: { pattern: RegExp; type: ManifestType }[] = [
  { pattern: /^(.*\/)?package\.json$/, type: 'npm' },
  { pattern: /^(.*\/)?pom\.xml$/, type: 'maven' },
  { pattern: /^(.*\/)?build\.gradle(\.kts)?$/, type: 'gradle' },
  { pattern: /^(.*\/)?requirements\.txt$/, type: 'pip' },
  { pattern: /^(.*\/)?Pipfile$/, type: 'pipenv' },
  { pattern: /^(.*\/)?pyproject\.toml$/, type: 'poetry' },
  { pattern: /^(.*\/)?Cargo\.toml$/, type: 'cargo' },
  { pattern: /^(.*\/)?go\.mod$/, type: 'go' },
  { pattern: /^(.*\/)?Gemfile$/, type: 'gemfile' },
  { pattern: /^(.*\/)?composer\.json$/, type: 'composer' },
  { pattern: /^(.*\/)?.*\.csproj$/, type: 'nuget' },
];

const EXCLUDED_DIRS = ['node_modules', 'vendor', '.git', 'dist', 'build', 'target', '__pycache__'];

export function findManifestFiles(tree: GitHubTreeItem[]): { path: string; type: ManifestType }[] {
  const manifests: { path: string; type: ManifestType }[] = [];

  for (const item of tree) {
    if (item.type !== 'blob') continue;
    if (EXCLUDED_DIRS.some(d => item.path.includes(`${d}/`))) continue;

    for (const { pattern, type } of MANIFEST_PATTERNS) {
      if (pattern.test(item.path)) {
        manifests.push({ path: item.path, type });
        break;
      }
    }
  }

  return manifests;
}

export async function extractAllDependencies(
  owner: string,
  repo: string,
  tree: GitHubTreeItem[]
): Promise<DependencyInfo> {
  const manifestFiles = findManifestFiles(tree);
  const manifests: DependencyManifest[] = [];

  const results = await Promise.allSettled(
    manifestFiles.map(async (mf) => {
      try {
        const content = await getFileContent(owner, repo, mf.path);
        return parseManifest(content, mf.path, mf.type);
      } catch {
        return null;
      }
    })
  );

  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) {
      manifests.push(r.value);
    }
  }

  const totalDependencies = manifests.reduce((sum, m) => sum + Object.keys(m.production).length, 0);
  const totalDevDependencies = manifests.reduce((sum, m) => sum + Object.keys(m.development).length, 0);

  return {
    manifests,
    totalDependencies,
    totalDevDependencies,
    totalCount: totalDependencies + totalDevDependencies,
  };
}

function parseManifest(content: string, path: string, type: ManifestType): DependencyManifest | null {
  switch (type) {
    case 'npm': return parseNpm(content, path);
    case 'maven': return parseMaven(content, path);
    case 'gradle': return parseGradle(content, path);
    case 'pip': return parsePip(content, path);
    case 'pipenv': return parsePipenv(content, path);
    case 'poetry': return parsePoetry(content, path);
    case 'cargo': return parseCargo(content, path);
    case 'go': return parseGoMod(content, path);
    case 'gemfile': return parseGemfile(content, path);
    case 'composer': return parseComposer(content, path);
    case 'nuget': return parseNuget(content, path);
    default: return null;
  }
}

function parseNpm(content: string, path: string): DependencyManifest | null {
  try {
    const pkg = JSON.parse(content);
    const production = pkg.dependencies || {};
    const development = pkg.devDependencies || {};
    return {
      path,
      type: 'npm',
      production,
      development,
      totalCount: Object.keys(production).length + Object.keys(development).length,
    };
  } catch { return null; }
}

function parseMaven(content: string, path: string): DependencyManifest | null {
  try {
    const production: Record<string, string> = {};
    const development: Record<string, string> = {};
    const depRegex = /<dependency>\s*<groupId>(.*?)<\/groupId>\s*<artifactId>(.*?)<\/artifactId>(?:\s*<version>(.*?)<\/version>)?(?:\s*<scope>(.*?)<\/scope>)?/gs;
    let match;
    while ((match = depRegex.exec(content)) !== null) {
      const name = `${match[1]}:${match[2]}`;
      const version = match[3] || 'latest';
      const scope = match[4] || '';
      if (scope === 'test') {
        development[name] = version;
      } else {
        production[name] = version;
      }
    }
    if (Object.keys(production).length === 0 && Object.keys(development).length === 0) return null;
    return {
      path,
      type: 'maven',
      production,
      development,
      totalCount: Object.keys(production).length + Object.keys(development).length,
    };
  } catch { return null; }
}

function parseGradle(content: string, path: string): DependencyManifest | null {
  try {
    const production: Record<string, string> = {};
    const development: Record<string, string> = {};
    const depRegex = /(implementation|api|compileOnly|runtimeOnly|testImplementation|testCompileOnly)\s*[('"]([^'"()]+)['")\s]/g;
    let match;
    while ((match = depRegex.exec(content)) !== null) {
      const keyword = match[1];
      const dep = match[2];
      const parts = dep.split(':');
      const name = parts.length >= 2 ? `${parts[0]}:${parts[1]}` : dep;
      const version = parts[2] || 'latest';
      if (keyword.startsWith('test')) {
        development[name] = version;
      } else {
        production[name] = version;
      }
    }
    if (Object.keys(production).length === 0 && Object.keys(development).length === 0) return null;
    return {
      path,
      type: 'gradle',
      production,
      development,
      totalCount: Object.keys(production).length + Object.keys(development).length,
    };
  } catch { return null; }
}

function parsePip(content: string, path: string): DependencyManifest | null {
  try {
    const production: Record<string, string> = {};
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue;
      const match = trimmed.match(/^([a-zA-Z0-9_.-]+)\s*(?:([><=!~]+)\s*(.+))?$/);
      if (match) {
        production[match[1]] = match[3] || 'latest';
      }
    }
    if (Object.keys(production).length === 0) return null;
    return { path, type: 'pip', production, development: {}, totalCount: Object.keys(production).length };
  } catch { return null; }
}

function parsePipenv(content: string, path: string): DependencyManifest | null {
  try {
    const production: Record<string, string> = {};
    const development: Record<string, string> = {};
    let section = '';
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed === '[packages]') { section = 'prod'; continue; }
      if (trimmed === '[dev-packages]') { section = 'dev'; continue; }
      if (trimmed.startsWith('[')) { section = ''; continue; }
      const match = trimmed.match(/^"?([a-zA-Z0-9_.-]+)"?\s*=\s*"?(.+?)"?\s*$/);
      if (match && section === 'prod') production[match[1]] = match[2];
      if (match && section === 'dev') development[match[1]] = match[2];
    }
    if (Object.keys(production).length === 0 && Object.keys(development).length === 0) return null;
    return {
      path, type: 'pipenv', production, development,
      totalCount: Object.keys(production).length + Object.keys(development).length,
    };
  } catch { return null; }
}

function parsePoetry(content: string, path: string): DependencyManifest | null {
  try {
    const production: Record<string, string> = {};
    const development: Record<string, string> = {};
    let section = '';
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed === '[tool.poetry.dependencies]') { section = 'prod'; continue; }
      if (trimmed.match(/^\[tool\.poetry\.(dev-dependencies|group\.dev\.dependencies)\]$/)) { section = 'dev'; continue; }
      if (trimmed.startsWith('[')) { section = ''; continue; }
      const match = trimmed.match(/^([a-zA-Z0-9_.-]+)\s*=\s*"?(.+?)"?\s*$/);
      if (match && match[1] !== 'python') {
        if (section === 'prod') production[match[1]] = match[2];
        if (section === 'dev') development[match[1]] = match[2];
      }
    }
    if (Object.keys(production).length === 0 && Object.keys(development).length === 0) return null;
    return {
      path, type: 'poetry', production, development,
      totalCount: Object.keys(production).length + Object.keys(development).length,
    };
  } catch { return null; }
}

function parseCargo(content: string, path: string): DependencyManifest | null {
  try {
    const production: Record<string, string> = {};
    const development: Record<string, string> = {};
    let section = '';
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed === '[dependencies]') { section = 'prod'; continue; }
      if (trimmed === '[dev-dependencies]') { section = 'dev'; continue; }
      if (trimmed.startsWith('[') && !trimmed.startsWith('[dependencies.') && !trimmed.startsWith('[dev-dependencies.')) { section = ''; continue; }
      const match = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*"?(.+?)"?\s*$/);
      if (match) {
        if (section === 'prod') production[match[1]] = match[2];
        if (section === 'dev') development[match[1]] = match[2];
      }
    }
    if (Object.keys(production).length === 0 && Object.keys(development).length === 0) return null;
    return {
      path, type: 'cargo', production, development,
      totalCount: Object.keys(production).length + Object.keys(development).length,
    };
  } catch { return null; }
}

function parseGoMod(content: string, path: string): DependencyManifest | null {
  try {
    const production: Record<string, string> = {};
    const requireRegex = /require\s*\(([\s\S]*?)\)/g;
    let block = requireRegex.exec(content);
    while (block) {
      const lines = block[1].split('\n');
      for (const line of lines) {
        const match = line.trim().match(/^(\S+)\s+(v\S+)/);
        if (match) production[match[1]] = match[2];
      }
      block = requireRegex.exec(content);
    }
    const singleReq = /^require\s+(\S+)\s+(v\S+)/gm;
    let sm;
    while ((sm = singleReq.exec(content)) !== null) {
      production[sm[1]] = sm[2];
    }
    if (Object.keys(production).length === 0) return null;
    return { path, type: 'go', production, development: {}, totalCount: Object.keys(production).length };
  } catch { return null; }
}

function parseGemfile(content: string, path: string): DependencyManifest | null {
  try {
    const production: Record<string, string> = {};
    const development: Record<string, string> = {};
    let inDevGroup = false;
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.match(/^group\s+:development/)) { inDevGroup = true; continue; }
      if (trimmed === 'end') { inDevGroup = false; continue; }
      const match = trimmed.match(/^gem\s+['"]([^'"]+)['"]\s*(?:,\s*['"](.+?)['"])?/);
      if (match) {
        const target = inDevGroup ? development : production;
        target[match[1]] = match[2] || 'latest';
      }
    }
    if (Object.keys(production).length === 0 && Object.keys(development).length === 0) return null;
    return {
      path, type: 'gemfile', production, development,
      totalCount: Object.keys(production).length + Object.keys(development).length,
    };
  } catch { return null; }
}

function parseComposer(content: string, path: string): DependencyManifest | null {
  try {
    const pkg = JSON.parse(content);
    const production = pkg.require || {};
    const development = pkg['require-dev'] || {};
    delete production['php'];
    Object.keys(production).forEach(k => { if (k.startsWith('ext-')) delete production[k]; });
    return {
      path, type: 'composer', production, development,
      totalCount: Object.keys(production).length + Object.keys(development).length,
    };
  } catch { return null; }
}

function parseNuget(content: string, path: string): DependencyManifest | null {
  try {
    const production: Record<string, string> = {};
    const regex = /<PackageReference\s+Include="([^"]+)"\s+Version="([^"]+)"/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      production[match[1]] = match[2];
    }
    if (Object.keys(production).length === 0) return null;
    return { path, type: 'nuget', production, development: {}, totalCount: Object.keys(production).length };
  } catch { return null; }
}
