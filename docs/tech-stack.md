# GitMaster - Technology Stack

## 1. Overview

This document outlines the technology choices for GitMaster, including rationale, alternatives considered, and integration details.

## 2. Core Technologies

### 2.1 Runtime & Language

#### Node.js (v18+)
**Purpose**: JavaScript runtime for backend server

**Rationale**:
- Excellent npm ecosystem for GitHub integration
- Async I/O perfect for API-heavy operations
- Shared language with frontend (code reuse)
- Strong community support for parsing libraries
- Non-blocking architecture for concurrent analysis

**Alternatives Considered**:
- **Python**: Better data science libraries, but slower startup and less TypeScript integration
- **Go**: Faster performance, but smaller ecosystem for code parsing
- **Rust**: Best performance, but steeper learning curve and fewer libraries

#### TypeScript (v5+)
**Purpose**: Type-safe development for frontend and backend

**Rationale**:
- Catch errors at compile time
- Better IDE support and autocomplete
- Self-documenting code through types
- Easier refactoring and maintenance
- Shared types between frontend and backend

**Configuration**: Strict mode enabled for maximum type safety

---

## 3. Backend Stack

### 3.1 Web Framework

#### Express.js (v4)
**Purpose**: HTTP server and routing

**Rationale**:
- Mature, battle-tested framework
- Minimal and unopinionated
- Extensive middleware ecosystem
- Easy to understand and maintain
- Excellent documentation

**Alternatives Considered**:
- **Fastify**: Faster but less mature ecosystem
- **NestJS**: More opinionated, heavier framework
- **Koa**: Smaller community, fewer middleware options

**Key Middleware**:
- `express.json()`: JSON body parsing
- `cors()`: Cross-origin resource sharing
- `helmet()`: Security headers
- `compression()`: Response compression
- `express-rate-limit`: Rate limiting

### 3.2 GitHub Integration

#### Octokit/rest (Latest)
**Purpose**: GitHub API client library

**Rationale**:
- Official GitHub SDK
- Type definitions included
- Authentication handling built-in
- Rate limiting awareness
- Automatic pagination
- Request retry logic

**Features Used**:
- Repository metadata fetching
- File tree retrieval
- Content fetching
- Branch listing
- Rate limit checking

### 3.3 Code Parsing & Analysis

#### @babel/parser
**Purpose**: Parse JavaScript/JSX code into AST

**Rationale**:
- Industry standard parser
- Handles modern JavaScript features
- JSX support
- Excellent error recovery
- Plugin system for extensions

#### typescript (Compiler API)
**Purpose**: Parse and analyze TypeScript code

**Rationale**:
- Official TypeScript compiler
- Complete language support
- Type checking capabilities
- AST traversal utilities

#### Additional Parsers:
- **toml**: Cargo.toml, pyproject.toml parsing
- **yaml**: YAML config file parsing
- **xml2js**: pom.xml parsing
- **fast-glob**: Fast file pattern matching

### 3.4 Dependency Analysis

#### npm-package-arg
**Purpose**: Parse npm package specifiers

**npm-registry-fetch**
**Purpose**: Fetch package metadata from npm registry

**Rationale**:
- Official npm tools
- Handle all version formats
- Registry API integration
- Dependency resolution

### 3.5 Caching

#### node-cache
**Purpose**: In-memory caching of analysis results

**Rationale**:
- Simple API
- TTL support
- No external dependencies
- Synchronous operations
- Automatic cleanup

**Future Migration Path**: Redis for distributed caching

### 3.6 Validation

#### Zod
**Purpose**: Schema validation and type inference

**Rationale**:
- TypeScript-first design
- Type inference from schemas
- Composable validators
- Excellent error messages
- Zero dependencies

**Usage**:
- Validate API request bodies
- Validate GitHub API responses
- Validate parsed file contents

### 3.7 Utilities

#### date-fns
**Purpose**: Date manipulation and formatting

**lodash**
**Purpose**: Utility functions (debounce, groupBy, etc.)

**debug**
**Purpose**: Debugging with namespaces

**dotenv**
**Purpose**: Environment variable management

---

## 4. Frontend Stack

### 4.1 UI Framework

#### React (v18)
**Purpose**: Component-based UI library

**Rationale**:
- Industry standard
- Huge ecosystem
- Excellent TypeScript support
- Virtual DOM for performance
- Hooks for state management
- Server components (future)

