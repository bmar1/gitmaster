# GitMaster Backend

Express.js + TypeScript backend API for analyzing GitHub repositories.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

Server runs on `http://localhost:3001`

## API Endpoints

### POST /api/analyze
Analyze a GitHub repository.

**Request:**
```json
{
  "url": "https://github.com/facebook/react"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "repository": {
      "owner": "facebook",
      "name": "react",
      "fullName": "facebook/react",
      "description": "...",
      "stars": 210000,
      "forks": 44000,
      "language": "JavaScript",
      "url": "https://github.com/facebook/react",
      "defaultBranch": "main"
    },
    "fileTree": [...],
    "dependencies": {
      "dependencies": { ... },
      "devDependencies": { ... },
      "totalCount": 47
    },
    "summary": "...",
    "analyzedAt": "2026-02-24T..."
  }
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-02-24T...",
    "version": "1.0.0"
  }
}
```

## Project Structure

```
src/
├── index.ts              # Express server entry point
├── routes/
│   └── analyze.ts        # Analysis endpoint
├── services/
│   ├── github.service.ts # GitHub API integration
│   ├── fileTree.service.ts # File tree processing
│   └── dependency.service.ts # Dependency extraction
├── types/
│   └── index.ts          # TypeScript interfaces
└── utils/
    └── parser.ts         # URL parsing utilities
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled JavaScript (production)
- `npm run typecheck` - Run TypeScript type checking

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

## Technologies

- Express.js - Web framework
- TypeScript - Type safety
- Octokit - GitHub API client
- CORS - Cross-origin resource sharing
- dotenv - Environment variables

## Error Handling

All errors return consistent format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

Common error codes:
- `MISSING_URL` - No URL provided
- `INVALID_URL` - Malformed GitHub URL
- `ANALYSIS_FAILED` - Generic analysis error
- `NOT_FOUND` - Repository or endpoint not found
