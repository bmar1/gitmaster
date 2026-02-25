import { DependencyInfo, DependencyManifest } from '../types';
import { Package, FileCode, Info } from 'lucide-react';
import { useState } from 'react';

const MANIFEST_LABELS: Record<string, string> = {
  npm: 'npm (package.json)',
  maven: 'Maven (pom.xml)',
  gradle: 'Gradle (build.gradle)',
  pip: 'pip (requirements.txt)',
  pipenv: 'Pipenv (Pipfile)',
  poetry: 'Poetry (pyproject.toml)',
  cargo: 'Cargo (Cargo.toml)',
  go: 'Go Modules (go.mod)',
  gemfile: 'Bundler (Gemfile)',
  composer: 'Composer (composer.json)',
  nuget: 'NuGet (.csproj)',
};

const PKG_DESCRIPTIONS: Record<string, string> = {
  // Frontend frameworks
  'react': 'UI library for building component-based interfaces',
  'react-dom': 'React renderer for web browsers',
  'vue': 'Progressive framework for building UIs',
  'angular': 'Platform for building mobile & desktop web apps',
  '@angular/core': 'Core Angular framework',
  '@angular/common': 'Common Angular utilities & pipes',
  '@angular/router': 'Client-side routing for Angular',
  '@angular/forms': 'Form handling for Angular',
  'svelte': 'Compile-time reactive UI framework',
  'solid-js': 'Declarative, reactive UI library',
  'preact': 'Lightweight React alternative (3KB)',
  'next': 'React framework with SSR & file-based routing',
  'nuxt': 'Vue framework with SSR & file-based routing',
  'gatsby': 'React-based static site generator',
  'remix': 'Full-stack React framework',
  'astro': 'Content-focused web framework with island architecture',

  // State management
  'redux': 'Predictable state container for JS apps',
  '@reduxjs/toolkit': 'Opinionated Redux with best practices',
  'react-redux': 'Official React bindings for Redux',
  'zustand': 'Lightweight state management for React',
  'recoil': 'Experimental state management by Meta',
  'mobx': 'Reactive state management with observables',
  'jotai': 'Primitive, flexible state management for React',
  'valtio': 'Proxy-based state management for React',
  'pinia': 'Intuitive state management for Vue',
  'vuex': 'Centralized state management for Vue',
  'xstate': 'State machines and statecharts for JS',
  'ngrx': 'Reactive state management for Angular',

  // Routing
  'react-router': 'Declarative routing for React',
  'react-router-dom': 'DOM bindings for React Router',
  'vue-router': 'Official router for Vue.js',
  'wouter': 'Tiny router for React and Preact',

  // Data fetching
  '@tanstack/react-query': 'Async state management & server cache',
  'swr': 'React hooks for data fetching with caching',
  'axios': 'Promise-based HTTP client',
  'got': 'HTTP request library for Node.js',
  'node-fetch': 'Fetch API for Node.js',
  'undici': 'Fast HTTP/1.1 client for Node.js',
  'ky': 'Tiny HTTP client based on Fetch API',
  'graphql-request': 'Minimal GraphQL client',
  'apollo-client': 'Full-featured GraphQL client',
  '@apollo/client': 'Full-featured GraphQL client for React',
  'urql': 'Lightweight GraphQL client',

  // Styling
  'tailwindcss': 'Utility-first CSS framework',
  'styled-components': 'CSS-in-JS with tagged template literals',
  '@emotion/react': 'CSS-in-JS library with React support',
  '@emotion/styled': 'Styled API for Emotion',
  'sass': 'CSS preprocessor with variables & nesting',
  'less': 'CSS preprocessor',
  'postcss': 'CSS transformation tool with plugins',
  'autoprefixer': 'Auto-adds vendor prefixes to CSS',
  '@mui/material': 'Material Design component library for React',
  '@chakra-ui/react': 'Accessible component library for React',
  'antd': 'Enterprise UI component library for React',
  'radix-ui': 'Unstyled, accessible UI primitives',
  '@radix-ui/react-dialog': 'Accessible dialog/modal primitive',
  '@headlessui/react': 'Unstyled, accessible UI components',
  'shadcn-ui': 'Re-usable components built on Radix & Tailwind',
  'bootstrap': 'Popular CSS framework for responsive design',
  'bulma': 'Modern CSS framework based on Flexbox',
  'lucide-react': 'Beautiful & consistent icon library for React',
  'react-icons': 'SVG icon packs for React',

  // Backend frameworks
  'express': 'Minimal web framework for Node.js',
  'fastify': 'Fast, low-overhead web framework for Node.js',
  'koa': 'Expressive middleware web framework for Node.js',
  'hapi': 'Framework for building APIs and services',
  '@nestjs/core': 'Progressive Node.js framework',
  '@nestjs/common': 'NestJS common utilities',

  // Python
  'django': 'High-level Python web framework',
  'flask': 'Lightweight Python web framework',
  'fastapi': 'Modern, fast Python API framework',
  'uvicorn': 'Lightning-fast ASGI server for Python',
  'gunicorn': 'Python WSGI HTTP server',
  'celery': 'Distributed task queue for Python',
  'sqlalchemy': 'Python SQL toolkit and ORM',
  'pydantic': 'Data validation using Python type hints',
  'requests': 'HTTP library for Python',
  'httpx': 'Async HTTP client for Python',
  'numpy': 'Numerical computing library for Python',
  'pandas': 'Data analysis and manipulation library',
  'scipy': 'Scientific computing tools for Python',
  'matplotlib': 'Plotting and visualization library',
  'scikit-learn': 'Machine learning library for Python',
  'tensorflow': 'Open-source ML/deep learning framework',
  'pytorch': 'Deep learning framework by Meta',
  'torch': 'Deep learning framework by Meta',
  'keras': 'High-level neural networks API',
  'pytest': 'Python testing framework',
  'black': 'Python code formatter',
  'flake8': 'Python linting tool',
  'mypy': 'Static type checker for Python',
  'poetry': 'Python dependency management and packaging',
  'pillow': 'Python imaging library (PIL fork)',
  'beautifulsoup4': 'HTML/XML parser for web scraping',
  'scrapy': 'Web scraping framework for Python',
  'boto3': 'AWS SDK for Python',

  // Database & ORM
  'prisma': 'Next-gen TypeScript ORM',
  '@prisma/client': 'Auto-generated database client',
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

  // Auth
  'passport': 'Authentication middleware for Node.js',
  'jsonwebtoken': 'JWT implementation for Node.js',
  'bcrypt': 'Password hashing library',
  'bcryptjs': 'Pure JS bcrypt implementation',
  'next-auth': 'Authentication for Next.js',
  '@auth/core': 'Authentication framework core',
  'lucia': 'Auth library for session-based authentication',

  // Testing
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

  // Build tools
  'vite': 'Fast build tool and dev server',
  'webpack': 'Module bundler for JavaScript',
  'esbuild': 'Extremely fast JavaScript/CSS bundler',
  'rollup': 'ES module bundler',
  'parcel': 'Zero-config build tool',
  'turbo': 'High-performance build system for monorepos',
  'tsup': 'Bundle TypeScript libraries with no config',
  'swc': 'Super-fast compiler written in Rust',

  // TypeScript & tooling
  'typescript': 'Typed superset of JavaScript',
  'ts-node': 'TypeScript execution for Node.js',
  'tsx': 'TypeScript execute — enhanced ts-node',
  'eslint': 'Pluggable JavaScript linter',
  'prettier': 'Opinionated code formatter',
  'husky': 'Git hooks made easy',
  'lint-staged': 'Run linters on staged git files',
  'commitlint': 'Lint commit messages',
  'nodemon': 'Auto-restart Node.js on file changes',
  'concurrently': 'Run multiple commands concurrently',

  // Utilities
  'lodash': 'Utility library for common JS operations',
  'underscore': 'Functional programming helpers for JS',
  'ramda': 'Functional programming library for JS',
  'date-fns': 'Modern JavaScript date utility library',
  'dayjs': 'Lightweight date library (2KB)',
  'moment': 'Date manipulation library (consider dayjs)',
  'uuid': 'RFC-compliant UUID generator',
  'nanoid': 'Tiny, secure URL-friendly unique ID generator',
  'zod': 'TypeScript-first schema validation',
  'yup': 'Schema validation library',
  'joi': 'Data validation for JavaScript',
  'class-validator': 'Decorator-based validation for classes',
  'dotenv': 'Loads environment variables from .env files',
  'cors': 'Express middleware for Cross-Origin requests',
  'helmet': 'Security headers middleware for Express',
  'compression': 'Response compression middleware',
  'morgan': 'HTTP request logger for Express',
  'winston': 'Versatile logging library for Node.js',
  'pino': 'Fast JSON logger for Node.js',
  'chalk': 'Terminal string styling',
  'commander': 'CLI framework for Node.js',
  'yargs': 'CLI argument parser',
  'inquirer': 'Interactive CLI prompts',
  'ora': 'Elegant terminal spinner',
  'sharp': 'High-performance image processing',
  'multer': 'Multipart form data / file upload middleware',
  'socket.io': 'Real-time bidirectional communication',
  'ws': 'Simple WebSocket implementation for Node.js',
  'cheerio': 'Server-side HTML parsing (jQuery-like)',
  'puppeteer': 'Headless Chrome browser automation',
  'octokit': 'GitHub API client for JavaScript',
  'rxjs': 'Reactive Extensions for JavaScript',
  'immer': 'Immutable state with a mutable API',
  'clsx': 'Tiny utility for constructing className strings',
  'class-variance-authority': 'Variant-based className utility',
  'tailwind-merge': 'Merge Tailwind classes without conflicts',
  'framer-motion': 'Production-ready React animation library',
  'gsap': 'Professional-grade JavaScript animation',
  'three': '3D graphics library for the web',
  '@react-three/fiber': 'React renderer for Three.js',
  'd3': 'Data-driven document manipulation',
  'chart.js': 'Simple yet flexible charting library',
  'recharts': 'Composable charting library for React',
  'marked': 'Fast Markdown parser and compiler',
  'highlight.js': 'Syntax highlighting for the web',
  'prismjs': 'Lightweight syntax highlighting',

  // Java / Maven
  'spring-boot': 'Opinionated Java framework for production apps',
  'spring-boot-starter-web': 'Spring Boot web & REST support',
  'spring-boot-starter-data-jpa': 'Spring Boot JPA/Hibernate support',
  'spring-boot-starter-security': 'Spring Boot security & auth',
  'spring-boot-starter-test': 'Spring Boot testing support',
  'lombok': 'Java annotation-based boilerplate reduction',
  'junit': 'Unit testing framework for Java',
  'mockito': 'Mocking framework for Java unit tests',
  'jackson': 'JSON processor for Java',
  'slf4j': 'Logging facade for Java',
  'logback': 'Logging framework for Java',
  'hibernate': 'Java ORM framework',
  'guava': 'Google core Java libraries',
  'apache-commons': 'Reusable Java components',

  // Rust
  'serde': 'Serialization framework for Rust',
  'tokio': 'Async runtime for Rust',
  'actix-web': 'Powerful web framework for Rust',
  'axum': 'Ergonomic web framework for Rust',
  'reqwest': 'HTTP client for Rust',
  'clap': 'Command-line argument parser for Rust',
  'tracing': 'Application-level tracing for Rust',
  'anyhow': 'Flexible error handling for Rust',
  'thiserror': 'Derive macro for std::error::Error',

  // Go
  'gin': 'Fast HTTP web framework for Go',
  'echo': 'High-performance Go web framework',
  'fiber': 'Express-inspired Go web framework',
  'gorm': 'ORM library for Go',
  'cobra': 'CLI library for Go',
  'viper': 'Configuration management for Go',
  'zap': 'Blazing fast structured logger for Go',
  'testify': 'Testing toolkit for Go',

  // Ruby
  'rails': 'Full-stack Ruby web framework',
  'sinatra': 'Lightweight Ruby web framework',
  'rspec': 'BDD testing framework for Ruby',
  'devise': 'Authentication solution for Rails',
  'sidekiq': 'Background job processing for Ruby',
  'puma': 'Concurrent web server for Ruby',

  // PHP
  'laravel/framework': 'Full-stack PHP web framework',
  'symfony/framework': 'Modular PHP framework',
  'guzzlehttp/guzzle': 'PHP HTTP client',
  'phpunit/phpunit': 'Testing framework for PHP',

  // Cloud & DevOps
  'aws-sdk': 'AWS SDK for JavaScript',
  '@aws-sdk/client-s3': 'AWS S3 client',
  'firebase': 'Google backend-as-a-service platform',
  'firebase-admin': 'Firebase Admin SDK for server-side',
  '@google-cloud/storage': 'Google Cloud Storage client',
  'stripe': 'Payment processing API client',
  '@stripe/stripe-js': 'Stripe.js loading utility',
  'twilio': 'Cloud communications API client',
  'sendgrid': 'Email delivery service client',
  '@sentry/node': 'Error tracking for Node.js',
  '@sentry/react': 'Error tracking for React',
  'newrelic': 'Application performance monitoring',
  'datadog': 'Monitoring and observability platform',

  // React Native / Mobile
  'react-native': 'Build native mobile apps with React',
  'expo': 'React Native development platform',
  '@react-navigation/native': 'Navigation for React Native',
  'flutter': 'Google UI toolkit for mobile, web, desktop',

  // Monorepo
  'lerna': 'Multi-package repository management',
  'nx': 'Smart monorepo build system',
  '@changesets/cli': 'Versioning & changelog management',
};

