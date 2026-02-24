# GitMaster - Requirements Specification

## 1. Introduction

### 1.1 Purpose
GitMaster is a web application designed to provide comprehensive analysis of GitHub repositories. It ingests a repository URL and generates detailed insights into the project's structure, dependencies, architecture, and functionality.

### 1.2 Scope
The system will analyze public and private GitHub repositories, supporting multiple programming languages and providing actionable insights for developers, technical leads, and project managers.

### 1.3 Target Users
- Software developers exploring new codebases
- Technical leads conducting code reviews
- Project managers assessing project complexity
- Open source contributors understanding projects
- Teams performing technology audits

## 2. Functional Requirements

### 2.1 Repository Ingestion

#### FR-1.1: URL Input
- The system SHALL accept a valid GitHub repository URL in formats:
  - `https://github.com/owner/repo`
  - `github.com/owner/repo`
  - `owner/repo`
- The system SHALL validate URL format before processing
- The system SHALL provide clear error messages for invalid URLs

#### FR-1.2: Authentication
- The system SHALL support unauthenticated access for public repositories
- The system SHALL accept GitHub Personal Access Tokens for:
  - Private repository access
  - Higher rate limits (5000 requests/hour vs 60)
- The system SHALL securely handle authentication tokens (never log or store permanently)

#### FR-1.3: Branch Selection
- The system SHALL detect default branch (main/master)
- The system SHALL allow users to specify a different branch
- The system SHALL list available branches for selection

#### FR-1.4: Repository Fetching
- The system SHALL fetch repository metadata (name, description, stars, forks, language)
- The system SHALL retrieve complete file tree structure
- The system SHALL handle repositories up to 10GB in size
- The system SHALL implement rate limiting and retry logic for API calls

### 2.2 File Tree Processing

#### FR-2.1: Directory Structure
- The system SHALL generate a complete hierarchical file tree
- The system SHALL display file paths relative to repository root
- The system SHALL calculate total file count and directory depth

#### FR-2.2: File Classification
- The system SHALL categorize files by type:
  - Source code (.js, .ts, .py, .java, .rs, .go, etc.)
  - Configuration files (package.json, tsconfig.json, .env.example, etc.)
  - Documentation (.md, .txt, LICENSE)
  - Tests (*test.*, *spec.*, __tests__/)
  - Build artifacts and dependencies (node_modules/, dist/, build/)
  - Assets (images, fonts, media)

#### FR-2.3: File Statistics
- The system SHALL calculate Lines of Code (LOC) for each file
- The system SHALL aggregate LOC by language
- The system SHALL calculate file sizes
- The system SHALL identify language distribution (% per language)

#### FR-2.4: Important Files Detection
- The system SHALL identify and highlight:
  - README files (README.md, README.txt)
  - License files (LICENSE, LICENSE.md)
  - Package manifests (package.json, requirements.txt, Cargo.toml, etc.)
  - Configuration files (tsconfig.json, .eslintrc, etc.)
  - Entry points (index.js, main.py, main.go, etc.)

### 2.3 Dependency Analysis

#### FR-3.1: Dependency Extraction
- The system SHALL parse dependency files for multiple languages:
  - **JavaScript/TypeScript**: package.json, yarn.lock, package-lock.json, pnpm-lock.yaml
  - **Python**: requirements.txt, Pipfile, Pipfile.lock, pyproject.toml, setup.py
  - **Rust**: Cargo.toml, Cargo.lock
  - **Go**: go.mod, go.sum
  - **Java**: pom.xml, build.gradle, build.gradle.kts
  - **Ruby**: Gemfile, Gemfile.lock
  - **PHP**: composer.json, composer.lock

#### FR-3.2: Dependency Categorization
- The system SHALL distinguish between:
  - Production dependencies
  - Development dependencies
  - Peer dependencies
  - Optional dependencies

#### FR-3.3: Dependency Graph
- The system SHALL construct a dependency graph showing:
  - Direct dependencies
  - Transitive dependencies (up to 3 levels deep)
  - Dependency relationships and versions
- The system SHALL visualize the dependency graph interactively

#### FR-3.4: Dependency Metrics
- The system SHALL calculate:
  - Total number of dependencies
  - Dependency tree depth
  - Total dependency size (if available)
  - Most critical dependencies (highest usage)

#### FR-3.5: Dependency Health Check
- The system SHALL identify:
  - Outdated dependencies (comparing with latest versions)
  - Known security vulnerabilities (via GitHub Advisory Database)
  - Deprecated packages
  - License conflicts

### 2.4 Architecture Analysis

