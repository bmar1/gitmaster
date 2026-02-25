/**
 * Analyzer Service
 *
 * Performs high-level project analysis by cross-referencing the file tree
 * with parsed dependency data. Detects frameworks, classifies the project type,
 * identifies structure patterns (monorepo, multi-module, etc.), and generates
 * a human-readable summary.
 */

import { GitHubTreeItem, DetectedFramework, ProjectInsight, DependencyManifest } from '../types';

/**
 * Framework detection signatures.
 * Each entry defines the framework name, its functional category, and a set
 * of indicators (dependency names, file patterns, directory patterns).
 * The more indicators match, the higher the detection confidence.
 */
const FRAMEWORK_SIGNATURES: {
  name: string;
  category: DetectedFramework['category'];
  indicators: { type: 'dep' | 'file' | 'dir'; pattern: string }[];
}[] = [
  { name: 'React', category: 'frontend', indicators: [{ type: 'dep', pattern: 'react' }, { type: 'file', pattern: 'jsx' }, { type: 'file', pattern: 'tsx' }] },
  { name: 'Next.js', category: 'frontend', indicators: [{ type: 'dep', pattern: 'next' }, { type: 'file', pattern: 'next.config' }, { type: 'dir', pattern: 'app' }] },
  { name: 'Vue', category: 'frontend', indicators: [{ type: 'dep', pattern: 'vue' }, { type: 'file', pattern: '.vue' }] },
  { name: 'Nuxt', category: 'frontend', indicators: [{ type: 'dep', pattern: 'nuxt' }, { type: 'file', pattern: 'nuxt.config' }] },
  { name: 'Angular', category: 'frontend', indicators: [{ type: 'dep', pattern: '@angular/core' }, { type: 'file', pattern: 'angular.json' }] },
  { name: 'Svelte', category: 'frontend', indicators: [{ type: 'dep', pattern: 'svelte' }, { type: 'file', pattern: '.svelte' }] },
  { name: 'Express', category: 'backend', indicators: [{ type: 'dep', pattern: 'express' }] },
  { name: 'Fastify', category: 'backend', indicators: [{ type: 'dep', pattern: 'fastify' }] },
  { name: 'NestJS', category: 'backend', indicators: [{ type: 'dep', pattern: '@nestjs/core' }] },
  { name: 'Spring Boot', category: 'backend', indicators: [{ type: 'dep', pattern: 'spring-boot' }] },
  { name: 'Django', category: 'backend', indicators: [{ type: 'dep', pattern: 'django' }, { type: 'file', pattern: 'manage.py' }] },
  { name: 'Flask', category: 'backend', indicators: [{ type: 'dep', pattern: 'flask' }] },
  { name: 'FastAPI', category: 'backend', indicators: [{ type: 'dep', pattern: 'fastapi' }] },
  { name: 'Ruby on Rails', category: 'backend', indicators: [{ type: 'dep', pattern: 'rails' }, { type: 'dir', pattern: 'app/controllers' }] },
  { name: 'Laravel', category: 'backend', indicators: [{ type: 'dep', pattern: 'laravel/framework' }, { type: 'file', pattern: 'artisan' }] },
  { name: 'Actix Web', category: 'backend', indicators: [{ type: 'dep', pattern: 'actix-web' }] },
  { name: 'Gin', category: 'backend', indicators: [{ type: 'dep', pattern: 'github.com/gin-gonic/gin' }] },
  { name: 'TailwindCSS', category: 'styling', indicators: [{ type: 'dep', pattern: 'tailwindcss' }, { type: 'file', pattern: 'tailwind.config' }] },
  { name: 'Sass/SCSS', category: 'styling', indicators: [{ type: 'dep', pattern: 'sass' }, { type: 'file', pattern: '.scss' }] },
  { name: 'Styled Components', category: 'styling', indicators: [{ type: 'dep', pattern: 'styled-components' }] },
  { name: 'Jest', category: 'testing', indicators: [{ type: 'dep', pattern: 'jest' }, { type: 'file', pattern: 'jest.config' }] },
  { name: 'Vitest', category: 'testing', indicators: [{ type: 'dep', pattern: 'vitest' }] },
  { name: 'Mocha', category: 'testing', indicators: [{ type: 'dep', pattern: 'mocha' }] },
  { name: 'Pytest', category: 'testing', indicators: [{ type: 'dep', pattern: 'pytest' }] },
  { name: 'JUnit', category: 'testing', indicators: [{ type: 'dep', pattern: 'junit' }] },
  { name: 'Cypress', category: 'testing', indicators: [{ type: 'dep', pattern: 'cypress' }, { type: 'dir', pattern: 'cypress' }] },
  { name: 'Playwright', category: 'testing', indicators: [{ type: 'dep', pattern: 'playwright' }] },
  { name: 'Webpack', category: 'build', indicators: [{ type: 'dep', pattern: 'webpack' }, { type: 'file', pattern: 'webpack.config' }] },
  { name: 'Vite', category: 'build', indicators: [{ type: 'dep', pattern: 'vite' }, { type: 'file', pattern: 'vite.config' }] },
  { name: 'Rollup', category: 'build', indicators: [{ type: 'dep', pattern: 'rollup' }] },
  { name: 'esbuild', category: 'build', indicators: [{ type: 'dep', pattern: 'esbuild' }] },
  { name: 'Turbopack', category: 'build', indicators: [{ type: 'file', pattern: 'turbo.json' }] },
  { name: 'Docker', category: 'devops', indicators: [{ type: 'file', pattern: 'Dockerfile' }, { type: 'file', pattern: 'docker-compose' }] },
  { name: 'GitHub Actions', category: 'devops', indicators: [{ type: 'dir', pattern: '.github/workflows' }] },
  { name: 'PostgreSQL', category: 'database', indicators: [{ type: 'dep', pattern: 'pg' }, { type: 'dep', pattern: 'psycopg' }] },
  { name: 'MongoDB', category: 'database', indicators: [{ type: 'dep', pattern: 'mongoose' }, { type: 'dep', pattern: 'mongodb' }] },
  { name: 'Prisma', category: 'database', indicators: [{ type: 'dep', pattern: 'prisma' }, { type: 'file', pattern: 'schema.prisma' }] },
  { name: 'TypeORM', category: 'database', indicators: [{ type: 'dep', pattern: 'typeorm' }] },
  { name: 'SQLAlchemy', category: 'database', indicators: [{ type: 'dep', pattern: 'sqlalchemy' }] },
  { name: 'Redis', category: 'database', indicators: [{ type: 'dep', pattern: 'redis' }, { type: 'dep', pattern: 'ioredis' }] },
  { name: 'TypeScript', category: 'utility', indicators: [{ type: 'dep', pattern: 'typescript' }, { type: 'file', pattern: 'tsconfig.json' }] },
  { name: 'ESLint', category: 'utility', indicators: [{ type: 'dep', pattern: 'eslint' }, { type: 'file', pattern: '.eslintrc' }] },
  { name: 'Prettier', category: 'utility', indicators: [{ type: 'dep', pattern: 'prettier' }, { type: 'file', pattern: '.prettierrc' }] },
];

