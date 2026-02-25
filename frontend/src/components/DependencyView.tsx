/**
 * DependencyView — Categorized dependency browser.
 *
 * Groups all dependencies from every manifest into functional categories
 * (frontend, backend, testing, etc.) and displays them with package manager
 * badges and short descriptions for each known package.
 */

import { DependencyInfo, DependencyManifest } from '../types';
import {
  Package, Layout, Server, TestTube2, Wrench, Database, Cloud,
  Paintbrush, Shield, Boxes, Plug, FileCode
} from 'lucide-react';

const MANIFEST_DESCRIPTIONS: Record<string, { label: string; desc: string }> = {
  npm:      { label: 'npm',      desc: 'Node.js / JavaScript package manager' },
  maven:    { label: 'Maven',    desc: 'Java build automation & dependency manager' },
  gradle:   { label: 'Gradle',   desc: 'JVM build tool with Groovy/Kotlin DSL' },
  pip:      { label: 'pip',      desc: 'Python package installer' },
  pipenv:   { label: 'Pipenv',   desc: 'Python virtualenv & dependency manager' },
  poetry:   { label: 'Poetry',   desc: 'Modern Python packaging & dependency tool' },
  cargo:    { label: 'Cargo',    desc: 'Rust package manager & build system' },
  go:       { label: 'Go Modules', desc: 'Go dependency management system' },
  gemfile:  { label: 'Bundler',  desc: 'Ruby dependency manager' },
  composer: { label: 'Composer', desc: 'PHP dependency manager' },
  nuget:    { label: 'NuGet',    desc: '.NET package manager' },
};

// --- Dependency category classification ---
type DepCategory = 'frontend' | 'backend' | 'testing' | 'build' | 'database' | 'styling' | 'devops' | 'auth' | 'utility' | 'other';

const CATEGORY_META: Record<DepCategory, { label: string; icon: typeof Layout; accent: string }> = {
  frontend: { label: 'Frontend',      icon: Layout,     accent: 'text-accent' },
  backend:  { label: 'Backend',       icon: Server,     accent: 'text-sage' },
  database: { label: 'Database',      icon: Database,   accent: 'text-sage' },
  auth:     { label: 'Auth & Security', icon: Shield,   accent: 'text-ochre' },
  testing:  { label: 'Testing',       icon: TestTube2,  accent: 'text-ochre' },
  styling:  { label: 'Styling & UI',  icon: Paintbrush, accent: 'text-accent' },
  build:    { label: 'Build & Tooling', icon: Wrench,   accent: 'text-secondary' },
  devops:   { label: 'DevOps & Cloud', icon: Cloud,     accent: 'text-mist' },
  utility:  { label: 'Utilities',     icon: Plug,       accent: 'text-muted' },
  other:    { label: 'Other',         icon: Boxes,      accent: 'text-muted' },
};

const CATEGORY_ORDER: DepCategory[] = [
  'frontend', 'backend', 'database', 'auth', 'styling', 'testing', 'build', 'devops', 'utility', 'other',
];