#### FR-4.1: Framework Detection
- The system SHALL automatically detect:
  - Frontend frameworks (React, Vue, Angular, Svelte, Next.js, etc.)
  - Backend frameworks (Express, Fastify, NestJS, Django, Flask, etc.)
  - Build tools (Webpack, Vite, Rollup, esbuild, etc.)
  - Testing frameworks (Jest, Mocha, pytest, etc.)
  - Databases and ORMs (Prisma, TypeORM, SQLAlchemy, etc.)

#### FR-4.2: Design Pattern Recognition
- The system SHALL identify common patterns:
  - MVC (Model-View-Controller)
  - Monorepo structure
  - Microservices architecture
  - Layered architecture
  - Module federation

#### FR-4.3: Entry Point Discovery
- The system SHALL identify:
  - Application entry points (main files)
  - Server initialization files
  - CLI command definitions
  - Build scripts and npm scripts

#### FR-4.4: Component Mapping
- The system SHALL analyze:
  - Import/export relationships between files
  - Module dependencies within the project
  - Circular dependency detection
  - Most imported files (core modules)

#### FR-4.5: API Endpoint Extraction
- The system SHALL identify API endpoints for:
  - Express.js routes (app.get, app.post, router, etc.)
  - FastAPI/Flask routes (@app.get, @app.post, etc.)
  - NestJS controllers (@Controller, @Get, @Post)
  - Other common frameworks

#### FR-4.6: Documentation Extraction
- The system SHALL extract:
  - README content and structure
  - JSDoc comments from JavaScript/TypeScript
  - Docstrings from Python
  - Inline comments with architectural significance
  - CHANGELOG entries

### 2.5 Report Generation

#### FR-5.1: Summary Report
- The system SHALL generate a markdown report containing:
  - **Project Overview**: Name, description, primary language
  - **Repository Metrics**: Stars, forks, issues, last updated
  - **Key Features**: Extracted from README and code
  - **Technology Stack**: All frameworks and libraries used
  - **Architecture Overview**: High-level structure description
  - **File Structure**: Annotated directory tree
  - **Dependencies**: Critical dependencies list with versions
  - **Getting Started**: Setup and run instructions
  - **API Documentation**: Endpoints with methods and paths
  - **Code Metrics**: LOC, file counts, language distribution
  - **Complexity Score**: Overall project complexity rating (1-10)

#### FR-5.2: Export Options
- The system SHALL allow downloading reports as:
  - Markdown (.md)
  - JSON (structured data)
  - HTML (formatted view)

#### FR-5.3: Visualization
- The system SHALL provide interactive visualizations for:
  - File tree (collapsible/expandable)
  - Dependency graph (zoomable, pannable)
  - Language distribution (pie/bar chart)
  - File size distribution

### 2.6 User Interface

#### FR-6.1: Input Interface
- The system SHALL provide a clean form with:
  - Repository URL input field
  - Optional GitHub token input (masked)
  - Branch selection dropdown
  - Analyze button

#### FR-6.2: Progress Indication
- The system SHALL display real-time progress during analysis:
  - Current processing stage
  - Estimated time remaining
  - Progress bar

#### FR-6.3: Results Display
- The system SHALL organize results in tabs/sections:
  - Overview tab
  - File Tree tab
  - Dependencies tab
  - Architecture tab
  - Full Report tab

#### FR-6.4: Responsive Design
- The system SHALL be fully responsive for:
  - Desktop (1920x1080 and above)
  - Tablet (768px - 1024px)
  - Mobile (320px - 767px)

## 3. Non-Functional Requirements

### 3.1 Performance

#### NFR-1.1: Response Time
- Repository metadata fetch: < 2 seconds
- File tree generation: < 5 seconds for repos with < 1000 files
- Complete analysis: < 30 seconds for small repos (< 100 files)
- Complete analysis: < 2 minutes for medium repos (< 1000 files)
- Complete analysis: < 5 minutes for large repos (< 5000 files)

#### NFR-1.2: Throughput
- The system SHALL handle at least 10 concurrent analysis requests
- The system SHALL implement request queuing for overload scenarios

#### NFR-1.3: Caching
- The system SHALL cache repository analyses for 24 hours
- The system SHALL provide option to force refresh

### 3.2 Scalability

#### NFR-2.1: Repository Size
- The system SHALL support repositories up to:
  - 10,000 files
  - 10GB total size
  - 20 directory levels deep

#### NFR-2.2: Concurrent Users
- The system SHALL support 100 concurrent users
- The system SHALL gracefully degrade under load

### 3.3 Reliability

#### NFR-3.1: Error Handling
- The system SHALL handle network failures gracefully
- The system SHALL retry failed API calls (max 3 attempts)
- The system SHALL provide detailed error messages
- The system SHALL never crash due to malformed input

