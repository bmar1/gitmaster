# GitMaster - API Specification

## 1. Overview

This document describes the REST API endpoints for GitMaster backend service. All endpoints return JSON responses with consistent error handling.

## 2. Base Configuration

- **Base URL**: `http://localhost:3000/api` (development)
- **Content-Type**: `application/json`
- **Authentication**: Optional GitHub token in request body
- **Rate Limiting**: 100 requests per 15 minutes per IP

## 3. Common Response Format

### 3.1 Success Response
```typescript
{
  success: true,
  data: T,
  metadata: {
    timestamp: string,      // ISO 8601 format
    requestId: string,      // UUID for request tracking
    version: string         // API version (e.g., "1.0.0")
  }
}
```

### 3.2 Error Response
```typescript
{
  success: false,
  error: {
    code: string,           // Error code (e.g., "INVALID_URL", "RATE_LIMIT_EXCEEDED")
    message: string,        // Human-readable error message
    details?: any,          // Additional error context
    stack?: string          // Stack trace (development only)
  },
  metadata: {
    timestamp: string,
    requestId: string,
    version: string
  }
}
```

## 4. API Endpoints

### 4.1 Health Check

#### GET /api/health
Check API service health and status.

**Request**: None

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "uptime": 3600,
    "timestamp": "2026-02-24T18:30:00Z"
  }
}
```

---

### 4.2 Analyze Repository

#### POST /api/analyze
Initiates a new repository analysis.

**Request Body**:
```typescript
{
  url: string;              // GitHub repository URL (required)
  branch?: string;          // Branch name (optional, defaults to default branch)
  token?: string;           // GitHub Personal Access Token (optional)
  options?: {
    includeTests?: boolean;       // Include test files in analysis (default: true)
    maxDepth?: number;            // Max dependency graph depth (default: 3)
    skipLargeFiles?: boolean;     // Skip files > 1MB (default: true)
    languages?: string[];         // Limit analysis to specific languages
  }
}
```

**Example Request**:
```json
{
  "url": "https://github.com/facebook/react",
  "branch": "main",
  "options": {
    "includeTests": false,
    "maxDepth": 2
  }
}
```

**Response**: 202 Accepted
```json
{
  "success": true,
  "data": {
    "analysisId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "processing",
    "estimatedTime": 45,
    "message": "Analysis started successfully"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid URL or parameters
- `401 Unauthorized`: Invalid or expired GitHub token
- `403 Forbidden`: Repository is private and no token provided
- `404 Not Found`: Repository does not exist
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

### 4.3 Get Analysis Results

#### GET /api/analyze/:id
Retrieves complete analysis results.

**URL Parameters**:
- `id` (string, required): Analysis ID returned from POST /api/analyze

**Query Parameters**:
- `format` (string, optional): Response format (`json` | `markdown` | `html`) - default: `json`

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "repository": {
      "owner": "facebook",
      "name": "react",
      "fullName": "facebook/react",
      "url": "https://github.com/facebook/react",
      "branch": "main",
      "description": "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
      "stars": 210000,
      "forks": 44000,
      "language": "JavaScript",
      "license": "MIT",
      "lastUpdated": "2026-02-24T12:00:00Z",
      "size": 52428,
      "defaultBranch": "main"
    },
    "fileTree": [
      {
        "path": "packages",
        "name": "packages",
        "type": "directory",
        "children": [
          {
            "path": "packages/react",
            "name": "react",
            "type": "directory",
            "children": []
          }
        ]
      }
    ],
    "statistics": {
      "totalFiles": 1247,
      "totalDirectories": 234,
      "totalLOC": 89452,
      "languageDistribution": {
        "JavaScript": 65.2,
        "TypeScript": 28.5,
        "HTML": 3.1,
        "CSS": 2.2,
        "Other": 1.0
      },
      "fileTypeDistribution": {
        "source": 892,
        "test": 245,
        "config": 67,
        "docs": 43
      },
      "averageFileSize": 4523,
      "largestFiles": [
        {"path": "packages/react/index.js", "size": 125643, "loc": 3421}
      ]
    },
    "dependencies": {
      "manifestFiles": ["package.json", "packages/react/package.json"],
      "totalCount": 47,
      "production": [
        {
          "name": "loose-envify",
          "version": "^1.1.0",
          "installedVersion": "1.4.0",
          "type": "production",
          "description": "Fast (and loose) selective `process.env` replacer"
        }
      ],
      "development": [
        {
          "name": "jest",
          "version": "^29.0.0",
          "installedVersion": "29.7.0",
          "type": "development",
          "description": "Delightful JavaScript Testing"
        }
      ],
      "graph": {
        "nodes": [],
        "edges": []
      },
      "vulnerabilities": [],
      "outdated": [
        {
          "name": "typescript",
          "current": "5.0.0",
          "wanted": "5.3.0",
          "latest": "5.3.3",
          "severity": "minor"
        }
      ],
      "metrics": {
        "directDependencies": 12,
        "transitiveDependencies": 35,
        "maxDepth": 4,
        "averageDepth": 2.3
      }
    },
    "architecture": {
      "frameworks": [
        {
          "name": "React",
          "version": "18.2.0",
          "type": "frontend",
          "confidence": 1.0
        },
        {
          "name": "Jest",
          "version": "29.7.0",
          "type": "testing",
          "confidence": 1.0
        }
      ],
      "patterns": [
        "Monorepo",
        "Lerna Workspace",
        "Component Library"
      ],
      "entryPoints": [
        {
          "path": "packages/react/index.js",
          "type": "module",
          "exports": ["React", "Component", "useState"]
        }
      ],
      "apiEndpoints": [],
      "importGraph": {
        "nodes": [
          {"id": "packages/react/index.js", "imports": 15, "exports": 42}
        ],
        "edges": []
      },
      "keyModules": [
        {
          "path": "packages/react/src/ReactHooks.js",
          "importedBy": 87,
          "description": "Core hooks implementation"
        }
      ]
    },
    "summary": {
      "overview": "React is a JavaScript library for building user interfaces, particularly web applications. It uses a component-based architecture and virtual DOM for efficient rendering.",
      "keyFeatures": [
        "Component-based architecture",
        "Virtual DOM for performance",
        "Declarative UI",
        "Hooks for state management",
        "Server-side rendering support"
      ],
      "techStack": [
        "JavaScript/TypeScript",
        "Jest for testing",
        "Rollup for bundling",
        "Prettier for formatting"
      ],
      "setupInstructions": [
        "Clone the repository",
        "Run `npm install` to install dependencies",
        "Run `npm test` to run tests",
        "Run `npm run build` to build packages"
      ],
      "complexityScore": 9,
      "recommendation": "Large, complex project with monorepo structure. Requires significant effort to understand and contribute."
    },
    "report": {
      "markdown": "# React Repository Analysis\n\n...",
      "generatedAt": "2026-02-24T18:30:00Z"
    },
    "analyzedAt": "2026-02-24T18:30:00Z",
    "processingTime": 42.5
  }
}
```

**Error Responses**:
- `404 Not Found`: Analysis ID does not exist
- `500 Internal Server Error`: Server error

---

### 4.4 Get Analysis Progress

#### GET /api/analyze/:id/progress
Retrieves real-time progress of ongoing analysis.

**URL Parameters**:
- `id` (string, required): Analysis ID

**Response**: 200 OK (In Progress)
```json
{
  "success": true,
  "data": {
    "analysisId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "processing",
    "currentStage": "analyzing_dependencies",
    "stages": [
      {
        "name": "fetching_repository",
        "status": "completed",
        "progress": 100,
        "startedAt": "2026-02-24T18:29:00Z",
        "completedAt": "2026-02-24T18:29:05Z"
      },
      {
        "name": "parsing_file_tree",
        "status": "completed",
        "progress": 100,
        "startedAt": "2026-02-24T18:29:05Z",
        "completedAt": "2026-02-24T18:29:12Z"
      },
      {
        "name": "analyzing_dependencies",
        "status": "in_progress",
        "progress": 65,
        "startedAt": "2026-02-24T18:29:12Z"
      },
      {
        "name": "analyzing_architecture",
        "status": "pending",
        "progress": 0
      },
      {
        "name": "generating_report",
        "status": "pending",
        "progress": 0
      }
    ],
    "overallProgress": 52,
    "estimatedTimeRemaining": 25
  }
}
```

**Response**: 200 OK (Completed)
```json
{
  "success": true,
  "data": {
    "analysisId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "currentStage": "completed",
    "overallProgress": 100,
    "completedAt": "2026-02-24T18:30:00Z",
    "processingTime": 42.5
  }
}
```

**Response**: 200 OK (Failed)
```json
{
  "success": false,
  "error": {
    "code": "ANALYSIS_FAILED",
    "message": "Failed to analyze repository",
    "details": {
      "stage": "analyzing_dependencies",
      "reason": "Unable to parse package.json: Invalid JSON format"
    }
  }
}
```

---

### 4.5 Refresh Analysis

#### POST /api/analyze/:id/refresh
Forces a re-analysis of a previously analyzed repository, bypassing cache.

**URL Parameters**:
- `id` (string, required): Previous analysis ID

**Request Body**:
```typescript
{
  token?: string;           // Updated GitHub token (optional)
  branch?: string;          // Different branch (optional)
}
```

**Response**: 202 Accepted
```json
{
  "success": true,
  "data": {
    "analysisId": "660e8400-e29b-41d4-a716-446655440001",
    "status": "processing",
    "message": "Re-analysis started successfully"
  }
}
```

---

### 4.6 List Branches

#### GET /api/repository/branches
Lists all branches for a given repository.

**Query Parameters**:
- `url` (string, required): GitHub repository URL
- `token` (string, optional): GitHub Personal Access Token

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "branches": [
      {
        "name": "main",
        "sha": "abc123def456",
        "protected": true,
        "isDefault": true
      },
      {
        "name": "develop",
        "sha": "def456abc123",
        "protected": false,
        "isDefault": false
      }
    ],
    "defaultBranch": "main",
    "totalCount": 24
  }
}
```