// Maps package name patterns to categories
const DEP_CATEGORY_RULES: { test: (name: string) => boolean; category: DepCategory }[] = [
  // Frontend
  { test: n => /^(react|react-dom|vue|@vue\/|angular|@angular\/|svelte|solid-js|preact|next|nuxt|gatsby|remix|astro|@tanstack\/react|swr|react-router|react-router-dom|vue-router|wouter|redux|@reduxjs\/|react-redux|zustand|recoil|mobx|jotai|valtio|pinia|vuex|xstate|ngrx|framer-motion|react-native|expo|@react-navigation)/.test(n), category: 'frontend' },
  // Styling
  { test: n => /^(tailwindcss|styled-components|@emotion\/|sass|less|postcss|autoprefixer|@mui\/|@chakra-ui\/|antd|@radix-ui\/|@headlessui\/|bootstrap|bulma|lucide|react-icons|clsx|class-variance-authority|tailwind-merge|@mantine)/.test(n), category: 'styling' },
  // Backend
  { test: n => /^(express|fastify|koa|hapi|@nestjs\/|django|flask|fastapi|uvicorn|gunicorn|celery|rails|sinatra|laravel|symfony|actix-web|axum|gin|echo|fiber|puma|sidekiq|spring-boot|socket\.io|ws|cors|helmet|compression|morgan|multer)/.test(n), category: 'backend' },
  // Database
  { test: n => /^(prisma|@prisma\/|typeorm|sequelize|mongoose|mongodb|pg|mysql2|better-sqlite3|drizzle-orm|knex|redis|ioredis|sqlalchemy|gorm|hibernate|spring-boot-starter-data)/.test(n), category: 'database' },
  // Auth
  { test: n => /^(passport|jsonwebtoken|bcrypt|bcryptjs|next-auth|@auth\/|lucia|devise|spring-boot-starter-security)/.test(n), category: 'auth' },
  // Testing
  { test: n => /^(jest|vitest|mocha|chai|cypress|playwright|@playwright\/|@testing-library\/|supertest|sinon|nock|msw|pytest|rspec|junit|mockito|phpunit|testify|spring-boot-starter-test)/.test(n), category: 'testing' },
  // Build & Tooling
  { test: n => /^(vite|webpack|esbuild|rollup|parcel|turbo|tsup|swc|typescript|ts-node|tsx|eslint|@typescript-eslint\/|prettier|husky|lint-staged|commitlint|nodemon|concurrently|lerna|nx|@changesets\/|black|flake8|mypy|poetry|cargo|clap|cobra|viper)/.test(n), category: 'build' },
  // DevOps & Cloud
  { test: n => /^(aws-sdk|@aws-sdk\/|firebase|firebase-admin|@google-cloud\/|stripe|@stripe\/|twilio|sendgrid|@sentry\/|newrelic|datadog|docker|boto3|puppeteer|cheerio)/.test(n), category: 'devops' },
  // Utility (common known ones)
  { test: n => /^(lodash|underscore|ramda|date-fns|dayjs|moment|uuid|nanoid|zod|yup|joi|class-validator|dotenv|chalk|commander|yargs|inquirer|ora|sharp|rxjs|immer|axios|got|node-fetch|undici|ky|graphql-request|@apollo\/|urql|requests|httpx|reqwest|pydantic|marked|highlight\.js|prismjs|d3|chart\.js|recharts|three|@react-three\/|gsap|octokit|winston|pino)/.test(n), category: 'utility' },
];