/**
 * Top-level project analysis. Collects all dependency names into a set,
 * splits the tree into files and directories, then runs detection passes
 * for frameworks, project type, structure, tests, CI, docs, and more.
 */
export function analyzeProject(
  tree: GitHubTreeItem[],
  manifests: DependencyManifest[]
): ProjectInsight {
  // Flatten all deps (prod + dev) across every manifest into a single lowercase set
  // so framework detection can do fast O(1) lookups regardless of ecosystem
  const allDeps = new Set<string>();
  for (const m of manifests) {
    for (const dep of Object.keys(m.production)) allDeps.add(dep.toLowerCase());
    for (const dep of Object.keys(m.development)) allDeps.add(dep.toLowerCase());
  }

  const filePaths = tree.filter(t => t.type === 'blob').map(t => t.path);
  const dirPaths = tree.filter(t => t.type === 'tree').map(t => t.path);

  const frameworks = detectFrameworks(allDeps, filePaths, dirPaths, manifests);
  const projectType = detectProjectType(frameworks, filePaths, dirPaths, manifests);
  const structure = detectStructure(dirPaths, manifests);
  const buildTools = frameworks.filter(f => f.category === 'build').map(f => f.name);

  const testDirs = ['test', 'tests', '__tests__', 'spec', 'specs'];
  const hasTests = dirPaths.some(d => testDirs.some(td => d === td || d.endsWith(`/${td}`))) ||
    filePaths.some(f => f.match(/\.(test|spec)\.(ts|tsx|js|jsx|py|rb)$/));

  const hasCI = dirPaths.some(d => d.includes('.github/workflows')) ||
    filePaths.some(f => f.includes('.gitlab-ci') || f.includes('Jenkinsfile') || f.includes('.circleci'));

  const hasDocs = dirPaths.some(d => d === 'docs' || d === 'doc') ||
    filePaths.some(f => f.match(/^(README|CONTRIBUTING|CHANGELOG|docs\/)/i));

  const hasDocker = filePaths.some(f => f.match(/(Dockerfile|docker-compose)/i));
  const hasLicense = filePaths.some(f => f.match(/^LICENSE/i));

  const entryPoints = findEntryPoints(filePaths, manifests);
  const configFiles = filePaths.filter(f => isConfigFile(f));
  const keyDirectories = findKeyDirectories(dirPaths);

  return {
    projectType,
    structure,
    frameworks,
    buildTools,
    hasTests,
    hasCI,
    hasDocs,
    hasDocker,
    hasLicense,
    entryPoints,
    configFiles,
    keyDirectories,
  };
}

