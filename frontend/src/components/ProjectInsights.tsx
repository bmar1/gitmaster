/**
 * ProjectInsights — Detailed project analysis display.
 *
 * Renders three overview cards (project type, health indicators, quick stats),
 * a grid of detected framework cards with descriptions and confidence scores,
 * and entry points / key directories / config files panels.
 */

import { ProjectInsight, DetectedFramework } from '../types';
import {
  Layout, Server, TestTube2, Wrench, Database, Cloud, Paintbrush, Settings,
  CheckCircle2, XCircle, FolderTree, FileCode, Terminal, Gauge, Info
} from 'lucide-react';

const CATEGORY_CONFIG: Record<DetectedFramework['category'], { label: string; icon: typeof Layout; accent: string; bg: string }> = {
  frontend:  { label: 'Frontend',  icon: Layout,     accent: 'text-accent',    bg: 'bg-accent/10' },
  backend:   { label: 'Backend',   icon: Server,     accent: 'text-sage',      bg: 'bg-sage/10' },
  testing:   { label: 'Testing',   icon: TestTube2,  accent: 'text-ochre',     bg: 'bg-ochre/10' },
  build:     { label: 'Build',     icon: Wrench,     accent: 'text-secondary', bg: 'bg-secondary/10' },
  database:  { label: 'Database',  icon: Database,   accent: 'text-sage',      bg: 'bg-sage/10' },
  devops:    { label: 'DevOps',    icon: Cloud,      accent: 'text-mist',      bg: 'bg-mist/10' },
  styling:   { label: 'Styling',   icon: Paintbrush, accent: 'text-accent',    bg: 'bg-accent/10' },
  utility:   { label: 'Utility',   icon: Settings,   accent: 'text-muted',     bg: 'bg-muted/10' },
};

const FRAMEWORK_DESCRIPTIONS: Record<string, string> = {
  'React': 'Component-based UI library by Meta for building interactive user interfaces',
  'Next.js': 'Full-stack React framework with server-side rendering, routing, and API routes',
  'Vue': 'Progressive JavaScript framework for building UIs with a gentle learning curve',
  'Nuxt': 'Vue framework providing SSR, static generation, and file-based routing',
  'Angular': 'Enterprise-grade platform by Google for building scalable web applications',
  'Svelte': 'Compiler-based framework that shifts work to build time for zero runtime overhead',
  'Express': 'Minimal, unopinionated web framework — the de facto standard for Node.js APIs',
  'Fastify': 'High-performance Node.js web framework focused on low overhead and plugin architecture',
  'NestJS': 'Progressive Node.js framework using decorators and modules, inspired by Angular',
  'Spring Boot': 'Convention-over-configuration Java framework for production-grade applications',
  'Django': 'Batteries-included Python web framework with ORM, admin panel, and auth built-in',
  'Flask': 'Lightweight Python micro-framework that gives you full control over architecture',
  'FastAPI': 'Modern Python API framework with automatic OpenAPI docs and async support',
  'Ruby on Rails': 'Full-stack Ruby framework emphasizing convention over configuration',
  'Laravel': 'Elegant PHP framework with expressive syntax and rich ecosystem',
  'Actix Web': 'Extremely fast Rust web framework built on the Actix actor system',
  'Gin': 'High-performance Go web framework with a martini-like API',
  'TailwindCSS': 'Utility-first CSS framework for rapidly building custom designs',
  'Sass/SCSS': 'CSS preprocessor adding variables, nesting, and mixins to stylesheets',
  'Styled Components': 'CSS-in-JS library using tagged template literals for component-scoped styles',
  'Jest': 'Zero-config JavaScript testing framework with snapshot testing and mocking',
  'Vitest': 'Blazing fast unit testing framework powered by Vite with Jest-compatible API',
  'Mocha': 'Flexible JavaScript testing framework running on Node.js and in the browser',
  'Pytest': 'Python testing framework with fixtures, parameterization, and rich plugin ecosystem',
  'JUnit': 'The standard unit testing framework for Java and JVM languages',
  'Cypress': 'End-to-end testing framework that runs tests directly in the browser',
  'Playwright': 'Cross-browser end-to-end testing by Microsoft supporting Chromium, Firefox, and WebKit',
  'Webpack': 'Highly configurable module bundler for JavaScript applications',
  'Vite': 'Next-generation build tool using native ES modules for instant dev server startup',
  'Rollup': 'ES module bundler optimized for library publishing with tree-shaking',
  'esbuild': 'Extremely fast JavaScript bundler and minifier written in Go',
  'Turbopack': 'Incremental bundler optimized for large-scale monorepo builds',
  'Docker': 'Container platform for packaging applications with all dependencies',
  'GitHub Actions': 'CI/CD platform integrated directly into GitHub repositories',
  'PostgreSQL': 'Advanced open-source relational database with strong SQL compliance',
  'MongoDB': 'Document-oriented NoSQL database for flexible, schema-less data storage',
  'Prisma': 'Type-safe database client with auto-generated queries and migrations',
  'TypeORM': 'ORM for TypeScript and JavaScript supporting Active Record and Data Mapper patterns',
  'SQLAlchemy': 'Python SQL toolkit and ORM with both high-level and low-level APIs',
  'Redis': 'In-memory data store used as cache, message broker, and session store',
  'TypeScript': 'Typed superset of JavaScript that compiles to plain JS',
  'ESLint': 'Pluggable linter for identifying and fixing problems in JavaScript code',
  'Prettier': 'Opinionated code formatter enforcing consistent style across a codebase',
};