// --- Package descriptions (always-visible one-liners) ---
const PKG_DESC: Record<string, string> = {
  'react': 'UI library for building component-based interfaces',
  'react-dom': 'React renderer for web browsers',
  'vue': 'Progressive framework for building UIs',
  '@angular/core': 'Core Angular framework',
  '@angular/common': 'Common Angular utilities & pipes',
  '@angular/router': 'Client-side routing for Angular',
  'svelte': 'Compile-time reactive UI framework',
  'solid-js': 'Declarative, reactive UI library',
  'preact': 'Lightweight React alternative (3KB)',
  'next': 'React framework with SSR & file-based routing',
  'nuxt': 'Vue framework with SSR & file-based routing',
  'gatsby': 'React-based static site generator',
  'remix': 'Full-stack React framework',
  'astro': 'Content-focused web framework with island architecture',
  'redux': 'Predictable state container for JS apps',
  '@reduxjs/toolkit': 'Opinionated Redux with best practices',
  'react-redux': 'Official React bindings for Redux',
  'zustand': 'Lightweight state management for React',
  'mobx': 'Reactive state management with observables',
  'jotai': 'Primitive, flexible state management for React',
  'pinia': 'Intuitive state management for Vue',
  'vuex': 'Centralized state management for Vue',
  'xstate': 'State machines and statecharts for JS',
  'react-router': 'Declarative routing for React',
  'react-router-dom': 'DOM bindings for React Router',
  'vue-router': 'Official router for Vue.js',
  '@tanstack/react-query': 'Async state management & server cache',
  'swr': 'React hooks for data fetching with caching',
  'axios': 'Promise-based HTTP client',
  'got': 'HTTP request library for Node.js',
  'node-fetch': 'Fetch API for Node.js',
  'undici': 'Fast HTTP/1.1 client for Node.js',
  '@apollo/client': 'Full-featured GraphQL client for React',
  'urql': 'Lightweight GraphQL client',
  'tailwindcss': 'Utility-first CSS framework',
  'styled-components': 'CSS-in-JS with tagged template literals',
  '@emotion/react': 'CSS-in-JS library with React support',
  '@emotion/styled': 'Styled API for Emotion',
  'sass': 'CSS preprocessor with variables & nesting',
  'postcss': 'CSS transformation tool with plugins',
  'autoprefixer': 'Auto-adds vendor prefixes to CSS',
  '@mui/material': 'Material Design component library for React',
  '@chakra-ui/react': 'Accessible component library for React',
  'antd': 'Enterprise UI component library for React',
  '@radix-ui/react-dialog': 'Accessible dialog/modal primitive',
  '@headlessui/react': 'Unstyled, accessible UI components',
  'bootstrap': 'Popular CSS framework for responsive design',
  'lucide-react': 'Beautiful & consistent icon library for React',
  'react-icons': 'SVG icon packs for React',
  'clsx': 'Tiny utility for constructing className strings',
  'tailwind-merge': 'Merge Tailwind classes without conflicts',
  'express': 'Minimal web framework for Node.js',
  'fastify': 'Fast, low-overhead web framework for Node.js',
  'koa': 'Expressive middleware web framework for Node.js',
  '@nestjs/core': 'Progressive Node.js framework',
  '@nestjs/common': 'NestJS common utilities',
  'django': 'High-level Python web framework',
  'flask': 'Lightweight Python web framework',
  'fastapi': 'Modern, fast Python API framework',
  'uvicorn': 'Lightning-fast ASGI server for Python',
  'gunicorn': 'Python WSGI HTTP server',
  'celery': 'Distributed task queue for Python',
  'rails': 'Full-stack Ruby web framework',
  'sinatra': 'Lightweight Ruby web framework',
  'laravel/framework': 'Full-stack PHP web framework',
  'actix-web': 'Powerful web framework for Rust',
  'axum': 'Ergonomic web framework for Rust',
  'cors': 'Express middleware for Cross-Origin requests',
  'helmet': 'Security headers middleware for Express',
  'compression': 'Response compression middleware',
  'morgan': 'HTTP request logger for Express',
  'multer': 'File upload middleware for Express',
  'socket.io': 'Real-time bidirectional communication',
  'ws': 'Simple WebSocket implementation for Node.js',
  'prisma': 'Next-gen TypeScript ORM',
  '@prisma/client': 'Auto-generated Prisma database client',
  'typeorm': 'TypeScript ORM for SQL databases',
  'sequelize': 'Promise-based ORM for Node.js',
  'mongoose': 'MongoDB object modeling for Node.js',
  'mongodb': 'Official MongoDB driver for Node.js',
  'pg': 'PostgreSQL client for Node.js',
  'mysql2': 'Fast MySQL driver for Node.js',
  'better-sqlite3': 'Fast synchronous SQLite3 driver',
  'drizzle-orm': 'Lightweight TypeScript ORM',
  'knex': 'SQL query builder for Node.js',
  'redis': 'Redis client for Node.js',
  'ioredis': 'Full-featured Redis client for Node.js',
  'sqlalchemy': 'Python SQL toolkit and ORM',
  'passport': 'Authentication middleware for Node.js',
  'jsonwebtoken': 'JWT implementation for Node.js',
  'bcrypt': 'Password hashing library',
  'bcryptjs': 'Pure JS bcrypt implementation',
  'next-auth': 'Authentication for Next.js',
  'lucia': 'Auth library for session-based authentication',
  'devise': 'Authentication solution for Rails',
  'jest': 'JavaScript testing framework by Meta',
  'vitest': 'Vite-native testing framework',
  'mocha': 'Flexible JavaScript testing framework',
  'chai': 'BDD/TDD assertion library',
  'cypress': 'End-to-end testing framework',
  'playwright': 'Browser automation & testing by Microsoft',
  '@playwright/test': 'Playwright test runner',
  '@testing-library/react': 'Testing utilities for React components',
  '@testing-library/jest-dom': 'Custom Jest matchers for the DOM',
  'supertest': 'HTTP assertion library for Node.js',
  'sinon': 'Test spies, stubs, and mocks',
  'nock': 'HTTP request mocking for Node.js',
  'msw': 'API mocking using Service Worker',
  'pytest': 'Python testing framework',
  'rspec': 'BDD testing framework for Ruby',
  'junit': 'Unit testing framework for Java',
  'mockito': 'Mocking framework for Java unit tests',
  'vite': 'Fast build tool and dev server',
  'webpack': 'Module bundler for JavaScript',
  'esbuild': 'Extremely fast JavaScript/CSS bundler',
  'rollup': 'ES module bundler',
  'parcel': 'Zero-config build tool',
  'turbo': 'High-performance build system for monorepos',
  'tsup': 'Bundle TypeScript libraries with no config',
  'swc': 'Super-fast compiler written in Rust',
  'typescript': 'Typed superset of JavaScript',
  'ts-node': 'TypeScript execution for Node.js',
  'tsx': 'TypeScript execute — enhanced ts-node',
  'eslint': 'Pluggable JavaScript linter',
  'prettier': 'Opinionated code formatter',
  'husky': 'Git hooks made easy',
  'lint-staged': 'Run linters on staged git files',
  'nodemon': 'Auto-restart Node.js on file changes',
  'concurrently': 'Run multiple commands concurrently',
  'black': 'Python code formatter',
  'flake8': 'Python linting tool',
  'mypy': 'Static type checker for Python',
  'lerna': 'Multi-package repository management',
  'nx': 'Smart monorepo build system',
  'lodash': 'Utility library for common JS operations',
  'ramda': 'Functional programming library for JS',
  'date-fns': 'Modern JavaScript date utility library',
  'dayjs': 'Lightweight date library (2KB)',
  'moment': 'Date manipulation library (consider dayjs)',
  'uuid': 'RFC-compliant UUID generator',
  'nanoid': 'Tiny, secure URL-friendly unique ID generator',
  'zod': 'TypeScript-first schema validation',
  'yup': 'Schema validation library',
  'joi': 'Data validation for JavaScript',
  'dotenv': 'Loads environment variables from .env files',
  'winston': 'Versatile logging library for Node.js',
  'pino': 'Fast JSON logger for Node.js',
  'chalk': 'Terminal string styling',
  'commander': 'CLI framework for Node.js',
  'yargs': 'CLI argument parser',
  'sharp': 'High-performance image processing',
  'octokit': 'GitHub API client for JavaScript',
  'rxjs': 'Reactive Extensions for JavaScript',
  'immer': 'Immutable state with a mutable API',
  'framer-motion': 'Production-ready React animation library',
  'gsap': 'Professional-grade JavaScript animation',
  'three': '3D graphics library for the web',
  'd3': 'Data-driven document manipulation',
  'chart.js': 'Simple yet flexible charting library',
  'recharts': 'Composable charting library for React',
  'marked': 'Fast Markdown parser and compiler',
  'highlight.js': 'Syntax highlighting for the web',
  'pydantic': 'Data validation using Python type hints',
  'requests': 'HTTP library for Python',
  'httpx': 'Async HTTP client for Python',
  'numpy': 'Numerical computing library for Python',
  'pandas': 'Data analysis and manipulation library',
  'scipy': 'Scientific computing tools for Python',
  'matplotlib': 'Plotting and visualization library',
  'scikit-learn': 'Machine learning library for Python',
  'tensorflow': 'Open-source ML/deep learning framework',
  'torch': 'Deep learning framework by Meta',
  'keras': 'High-level neural networks API',
  'pillow': 'Python imaging library (PIL fork)',
  'beautifulsoup4': 'HTML/XML parser for web scraping',
  'scrapy': 'Web scraping framework for Python',
  'boto3': 'AWS SDK for Python',
  'spring-boot-starter-web': 'Spring Boot web & REST support',
  'spring-boot-starter-data-jpa': 'Spring Boot JPA/Hibernate support',
  'spring-boot-starter-security': 'Spring Boot security & auth',
  'spring-boot-starter-test': 'Spring Boot testing support',
  'lombok': 'Java annotation-based boilerplate reduction',
  'jackson': 'JSON processor for Java',
  'slf4j': 'Logging facade for Java',
  'logback': 'Logging framework for Java',
  'hibernate': 'Java ORM framework',
  'guava': 'Google core Java libraries',
  'serde': 'Serialization framework for Rust',
  'tokio': 'Async runtime for Rust',
  'reqwest': 'HTTP client for Rust',
  'clap': 'Command-line argument parser for Rust',
  'tracing': 'Application-level tracing for Rust',
  'anyhow': 'Flexible error handling for Rust',
  'thiserror': 'Derive macro for std::error::Error',
  'gorm': 'ORM library for Go',
  'cobra': 'CLI library for Go',
  'viper': 'Configuration management for Go',
  'zap': 'Blazing fast structured logger for Go',
  'testify': 'Testing toolkit for Go',
  'sidekiq': 'Background job processing for Ruby',
  'puma': 'Concurrent web server for Ruby',
  'guzzlehttp/guzzle': 'PHP HTTP client',
  'phpunit/phpunit': 'Testing framework for PHP',
  'aws-sdk': 'AWS SDK for JavaScript',
  '@aws-sdk/client-s3': 'AWS S3 client',
  'firebase': 'Google backend-as-a-service platform',
  'firebase-admin': 'Firebase Admin SDK for server-side',
  '@google-cloud/storage': 'Google Cloud Storage client',
  'stripe': 'Payment processing API client',
  '@stripe/stripe-js': 'Stripe.js loading utility',
  '@sentry/node': 'Error tracking for Node.js',
  '@sentry/react': 'Error tracking for React',
  'react-native': 'Build native mobile apps with React',
  'expo': 'React Native development platform',
  '@react-navigation/native': 'Navigation for React Native',
  'puppeteer': 'Headless Chrome browser automation',
  'cheerio': 'Server-side HTML parsing (jQuery-like)',
};