function getDescription(name: string): string | null {
  const lower = name.toLowerCase();
  if (PKG_DESCRIPTIONS[lower]) return PKG_DESCRIPTIONS[lower];
  if (PKG_DESCRIPTIONS[name]) return PKG_DESCRIPTIONS[name];

  for (const [key, desc] of Object.entries(PKG_DESCRIPTIONS)) {
    if (lower.startsWith(key + '/') || lower === `@types/${key}`) return desc;
  }
  return null;
}

function DepRow({ name, version }: { name: string; version: string }) {
  const [showDesc, setShowDesc] = useState(false);
  const description = getDescription(name);

  return (
    <div className="group">
      <div className="flex items-center justify-between py-1.5 px-3 rounded bg-surface-alt/50 hover:bg-surface-alt transition-colors">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-code text-primary/80 truncate group-hover:text-accent transition-colors">{name}</span>
          {description && (
            <button
              onClick={() => setShowDesc(!showDesc)}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              title={description}
            >
              <Info className="w-3 h-3 text-muted" />
            </button>
          )}
        </div>
        <span className="text-xs font-code text-muted ml-2 flex-shrink-0">{version}</span>
      </div>
      {showDesc && description && (
        <div className="px-3 py-1 text-xs text-muted font-body leading-relaxed animate-gentle-fade">
          {description}
        </div>
      )}
    </div>
  );
}

