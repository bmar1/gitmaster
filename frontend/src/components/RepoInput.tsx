import { useState } from 'react';
import { Search, Zap } from 'lucide-react';

interface RepoInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export function RepoInput({ onAnalyze, isLoading }: RepoInputProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url.trim());
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold mb-4 gradient-text tracking-tight">
          GITMASTER
        </h1>
        <p className="text-gray-400 text-lg tracking-wide">
          {'>'} DEEP REPOSITORY ANALYSIS SYSTEM
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-morphism p-8 rounded-xl terminal-glow">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="text-primary w-5 h-5" />
          <label className="text-sm text-primary tracking-widest">
            GITHUB_REPOSITORY_URL
          </label>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/50 w-5 h-5" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              disabled={isLoading}
              className="w-full pl-12 pr-4 py-4 bg-dark border border-primary/30 rounded-lg 
                       text-gray-100 placeholder-gray-600 font-mono
                       focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-300"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="px-8 py-4 bg-primary text-dark font-bold rounded-lg
                     hover:bg-secondary hover:shadow-lg hover:shadow-secondary/50
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-300 transform hover:scale-105
                     flex items-center space-x-2 tracking-wider"
          >
            <span>{isLoading ? 'ANALYZING...' : 'ANALYZE'}</span>
            {!isLoading && <span className="animate-pulse">▸</span>}
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500 flex items-center space-x-2">
          <span className="text-primary">▸</span>
          <span>No authentication required · Public repositories only · Rate limited</span>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-600 tracking-wide">
          Powered by GitHub API · Built with React + TypeScript
        </p>
      </div>
    </div>
  );
}