function getDescription(name: string): string | null {
  const lower = name.toLowerCase();
  if (PKG_DESC[lower]) return PKG_DESC[lower];
  if (PKG_DESC[name]) return PKG_DESC[name];
  for (const [key, desc] of Object.entries(PKG_DESC)) {
    if (lower.startsWith(key + '/') || lower === `@types/${key}`) return desc;
  }
  return null;
}

function classifyDep(name: string, isDev: boolean): DepCategory {
  const lower = name.toLowerCase();
  for (const rule of DEP_CATEGORY_RULES) {
    if (rule.test(lower)) return rule.category;
  }
  if (lower.startsWith('@types/')) return 'build';
  if (isDev) return 'build';
  return 'other';
}

interface CategorizedDep {
  name: string;
  version: string;
  manifestType: string;
  manifestPath: string;
  isDev: boolean;
  description: string | null;
}

function categorizeAll(manifests: DependencyManifest[]): Map<DepCategory, CategorizedDep[]> {
  const map = new Map<DepCategory, CategorizedDep[]>();

  for (const m of manifests) {
    for (const [name, version] of Object.entries(m.production)) {
      const cat = classifyDep(name, false);
      const group = map.get(cat) || [];
      group.push({ name, version, manifestType: m.type, manifestPath: m.path, isDev: false, description: getDescription(name) });
      map.set(cat, group);
    }
    for (const [name, version] of Object.entries(m.development)) {
      const cat = classifyDep(name, true);
      const group = map.get(cat) || [];
      group.push({ name, version, manifestType: m.type, manifestPath: m.path, isDev: true, description: getDescription(name) });
      map.set(cat, group);
    }
  }

  return map;
}