**Alternatives Considered**:
- **Vue**: Smaller ecosystem for TypeScript
- **Svelte**: Less mature, smaller community
- **Angular**: Too heavy for this use case

### 4.2 Build Tool

#### Vite (v5)
**Purpose**: Frontend build tool and dev server

**Rationale**:
- Lightning-fast HMR
- Native ESM support
- Optimized production builds
- Excellent TypeScript support
- Plugin ecosystem
- Better DX than Webpack

**Configuration**:
- TypeScript path aliases
- Environment variables
- Proxy for backend API
- Code splitting

### 4.3 Routing

#### React Router (v6)
**Purpose**: Client-side routing

**Rationale**:
- Standard for React SPAs
- Declarative routing
- Type-safe with TypeScript
- Lazy loading support
- Nested routes

**Routes**:
- `/`: Home page with input
- `/analysis/:id`: Analysis results page
- `/history`: Recent analyses (future)

### 4.4 Data Fetching

#### TanStack Query (React Query v5)
**Purpose**: Server state management and caching

**Rationale**:
- Automatic caching and refetching
- Background updates
- Optimistic updates
- Loading and error states
- Pagination support
- Query invalidation

**Usage**:
```typescript
useQuery(['analysis', id], () => fetchAnalysis(id), {
  staleTime: 5 * 60 * 1000,
  retry: 3
})
```

### 4.5 Visualization

#### D3.js (v7)
**Purpose**: Interactive dependency graph visualization

**Rationale**:
- Most powerful data visualization library
- Full control over rendering
- SVG/Canvas support
- Force-directed graphs
- Zoom and pan built-in

**Alternatives Considered**:
- **vis.js**: Less flexible
- **Cytoscape.js**: Good but heavier
- **React Flow**: Great for flowcharts, less suitable for force graphs

#### Recharts
**Purpose**: Chart components for statistics

**Rationale**:
- React-native components
- Easy to use
- Responsive by default
- Good TypeScript support

**Charts Used**:
- Pie chart for language distribution
- Bar chart for file type distribution
- Tree map for file sizes

### 4.6 Styling

#### Tailwind CSS (v3)
**Purpose**: Utility-first CSS framework

**Rationale**:
- Rapid development
- Consistent design system
- Purge unused CSS
- Responsive utilities
- Dark mode support

**Customization**:
- Custom color palette
- Typography scale
- Spacing system
- Component classes

#### Additional Styling Tools:
- **clsx**: Conditional class names
- **tailwind-merge**: Merge conflicting classes

### 4.7 Markdown Rendering

#### react-markdown
**Purpose**: Render markdown content safely

**Rationale**:
- XSS protection
- Syntax highlighting support
- Custom component rendering
- GitHub-flavored markdown

**Plugins**:
- **remark-gfm**: GitHub-flavored markdown
- **rehype-highlight**: Code syntax highlighting

### 4.8 Icons

#### Lucide React
**Purpose**: Icon library

**Rationale**:
- Modern, clean icons
- Tree-shakeable
- TypeScript support
- Consistent style
- Small bundle size

**Alternative**: Heroicons, React Icons

### 4.9 Form Handling

#### React Hook Form
**Purpose**: Form state management and validation

**Rationale**:
- Minimal re-renders
- Built-in validation
- TypeScript support
- Small bundle size
- Easy integration with Zod

---

## 5. Development Tools

### 5.1 Code Quality

#### ESLint (v8+)
**Purpose**: JavaScript/TypeScript linting

**Plugins**:
- `@typescript-eslint/eslint-plugin`
- `eslint-plugin-react`
- `eslint-plugin-react-hooks`
- `eslint-plugin-import`

**Rules**: Airbnb base with TypeScript overrides

#### Prettier (v3)
**Purpose**: Code formatting

**Configuration**:
- Single quotes
- 2 space indentation
- Trailing commas
- 100 character line width

### 5.2 Testing

#### Jest (v29)
**Purpose**: Unit and integration testing

**Rationale**:
- Industry standard for Node.js
- Built-in mocking
- Snapshot testing
- Code coverage reports
- TypeScript support via ts-jest

#### React Testing Library
**Purpose**: React component testing

**Rationale**:
- User-centric testing
- Best practices by default
- Works well with Jest
- Accessibility-focused

#### Supertest
**Purpose**: API endpoint testing

**Rationale**:
- Express integration
- Fluent API
- No server required for tests

### 5.3 Type Checking

