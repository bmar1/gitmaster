# GitMaster Frontend

React + TypeScript + TailwindCSS frontend for GitMaster repository analyzer.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (optional):
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

App runs on `http://localhost:5173`

## Project Structure

```
src/
├── App.tsx                    # Main application component
├── main.tsx                   # React entry point
├── index.css                  # Global styles + Tailwind
├── components/
│   ├── RepoInput.tsx          # URL input form
│   ├── AnalysisView.tsx       # Results display with tabs
│   ├── FileTreeView.tsx       # Interactive file tree
│   ├── DependencyView.tsx     # Dependencies grid
│   └── LoadingSpinner.tsx     # Loading animation
├── services/
│   └── api.ts                 # Backend API client
└── types/
    └── index.ts               # TypeScript interfaces
```

## Features

- Single-page application
- Terminal-inspired dark theme
- Animated UI elements
- Responsive design
- Real-time analysis feedback
- Interactive file tree
- Dependency visualization

## Design System

### Colors
- Primary: Electric Cyan (`#00ffff`)
- Secondary: Neon Green (`#00ff88`)
- Accent: Pink (`#ff006e`)
- Background: Deep Blue-Black

### Typography
- Font: JetBrains Mono, Space Mono (monospace)
- Weights: 400, 500, 600, 700

### Animations
- Fade in
- Slide up/down
- Glow effects
- Pulse animations
- Matrix-style background

## Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Configuration

### Vite Config
- React plugin enabled
- API proxy to backend (`/api` → `http://localhost:3001`)
- Path aliases (`@/` → `src/`)

### TailwindCSS
- Custom color palette
- Monospace fonts
- Custom animations
- Utility classes

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: `/api` for proxy)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Deployment

### Vercel
1. Connect GitHub repository
2. Set root directory to `frontend`
3. Set environment variable `VITE_API_URL` to backend URL
4. Deploy

### Other Platforms
Build production bundle:
```bash
npm run build
```

Serve `dist/` folder with any static hosting service.