/**
 * Scores each framework signature against the repo's dependency set, files, and dirs.
 * Confidence = (matched indicators) / (total indicators), capped at 1.0.
 * Results are sorted by confidence descending so the most certain detections come first.
 */
function detectFrameworks(
  deps: Set<string>,
  files: string[],
  dirs: string[],
  manifests: DependencyManifest[]
): DetectedFramework[] {
  const detected: DetectedFramework[] = [];

  for (const sig of FRAMEWORK_SIGNATURES) {
    let hits = 0;
    let detectedFrom = '';
    let version: string | undefined;

    for (const indicator of sig.indicators) {
      if (indicator.type === 'dep') {
        if (deps.has(indicator.pattern.toLowerCase())) {
          hits++;
          detectedFrom = `dependency: ${indicator.pattern}`;
          for (const m of manifests) {
            version = m.production[indicator.pattern] || m.development[indicator.pattern] || version;
          }
        }
      } else if (indicator.type === 'file') {
        if (files.some(f => f.toLowerCase().includes(indicator.pattern.toLowerCase()))) {
          hits++;
          if (!detectedFrom) detectedFrom = `file: ${indicator.pattern}`;
        }
      } else if (indicator.type === 'dir') {
        if (dirs.some(d => d.toLowerCase().includes(indicator.pattern.toLowerCase()))) {
          hits++;
          if (!detectedFrom) detectedFrom = `directory: ${indicator.pattern}`;
        }
      }
    }

    if (hits > 0) {
      const confidence = Math.min(hits / sig.indicators.length, 1.0);
      detected.push({
        name: sig.name,
        category: sig.category,
        confidence,
        version,
        detectedFrom,
      });
    }
  }

  return detected.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Classifies the overall project type based on which framework categories
 * were detected and which conventional directories exist.
 */
function detectProjectType(
  frameworks: DetectedFramework[],
  files: string[],
  dirs: string[],
  _manifests: DependencyManifest[]
): string {
  const hasFrontend = frameworks.some(f => f.category === 'frontend');
  const hasBackend = frameworks.some(f => f.category === 'backend');
  const hasLib = files.some(f => f === 'index.d.ts') || dirs.some(d => d === 'lib' || d === 'src/lib');

  if (hasFrontend && hasBackend) return 'Full-Stack Application';
  if (hasFrontend) return 'Frontend Application';
  if (hasBackend) return 'Backend Service / API';
  if (hasLib) return 'Library / Package';
  if (files.some(f => f.match(/^(cli|bin)\//))) return 'CLI Tool';
  if (dirs.some(d => d === 'src')) return 'Application';
  return 'Project';
}

/**
 * Determines repository structure by analyzing where manifest files live
 * and checking for conventional monorepo directories (packages/, apps/).
 */
function detectStructure(dirs: string[], manifests: DependencyManifest[]): string {
  // Group manifests by their parent directory to see if code lives in multiple modules
  const uniquePaths = new Set(manifests.map(m => {
    const parts = m.path.split('/');
    return parts.length > 1 ? parts.slice(0, -1).join('/') : 'root';
  }));

  if (uniquePaths.size > 2) return 'Monorepo';
  if (uniquePaths.size === 2 && !uniquePaths.has('root')) return 'Multi-Module';

  const hasPackages = dirs.some(d => d === 'packages');
  const hasApps = dirs.some(d => d === 'apps');
  if (hasPackages || hasApps) return 'Monorepo';

  const hasSeparate = dirs.some(d => d === 'frontend' || d === 'client') &&
                      dirs.some(d => d === 'backend' || d === 'server' || d === 'api');
  if (hasSeparate) return 'Multi-Module (Frontend + Backend)';

  return 'Single Module';
}

/**
 * Identifies likely entry point files by checking for conventional names
 * (index.ts, main.py, main.go, etc.) relative to each manifest's directory.
 */
function findEntryPoints(files: string[], manifests: DependencyManifest[]): string[] {
  const entries: string[] = [];

  for (const m of manifests) {
    if (m.type === 'npm') {
      const possibleMain = ['src/index.ts', 'src/index.js', 'src/main.ts', 'src/main.tsx', 'src/app.ts', 'index.ts', 'index.js', 'server.ts', 'server.js'];
      const dir = m.path.replace(/\/package\.json$/, '');
      for (const pm of possibleMain) {
        const full = dir ? `${dir}/${pm}` : pm;
        if (files.includes(full)) { entries.push(full); break; }
      }
    }
  }

  const globalEntries = ['main.py', 'app.py', 'manage.py', 'main.go', 'cmd/main.go', 'src/main.rs', 'src/lib.rs'];
  for (const ge of globalEntries) {
    if (files.includes(ge)) entries.push(ge);
  }

  return [...new Set(entries)];
}

/** Matches filenames against common config file naming conventions. */
function isConfigFile(path: string): boolean {
  const name = path.split('/').pop() || '';
  return /^(\..+rc\.?(js|json|yml|yaml|cjs|mjs)?|tsconfig.*\.json|jest\.config.*|vite\.config.*|webpack\.config.*|next\.config.*|nuxt\.config.*|tailwind\.config.*|postcss\.config.*|babel\.config.*|\.env\.example|Makefile|Dockerfile|docker-compose.*|\.gitignore|\.editorconfig|\.prettierrc.*|\.eslintrc.*)$/.test(name);
}

/** Filters directories to only those at depth ≤ 2 with architecturally significant names. */
function findKeyDirectories(dirs: string[]): string[] {
  const important = ['src', 'lib', 'app', 'api', 'pages', 'components', 'services',
    'utils', 'hooks', 'models', 'controllers', 'routes', 'middleware',
    'public', 'static', 'assets', 'config', 'scripts', 'test', 'tests',
    'docs', 'packages', 'apps', 'frontend', 'backend', 'server', 'client'];
  return dirs.filter(d => {
    const name = d.split('/').pop() || '';
    return important.includes(name) && d.split('/').length <= 2;
  });
}

/**
 * Generates a human-readable summary paragraph from the analysis results.
 * Combines the repo description, detected stack, structure, file count,
 * dependency count, language breakdown, and project health badges.
 */
export function generateSummary(
  repoDescription: string | null,
  _repoLanguage: string | null,
  insights: ProjectInsight,
  totalFiles: number,
  totalDeps: number,
  languages: { name: string; percentage: number }[]
): string {
  const parts: string[] = [];

  parts.push(repoDescription || 'No description provided by the repository maintainers.');

  const frontendFw = insights.frameworks.filter(f => f.category === 'frontend').map(f => f.name);
  const backendFw = insights.frameworks.filter(f => f.category === 'backend').map(f => f.name);
  const dbFw = insights.frameworks.filter(f => f.category === 'database').map(f => f.name);

  if (frontendFw.length || backendFw.length) {
    const stackParts: string[] = [];
    if (frontendFw.length) stackParts.push(`${frontendFw.join(', ')} on the frontend`);
    if (backendFw.length) stackParts.push(`${backendFw.join(', ')} on the backend`);
    if (dbFw.length) stackParts.push(`${dbFw.join(', ')} for data storage`);
    parts.push(`The project uses ${stackParts.join(', and ')}.`);
  }

  parts.push(`It is a ${insights.projectType.toLowerCase()} with a ${insights.structure.toLowerCase()} structure, comprising ${totalFiles} files and ${totalDeps} dependencies.`);

  if (languages.length > 0) {
    const topLangs = languages.slice(0, 3).map(l => `${l.name} (${l.percentage}%)`);
    parts.push(`Primary languages: ${topLangs.join(', ')}.`);
  }

  const badges: string[] = [];
  if (insights.hasTests) badges.push('test suite');
  if (insights.hasCI) badges.push('CI/CD pipeline');
  if (insights.hasDocker) badges.push('Docker support');
  if (insights.hasDocs) badges.push('documentation');
  if (badges.length) parts.push(`The project includes a ${badges.join(', ')}.`);

  return parts.join(' ');
}