#### NFR-3.2: Data Validation
- The system SHALL validate all user inputs
- The system SHALL sanitize repository data to prevent XSS
- The system SHALL handle missing or incomplete repository data

### 3.4 Security

#### NFR-4.1: Authentication Security
- The system SHALL never log GitHub tokens
- The system SHALL never persist tokens in local storage
- The system SHALL use HTTPS for all API communications
- The system SHALL use environment variables for sensitive config

#### NFR-4.2: Input Validation
- The system SHALL validate and sanitize all URL inputs
- The system SHALL prevent path traversal attacks
- The system SHALL prevent code injection through repository content

### 3.5 Maintainability

#### NFR-5.1: Code Quality
- The system SHALL maintain TypeScript strict mode
- The system SHALL have ESLint configuration
- The system SHALL use consistent code formatting (Prettier)
- The system SHALL include JSDoc comments for public APIs

#### NFR-5.2: Testing
- The system SHALL have unit tests for core services (>70% coverage)
- The system SHALL have integration tests for API endpoints
- The system SHALL have end-to-end tests for critical user flows

#### NFR-5.3: Documentation
- The system SHALL include README with setup instructions
- The system SHALL document all API endpoints
- The system SHALL include inline code documentation
- The system SHALL maintain architecture documentation

### 3.6 Usability

#### NFR-6.1: User Experience
- The system SHALL provide intuitive navigation
- The system SHALL use consistent UI patterns
- The system SHALL provide helpful error messages
- The system SHALL include loading states for async operations

#### NFR-6.2: Accessibility
- The system SHALL meet WCAG 2.1 Level AA standards
- The system SHALL support keyboard navigation
- The system SHALL include ARIA labels for screen readers

### 3.7 Compatibility

#### NFR-7.1: Browser Support
- The system SHALL support:
  - Chrome/Edge (latest 2 versions)
  - Firefox (latest 2 versions)
  - Safari (latest 2 versions)

#### NFR-7.2: Node.js Version
- The system SHALL require Node.js 18.x or higher
- The system SHALL use npm 9.x or higher

## 4. Data Models

### 4.1 Repository Analysis Result
```typescript
{
  id: string;
  url: string;
  owner: string;
  name: string;
  branch: string;
  analyzedAt: Date;
  metadata: RepositoryMetadata;
  fileTree: FileNode[];
  dependencies: DependencyInfo;
  architecture: ArchitectureInfo;
  summary: ProjectSummary;
  metrics: CodeMetrics;
}
```

### 4.2 File Node
```typescript
{
  path: string;
  name: string;
  type: 'file' | 'directory';
  size: number;
  language: string;
  category: 'source' | 'config' | 'docs' | 'test' | 'asset' | 'other';
  loc: number;
  children?: FileNode[];
}
```

### 4.3 Dependency Info
```typescript
{
  manifestFiles: string[];
  totalCount: number;
  production: Dependency[];
  development: Dependency[];
  graph: DependencyGraph;
  vulnerabilities: Vulnerability[];
  outdated: OutdatedDependency[];
}
```

### 4.4 Architecture Info
```typescript
{
  frameworks: Framework[];
  patterns: DesignPattern[];
  entryPoints: EntryPoint[];
  apiEndpoints: Endpoint[];
  components: ComponentInfo[];
  imports: ImportGraph;
}
```

## 5. Constraints and Assumptions

### 5.1 Constraints
- GitHub API rate limits: 5000/hour (authenticated), 60/hour (unauthenticated)
- Analysis timeout: 10 minutes maximum per repository
- Maximum repository size: 10GB
- Maximum file count: 10,000 files

### 5.2 Assumptions
- Users have internet connectivity
- GitHub repositories are accessible (public or token-authorized)
- Repository follows standard conventions for dependency files
- Majority of code is in supported languages

## 6. Success Criteria

### 6.1 Functional Success
- Successfully analyzes 95% of well-formed repositories
- Accurately detects dependencies for supported languages
- Correctly identifies frameworks and patterns in 90% of cases
- Generates comprehensive reports with all required sections

### 6.2 Performance Success
- Analysis completes within time requirements (NFR-1.1)
- System handles 100 concurrent users without degradation
- Page load time < 2 seconds
- API response time < 500ms for cached results

### 6.3 User Satisfaction
- Intuitive UI requiring no training
- Clear error messages and recovery paths
- Actionable insights in generated reports
- Fast feedback during analysis process

## 7. Out of Scope (Future Enhancements)

- Real-time repository monitoring
- Automated code quality scoring
- Pull request analysis
- Commit history analysis
- Contributor analysis
- Security audit automation
- Code duplication detection
- Performance benchmarking
- Multi-repository comparison
- CI/CD pipeline integration