---

### 4.7 Validate Repository

#### POST /api/repository/validate
Validates a GitHub repository URL without performing full analysis.

**Request Body**:
```typescript
{
  url: string;              // GitHub repository URL
  token?: string;           // GitHub token (optional)
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "valid": true,
    "repository": {
      "owner": "facebook",
      "name": "react",
      "exists": true,
      "accessible": true,
      "isPrivate": false,
      "defaultBranch": "main"
    }
  }
}
```

**Response**: 200 OK (Invalid)
```json
{
  "success": true,
  "data": {
    "valid": false,
    "reason": "Repository does not exist",
    "repository": null
  }
}
```

---

### 4.8 Get Cached Analyses

#### GET /api/analyze/cache
Lists recently cached analyses (last 24 hours).

**Query Parameters**:
- `limit` (number, optional): Maximum results to return (default: 20, max: 100)
- `offset` (number, optional): Pagination offset (default: 0)

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "analyses": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "repository": {
          "owner": "facebook",
          "name": "react",
          "url": "https://github.com/facebook/react"
        },
        "branch": "main",
        "analyzedAt": "2026-02-24T18:30:00Z",
        "expiresAt": "2026-02-25T18:30:00Z",
        "status": "completed"
      }
    ],
    "pagination": {
      "total": 15,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

---

### 4.9 Export Report

#### GET /api/analyze/:id/export
Exports analysis report in specified format.

**URL Parameters**:
- `id` (string, required): Analysis ID

**Query Parameters**:
- `format` (string, required): Export format (`markdown` | `json` | `html`)

**Response**: 200 OK
- **Content-Type**: Varies by format
  - `markdown`: `text/markdown`
  - `json`: `application/json`
  - `html`: `text/html`

**Example Response (Markdown)**:
```
Content-Type: text/markdown
Content-Disposition: attachment; filename="react-analysis-2026-02-24.md"

# React Repository Analysis
...
```

---

### 4.10 Delete Analysis

#### DELETE /api/analyze/:id
Removes an analysis from cache.

**URL Parameters**:
- `id` (string, required): Analysis ID

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "message": "Analysis deleted successfully",
    "deletedId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

## 5. Data Models

### 5.1 AnalysisRequest
```typescript
interface AnalysisRequest {
  url: string;
  branch?: string;
  token?: string;
  options?: AnalysisOptions;
}

interface AnalysisOptions {
  includeTests?: boolean;
  maxDepth?: number;
  skipLargeFiles?: boolean;
  languages?: string[];
}
```

### 5.2 AnalysisResult
```typescript
interface AnalysisResult {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  repository: RepositoryMetadata;
  fileTree: FileNode[];
  statistics: Statistics;
  dependencies: DependencyInfo;
  architecture: ArchitectureInfo;
  summary: ProjectSummary;
  report: Report;
  analyzedAt: string;
  processingTime: number;
}
```

### 5.3 RepositoryMetadata
```typescript
interface RepositoryMetadata {
  owner: string;
  name: string;
  fullName: string;
  url: string;
  branch: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  license: string;
  lastUpdated: string;
  size: number;
  defaultBranch: string;
  topics?: string[];
  hasIssues: boolean;
  hasWiki: boolean;
  openIssuesCount: number;
}
```

### 5.4 FileNode
```typescript
interface FileNode {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  language?: string;
  category?: 'source' | 'config' | 'docs' | 'test' | 'asset' | 'other';
  loc?: number;
  important?: boolean;
  children?: FileNode[];
}
```

### 5.5 Statistics
```typescript
interface Statistics {
  totalFiles: number;
  totalDirectories: number;
  totalLOC: number;
  languageDistribution: Record<string, number>;
  fileTypeDistribution: Record<string, number>;
  averageFileSize: number;
  largestFiles: Array<{
    path: string;
    size: number;
    loc: number;
  }>;
}
```

### 5.6 DependencyInfo
```typescript
interface DependencyInfo {
  manifestFiles: string[];
  totalCount: number;
  production: Dependency[];
  development: Dependency[];
  graph: DependencyGraph;
  vulnerabilities: Vulnerability[];
  outdated: OutdatedDependency[];
  metrics: DependencyMetrics;
}

interface Dependency {
  name: string;
  version: string;
  installedVersion?: string;
  type: 'production' | 'development' | 'peer' | 'optional';
  description?: string;
  homepage?: string;
  license?: string;
}

interface DependencyGraph {
  nodes: Array<{
    id: string;
    name: string;
    version: string;
    depth: number;
  }>;
  edges: Array<{
    from: string;
    to: string;
    type: string;
  }>;
}

interface Vulnerability {
  dependency: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  description: string;
  fixedIn?: string;
  references: string[];
}

interface OutdatedDependency {
  name: string;
  current: string;
  wanted: string;
  latest: string;
  severity: 'patch' | 'minor' | 'major';
}

interface DependencyMetrics {
  directDependencies: number;
  transitiveDependencies: number;
  maxDepth: number;
  averageDepth: number;
}
```

### 5.7 ArchitectureInfo
```typescript
interface ArchitectureInfo {
  frameworks: Framework[];
  patterns: string[];
  entryPoints: EntryPoint[];
  apiEndpoints: Endpoint[];
  importGraph: ImportGraph;
  keyModules: KeyModule[];
}

interface Framework {
  name: string;
  version: string;
  type: 'frontend' | 'backend' | 'testing' | 'build' | 'database' | 'other';
  confidence: number;
  detectedFrom: string[];
}

interface EntryPoint {
  path: string;
  type: 'module' | 'server' | 'cli' | 'script';
  exports?: string[];
  description?: string;
}

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  handler: string;
  file: string;
  line: number;
  parameters?: string[];
}

interface ImportGraph {
  nodes: Array<{
    id: string;
    path: string;
    imports: number;
    exports: number;
  }>;
  edges: Array<{
    from: string;
    to: string;
    imports: string[];
  }>;
}

interface KeyModule {
  path: string;
  importedBy: number;
  description: string;
  importance: number;
}
```

### 5.8 ProjectSummary
```typescript
interface ProjectSummary {
  overview: string;
  keyFeatures: string[];
  techStack: string[];
  setupInstructions: string[];
  complexityScore: number;
  recommendation: string;
}
```

### 5.9 Report
```typescript
interface Report {
  markdown: string;
  generatedAt: string;
}
```

## 6. Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_URL` | 400 | Repository URL is malformed or invalid |
| `INVALID_BRANCH` | 400 | Specified branch does not exist |
| `INVALID_TOKEN` | 401 | GitHub token is invalid or expired |
| `REPO_NOT_FOUND` | 404 | Repository does not exist on GitHub |
| `REPO_PRIVATE` | 403 | Repository is private, token required |
| `ANALYSIS_NOT_FOUND` | 404 | Analysis ID does not exist |
| `RATE_LIMIT_EXCEEDED` | 429 | GitHub API rate limit exceeded |
| `REPO_TOO_LARGE` | 413 | Repository exceeds size limits |
| `TIMEOUT` | 504 | Analysis exceeded timeout limit |
| `PARSE_ERROR` | 422 | Failed to parse dependency files |
| `GITHUB_API_ERROR` | 502 | GitHub API returned an error |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## 7. Rate Limiting

### 7.1 API Rate Limits
- **Per IP**: 100 requests per 15 minutes
- **Per Analysis**: 1 analysis per 10 seconds per repository

### 7.2 Rate Limit Headers
All responses include rate limit information:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1709741400
```

### 7.3 Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "limit": 100,
      "remaining": 0,
      "resetAt": "2026-02-24T19:00:00Z"
    }
  }
}
```

## 8. Webhooks (Future Enhancement)

### 8.1 POST /api/webhooks/github
Receive GitHub webhook events for automated re-analysis.

**Events Supported**:
- `push`: Re-analyze on new commits
- `release`: Re-analyze on new releases
- `repository`: Re-analyze on repository updates

## 9. Authentication & Authorization

### 9.1 API Key (Future Enhancement)
For production deployment, implement API key authentication:
```
Authorization: Bearer <api_key>
```

### 9.2 GitHub Token Handling
- Tokens are passed in request body, never in headers or URLs
- Tokens are used only for GitHub API calls
- Tokens are never logged or persisted
- Token validation before use

## 10. Versioning

### 10.1 API Versioning Strategy
- Version included in URL path: `/api/v1/analyze`
- Current version: v1 (implicit, no version in path initially)
- Breaking changes require new version
- Old versions deprecated with 6-month notice

### 10.2 Response Version
All responses include API version in metadata:
```json
{
  "metadata": {
    "version": "1.0.0"
  }
}
```

## 11. CORS Policy

### 11.1 Allowed Origins
- Development: `http://localhost:5173` (Vite default)
- Production: Configured via environment variable

### 11.2 Allowed Methods
- `GET`, `POST`, `DELETE`, `OPTIONS`

### 11.3 Allowed Headers
- `Content-Type`, `Authorization`, `X-Request-ID`

## 12. Example Request Flows

### 12.1 Complete Analysis Flow
```bash
# Step 1: Validate repository
POST /api/repository/validate
{
  "url": "https://github.com/facebook/react"
}

# Step 2: Start analysis
POST /api/analyze
{
  "url": "https://github.com/facebook/react",
  "branch": "main"
}
# Returns: { "analysisId": "550e8400..." }

# Step 3: Poll progress
GET /api/analyze/550e8400.../progress
# Repeat until status = "completed"

# Step 4: Get results
GET /api/analyze/550e8400...

# Step 5: Export report
GET /api/analyze/550e8400.../export?format=markdown
```

### 12.2 Quick Analysis with Token
```bash
POST /api/analyze
{
  "url": "https://github.com/myorg/private-repo",
  "token": "ghp_xxxxxxxxxxxx",
  "options": {
    "includeTests": false,
    "maxDepth": 2
  }
}
```

## 13. Testing Endpoints (Development Only)

### 13.1 POST /api/dev/mock-analysis
Creates a mock analysis result for frontend testing.

**Available only in development mode**

**Request Body**:
```typescript
{
  repoName: string;
  complexity: 'simple' | 'medium' | 'complex';
}
```

### 13.2 POST /api/dev/clear-cache
Clears all cached analyses.

**Available only in development mode**

## 14. Performance Considerations

### 14.1 Response Compression
- All responses > 1KB are gzip compressed
- Client must support `Accept-Encoding: gzip`

### 14.2 Pagination
For large datasets (e.g., thousands of dependencies), implement pagination:
```
GET /api/analyze/:id/dependencies?page=1&limit=50
```

### 14.3 Partial Responses
Support field filtering to reduce payload size:
```
GET /api/analyze/:id?fields=repository,statistics,summary
```

## 15. Monitoring Endpoints (Future)

### 15.1 GET /api/metrics
Prometheus-compatible metrics endpoint.

### 15.2 GET /api/logs
Access recent log entries (admin only).