function DepItem({ dep }: { dep: CategorizedDep }) {
  const info = MANIFEST_DESCRIPTIONS[dep.manifestType];
  return (
    <div className="group py-2.5 px-3 rounded-lg bg-surface-2/50 hover:bg-surface-2 transition-colors border border-transparent hover:border-border/40">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="text-sm font-code text-primary font-medium group-hover:text-accent transition-colors truncate">
          {dep.name}
        </span>
        <span className="ml-auto flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-code px-1.5 py-0.5 rounded bg-surface-alt text-muted border border-border/30">
            {info?.label || dep.manifestType}
          </span>
          <span className="text-xs font-code text-muted">{dep.version}</span>
        </span>
      </div>
      {dep.description && (
        <p className="text-xs text-muted/80 font-body leading-relaxed">{dep.description}</p>
      )}
    </div>
  );
}

function CategorySection({ category, deps }: { category: DepCategory; deps: CategorizedDep[] }) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;

  return (
    <div className="card-glow p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center">
          <Icon className={`w-4.5 h-4.5 ${meta.accent}`} />
        </div>
        <div>
          <h4 className="font-display font-semibold text-primary text-sm">{meta.label}</h4>
          <p className="text-[11px] font-code text-muted">{deps.length} package{deps.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {deps.map((dep, i) => (
          <DepItem key={`${dep.name}-${dep.manifestPath}-${i}`} dep={dep} />
        ))}
      </div>
    </div>
  );
}