#### typescript (Compiler)
**Purpose**: Type checking

**Configuration**:
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "esModuleInterop": true,
  "skipLibCheck": true
}
```

### 5.4 Build Tools

#### tsc (TypeScript Compiler)
**Purpose**: Compile TypeScript to JavaScript (backend)

#### Vite
**Purpose**: Build frontend for production

**Optimizations**:
- Code splitting
- Tree shaking
- Asset optimization
- Source maps

### 5.5 Package Management

#### npm (v9+)
**Purpose**: Dependency management

**Rationale**:
- Built into Node.js
- Workspaces support for monorepo
- Package-lock for reproducible builds
- npm scripts for task automation

**Workspace Structure**:
```json
{
  "workspaces": ["frontend", "backend", "shared"]
}
```

**Alternatives Considered**:
- **pnpm**: Faster, but less familiar to most developers
- **yarn**: Similar features, but npm workspaces are sufficient

---

## 6. External Services & APIs

### 6.1 GitHub API (REST v3)
**Purpose**: Repository data fetching

**Rate Limits**:
- Unauthenticated: 60 requests/hour
- Authenticated: 5000 requests/hour

**Endpoints Used**:
- `GET /repos/:owner/:repo`: Repository metadata
- `GET /repos/:owner/:repo/git/trees/:sha`: File tree
- `GET /repos/:owner/:repo/contents/:path`: File contents
- `GET /repos/:owner/:repo/branches`: Branch listing

### 6.2 npm Registry API
**Purpose**: Package metadata and version checking

**Endpoints**:
- `GET /:package`: Package information
- `GET /:package/:version`: Specific version info

### 6.3 GitHub Advisory Database (Future)
**Purpose**: Security vulnerability checking

**API**: GraphQL endpoint for vulnerability queries

---

## 7. Technology Justification Matrix

| Requirement | Technology | Justification |
|-------------|------------|---------------|
| Type Safety | TypeScript | Catch errors early, better DX |
| Backend Framework | Express | Simple, mature, extensive ecosystem |
| Frontend Framework | React | Industry standard, great ecosystem |
| Build Tool | Vite | Fast HMR, modern, optimized builds |
| GitHub Integration | Octokit | Official SDK, comprehensive features |
| Code Parsing | Babel/TS Compiler | Industry standard, accurate parsing |
| Caching | node-cache | Simple, sufficient for MVP |
| API Client | TanStack Query | Best-in-class state management |
| Styling | Tailwind CSS | Rapid development, consistent design |
| Visualization | D3.js | Powerful, flexible, proven |
| Validation | Zod | Type-safe, composable, great DX |
| Testing | Jest + RTL | Industry standard, comprehensive |

## 8. Package Versions & Compatibility

### 8.1 Backend Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "octokit": "^3.1.0",
    "typescript": "^5.3.0",
    "@babel/parser": "^7.23.0",
    "toml": "^3.0.0",
    "yaml": "^2.3.0",
    "zod": "^3.22.0",
    "node-cache": "^5.1.0",
    "axios": "^1.6.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.0",
    "date-fns": "^3.0.0",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "@types/cors": "^2.8.17",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.0",
    "supertest": "^6.3.0",
    "nodemon": "^3.0.0",
    "ts-node": "^10.9.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.0"
  }
}
```