function FrameworkCard({ fw }: { fw: DetectedFramework }) {
  const config = CATEGORY_CONFIG[fw.category];
  const Icon = config.icon;
  const description = FRAMEWORK_DESCRIPTIONS[fw.name];
  const confidencePercent = Math.round(fw.confidence * 100);

  return (
    <div className="card-glow p-4 group">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4.5 h-4.5 ${config.accent}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-code text-sm font-medium text-primary group-hover:text-accent transition-colors">{fw.name}</span>
            {fw.version && (
              <span className="text-[10px] font-code px-1.5 py-0.5 rounded bg-surface-alt text-muted border border-border/30">{fw.version}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] font-code ${config.accent} uppercase tracking-wider`}>{config.label}</span>
            <span className="text-muted/40">·</span>
            <span className="text-[10px] font-code text-muted">{fw.detectedFrom}</span>
          </div>
          {description && (
            <p className="text-xs text-muted/80 font-body leading-relaxed">{description}</p>
          )}
        </div>
        <div className="flex-shrink-0 flex items-center gap-1" title={`${confidencePercent}% detection confidence`}>
          <Gauge className="w-3 h-3 text-muted/50" />
          <span className="text-[10px] font-code text-muted">{confidencePercent}%</span>
        </div>
      </div>
    </div>
  );
}

function BoolIndicator({ value, label, detail }: { value: boolean; label: string; detail?: string }) {
  return (
    <div className="flex items-start gap-2.5 py-1">
      {value
        ? <CheckCircle2 className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
        : <XCircle className="w-4 h-4 text-border flex-shrink-0 mt-0.5" />
      }
      <div>
        <span className={`text-sm font-body ${value ? 'text-primary' : 'text-muted/60'}`}>{label}</span>
        {detail && value && <p className="text-[11px] text-muted/70 font-body mt-0.5">{detail}</p>}
      </div>
    </div>
  );
}

export function ProjectInsights({ insights }: { insights: ProjectInsight }) {
  const grouped = new Map<string, DetectedFramework[]>();
  for (const fw of insights.frameworks) {
    const group = grouped.get(fw.category) || [];
    group.push(fw);
    grouped.set(fw.category, group);
  }

  return (
    <div className="space-y-8 animate-rise">
      {/* Project overview row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-glow p-6">
          <div className="flex items-center gap-2 mb-4">
            <FolderTree className="w-5 h-5 text-accent" />
            <h4 className="font-display font-semibold text-primary">Project Overview</h4>
          </div>
          <dl className="space-y-3">
            <div>
              <dt className="text-[10px] font-code text-muted uppercase tracking-wider">Type</dt>
              <dd className="font-code text-sm text-primary font-medium">{insights.projectType}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-code text-muted uppercase tracking-wider">Structure</dt>
              <dd className="font-code text-sm text-primary font-medium">{insights.structure}</dd>
            </div>
            {insights.buildTools.length > 0 && (
              <div>
                <dt className="text-[10px] font-code text-muted uppercase tracking-wider">Build Tools</dt>
                <dd className="font-code text-sm text-primary">{insights.buildTools.join(', ')}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="card-glow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-accent" />
            <h4 className="font-display font-semibold text-primary">Health Indicators</h4>
          </div>
          <div className="space-y-1">
            <BoolIndicator value={insights.hasTests} label="Test Suite" detail="Automated tests found in the project" />
            <BoolIndicator value={insights.hasCI} label="CI/CD Pipeline" detail="Continuous integration configured" />
            <BoolIndicator value={insights.hasDocker} label="Docker Support" detail="Containerization files present" />
            <BoolIndicator value={insights.hasDocs} label="Documentation" detail="README or docs directory found" />
            <BoolIndicator value={insights.hasLicense} label="License" detail="Open-source license file present" />
          </div>
        </div>

        <div className="card-glow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-accent" />
            <h4 className="font-display font-semibold text-primary">Quick Stats</h4>
          </div>
          <div className="space-y-3">
            <div>
              <dt className="text-[10px] font-code text-muted uppercase tracking-wider">Frameworks</dt>
              <dd className="font-display text-2xl font-bold text-primary">{insights.frameworks.length}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-code text-muted uppercase tracking-wider">Config Files</dt>
              <dd className="font-display text-2xl font-bold text-primary">{insights.configFiles.length}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-code text-muted uppercase tracking-wider">Categories</dt>
              <dd className="flex flex-wrap gap-1 mt-1">
                {Array.from(grouped.keys()).map(cat => {
                  const config = CATEGORY_CONFIG[cat as DetectedFramework['category']];
                  return (
                    <span key={cat} className={`text-[10px] font-code ${config.accent} px-1.5 py-0.5 rounded ${config.bg}`}>
                      {config.label}
                    </span>
                  );
                })}
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* Detected Stack — full framework cards */}
      {insights.frameworks.length > 0 && (
        <div>
          <h3 className="font-display text-xl font-semibold text-primary mb-5">Detected Stack</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {insights.frameworks.map(fw => (
              <FrameworkCard key={fw.name} fw={fw} />
            ))}
          </div>
        </div>
      )}

      {/* Entry Points & Key Directories */}
      {(insights.entryPoints.length > 0 || insights.keyDirectories.length > 0 || insights.configFiles.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights.entryPoints.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileCode className="w-4.5 h-4.5 text-sage" />
                <h4 className="font-display font-semibold text-primary text-sm">Entry Points</h4>
              </div>
              <div className="space-y-1">
                {insights.entryPoints.map(ep => (
                  <div key={ep} className="font-code text-xs text-secondary py-1 px-2 rounded bg-surface-alt/50 truncate">{ep}</div>
                ))}
              </div>
            </div>
          )}

          {insights.keyDirectories.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-4.5 h-4.5 text-ochre" />
                <h4 className="font-display font-semibold text-primary text-sm">Key Directories</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {insights.keyDirectories.map(dir => (
                  <span key={dir} className="font-code text-xs text-secondary py-1 px-2 rounded bg-surface-alt/50">{dir}/</span>
                ))}
              </div>
            </div>
          )}

          {insights.configFiles.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-4.5 h-4.5 text-muted" />
                <h4 className="font-display font-semibold text-primary text-sm">Config Files</h4>
              </div>
              <div className="space-y-1 max-h-[180px] overflow-y-auto">
                {insights.configFiles.map(cf => (
                  <div key={cf} className="font-code text-xs text-secondary py-1 px-2 rounded bg-surface-alt/50 truncate">{cf}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