export function DependencyView({ dependencies }: { dependencies: DependencyInfo }) {
  if (dependencies.manifests.length === 0) {
    return (
      <div className="text-center py-16 animate-rise">
        <Package className="w-10 h-10 mx-auto mb-4 text-border" />
        <p className="text-muted font-body">No dependency manifests detected in this repository.</p>
      </div>
    );
  }

  const categorized = categorizeAll(dependencies.manifests);
  const manifestTypes = [...new Set(dependencies.manifests.map(m => m.type))];

  return (
    <div className="space-y-8 animate-rise">
      {/* Overview bar */}
      <div className="card p-5">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div>
            <p className="text-xs font-code text-muted uppercase tracking-wider">Total Packages</p>
            <p className="font-display text-2xl font-bold text-primary">{dependencies.totalCount}</p>
          </div>
          <div className="w-px h-10 bg-border/50" />
          <div>
            <p className="text-xs font-code text-muted uppercase tracking-wider">Manifests</p>
            <p className="font-display text-2xl font-bold text-primary">{dependencies.manifests.length}</p>
          </div>
          <div className="w-px h-10 bg-border/50" />
          <div>
            <p className="text-xs font-code text-muted uppercase tracking-wider">Production</p>
            <p className="font-display text-2xl font-bold text-sage">{dependencies.totalDependencies}</p>
          </div>
          <div className="w-px h-10 bg-border/50" />
          <div>
            <p className="text-xs font-code text-muted uppercase tracking-wider">Development</p>
            <p className="font-display text-2xl font-bold text-ochre">{dependencies.totalDevDependencies}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {manifestTypes.map(type => {
            const info = MANIFEST_DESCRIPTIONS[type];
            const count = dependencies.manifests.filter(m => m.type === type).reduce((s, m) => s + m.totalCount, 0);
            return (
              <div key={type} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-border/30">
                <FileCode className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-code text-primary font-medium">{info?.label || type}</span>
                <span className="text-[10px] text-muted font-code">— {info?.desc || 'Package manager'}</span>
                <span className="text-[10px] font-code text-accent ml-1">({count})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-manifest source paths */}
      <div className="flex flex-wrap gap-2">
        {dependencies.manifests.map((m, i) => (
          <span key={`${m.path}-${i}`} className="pill text-xs">
            <FileCode className="w-3 h-3" /> {m.path}
          </span>
        ))}
      </div>

      {/* Categorized sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {CATEGORY_ORDER.map(cat => {
          const deps = categorized.get(cat);
          if (!deps || deps.length === 0) return null;
          return <CategorySection key={cat} category={cat} deps={deps} />;
        })}
      </div>
    </div>
  );
}