### 8.2 Frontend Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "@tanstack/react-query": "^5.17.0",
    "d3": "^7.8.5",
    "recharts": "^2.10.0",
    "react-markdown": "^9.0.0",
    "remark-gfm": "^4.0.0",
    "rehype-highlight": "^7.0.0",
    "lucide-react": "^0.300.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "react-hook-form": "^7.49.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/d3": "^7.4.3",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "eslint": "^8.56.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0"
  }
}
```

### 8.3 Shared Types Package
```json
{
  "name": "@gitmaster/shared",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

---

## 9. Code Parsing Technologies

### 9.1 JavaScript/TypeScript

| Library | Purpose | Rationale |
|---------|---------|-----------|
| @babel/parser | Parse JS/JSX to AST | Industry standard, handles all syntax |
| TypeScript Compiler API | Parse TS/TSX, type info | Official, complete language support |
| @babel/traverse | AST traversal | Easy to navigate and analyze code |

**Use Cases**:
- Extract import/export statements
- Find API route definitions
- Detect React components
- Analyze function complexity

### 9.2 Python

| Library | Purpose | Rationale |
|---------|---------|-----------|
| toml | Parse pyproject.toml | Standard TOML parser |
| Manual parsing | requirements.txt | Simple line-by-line parsing |

**Use Cases**:
- Extract dependencies from pyproject.toml
- Parse requirements.txt
- Identify Python frameworks (Django, Flask)

### 9.3 Rust

| Library | Purpose | Rationale |
|---------|---------|-----------|
| toml | Parse Cargo.toml | Standard TOML parser |

**Use Cases**:
- Extract Rust dependencies
- Identify workspace structure

### 9.4 Go

| Library | Purpose | Rationale |
|---------|---------|-----------|
| Manual parsing | go.mod | Simple structured format |

**Use Cases**:
- Extract Go module dependencies
- Parse version constraints

### 9.5 Java

| Library | Purpose | Rationale |
|---------|---------|-----------|
| xml2js | Parse pom.xml | Reliable XML parser |
| Manual parsing | build.gradle | Groovy DSL, complex to parse fully |

**Use Cases**:
- Extract Maven dependencies
- Parse Gradle dependencies (basic)

---

## 10. Development Environment

### 10.1 Version Control

#### Git
**Purpose**: Source code management

**Workflow**: Feature branch workflow with pull requests

#### GitHub
**Purpose**: Repository hosting and collaboration

### 10.2 IDE Recommendations

#### VS Code
**Recommended Extensions**:
- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- Tailwind CSS IntelliSense
- GitLens
- REST Client (for API testing)

### 10.3 Node Version Management

#### nvm (Node Version Manager)
**Purpose**: Manage multiple Node.js versions

**Configuration**: `.nvmrc` file specifying Node 18

---

## 11. Security Stack

### 11.1 Backend Security

#### helmet
**Purpose**: Set security-related HTTP headers

**Headers**:
- Content-Security-Policy
- X-Content-Type-Options
- X-Frame-Options
- Strict-Transport-Security

#### express-rate-limit
**Purpose**: Prevent brute force and DDoS

**Configuration**:
- 100 requests per 15 minutes per IP
- Custom error messages
- Skip successful requests in count

#### cors
**Purpose**: Configure CORS policies

**Configuration**:
- Whitelist frontend origin
- Credentials support
- Preflight caching

### 11.2 Frontend Security

#### DOMPurify (via react-markdown)
**Purpose**: Sanitize HTML/markdown to prevent XSS

#### Content Security Policy
**Purpose**: Prevent XSS and injection attacks

**Configuration**:
```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self' https://api.github.com;
```

---

## 12. Monitoring & Logging

### 12.1 Logging

#### winston (Future)
**Purpose**: Structured logging

**Rationale**:
- Flexible transports
- Log levels
- JSON formatting
- Production-ready

**Configuration**:
- Console transport (development)
- File transport (production)
- Error tracking integration (Sentry)

### 12.2 Error Tracking (Future)

#### Sentry
**Purpose**: Error monitoring and tracking

**Rationale**:
- Real-time error alerts
- Stack trace analysis
- Release tracking
- Performance monitoring

---

## 13. Infrastructure (Future Deployment)

### 13.1 Containerization

#### Docker
**Purpose**: Containerize application

**Configuration**:
- Multi-stage builds
- Node Alpine base image
- Layer optimization
- Docker Compose for local development

### 13.2 Hosting Options

| Option | Backend | Frontend | Cost | Complexity |
|--------|---------|----------|------|------------|
| Vercel | Serverless Functions | Edge Network | Free tier available | Low |
| Railway | Container | Static hosting | $5/month+ | Low |
| AWS | ECS/Lambda | S3 + CloudFront | Variable | High |
| DigitalOcean | Droplet/App Platform | Static/CDN | $5-12/month | Medium |

**Recommendation**: Railway or Vercel for MVP due to simplicity and cost.

### 13.3 Database (Future)

#### PostgreSQL
**Purpose**: Persistent storage for analyses

**Rationale**:
- ACID compliance
- JSON support
- Great performance
- Wide adoption

**ORM**: Prisma for type-safe database access

#### Redis
**Purpose**: Distributed caching and job queue

**Rationale**:
- In-memory speed
- TTL support
- Pub/sub for real-time updates
- Bull queue backend

---

## 14. CI/CD (Future)

### 14.1 GitHub Actions
**Purpose**: Automated testing and deployment

**Workflows**:
- **PR Checks**: Lint, type check, test
- **Deploy**: Build and deploy on merge to main
- **Dependencies**: Automated dependency updates (Dependabot)

**Example Workflow**:
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
```

---

## 15. Performance Technologies

### 15.1 Caching Strategy

| Layer | Technology | TTL | Use Case |
|-------|------------|-----|----------|
| Memory | node-cache | 24h | Analysis results |
| CDN | CloudFlare | 7d | Static assets |
| Browser | Service Worker | 1h | API responses |

### 15.2 Optimization Tools

#### webpack-bundle-analyzer (Vite plugin)
**Purpose**: Analyze bundle size

#### lighthouse-ci
**Purpose**: Performance auditing

---

## 16. Documentation Tools

### 16.1 API Documentation

#### Swagger/OpenAPI (Future)
**Purpose**: Interactive API documentation

**Generation**: Automatic from route definitions

### 16.2 Code Documentation

#### TypeDoc (Future)
**Purpose**: Generate TypeScript documentation

**Configuration**: Generate from TSDoc comments

---

## 17. Environment Configuration

### 17.1 Environment Variables

#### Backend (.env)
```bash
NODE_ENV=development
PORT=3000
GITHUB_API_URL=https://api.github.com
GITHUB_DEFAULT_TOKEN=
CACHE_TTL=86400
MAX_REPO_SIZE=10737418240
API_RATE_LIMIT=100
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3000/api
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=false
```

### 17.2 Configuration Management

#### dotenv
**Purpose**: Load environment variables from .env file

**Security**: .env files in .gitignore, .env.example for reference

---

## 18. Alternative Approaches Considered

### 18.1 Why Not a Single Language (Python)?

**Python Pros**:
- Rich data science ecosystem (pandas, matplotlib)
- Strong parsing libraries (ast module)
- Great for text processing

**Python Cons**:
- Slower runtime for I/O operations
- Less suitable for real-time web applications
- Separate frontend language still needed
- Larger deployment footprint

**Decision**: Node.js chosen for async I/O, shared language, and better web ecosystem.

### 18.2 Why Not GraphQL?

**GraphQL Pros**:
- Flexible data fetching
- Single endpoint
- Strong typing

**GraphQL Cons**:
- Overkill for simple CRUD
- Additional complexity
- Caching more difficult

**Decision**: REST chosen for simplicity and standard caching.

### 18.3 Why Not Server-Side Rendering (SSR)?

**SSR Pros**:
- Better SEO
- Faster first paint

**SSR Cons**:
- Added complexity
- Deployment challenges
- Not needed for tool/dashboard

**Decision**: Client-side rendering sufficient for internal tool. Can add Next.js later if needed.

---

## 19. Technology Risk Assessment

| Technology | Risk Level | Mitigation |
|------------|------------|------------|
| GitHub API Rate Limits | Medium | Token authentication, caching, graceful degradation |
| Large Repository Processing | High | Streaming, pagination, timeout limits, sample analysis |
| Parser Accuracy | Medium | Multiple parsers, fallback strategies, manual overrides |
| TypeScript Complexity | Low | Team familiarity, gradual adoption, excellent tooling |
| Frontend Bundle Size | Medium | Code splitting, lazy loading, tree shaking |
| External API Dependency | Medium | Error handling, retry logic, timeout handling |

---

## 20. Learning Resources

### 20.1 Official Documentation
- [Node.js Documentation](https://nodejs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [React Documentation](https://react.dev)
- [Express Guide](https://expressjs.com/en/guide/routing.html)
- [Octokit Documentation](https://octokit.github.io/rest.js)
- [Vite Guide](https://vitejs.dev/guide)
- [TanStack Query Docs](https://tanstack.com/query/latest)

### 20.2 Key Concepts to Understand
- REST API design principles
- TypeScript advanced types (generics, utility types)
- React Hooks patterns
- Dependency injection
- AST (Abstract Syntax Tree) traversal
- Graph algorithms (for dependency analysis)
- Rate limiting strategies
- Caching strategies (TTL, LRU, invalidation)

---

## 21. Success Metrics

### 21.1 Technical Metrics
- Backend response time < 200ms (cached)
- Backend response time < 30s (uncached, small repos)
- Frontend bundle size < 500KB (gzipped)
- Lighthouse score > 90
- Test coverage > 70%

### 21.2 Developer Experience
- Setup time < 10 minutes
- Hot reload < 2 seconds
- Type safety in all modules
- Clear error messages
- Comprehensive documentation