function ManifestCard({ manifest }: { manifest: DependencyManifest }) {
  const prodDeps = Object.entries(manifest.production);
  const devDeps = Object.entries(manifest.development);

  return (
    <div className="card p-6">
      <div className="flex items-start gap-3 mb-5">
        <FileCode className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-display font-semibold text-primary">
            {MANIFEST_LABELS[manifest.type] || manifest.type}
          </h4>
          <p className="text-xs font-code text-muted mt-0.5">{manifest.path}</p>
        </div>
        <span className="ml-auto pill text-xs">
          {manifest.totalCount} total
        </span>
      </div>

      {prodDeps.length > 0 && (
        <div className="mb-5">
          <h5 className="text-xs font-code text-muted uppercase tracking-wider mb-3">
            Dependencies ({prodDeps.length})
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {prodDeps.map(([name, version]) => (
              <DepRow key={name} name={name} version={version} />
            ))}
          </div>
        </div>
      )}

      {devDeps.length > 0 && (
        <div>
          <h5 className="text-xs font-code text-muted uppercase tracking-wider mb-3">
            Dev Dependencies ({devDeps.length})
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {devDeps.map(([name, version]) => (
              <DepRow key={name} name={name} version={version} />
            ))}
          </div>
        </div>
      )}
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

  return (
    <div className="space-y-6 animate-rise">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted font-body">
          Found <strong className="text-primary">{dependencies.manifests.length}</strong> manifest{dependencies.manifests.length > 1 ? 's' : ''} with{' '}
          <strong className="text-primary">{dependencies.totalCount}</strong> total packages
        </p>
      </div>

      {dependencies.manifests.map((manifest, idx) => (
        <ManifestCard key={`${manifest.path}-${idx}`} manifest={manifest} />
      ))}
    </div>
  );
}
